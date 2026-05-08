
from django.db import migrations, models
class Migration(migrations.Migration):
    initial = True
    dependencies = [
    ]
    operations = [
        migrations.CreateModel(
            name='Envio',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('codigo_rastreo', models.CharField(db_index=True, max_length=20, unique=True)),
                ('remitente_nombre', models.CharField(max_length=100)),
                ('remitente_telefono', models.CharField(max_length=20)),
                ('remitente_ci', models.CharField(blank=True, max_length=20)),
                ('destinatario_nombre', models.CharField(max_length=100)),
                ('destinatario_telefono', models.CharField(max_length=20)),
                ('destinatario_direccion', models.CharField(max_length=200)),
                ('descripcion', models.TextField()),
                ('peso_kg', models.DecimalField(decimal_places=2, max_digits=6)),
                ('precio_bs', models.DecimalField(decimal_places=2, max_digits=8)),
                ('fecha_registro', models.DateTimeField(auto_now_add=True)),
                ('fecha_estimada', models.DateField(blank=True, null=True)),
            ],
            options={
                'verbose_name': 'Envío',
                'verbose_name_plural': 'Envíos',
                'db_table': 'envios',
                'ordering': ['-fecha_registro'],
            },
        ),
        migrations.CreateModel(
            name='Estado',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(choices=[('REGISTRADO', 'Registrado'), ('EN_TRANSITO', 'En Tránsito'), ('EN_SUCURSAL_DESTINO', 'En Sucursal Destino'), ('EN_RUTA_ENTREGA', 'En Ruta de Entrega'), ('ENTREGADO', 'Entregado'), ('DEVUELTO', 'Devuelto')], max_length=50, unique=True)),
                ('descripcion', models.TextField(blank=True)),
                ('orden', models.IntegerField()),
            ],
            options={
                'verbose_name': 'Estado',
                'verbose_name_plural': 'Estados',
                'db_table': 'estados',
                'ordering': ['orden'],
            },
        ),
        migrations.CreateModel(
            name='HistorialEstado',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fecha_cambio', models.DateTimeField(auto_now_add=True)),
                ('observacion', models.TextField(blank=True)),
            ],
            options={
                'verbose_name': 'Historial de Estado',
                'verbose_name_plural': 'Historial de Estados',
                'db_table': 'historial_estados',
                'ordering': ['fecha_cambio'],
            },
        ),
        migrations.CreateModel(
            name='Sucursal',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=100)),
                ('departamento', models.CharField(choices=[('La Paz', 'La Paz'), ('Santa Cruz', 'Santa Cruz'), ('Cochabamba', 'Cochabamba'), ('Oruro', 'Oruro'), ('Potosi', 'Potosí'), ('Sucre', 'Sucre'), ('Tarija', 'Tarija'), ('Trinidad', 'Trinidad'), ('Cobija', 'Cobija')], max_length=50)),
                ('ciudad', models.CharField(max_length=100)),
                ('direccion', models.CharField(max_length=200)),
                ('telefono', models.CharField(blank=True, max_length=20)),
                ('activa', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'Sucursal',
                'verbose_name_plural': 'Sucursales',
                'db_table': 'sucursales',
                'ordering': ['departamento'],
            },
        ),
    ]
