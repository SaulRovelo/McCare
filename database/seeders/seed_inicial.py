"""
database/seeders/seed_inicial.py — Seeder v2.0: Catálogo Base de Insumos + Configuración

v2.0 — Agrega:
  - Precios en MXN reales
  - Categorías: Alimentos, Higiene, Médico, Cuidado, Logística, Otros
  - Tabla ConfiguracionSQL con parámetros globales (familias_actuales, etc.)
  - Notificaciones de bienvenida

Uso:
    python -m database.seeders.seed_inicial
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from database.connection import SessionLocal, engine, Base
from database.models import InsumoSQL, MovimientoSQL, DonacionSQL, NotificacionSQL, ConfiguracionSQL  # noqa
from backend.models.domain import InsumoCreate
from backend.storage.crud import agregar_insumo


# ── Catálogo de insumos con precios MXN reales ───────────────────────────────
CATALOGO_INICIAL = [
    # ── Alimentos ─────────────────────────────────────────────────────────────
    InsumoCreate(nombre="Fórmula Láctea Etapa 1",    categoria="Alimentos", stock_actual=10,  consumo_diario=5.0,  nivel_critico=15, capacidad_maxima=100, sede="cdmx",   costo_unitario=85.0),   # lata 400g
    InsumoCreate(nombre="Fórmula Láctea Etapa 2",    categoria="Alimentos", stock_actual=18,  consumo_diario=4.0,  nivel_critico=12, capacidad_maxima=80,  sede="cdmx",   costo_unitario=89.0),
    InsumoCreate(nombre="Papilla de Frutas",          categoria="Alimentos", stock_actual=25,  consumo_diario=12.0, nivel_critico=30, capacidad_maxima=150, sede="cdmx",   costo_unitario=45.0),   # frasco 190g
    InsumoCreate(nombre="Papilla de Verduras",        categoria="Alimentos", stock_actual=20,  consumo_diario=10.0, nivel_critico=25, capacidad_maxima=120, sede="puebla", costo_unitario=42.0),
    InsumoCreate(nombre="Leche Entera 1L",            categoria="Alimentos", stock_actual=40,  consumo_diario=8.0,  nivel_critico=20, capacidad_maxima=100, sede="cdmx",   costo_unitario=28.0),
    InsumoCreate(nombre="Agua Purificada 19L",        categoria="Alimentos", stock_actual=8,   consumo_diario=2.0,  nivel_critico=5,  capacidad_maxima=30,  sede="edomex", costo_unitario=45.0),

    # ── Higiene ───────────────────────────────────────────────────────────────
    InsumoCreate(nombre="Pañales Etapa 1 (RN)",       categoria="Higiene",   stock_actual=80,  consumo_diario=25.0, nivel_critico=60, capacidad_maxima=300, sede="cdmx",   costo_unitario=320.0),  # paquete 44 pzas
    InsumoCreate(nombre="Pañales Etapa 2",            categoria="Higiene",   stock_actual=60,  consumo_diario=20.0, nivel_critico=50, capacidad_maxima=250, sede="cdmx",   costo_unitario=330.0),
    InsumoCreate(nombre="Pañales Etapa 4",            categoria="Higiene",   stock_actual=90,  consumo_diario=22.0, nivel_critico=55, capacidad_maxima=280, sede="puebla", costo_unitario=350.0),
    InsumoCreate(nombre="Toallas Húmedas (Paquete)",  categoria="Higiene",   stock_actual=150, consumo_diario=15.0, nivel_critico=40, capacidad_maxima=500, sede="puebla", costo_unitario=55.0),
    InsumoCreate(nombre="Jabón Neutro",               categoria="Higiene",   stock_actual=15,  consumo_diario=5.0,  nivel_critico=15, capacidad_maxima=100, sede="puebla", costo_unitario=18.0),
    InsumoCreate(nombre="Shampoo para Bebé",          categoria="Higiene",   stock_actual=30,  consumo_diario=3.0,  nivel_critico=10, capacidad_maxima=80,  sede="edomex", costo_unitario=65.0),
    InsumoCreate(nombre="Desinfectante de Manos",     categoria="Higiene",   stock_actual=45,  consumo_diario=6.0,  nivel_critico=15, capacidad_maxima=120, sede="cdmx",   costo_unitario=38.0),

    # ── Médico ────────────────────────────────────────────────────────────────
    InsumoCreate(nombre="Gasa Estéril",               categoria="Médico",    stock_actual=300, consumo_diario=40.0, nivel_critico=100, capacidad_maxima=1000, sede="edomex", costo_unitario=8.0),   # pieza
    InsumoCreate(nombre="Suero Oral (Vida Suero)",    categoria="Médico",    stock_actual=15,  consumo_diario=10.0, nivel_critico=25,  capacidad_maxima=100,  sede="edomex", costo_unitario=25.0),
    InsumoCreate(nombre="Paracetamol Infantil",       categoria="Médico",    stock_actual=12,  consumo_diario=2.0,  nivel_critico=10,  capacidad_maxima=50,   sede="edomex", costo_unitario=38.0),
    InsumoCreate(nombre="Termómetro Digital",         categoria="Médico",    stock_actual=8,   consumo_diario=0.1,  nivel_critico=3,   capacidad_maxima=20,   sede="cdmx",   costo_unitario=180.0),
    InsumoCreate(nombre="Kit de Admisión Hospitalaria",categoria="Médico",   stock_actual=20,  consumo_diario=3.0,  nivel_critico=8,   capacidad_maxima=60,   sede="cdmx",   costo_unitario=150.0),

    # ── Cuidado ───────────────────────────────────────────────────────────────
    InsumoCreate(nombre="Biberón Anti-cólicos",       categoria="Cuidado",   stock_actual=25,  consumo_diario=1.0,  nivel_critico=5,  capacidad_maxima=50,  sede="edomex", costo_unitario=180.0),
    InsumoCreate(nombre="Cobija Térmica Bebé",        categoria="Cuidado",   stock_actual=35,  consumo_diario=0.5,  nivel_critico=10, capacidad_maxima=80,  sede="cdmx",   costo_unitario=220.0),
    InsumoCreate(nombre="Sábana Cuna (Par)",          categoria="Cuidado",   stock_actual=40,  consumo_diario=1.0,  nivel_critico=10, capacidad_maxima=100, sede="puebla", costo_unitario=145.0),
    InsumoCreate(nombre="Chupón Silicona",            categoria="Cuidado",   stock_actual=60,  consumo_diario=2.0,  nivel_critico=15, capacidad_maxima=120, sede="cdmx",   costo_unitario=55.0),

    # ── Logística / Transporte ────────────────────────────────────────────────
    InsumoCreate(nombre="Gasolina (L)",               categoria="Logística", stock_actual=200, consumo_diario=30.0, nivel_critico=60, capacidad_maxima=500, sede="cdmx",   costo_unitario=22.0),
    InsumoCreate(nombre="Cajas de Cartón (Paq. 10)", categoria="Logística", stock_actual=50,  consumo_diario=5.0,  nivel_critico=15, capacidad_maxima=150, sede="cdmx",   costo_unitario=120.0),
    InsumoCreate(nombre="Bolsas de Almacenamiento",   categoria="Logística", stock_actual=300, consumo_diario=20.0, nivel_critico=50, capacidad_maxima=800, sede="edomex", costo_unitario=12.0),

    # ── Otros ─────────────────────────────────────────────────────────────────
    InsumoCreate(nombre="Papel de Impresora (Resma)", categoria="Otros",     stock_actual=15,  consumo_diario=1.0,  nivel_critico=5,  capacidad_maxima=50,  sede="cdmx",   costo_unitario=95.0),
    InsumoCreate(nombre="Cubrebocas (Caja 50 pzas)", categoria="Otros",     stock_actual=20,  consumo_diario=2.0,  nivel_critico=5,  capacidad_maxima=100, sede="cdmx",   costo_unitario=85.0),
]


# ── Configuración global del sistema ─────────────────────────────────────────
CONFIGURACION_INICIAL = [
    ConfiguracionSQL(
        clave="familias_actuales",
        valor="47",
        tipo="int",
        descripcion="Número de familias actualmente alojadas. Se actualiza manualmente desde el panel admin."
    ),
    ConfiguracionSQL(
        clave="nombre_casa",
        valor="Casa Ronald McDonald CDMX",
        tipo="str",
        descripcion="Nombre visible de la sede principal para comunicaciones y reportes."
    ),
    ConfiguracionSQL(
        clave="dias_cobertura_meta",
        valor="14",
        tipo="int",
        descripcion="Meta de días de cobertura mínima por insumo antes de considerar reabastecimiento."
    ),
    ConfiguracionSQL(
        clave="email_alertas",
        valor="admin@casaronald.org.mx",
        tipo="str",
        descripcion="Correo destino para alertas críticas del sistema (CareForecast + urgentes)."
    ),
    ConfiguracionSQL(
        clave="notificaciones_correo_activas",
        valor="false",
        tipo="bool",
        descripcion="Activa/desactiva el envío real de correos. En false solo se registran internamente."
    ),
]


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Insumos
        insumos_existentes = db.query(InsumoSQL).count()
        if insumos_existentes == 0:
            for insumo_data in CATALOGO_INICIAL:
                agregar_insumo(db, insumo_data)
            print(f"✅ {len(CATALOGO_INICIAL)} insumos cargados con precios MXN.")
        else:
            print(f"⚠️  Ya existen {insumos_existentes} insumos. Saltando catálogo.")

        # Configuración global
        for cfg in CONFIGURACION_INICIAL:
            existente = db.query(ConfiguracionSQL).filter_by(clave=cfg.clave).first()
            if not existente:
                db.add(cfg)
        db.commit()
        print("✅ Configuración global cargada.")

        # Notificación de bienvenida
        from database.models import NotificacionSQL
        n_existentes = db.query(NotificacionSQL).count()
        if n_existentes == 0:
            db.add(NotificacionSQL(
                tipo="info",
                titulo="Sistema McCare v2.0 inicializado",
                mensaje="Base de datos configurada correctamente. CareForecast activo y monitoreando inventario.",
            ))
            db.commit()
            print("✅ Notificación de bienvenida creada.")

    finally:
        db.close()


if __name__ == "__main__":
    run()
