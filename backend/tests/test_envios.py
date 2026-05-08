"""
ECOBOL — Tests de envíos (test_envios.py)
Cobertura mínima 60% en módulos críticos — RNF05

Casos de prueba:
  - Registrar envío genera código ECO-YYYY-XXXXX
  - Cálculo de precio interdepartamental correcto
  - Cálculo de precio con tarifa remota (Cobija/Trinidad)
  - Consulta pública sin autenticación funciona
  - Transición de estado válida e inválida
  - Empleado solo ve envíos de su sucursal
"""
from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status

from src.apps.usuarios.models import Usuario
from src.apps.envios.models import Sucursal, Estado, Envio, HistorialEstado
from src.apps.utils.helpers import (
    generar_codigo_rastreo,
    calcular_precio,
    validar_transicion_estado,
)


class HelpersTests(TestCase):
    """Tests para las funciones de helpers.py — Code Smell refactorizado."""

    def setUp(self):
        self.sucursal_lapaz = Sucursal.objects.create(
            nombre="La Paz", departamento="La Paz",
            ciudad="La Paz", direccion="Av. 1",
        )
        self.sucursal_scz = Sucursal.objects.create(
            nombre="Santa Cruz", departamento="Santa Cruz",
            ciudad="Santa Cruz", direccion="Av. 2",
        )
        self.sucursal_cobija = Sucursal.objects.create(
            nombre="Cobija", departamento="Cobija",
            ciudad="Cobija", direccion="Av. 3",
        )

    def test_generar_codigo_formato_correcto(self):
        """El código tiene formato ECO-YYYY-XXXXX — RF02."""
        codigo = generar_codigo_rastreo()
        self.assertTrue(codigo.startswith("ECO-"))
        partes = codigo.split("-")
        self.assertEqual(len(partes), 3)
        self.assertEqual(len(partes[1]), 4)  # año
        self.assertEqual(len(partes[2]), 5)  # sufijo

    def test_generar_codigo_unico(self):
        """Dos llamadas generan códigos distintos."""
        c1 = generar_codigo_rastreo()
        c2 = generar_codigo_rastreo()
        self.assertNotEqual(c1, c2)

    def test_precio_interdepartamental_basico(self):
        """1 kg entre La Paz y Santa Cruz = Bs. 20."""
        precio = calcular_precio(1, self.sucursal_lapaz, self.sucursal_scz)
        self.assertEqual(precio, Decimal("20.00"))

    def test_precio_interdepartamental_con_kg_extra(self):
        """3 kg entre La Paz y Santa Cruz = Bs. 20 + 2*5 = Bs. 30."""
        precio = calcular_precio(3, self.sucursal_lapaz, self.sucursal_scz)
        self.assertEqual(precio, Decimal("30.00"))

    def test_precio_con_tarifa_remota_cobija(self):
        """Destino Cobija aplica +20% — RF07."""
        precio = calcular_precio(1, self.sucursal_lapaz, self.sucursal_cobija)
        self.assertEqual(precio, Decimal("24.00"))  # 20 * 1.20

    def test_precio_local_mismo_departamento(self):
        """Mismo departamento = Bs. 8 fijo."""
        sucursal2 = Sucursal.objects.create(
            nombre="La Paz 2", departamento="La Paz",
            ciudad="La Paz", direccion="Av. 5",
        )
        precio = calcular_precio(5, self.sucursal_lapaz, sucursal2)
        self.assertEqual(precio, Decimal("8.00"))

    def test_transicion_valida_registrado_a_transito(self):
        """REGISTRADO → EN_TRANSITO es válido — RF05."""
        self.assertTrue(validar_transicion_estado("REGISTRADO", "EN_TRANSITO"))

    def test_transicion_invalida_registrado_a_entregado(self):
        """REGISTRADO → ENTREGADO no es válido (salto de estado)."""
        self.assertFalse(validar_transicion_estado("REGISTRADO", "ENTREGADO"))

    def test_transicion_invalida_desde_estado_final(self):
        """ENTREGADO no tiene transiciones válidas."""
        self.assertFalse(validar_transicion_estado("ENTREGADO", "EN_TRANSITO"))


