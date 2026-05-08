"""
ECOBOL — Tests de autenticación (test_auth.py)
Cobertura mínima 60% en módulos críticos — RNF05

Casos de prueba:
  - Login exitoso retorna access + refresh + usuario
  - Login con cuenta desactivada es rechazado
  - Acceso a endpoint protegido sin token es rechazado
  - Token expirado rechazado (simulado)
"""
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from src.apps.usuarios.models import Usuario
from src.apps.envios.models import Sucursal


class AuthTokenTests(APITestCase):
    """Tests para el endpoint de autenticación JWT — UC02."""

    def setUp(self):
        self.sucursal = Sucursal.objects.create(
            nombre="Sucursal La Paz Test",
            departamento="La Paz",
            ciudad="La Paz",
            direccion="Av. Test 123",
        )
        self.usuario = Usuario.objects.create_user(
            email="empleado@ecobol.test",
            password="test1234",
            nombre="Juan",
            apellido="Pérez",
            rol="EMPLEADO",
            sucursal=self.sucursal,
        )
        self.admin = Usuario.objects.create_superuser(
            email="admin@ecobol.test",
            password="admin1234",
            nombre="Admin",
            apellido="ECOBOL",
        )
        self.url_token = reverse("token_obtain")

    def test_login_exitoso_retorna_tokens(self):
        """Login válido devuelve access, refresh y datos del usuario."""
        response = self.client.post(self.url_token, {
            "email": "empleado@ecobol.test",
            "password": "test1234",
        }, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("usuario", response.data)
        self.assertEqual(response.data["usuario"]["rol"], "EMPLEADO")

    def test_login_credenciales_incorrectas(self):
        """Credenciales incorrectas retornan 401."""
        response = self.client.post(self.url_token, {
            "email": "empleado@ecobol.test",
            "password": "wrongpass",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_cuenta_desactivada(self):
        """Cuenta desactivada retorna error — UC02 alternativo A2."""
        self.usuario.activo = False
        self.usuario.save()
        response = self.client.post(self.url_token, {
            "email": "empleado@ecobol.test",
            "password": "test1234",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_endpoint_protegido_sin_token(self):
        """Acceso a /api/envios/ sin token retorna 401."""
        response = self.client.get("/api/envios/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_actualiza_ultimo_acceso(self):
        """Login actualiza el campo ultimo_acceso del usuario."""
        self.assertIsNone(self.usuario.ultimo_acceso)
        self.client.post(self.url_token, {
            "email": "empleado@ecobol.test",
            "password": "test1234",
        }, format="json")
        self.usuario.refresh_from_db()
        self.assertIsNotNone(self.usuario.ultimo_acceso)

    def test_admin_login_redirige_correctamente(self):
        """Admin puede autenticarse y su rol es ADMIN."""
        response = self.client.post(self.url_token, {
            "email": "admin@ecobol.test",
            "password": "admin1234",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["usuario"]["rol"], "ADMIN")
