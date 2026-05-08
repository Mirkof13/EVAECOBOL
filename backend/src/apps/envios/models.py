
from django.db import models
from django.conf import settings
class Sucursal(models.Model):
    DEPARTAMENTOS = [
        ("La Paz", "La Paz"),
        ("Santa Cruz", "Santa Cruz"),
        ("Cochabamba", "Cochabamba"),
        ("Oruro", "Oruro"),
        ("Potosi", "Potosí"),
        ("Sucre", "Sucre"),
        ("Tarija", "Tarija"),
        ("Trinidad", "Trinidad"),
        ("Cobija", "Cobija"),
    ]
    nombre = models.CharField(max_length=100)
    departamento = models.CharField(max_length=50, choices=DEPARTAMENTOS)
    ciudad = models.CharField(max_length=100)
    direccion = models.CharField(max_length=200)
    telefono = models.CharField(max_length=20, blank=True)
    activa = models.BooleanField(default=True)
    def __str__(self):
        return self.nombre
    class Meta:
        db_table = "sucursales"
        ordering = ["departamento"]
        verbose_name = "Sucursal"
        verbose_name_plural = "Sucursales"
class Estado(models.Model):
    NOMBRES = [
        ("REGISTRADO", "Registrado"),
        ("EN_TRANSITO", "En Tránsito"),
        ("EN_SUCURSAL_DESTINO", "En Sucursal Destino"),
        ("EN_RUTA_ENTREGA", "En Ruta de Entrega"),
        ("ENTREGADO", "Entregado"),
        ("DEVUELTO", "Devuelto"),
    ]
    nombre = models.CharField(max_length=50, choices=NOMBRES, unique=True)
    descripcion = models.TextField(blank=True)
    orden = models.IntegerField()
    def __str__(self):
        return self.nombre
    class Meta:
        db_table = "estados"
        ordering = ["orden"]
        verbose_name = "Estado"
        verbose_name_plural = "Estados"
class Envio(models.Model):
    codigo_rastreo = models.CharField(max_length=20, unique=True, db_index=True)
    remitente_nombre = models.CharField(max_length=100)
    remitente_telefono = models.CharField(max_length=20)
    remitente_ci = models.CharField(max_length=20, blank=True)
    destinatario_nombre = models.CharField(max_length=100)
    destinatario_telefono = models.CharField(max_length=20)
    destinatario_direccion = models.CharField(max_length=200)
    descripcion = models.TextField()
    peso_kg = models.DecimalField(max_digits=6, decimal_places=2)
    precio_bs = models.DecimalField(max_digits=8, decimal_places=2)
    foto_envio = models.ImageField(upload_to="fotos_envios/", null=True, blank=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    fecha_estimada = models.DateField(null=True, blank=True)
    sucursal_origen = models.ForeignKey(
        Sucursal,
        on_delete=models.PROTECT,
        related_name="envios_origen",
    )
    sucursal_destino = models.ForeignKey(
        Sucursal,
        on_delete=models.PROTECT,
        related_name="envios_destino",
    )
    estado_actual = models.ForeignKey(
        Estado,
        on_delete=models.PROTECT,
        db_index=True,
    )
    registrado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
    )
    def esta_retrasado(self):
        from django.utils import timezone
        import datetime
        HORAS_LIMITE = 48
        if self.estado_actual.nombre in ("ENTREGADO", "DEVUELTO"):
            return False
        ultimo = self.historial.order_by("-fecha_cambio").first()
        if not ultimo:
            return False
        return (timezone.now() - ultimo.fecha_cambio) > datetime.timedelta(hours=HORAS_LIMITE)
    def __str__(self):
        return f"{self.codigo_rastreo} — {self.destinatario_nombre}"
    class Meta:
        db_table = "envios"
        ordering = ["-fecha_registro"]
        verbose_name = "Envío"
        verbose_name_plural = "Envíos"
        indexes = [
            models.Index(fields=["remitente_nombre"], name="idx_envio_remitente"),
            models.Index(fields=["destinatario_nombre"], name="idx_envio_destinatario"),
            models.Index(fields=["fecha_registro"], name="idx_envio_fecha_registro"),
            models.Index(fields=["sucursal_origen", "estado_actual"], name="idx_envio_origen_estado"),
            models.Index(fields=["sucursal_destino", "estado_actual"], name="idx_envio_destino_estado"),
        ]
class GaleriaImagen(models.Model):
    titulo = models.CharField(max_length=200)
    imagen = models.ImageField(upload_to="galeria/")
    descripcion = models.TextField(blank=True)
    orden = models.IntegerField(default=0)
    activa = models.BooleanField(default=True)
    fecha_subida = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.titulo
    class Meta:
        db_table = "galeria_imagenes"
        ordering = ["orden", "-fecha_subida"]
        verbose_name = "Imagen de Galería"
        verbose_name_plural = "Imágenes de Galería"
class HistorialEstado(models.Model):
    fecha_cambio = models.DateTimeField(auto_now_add=True)
    observacion = models.TextField(blank=True)
    envio = models.ForeignKey(
        Envio,
        on_delete=models.CASCADE,
        related_name="historial",
        db_index=True,
    )
    estado = models.ForeignKey(Estado, on_delete=models.PROTECT)
    sucursal = models.ForeignKey(Sucursal, on_delete=models.SET_NULL, null=True, blank=True)
    actualizado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
    )
    def __str__(self):
        return f"{self.envio.codigo_rastreo} → {self.estado.nombre} ({self.fecha_cambio:%Y-%m-%d %H:%M})"
    class Meta:
        db_table = "historial_estados"
        ordering = ["fecha_cambio"]
        verbose_name = "Historial de Estado"
        verbose_name_plural = "Historial de Estados"
        indexes = [
            models.Index(fields=["envio", "fecha_cambio"], name="idx_historial_envio_fecha"),
        ]