class EnvioAPITests(APITestCase):
    """Tests de integración para los endpoints de envíos."""

    def setUp(self):
        self.sucursal_origen = Sucursal.objects.create(
            nombre="La Paz Test", departamento="La Paz",
            ciudad="La Paz", direccion="Av. Test 1",
        )
        self.sucursal_destino = Sucursal.objects.create(
            nombre="Santa Cruz Test", departamento="Santa Cruz",
            ciudad="Santa Cruz", direccion="Av. Test 2",
        )

        # Crear estados
        self.estado_reg = Estado.objects.create(nombre="REGISTRADO", descripcion="Reg", orden=1)
        Estado.objects.create(nombre="EN_TRANSITO", descripcion="Trans", orden=2)
        Estado.objects.create(nombre="EN_SUCURSAL_DESTINO", descripcion="Dest", orden=3)
        Estado.objects.create(nombre="EN_RUTA_ENTREGA", descripcion="Ruta", orden=4)
        Estado.objects.create(nombre="ENTREGADO", descripcion="Ent", orden=5)
        Estado.objects.create(nombre="DEVUELTO", descripcion="Dev", orden=6)

        self.empleado = Usuario.objects.create_user(
            email="emp@ecobol.test", password="emp1234",
            nombre="María", apellido="López", rol="EMPLEADO",
            sucursal=self.sucursal_origen,
        )
        self.gerente = Usuario.objects.create_user(
            email="ger@ecobol.test", password="ger1234",
            nombre="Carlos", apellido="Méndez", rol="GERENTE",
        )

    def _login(self, email, password):
        response = self.client.post("/api/auth/token/", {
            "email": email, "password": password,
        }, format="json")
        token = response.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        return token

    def test_registrar_envio_genera_codigo(self):
        """POST /api/envios/ genera código ECO-YYYY-XXXXX — RF01, RF02."""
        self._login("emp@ecobol.test", "emp1234")
        data = {
            "remitente_nombre": "Pedro Quispe",
            "remitente_telefono": "70012345",
            "destinatario_nombre": "Ana Mamani",
            "destinatario_telefono": "71234567",
            "destinatario_direccion": "Av. San Martín 123",
            "descripcion": "Documentos importantes",
            "peso_kg": "2.5",
            "sucursal_origen_id": self.sucursal_origen.id,
            "sucursal_destino_id": self.sucursal_destino.id,
        }
        response = self.client.post("/api/envios/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # El campo código se recibe al consultar el detalle
        envio = Envio.objects.first()
        self.assertIsNotNone(envio)
        self.assertTrue(envio.codigo_rastreo.startswith("ECO-"))

    def test_rastreo_publico_sin_autenticacion(self):
        """GET /api/rastreo/ funciona sin token — RF03, UC01."""
        envio = Envio.objects.create(
            codigo_rastreo="ECO-2026-TEST1",
            remitente_nombre="Test", remitente_telefono="70000000",
            destinatario_nombre="Test Dest", destinatario_telefono="71111111",
            destinatario_direccion="Calle Test 1",
            descripcion="Test", peso_kg=1, precio_bs=20,
            sucursal_origen=self.sucursal_origen,
            sucursal_destino=self.sucursal_destino,
            estado_actual=self.estado_reg,
            registrado_por=self.empleado,
        )
        # Sin token
        self.client.credentials()
        response = self.client.get(f"/api/rastreo/?codigo={envio.codigo_rastreo}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["codigo_rastreo"], "ECO-2026-TEST1")

    def test_rastreo_publico_codigo_inexistente(self):
        """Código no existente retorna 404 — UC01 alternativo A2."""
        self.client.credentials()
        response = self.client.get("/api/rastreo/?codigo=ECO-0000-XXXXX")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_peso_excede_limite_agbc(self):
        """Peso > 20 kg es rechazado con 400 — RF01."""
        self._login("emp@ecobol.test", "emp1234")
        data = {
            "remitente_nombre": "Test", "remitente_telefono": "70000000",
            "destinatario_nombre": "Dest", "destinatario_telefono": "71111111",
            "destinatario_direccion": "Calle 1", "descripcion": "Test",
            "peso_kg": "25",
            "sucursal_origen_id": self.sucursal_origen.id,
            "sucursal_destino_id": self.sucursal_destino.id,
        }
        response = self.client.post("/api/envios/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_estadisticas_requiere_gerente(self):
        """Empleado no puede acceder al dashboard — RF08."""
        self._login("emp@ecobol.test", "emp1234")
        response = self.client.get("/api/estadisticas/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_estadisticas_gerente_retorna_datos(self):
        """Gerente accede al dashboard correctamente — RF08."""
        self._login("ger@ecobol.test", "ger1234")
        response = self.client.get("/api/estadisticas/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("total_hoy", response.data)
        self.assertIn("por_estado", response.data)
