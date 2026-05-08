
from django.conf import settings
from django.db import migrations, models
class Migration(migrations.Migration):
    dependencies = [
        ('envios', '0003_envio_foto_envio'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]
    operations = [
        migrations.AddIndex(
            model_name='envio',
            index=models.Index(fields=['remitente_nombre'], name='idx_envio_remitente'),
        ),
        migrations.AddIndex(
            model_name='envio',
            index=models.Index(fields=['destinatario_nombre'], name='idx_envio_destinatario'),
        ),
        migrations.AddIndex(
            model_name='envio',
            index=models.Index(fields=['fecha_registro'], name='idx_envio_fecha_registro'),
        ),
        migrations.AddIndex(
            model_name='envio',
            index=models.Index(fields=['sucursal_origen', 'estado_actual'], name='idx_envio_origen_estado'),
        ),
        migrations.AddIndex(
            model_name='envio',
            index=models.Index(fields=['sucursal_destino', 'estado_actual'], name='idx_envio_destino_estado'),
        ),
        migrations.AddIndex(
            model_name='historialestado',
            index=models.Index(fields=['envio', 'fecha_cambio'], name='idx_historial_envio_fecha'),
        ),
    ]
