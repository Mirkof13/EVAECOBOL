from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
class Migration(migrations.Migration):
    dependencies = [
        ("usuarios", "0001_initial"),
    ]
    operations = [
        migrations.CreateModel(
            name="LogActividad",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("accion", models.CharField(
                    choices=[
                        ("LOGIN",             "Inicio de sesión"),
                        ("LOGOUT",            "Cierre de sesión"),
                        ("CREAR_ENVIO",       "Crear envío"),
                        ("ACTUALIZAR_ESTADO", "Actualizar estado"),
                        ("CREAR_USUARIO",     "Crear usuario"),
                        ("EDITAR_USUARIO",    "Editar usuario"),
                        ("EXPORTAR",          "Exportar reporte"),
                    ],
                    max_length=30,
                )),
                ("descripcion", models.TextField(blank=True)),
                ("ip", models.GenericIPAddressField(blank=True, null=True, unpack_ipv4=True)),
                ("fecha", models.DateTimeField(auto_now_add=True)),
                ("usuario", models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name="logs",
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                "verbose_name": "Log de Actividad",
                "verbose_name_plural": "Logs de Actividad",
                "db_table": "log_actividad",
                "ordering": ["-fecha"],
            },
        ),
    ]
