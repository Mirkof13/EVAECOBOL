
from django.utils import timezone
from django.core.cache import cache
from django.conf import settings
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import Usuario, LogActividad
from .serializers import (
    UsuarioSerializer, UsuarioCrearSerializer,
    UsuarioEditarSerializer, PerfilSerializer, LogActividadSerializer,
)
from src.apps.envios.models import Sucursal
from src.apps.envios.serializers import SucursalSerializer
def get_client_ip(request):
    x_forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded:
        return x_forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "unknown")
def registrar_log(usuario, accion, descripcion="", ip=None):
    try:
        LogActividad.objects.create(
            usuario=usuario, accion=accion, descripcion=descripcion, ip=ip
        )
    except Exception:
        pass
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        user.ultimo_acceso = timezone.now()
        user.save(update_fields=["ultimo_acceso"])
        if not user.activo:
            from rest_framework_simplejwt.exceptions import AuthenticationFailed
            raise AuthenticationFailed("Cuenta suspendida. Contacte al administrador.")
        data["usuario"] = PerfilSerializer(user).data
        return data
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    def post(self, request, *args, **kwargs):
        ip = get_client_ip(request)
        max_attempts = getattr(settings, "LOGIN_MAX_ATTEMPTS", 3)
        lockout_seconds = getattr(settings, "LOGIN_LOCKOUT_SECONDS", 300)
        locked_key = f"login_locked_{ip}"
        failed_key = f"login_failed_{ip}"
        if cache.get(locked_key):
            return Response(
                {"detail": "Demasiados intentos fallidos. Intente de nuevo en 5 minutos."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            cache.delete(failed_key)
        else:
            failed = cache.get(failed_key, 0) + 1
            if failed >= max_attempts:
                cache.set(locked_key, True, lockout_seconds)
                cache.delete(failed_key)
            else:
                cache.set(failed_key, failed, lockout_seconds)
        return response
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    refresh_token = request.data.get("refresh")
    if refresh_token:
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            pass  
    return Response(
        {"detail": "Sesión cerrada correctamente."},
        status=status.HTTP_200_OK,
    )
class IsAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.rol == "ADMIN"
class UsuarioListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdmin]
    def get_serializer_class(self):
        if self.request.method == "POST":
            return UsuarioCrearSerializer
        return UsuarioSerializer
    def get_queryset(self):
        qs = Usuario.objects.select_related("sucursal").all()
        rol = self.request.query_params.get("rol")
        activo = self.request.query_params.get("activo")
        if rol:
            qs = qs.filter(rol=rol)
        if activo is not None:
            qs = qs.filter(activo=activo.lower() == "true")
        return qs
class UsuarioDetalleView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAdmin]
    queryset = Usuario.objects.select_related("sucursal").all()
    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return UsuarioEditarSerializer
        return UsuarioSerializer
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def perfil_propio(request):
    serializer = PerfilSerializer(request.user)
    return Response(serializer.data)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def listar_sucursales(request):
    sucursales = Sucursal.objects.filter(activa=True).order_by("departamento")
    return Response(SucursalSerializer(sucursales, many=True).data)
