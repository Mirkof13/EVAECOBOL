
from django.db import migrations, models
class Migration(migrations.Migration):
    dependencies = [
        ('envios', '0002_initial'),
    ]
    operations = [
        migrations.AddField(
            model_name='envio',
            name='foto_envio',
            field=models.ImageField(blank=True, null=True, upload_to='fotos_envios/'),
        ),
    ]
