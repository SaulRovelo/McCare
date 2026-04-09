import sys
import os
from sqlalchemy import text

# Add current directory to path
sys.path.append(os.getcwd())

from database.connection import SessionLocal
from database.models import InsumoSQL

def normalize():
    db = SessionLocal()
    try:
        print("--- Iniciando Normalización de Inventario ---")
        
        # 1. Asegurar que todos los insumos tienen un ritmo de consumo > 0
        items = db.query(InsumoSQL).all()
        for item in items:
            if item.consumo_diario <= 0:
                print(f"Normalizando ritmo para: {item.nombre} (era {item.consumo_diario})")
                item.consumo_diario = 1.2 # Un valor razonable por default
                
        # 2. Casos críticos para el demo (los de la imagen del usuario)
        # Panales Etapa 3 (Sede CDMX usualmente)
        p3 = db.query(InsumoSQL).filter(InsumoSQL.nombre.like("%Pañales Etapa 3%")).first()
        if p3:
            print(f"Ajustando Pañales E3: Stock {p3.stock_actual} -> 12, Consumo -> 4.5 (Agotamiento en ~3 días)")
            p3.stock_actual = 12
            p3.consumo_diario = 4.5
            p3.nivel_critico = 15
            
        # Panales Etapa 4
        p4 = db.query(InsumoSQL).filter(InsumoSQL.nombre.like("%Pañales Etapa 4%")).first()
        if p4:
            print(f"Ajustando Pañales E4: Stock {p4.stock_actual} -> 45, Consumo -> 6.0 (Agotamiento en ~7 días)")
            p4.stock_actual = 45
            p4.consumo_diario = 6.0
            p4.nivel_critico = 20
            
        # 3. Un caso ya agotado o casi agotado (1 día) para impacto visual
        leche = db.query(InsumoSQL).filter(InsumoSQL.nombre.like("%Leche%")).first()
        if leche:
            print(f"Ajustando Leche: Stock {leche.stock_actual} -> 2, Consumo -> 2.0 (Agotamiento HOY/MAÑANA)")
            leche.stock_actual = 2
            leche.consumo_diario = 2.0
            leche.nivel_critico = 10

        db.commit()
        print("--- Normalización Completada con Éxito ---")
        
    except Exception as e:
        print(f"Error durante la normalización: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    normalize()
