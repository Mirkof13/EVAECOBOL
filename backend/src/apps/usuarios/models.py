
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
class UsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("El email es obligatorio.")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("rol", "ADMIN")
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)
class Usuario(AbstractBaseUser, PermissionsMixin):
    ROL_CHOICES = [
        ("ADMIN", "Administrador"),
        ("EMPLEADO", "Empleado"),
        ("GERENTE", "Gerente"),
    ]
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    rol = models.CharField(max_length=20, choices=ROL_CHOICES, default="EMPLEADO")
    sucursal = models.ForeignKey(
        "envios.Sucursal",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="empleados",
    )
    activo = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    ultimo_acceso = models.DateTimeField(null=True, blank=True)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["nombre", "apellido"]
    objects = UsuarioManager()
    def get_nombre_completo(self):
        return f"{self.nombre} {self.apellido}"
    def __str__(self):
        return f"{self.get_nombre_completo()} ({self.rol})"
    class Meta:
        db_table = "usuarios"
        ordering = ["apellido", "nombre"]
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"
class LogActividad(models.Model):
    ACCION_CHOICES = [
        ("LOGIN",             "Inicio de sesión"),
        ("LOGOUT",            "Cierre de sesión"),
        ("CREAR_ENVIO",       "Crear envío"),
        ("ACTUALIZAR_ESTADO", "Actualizar estado"),
        ("CREAR_USUARIO",     "Crear usuario"),
        ("EDITAR_USUARIO",    "Editar usuario"),
        ("EXPORTAR",          "Exportar reporte"),
    ]
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="logs",
    )
    accion = models.CharField(max_length=30, choices=ACCION_CHOICES)
    descripcion = models.TextField(blank=True)
    ip = models.GenericIPAddressField(null=True, blank=True, unpack_ipv4=True)
    fecha = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        nombre = self.usuario.get_nombre_completo() if self.usuario else "Anónimo"
        return f"{nombre} — {self.accion}"
    class Meta:
        db_table = "log_actividad"
        ordering = ["-fecha"]
        verbose_name = "Log de Actividad"
        verbose_name_plural = "Logs de Actividad"
