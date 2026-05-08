"""
ECOBOL — Script de datos semilla (seed_data.py)
Ejecutar con: python manage.py shell < seed_data.py
O mediante el management command: python manage.py seed
"""
import os
import sys
import django

# Configurar Django si se ejecuta directamente
if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    django.setup()

from src.apps.envios.models import Sucursal, Estado
from src.apps.usuarios.models import Usuario


def seed():
    print("[SEED] Iniciando seed de datos ECOBOL...")

    # ─── 9 Sucursales departamentales ──────────────────────────────────────────
    sucursales_data = [
        ("Sucursal Central La Paz", "La Paz", "La Paz", "Av. Mariscal Santa Cruz 1234", "22123456"),
        ("Sucursal Santa Cruz", "Santa Cruz", "Santa Cruz de la Sierra", "Av. Canoto 567", "33456789"),
        ("Sucursal Cochabamba", "Cochabamba", "Cochabamba", "Plaza 14 de Septiembre 890", "44567890"),
        ("Sucursal Oruro", "Oruro", "Oruro", "Calle Adolfo Mier 234", "52123456"),
        ("Sucursal Potosi", "Potosi", "Potosi", "Calle Bolivar 456", "62234567"),
        ("Sucursal Sucre", "Sucre", "Sucre", "Av. Venezuela 789", "64345678"),
        ("Sucursal Tarija", "Tarija", "Tarija", "Calle Colon 123", "66456789"),
        ("Sucursal Trinidad", "Trinidad", "Trinidad", "Av. 6 de Agosto 321", "46567890"),
        ("Sucursal Cobija", "Cobija", "Cobija", "Av. Internacional 654", "32678901"),
    ]

    sucursales = {}
    for nombre, depto, ciudad, direccion, telefono in sucursales_data:
        obj, created = Sucursal.objects.get_or_create(
            nombre=nombre,
            defaults=dict(departamento=depto, ciudad=ciudad, direccion=direccion, telefono=telefono),
        )
        sucursales[depto] = obj
        status_str = "CREADA" if created else "ya existe"
        print(f"  Sucursal {status_str}: {nombre}")

    # ─── 6 Estados en orden ────────────────────────────────────────────────────
    estados_data = [
        ("REGISTRADO", "El envio ha sido registrado en el sistema.", 1),
        ("EN_TRANSITO", "El envio esta en camino hacia la sucursal de destino.", 2),
        ("EN_SUCURSAL_DESTINO", "El envio llego a la sucursal de destino.", 3),
        ("EN_RUTA_ENTREGA", "El envio esta en ruta para ser entregado al destinatario.", 4),
        ("ENTREGADO", "El envio fue entregado exitosamente al destinatario.", 5),
        ("DEVUELTO", "El envio fue devuelto al remitente.", 6),
    ]

    for nombre, desc, orden in estados_data:
        obj, created = Estado.objects.get_or_create(
            nombre=nombre,
            defaults=dict(descripcion=desc, orden=orden),
        )
        status_str = "CREADO" if created else "ya existe"
        print(f"  Estado {status_str}: {nombre}")

    # ─── Usuarios de prueba ────────────────────────────────────────────────────
    if not Usuario.objects.filter(email="admin@ecobol.bo").exists():
        Usuario.objects.create_superuser(
            email="admin@ecobol.bo",
            password="Admin2026!",
            nombre="Administrador",
            apellido="ECOBOL",
        )
        print("  Admin creado: admin@ecobol.bo / Admin2026!")

    if not Usuario.objects.filter(email="gerente@ecobol.bo").exists():
        Usuario.objects.create_user(
            email="gerente@ecobol.bo",
            password="Gerente2026!",
            nombre="Carlos",
            apellido="Mendez",
            rol="GERENTE",
        )
        print("  Gerente creado: gerente@ecobol.bo / Gerente2026!")

    if not Usuario.objects.filter(email="empleado@ecobol.bo").exists():
        Usuario.objects.create_user(
            email="empleado@ecobol.bo",
            password="Empleado2026!",
            nombre="Maria",
            apellido="Lopez",
            rol="EMPLEADO",
            sucursal=sucursales.get("La Paz"),
        )
        print("  Empleado creado: empleado@ecobol.bo / Empleado2026!")

    print("\n[SEED COMPLETADO] Usuarios de prueba:")
    print("  Admin   : admin@ecobol.bo     / Admin2026!")
    print("  Gerente : gerente@ecobol.bo   / Gerente2026!")
    print("  Empleado: empleado@ecobol.bo  / Empleado2026!")


