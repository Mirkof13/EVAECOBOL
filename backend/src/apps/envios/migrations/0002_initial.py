
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models
class Migration(migrations.Migration):
    initial = True
    dependencies = [
        ('envios', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]
    operations = [
        migrations.AddField(
            model_name='envio',
            name='registrado_por',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='envio',
            name='estado_actual',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='envios.estado'),
        ),
        migrations.AddField(
            model_name='historialestado',
            name='actualizado_por',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='historialestado',
            name='envio',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='historial', to='envios.envio'),
        ),
        migrations.AddField(
            model_name='historialestado',
            name='estado',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='envios.estado'),
        ),
        migrations.AddField(
            model_name='historialestado',
            name='sucursal',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='envios.sucursal'),
        ),
        migrations.AddField(
            model_name='envio',
            name='sucursal_destino',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='envios_destino', to='envios.sucursal'),
        ),
        migrations.AddField(
            model_name='envio',
            name='sucursal_origen',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='envios_origen', to='envios.sucursal'),
        ),
    ]
