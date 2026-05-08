
import csv
from django.http import HttpResponse
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from src.apps.envios.models import Envio
from src.apps.utils.auth import QueryParamJWTAuthentication
@api_view(["GET"])
@authentication_classes([QueryParamJWTAuthentication, JWTAuthentication])
@permission_classes([IsAuthenticated])
def exportar_csv(request):
    if request.user.rol not in ("GERENTE", "ADMIN"):
        return Response({"error": "Acceso denegado."}, status=status.HTTP_403_FORBIDDEN)
    desde = request.query_params.get("desde")
    hasta = request.query_params.get("hasta")
    sucursal_id = request.query_params.get("sucursal")
    estado_nombre = request.query_params.get("estado")
    qs = Envio.objects.select_related(
        "sucursal_origen", "sucursal_destino", "estado_actual", "registrado_por"
    )
    if desde:
        qs = qs.filter(fecha_registro__date__gte=desde)
    if hasta:
        qs = qs.filter(fecha_registro__date__lte=hasta)
    if sucursal_id:
        qs = qs.filter(sucursal_origen_id=sucursal_id)
    if estado_nombre:
        qs = qs.filter(estado_actual__nombre=estado_nombre)
    if not any([desde, hasta, sucursal_id, estado_nombre]):
        inicio_mes = timezone.now().date().replace(day=1)
        qs = qs.filter(fecha_registro__date__gte=inicio_mes)
    fecha_hoy = timezone.now().date()
    nombre_archivo = f"reporte_ecobol_{fecha_hoy}.csv"
    response = HttpResponse(content_type="text/csv; charset=utf-8")
    response["Content-Disposition"] = f'attachment; filename="{nombre_archivo}"'
    response.write("\ufeff")  
    writer = csv.writer(response)
    writer.writerow([
        "Código Rastreo", "Remitente", "Tel. Remitente",
        "Destinatario", "Tel. Destinatario", "Dirección Destino",
        "Sucursal Origen", "Sucursal Destino",
        "Peso (kg)", "Precio (Bs.)",
        "Estado", "Fecha Registro", "Fecha Estimada",
        "Registrado por",
    ])
    for e in qs:
        writer.writerow([
            e.codigo_rastreo,
            e.remitente_nombre,
            e.remitente_telefono,
            e.destinatario_nombre,
            e.destinatario_telefono,
            e.destinatario_direccion,
            e.sucursal_origen.nombre,
            e.sucursal_destino.nombre,
            e.peso_kg,
            e.precio_bs,
            e.estado_actual.nombre,
            e.fecha_registro.strftime("%Y-%m-%d %H:%M"),
            e.fecha_estimada.strftime("%Y-%m-%d") if e.fecha_estimada else "",
            e.registrado_por.get_nombre_completo(),
        ])
    return response
