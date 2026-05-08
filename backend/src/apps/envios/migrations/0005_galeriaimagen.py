from django.db import migrations, models
class Migration(migrations.Migration):
    dependencies = [
        ("envios", "0004_add_composite_indices"),
    ]
    operations = [
        migrations.CreateModel(
            name="GaleriaImagen",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("titulo", models.CharField(max_length=200)),
                ("imagen", models.ImageField(upload_to="galeria/")),
                ("descripcion", models.TextField(blank=True)),
                ("orden", models.IntegerField(default=0)),
                ("activa", models.BooleanField(default=True)),
                ("fecha_subida", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "verbose_name": "Imagen de Galería",
                "verbose_name_plural": "Imágenes de Galería",
                "db_table": "galeria_imagenes",
                "ordering": ["orden", "-fecha_subida"],
            },
        ),
    ]
