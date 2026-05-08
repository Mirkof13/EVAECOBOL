
import uuid
from decimal import Decimal
PESO_MAXIMO_KG = 20
TARIFA_BASE_LOCAL = Decimal("8.00")
TARIFA_BASE_INTERDEPARTAMENTAL = Decimal("20.00")
TARIFA_POR_KG_ADICIONAL = Decimal("5.00")
FACTOR_TARIFA_REMOTA = Decimal("1.20")
SUCURSALES_REMOTAS = {"Trinidad", "Cobija"}
HORAS_LIMITE_RETRASO = 48
TRANSICIONES_VALIDAS = {
    "REGISTRADO": ["EN_TRANSITO"],
    "EN_TRANSITO": ["EN_SUCURSAL_DESTINO", "DEVUELTO"],
    "EN_SUCURSAL_DESTINO": ["EN_RUTA_ENTREGA", "DEVUELTO"],
    "EN_RUTA_ENTREGA": ["ENTREGADO", "DEVUELTO"],
    "ENTREGADO": [],
    "DEVUELTO": [],
}
def generar_codigo_rastreo() -> str:
    from django.utils import timezone
    año = timezone.now().year
    sufijo = uuid.uuid4().hex[:5].upper()
    return f"ECO-{año}-{sufijo}"
def calcular_precio(peso_kg, sucursal_origen, sucursal_destino) -> Decimal:
    mismo_depto = sucursal_origen.departamento == sucursal_destino.departamento
    if mismo_depto:
        precio = TARIFA_BASE_LOCAL
    else:
        precio = TARIFA_BASE_INTERDEPARTAMENTAL
        kg = Decimal(str(peso_kg))
        if kg > 1:
            precio += (kg - 1) * TARIFA_POR_KG_ADICIONAL
    if sucursal_destino.departamento in SUCURSALES_REMOTAS:
        precio *= FACTOR_TARIFA_REMOTA
    return precio.quantize(Decimal("0.01"))
def validar_transicion_estado(estado_actual_nombre: str, nuevo_estado_nombre: str) -> bool:
    estados_siguientes = TRANSICIONES_VALIDAS.get(estado_actual_nombre, [])
    return nuevo_estado_nombre in estados_siguientes
def obtener_estados_siguientes(estado_actual_nombre: str) -> list:
    return TRANSICIONES_VALIDAS.get(estado_actual_nombre, [])
