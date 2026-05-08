import os, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
django.setup()
from src.apps.usuarios.models import Usuario

pw_map = {
    "admin@ecobol.bo": "Admin2026!",
    "gerente@ecobol.bo": "Gerente2026!",
    "empleado@ecobol.bo": "Empleado2026!",
}

for u in Usuario.objects.all():
    pw = pw_map.get(u.email, "")
    ok = u.check_password(pw)
    print(f"{u.email} | activo={u.activo} | pw_ok={ok}")