def seed_envios():
    """Crea envíos de demostración con datos bolivianos realistas. Usa get_or_create para ser idempotente."""
    from src.apps.envios.models import Envio, HistorialEstado

    try:
        estados = {e.nombre: e for e in Estado.objects.all()}
        sucursales = {s.departamento: s for s in Sucursal.objects.all()}
        emp = Usuario.objects.get(email="empleado@ecobol.bo")
        adm = Usuario.objects.get(email="admin@ecobol.bo")
    except Exception as e:
        print(f"  Error cargando datos base: {e}")
        return

    REG  = estados["REGISTRADO"]
    TRA  = estados["EN_TRANSITO"]
    DES  = estados["EN_SUCURSAL_DESTINO"]
    RUT  = estados["EN_RUTA_ENTREGA"]
    ENT  = estados["ENTREGADO"]
    DEV  = estados["DEVUELTO"]

    lp   = sucursales["La Paz"]
    sc   = sucursales["Santa Cruz"]
    cbba = sucursales["Cochabamba"]
    oru  = sucursales["Oruro"]
    pot  = sucursales["Potosi"]
    suc  = sucursales["Sucre"]
    tar  = sucursales["Tarija"]
    tri  = sucursales["Trinidad"]
    cob  = sucursales["Cobija"]

    # (codigo, remitente, tel_rem, dest, tel_dest, dir_dest, desc, peso, origen, destino, estado, user, obs_extra)
    ENVIOS = [
        ("ECO-2026-A1B2C", "Juan Quispe Mamani", "70012345",
         "Ana Condori Flores", "71234567", "Av. Monseñor Rivero 320, Santa Cruz",
         "Documentos notariales urgentes", "1.50", "27.50", lp, sc, TRA, emp, "En ruta hacia Santa Cruz"),
        ("ECO-2026-D4E5F", "Maria Lopez Torres", "71111111",
         "Pedro Rojas Vaca", "72222222", "Av. Heroinas 100, Cochabamba",
         "Ropa y articulos personales", "5.00", "45.00", sc, cbba, REG, adm, None),
        ("ECO-2026-G7H8I", "Roberto Flores Siles", "73333333",
         "Carmen Quispe Choque", "74444444", "Calle Murillo 45, La Paz",
         "Electrodomestico pequeno (licuadora)", "3.20", "36.00", cbba, lp, ENT, emp, "Entregado conforme"),
        ("ECO-2026-K1L2M", "Fernanda Mamani Apaza", "76611122",
         "Miguel Torrez Quispe", "77833344", "Calle Bolivar 230, Oruro",
         "Medicamentos y suplementos", "2.00", "30.00", lp, oru, DES, emp, "Llegado a sucursal Oruro"),
        ("ECO-2026-P3Q4R", "Diego Condori Villca", "72255566",
         "Patricia Rocha Lima", "71988877", "Av. Las Americas 567, Tarija",
         "Libros universitarios y apuntes", "4.50", "42.50", sc, tar, TRA, adm, "En transito departamental"),
        ("ECO-2026-S5T6U", "Alejandra Soria Reyes", "73344455",
         "Hernan Vaca Diaz", "74566677", "Calle Sucre 120, Potosi",
         "Repuestos electronicos", "1.80", "28.00", cbba, pot, ENT, emp, "Entregado al destinatario"),
        ("ECO-2026-V7W8X", "Luis Mamani Chura", "70099988",
         "Rosario Flores Mamani", "71022233", "Av. 6 de Agosto 890, Trinidad",
         "Artesanias y tejidos tipicos", "2.50", "30.00", lp, tri, RUT, emp, "En camino para entrega final"),
        ("ECO-2026-Y9Z0A", "Claudia Gutierrez Pardo", "76877766",
         "Jose Quispe Calle", "72100099", "Av. Internacional 45, Cobija",
         "Computadora portatil (empaquetada)", "3.00", "28.80", sc, cob, DEV, adm, "Devuelto: destinatario no encontrado"),
        ("ECO-2026-B2C3D", "Eduardo Salazar Velez", "71344455",
         "Monica Arandia Soto", "73566677", "Calle La Paz 78, Sucre",
         "Documentos academicos universitarios", "0.80", "20.00", lp, suc, DES, emp, "Paquete en sucursal Sucre"),
        ("ECO-2026-E4F5G", "Silvia Choque Huanca", "70877788",
         "Raul Ticona Nina", "72599900", "Av. Mariscal Sucre 340, Cochabamba",
         "Alimentos no perecederos (regalo)", "8.00", "70.00", tar, cbba, TRA, adm, "En transito via Santa Cruz"),
        ("ECO-2026-H6I7J", "Nicolas Poma Condori", "73100122",
         "Beatriz Morales Cruz", "71455566", "Calle Ingavi 56, La Paz",
         "Instrumentos musicales (zamponas)", "1.50", "27.50", oru, lp, ENT, emp, "Entregado sin novedad"),
        ("ECO-2026-K8L9M", "Andrea Vargas Perez", "76311234",
         "Gonzalo Hinojosa Paz", "71677788", "Av. Busch 123, Santa Cruz",
         "Ropa deportiva y calzados", "6.00", "55.00", cbba, sc, REG, adm, None),
    ]

    for (cod, rem_n, rem_t, des_n, des_t, des_dir, desc, peso, precio,
         origen, destino, estado_final, user, obs_extra) in ENVIOS:
        envio, created = Envio.objects.get_or_create(
            codigo_rastreo=cod,
            defaults=dict(
                remitente_nombre=rem_n, remitente_telefono=rem_t,
                destinatario_nombre=des_n, destinatario_telefono=des_t,
                destinatario_direccion=des_dir, descripcion=desc,
                peso_kg=peso, precio_bs=precio,
                sucursal_origen=origen, sucursal_destino=destino,
                estado_actual=estado_final, registrado_por=user,
            )
        )
        if not created:
            print(f"  Ya existe: {cod}")
            continue

        # Historial completo según el estado final
        pasos = [REG]
        if estado_final == TRA:   pasos += [TRA]
        elif estado_final == DES:  pasos += [TRA, DES]
        elif estado_final == RUT:  pasos += [TRA, DES, RUT]
        elif estado_final == ENT:  pasos += [TRA, DES, RUT, ENT]
        elif estado_final == DEV:  pasos += [TRA, DEV]

        for i, est in enumerate(pasos):
            obs = obs_extra if (est == estado_final and obs_extra) else f"Envio en estado {est.nombre}."
            HistorialEstado.objects.create(
                envio=envio, estado=est,
                sucursal=destino if i > 0 else origen,
                actualizado_por=user, observacion=obs,
            )
        print(f"  Envio creado: {cod} [{estado_final.nombre}]")


if __name__ == "__main__":
    seed()
    seed_envios()
