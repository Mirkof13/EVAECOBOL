
from rest_framework import serializers
from .models import Sucursal, Estado, Envio, HistorialEstado, GaleriaImagen
from src.apps.utils.helpers import PESO_MAXIMO_KG
class GaleriaImagenSerializer(serializers.ModelSerializer):
    class Meta:
        model = GaleriaImagen
        fields = ["id", "titulo", "imagen", "descripcion", "orden", "activa", "fecha_subida"]
class SucursalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sucursal
        fields = ["id", "nombre", "departamento", "ciudad", "direccion", "telefono", "activa"]
class EstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estado
        fields = ["id", "nombre", "descripcion", "orden"]
class HistorialEstadoSerializer(serializers.ModelSerializer):
    estado_nombre = serializers.CharField(source="estado.nombre", read_only=True)
    sucursal_nombre = serializers.CharField(source="sucursal.nombre", read_only=True)
    actualizado_por_nombre = serializers.SerializerMethodField()
    class Meta:
        model = HistorialEstado
        fields = [
            "id", "fecha_cambio", "estado_nombre",
            "sucursal_nombre", "actualizado_por_nombre", "observacion",
        ]
    def get_actualizado_por_nombre(self, obj):
        return obj.actualizado_por.get_nombre_completo()
class EnvioListSerializer(serializers.ModelSerializer):
    estado_actual_nombre = serializers.CharField(source="estado_actual.nombre", read_only=True)
    sucursal_origen_nombre = serializers.CharField(source="sucursal_origen.nombre", read_only=True)
    sucursal_destino_nombre = serializers.CharField(source="sucursal_destino.nombre", read_only=True)
    esta_retrasado = serializers.SerializerMethodField()
    class Meta:
        model = Envio
        fields = [
            "id", "codigo_rastreo", "remitente_nombre", "destinatario_nombre",
            "sucursal_origen_nombre", "sucursal_destino_nombre",
            "estado_actual_nombre", "fecha_registro", "peso_kg", "precio_bs",
            "esta_retrasado",
        ]
    def get_esta_retrasado(self, obj):
        return obj.esta_retrasado()
class EnvioDetalleSerializer(serializers.ModelSerializer):
    historial = HistorialEstadoSerializer(many=True, read_only=True)
    estado_actual = EstadoSerializer(read_only=True)
    sucursal_origen = SucursalSerializer(read_only=True)
    sucursal_destino = SucursalSerializer(read_only=True)
    registrado_por_nombre = serializers.SerializerMethodField()
    esta_retrasado = serializers.SerializerMethodField()
    class Meta:
        model = Envio
        fields = [
            "id", "codigo_rastreo",
            "remitente_nombre", "remitente_telefono", "remitente_ci",
            "destinatario_nombre", "destinatario_telefono", "destinatario_direccion",
            "descripcion", "peso_kg", "precio_bs", "foto_envio",
            "fecha_registro", "fecha_estimada",
            "sucursal_origen", "sucursal_destino",
            "estado_actual", "registrado_por_nombre",
            "historial", "esta_retrasado",
        ]
    def get_registrado_por_nombre(self, obj):
        return obj.registrado_por.get_nombre_completo()
    def get_esta_retrasado(self, obj):
        return obj.esta_retrasado()
class EnvioCrearSerializer(serializers.ModelSerializer):
    sucursal_origen_id = serializers.PrimaryKeyRelatedField(
        queryset=Sucursal.objects.filter(activa=True),
        source="sucursal_origen",
    )
    sucursal_destino_id = serializers.PrimaryKeyRelatedField(
        queryset=Sucursal.objects.filter(activa=True),
        source="sucursal_destino",
    )
    class Meta:
        model = Envio
        fields = [
            "remitente_nombre", "remitente_telefono", "remitente_ci",
            "destinatario_nombre", "destinatario_telefono", "destinatario_direccion",
            "descripcion", "peso_kg", "foto_envio",
            "sucursal_origen_id", "sucursal_destino_id",
            "fecha_estimada",
        ]
    def validate_peso_kg(self, value):
        if value <= 0:
            raise serializers.ValidationError("El peso debe ser mayor a 0 kg.")
        if value > PESO_MAXIMO_KG:
            raise serializers.ValidationError(
                f"El peso máximo permitido es {PESO_MAXIMO_KG} kg (norma AGBC)."
            )
        return value
    def validate(self, data):
        origen = data.get("sucursal_origen")
        destino = data.get("sucursal_destino")
        if origen and destino and origen.id == destino.id:
            raise serializers.ValidationError(
                "La sucursal de origen y destino no pueden ser la misma."
            )
        return data
