
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    UsuarioListCreateView,
    UsuarioDetalleView,
    perfil_propio,
    listar_sucursales,
    logout_view,
)
urlpatterns = [
    path("auth/token/",         CustomTokenObtainPairView.as_view(), name="token_obtain"),
    path("auth/token/refresh/", TokenRefreshView.as_view(),          name="token_refresh"),
    path("auth/logout/",        logout_view,                         name="auth_logout"),
    path("usuarios/",         UsuarioListCreateView.as_view(), name="usuario_list_create"),
    path("usuarios/<int:pk>/", UsuarioDetalleView.as_view(),  name="usuario_detalle"),
    path("usuarios/me/",       perfil_propio,                 name="perfil_propio"),
    path("sucursales/", listar_sucursales, name="sucursales_lista"),
]
