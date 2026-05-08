
from django.utils import timezone
from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Envio, HistorialEstado, Estado, Sucursal
from .serializers import (
    EnvioListSerializer,
    EnvioDetalleSerializer,
    EnvioCrearSerializer,
    SucursalSerializer,
)
from src.apps.utils.helpers import (
    generar_codigo_rastreo,
    calcular_precio,
    validar_transicion_estado,
    obtener_estados_siguientes,
)
class IsEmpleadoOAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.rol in ("EMPLEADO", "ADMIN")
class IsGerenteOAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.rol in ("GERENTE", "ADMIN")
class IsAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.rol == "ADMIN"
class SucursalAdminListCreateView(generics.ListCreateAPIView):
    queryset = Sucursal.objects.all().order_by("departamento")
    serializer_class = SucursalSerializer
    permission_classes = [IsAdmin]
class SucursalAdminDetalleView(generics.RetrieveUpdateAPIView):
    queryset = Sucursal.objects.all()
    serializer_class = SucursalSerializer
    permission_classes = [IsAdmin]
class EnvioListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        "estado_actual__nombre": ["exact"],
        "sucursal_origen": ["exact"],
        "sucursal_destino": ["exact"],
        "fecha_registro": ["date", "date__gte", "date__lte"],
    }
    search_fields = ["destinatario_nombre", "codigo_rastreo", "remitente_nombre"]
    ordering_fields = ["fecha_registro", "precio_bs", "peso_kg"]
    ordering = ["-fecha_registro"]
    def get_serializer_class(self):
        if self.request.method == "POST":
            return EnvioCrearSerializer
        return EnvioListSerializer
    def get_queryset(self):
        usuario = self.request.user
        qs = Envio.objects.select_related(
            "estado_actual", "sucursal_origen", "sucursal_destino"
        )
        if usuario.rol == "EMPLEADO" and usuario.sucursal:
            return qs.filter(sucursal_origen=usuario.sucursal)
        return qs
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            EnvioListSerializer(serializer.instance).data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )
    def perform_create(self, serializer):
        origen = serializer.validated_data["sucursal_origen"]
        destino = serializer.validated_data["sucursal_destino"]
        peso = serializer.validated_data["peso_kg"]
        estado_inicial = Estado.objects.get(nombre="REGISTRADO")
        codigo = generar_codigo_rastreo()
        precio = calcular_precio(peso, origen, destino)
        envio = serializer.save(
            codigo_rastreo=codigo,
            precio_bs=precio,
            estado_actual=estado_inicial,
            registrado_por=self.request.user,
        )
        HistorialEstado.objects.create(
            envio=envio,
            estado=estado_inicial,
            sucursal=origen,
            actualizado_por=self.request.user,
            observacion="Envío registrado en el sistema.",
        )
class EnvioDetalleView(generics.RetrieveAPIView):
    queryset = Envio.objects.prefetch_related(
        "historial__estado",
        "historial__sucursal",
        "historial__actualizado_por",
    ).select_related("estado_actual", "sucursal_origen", "sucursal_destino")
    serializer_class = EnvioDetalleSerializer
    permission_classes = [IsAuthenticated]
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def actualizar_estado(request, pk):
    if request.user.rol not in ("EMPLEADO", "ADMIN"):
        return Response(
            {"error": "Solo empleados pueden actualizar estados."},
            status=status.HTTP_403_FORBIDDEN,
        )
    try:
        envio = Envio.objects.select_related("estado_actual").get(pk=pk)
    except Envio.DoesNotExist:
        return Response({"error": "Envío no encontrado."}, status=status.HTTP_404_NOT_FOUND)
    nuevo_nombre = request.data.get("estado")
    observacion = request.data.get("observacion", "")
    if not nuevo_nombre:
        return Response(
            {"error": "El campo 'estado' es requerido."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if not validar_transicion_estado(envio.estado_actual.nombre, nuevo_nombre):
        estados_posibles = obtener_estados_siguientes(envio.estado_actual.nombre)
        return Response(
            {
                "error": f"Transición '{envio.estado_actual.nombre}' → '{nuevo_nombre}' no permitida.",
                "estados_posibles": estados_posibles,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        nuevo_estado = Estado.objects.get(nombre=nuevo_nombre)
    except Estado.DoesNotExist:
        return Response({"error": "Estado no válido."}, status=status.HTTP_400_BAD_REQUEST)
    envio.estado_actual = nuevo_estado
    envio.save(update_fields=["estado_actual"])
    HistorialEstado.objects.create(
        envio=envio,
        estado=nuevo_estado,
        sucursal=request.user.sucursal,
        actualizado_por=request.user,
        observacion=observacion,
    )
    serializer = EnvioDetalleSerializer(envio)
    return Response(serializer.data)
@api_view(["GET"])
@permission_classes([AllowAny])
def rastreo_publico(request):
    codigo = request.query_params.get("codigo", "").strip().upper()
    if not codigo:
        return Response(
            {"error": "El parámetro 'codigo' es requerido."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        envio = Envio.objects.prefetch_related(
            "historial__estado",
            "historial__sucursal",
            "historial__actualizado_por",
        ).select_related(
            "estado_actual", "sucursal_origen", "sucursal_destino"
        ).get(codigo_rastreo=codigo)
    except Envio.DoesNotExist:
        return Response(
            {"error": "Código no encontrado. Verifica el código en tu comprobante."},
            status=status.HTTP_404_NOT_FOUND,
        )
    return Response(EnvioDetalleSerializer(envio).data)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def estadisticas(request):
    if request.user.rol not in ("GERENTE", "ADMIN"):
        return Response({"error": "Acceso denegado."}, status=status.HTTP_403_FORBIDDEN)
    from django.db.models import Count
    import datetime
    hoy = timezone.now().date()
    inicio_mes = hoy.replace(day=1)
    total_hoy = Envio.objects.filter(fecha_registro__date=hoy).count()
    total_mes = Envio.objects.filter(fecha_registro__date__gte=inicio_mes).count()
    por_estado = list(
        Envio.objects.values("estado_actual__nombre")
        .annotate(total=Count("id"))
        .order_by("estado_actual__orden")
    )
    por_sucursal = list(
        Envio.objects.filter(fecha_registro__date__gte=inicio_mes)
        .values("sucursal_origen__nombre")
        .annotate(total=Count("id"))
        .order_by("-total")[:5]
    )
    entregados_mes = Envio.objects.filter(
        estado_actual__nombre="ENTREGADO",
        fecha_registro__date__gte=inicio_mes,
    ).count()
    porcentaje_exitosas = round((entregados_mes / total_mes * 100), 1) if total_mes > 0 else 0
    limite = timezone.now() - datetime.timedelta(hours=48)
    retrasados = Envio.objects.exclude(
        estado_actual__nombre__in=["ENTREGADO", "DEVUELTO"]
    ).filter(
        historial__fecha_cambio__lte=limite
    ).distinct().count()
    return Response({
        "total_hoy": total_hoy,
        "total_mes": total_mes,
        "por_estado": por_estado,
        "por_sucursal": por_sucursal,
        "porcentaje_exitosas": porcentaje_exitosas,
        "retrasados": retrasados,
    })
