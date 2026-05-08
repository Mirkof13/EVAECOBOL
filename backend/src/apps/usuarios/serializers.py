
from rest_framework import serializers
from .models import Usuario, LogActividad
from src.apps.envios.models import Sucursal
class SucursalBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sucursal
        fields = ["id", "nombre", "departamento"]
class UsuarioSerializer(serializers.ModelSerializer):
    sucursal_detalle = SucursalBriefSerializer(source="sucursal", read_only=True)
    nombre_completo = serializers.SerializerMethodField()
    class Meta:
        model = Usuario
        fields = [
            "id", "nombre", "apellido", "email", "rol",
            "sucursal", "sucursal_detalle", "nombre_completo",
            "activo", "fecha_creacion", "ultimo_acceso",
        ]
        read_only_fields = ["fecha_creacion", "ultimo_acceso"]
    def get_nombre_completo(self, obj):
        return obj.get_nombre_completo()
class UsuarioCrearSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    class Meta:
        model = Usuario
        fields = ["nombre", "apellido", "email", "password", "rol", "sucursal", "activo"]
    def create(self, validated_data):
        password = validated_data.pop("password")
        usuario = Usuario(**validated_data)
        usuario.set_password(password)
        usuario.save()
        return usuario
class UsuarioEditarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ["nombre", "apellido", "email", "rol", "sucursal", "activo"]
class PerfilSerializer(serializers.ModelSerializer):
    sucursal_nombre = serializers.CharField(source="sucursal.nombre", read_only=True)
    sucursal_id = serializers.IntegerField(source="sucursal.id", read_only=True)
    class Meta:
        model = Usuario
        fields = [
            "id", "nombre", "apellido", "email", "rol",
            "sucursal_id", "sucursal_nombre", "activo",
        ]
class LogActividadSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.SerializerMethodField()
    class Meta:
        model = LogActividad
        fields = ["id", "accion", "descripcion", "ip", "fecha", "usuario_nombre"]
    def get_usuario_nombre(self, obj):
        return obj.usuario.get_nombre_completo() if obj.usuario else None
