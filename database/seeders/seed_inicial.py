"""
database/seeders/seed_inicial.py — Seeder: Catálogo Base de Insumos

Responsabilidad: poblar la base de datos con el catálogo inicial de insumos
de McCare. Se ejecuta una sola vez en un entorno limpio.

Uso:
    python -m database.seeders.seed_inicial
    (o vía delegador: python seed.py)
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from database.connection import SessionLocal, engine, Base
from database.models import InsumoSQL  # noqa: F401 — necesario para create_all
from backend.models.domain import InsumoCreate
from backend.storage.crud import agregar_insumo


CATALOGO_INICIAL = [
    # Alimentos (CRÍTICOS en CDMX)
    InsumoCreate(nombre="Fórmula Láctea Etapa 1",   categoria="Alimentos", stock_actual=10,  consumo_diario=5.0,  nivel_critico=15, capacidad_maxima=100, sede="cdmx", costo_unitario=250),
    InsumoCreate(nombre="Papilla de Frutas",          categoria="Alimentos", stock_actual=25, consumo_diario=12.0, nivel_critico=30, capacidad_maxima=150, sede="cdmx", costo_unitario=80),
    InsumoCreate(nombre="Leche Entera 1L",            categoria="Alimentos", stock_actual=40,  consumo_diario=8.0,  nivel_critico=20, capacidad_maxima=100, sede="cdmx", costo_unitario=35),
    # Higiene (RIESGO / HEALTHY en Puebla)
    InsumoCreate(nombre="Pañales Etapa 4",            categoria="Higiene",   stock_actual=80, consumo_diario=25.0, nivel_critico=60, capacidad_maxima=300, sede="puebla", costo_unitario=320),
    InsumoCreate(nombre="Toallas Húmedas (Paquete)",  categoria="Higiene",   stock_actual=150, consumo_diario=15.0, nivel_critico=40, capacidad_maxima=500, sede="puebla", costo_unitario=45),
    InsumoCreate(nombre="Jabón Neutro",               categoria="Higiene",   stock_actual=15,  consumo_diario=5.0,  nivel_critico=15, capacidad_maxima=100, sede="puebla", costo_unitario=20),
    # Médico (MIXTO Edomex)
    InsumoCreate(nombre="Gasa Estéril",               categoria="Médico",    stock_actual=300, consumo_diario=40.0, nivel_critico=100, capacidad_maxima=1000, sede="edomex", costo_unitario=15),
    InsumoCreate(nombre="Suero Oral",                 categoria="Médico",    stock_actual=15,  consumo_diario=10.0, nivel_critico=25, capacidad_maxima=100, sede="edomex", costo_unitario=30),
    InsumoCreate(nombre="Paracetamol Infantil",       categoria="Médico",    stock_actual=12,  consumo_diario=2.0,  nivel_critico=10, capacidad_maxima=50, sede="edomex", costo_unitario=120),
    # Cuidado
    InsumoCreate(nombre="Biberón Anti-cólicos",       categoria="Cuidado",   stock_actual=25,  consumo_diario=1.0,  nivel_critico=5, capacidad_maxima=50, sede="edomex", costo_unitario=180),
]


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        for insumo_data in CATALOGO_INICIAL:
            agregar_insumo(db, insumo_data)
        print("✅ Catálogo inicial cargado en SQLite.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
