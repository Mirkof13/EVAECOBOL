
from django.urls import path
from .views import (
    EnvioListCreateView,
    EnvioDetalleView,
    actualizar_estado,
    rastreo_publico,
    estadisticas,
    SucursalAdminListCreateView,
    SucursalAdminDetalleView,
)
urlpatterns = [
    path("envios/", EnvioListCreateView.as_view(), name="envio_list_create"),
    path("envios/<int:pk>/", EnvioDetalleView.as_view(), name="envio_detalle"),
    path("envios/<int:pk>/estado/", actualizar_estado, name="envio_actualizar_estado"),
    path("rastreo/", rastreo_publico, name="rastreo_publico"),
    path("estadisticas/", estadisticas, name="estadisticas"),
    path("sucursales/admin/", SucursalAdminListCreateView.as_view(), name="sucursal_admin_list"),
    path("sucursales/admin/<int:pk>/", SucursalAdminDetalleView.as_view(), name="sucursal_admin_detalle"),
]
