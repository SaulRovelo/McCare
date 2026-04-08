import sys
import os
import csv
from datetime import datetime

# Agregamos la ruta base para que Python encuentre los módulos
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from database.connection import SessionLocal, Base, engine
from database.models import InsumoSQL, MovimientoSQL

def importar_csv_a_supabase():
    # 1. Asegurar que TODAS las tablas existan (esto crea Configuracion, Donacion, etc. si no existen)
    print("Verificando consistencia de tablas en Supabase...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    # 2. Leer insumos
    with open('/tmp/insumos.csv', mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Revisa si ya existe
            existe = db.query(InsumoSQL).filter_by(id=row['id']).first()
            if not existe:
                insumo = InsumoSQL(
                    id=row['id'],
                    nombre=row['nombre'],
                    categoria=row['categoria'],
                    stock_actual=int(row['stock_actual']),
                    consumo_diario=float(row['consumo_diario']),
                    nivel_critico=int(row['nivel_critico']),
                    capacidad_maxima=int(row['capacidad_maxima']),
                    sede=row['sede'],
                    costo_unitario=float(row['costo_unitario']),
                    fecha_creacion=datetime.strptime(row['fecha_creacion'], '%Y-%m-%d %H:%M:%S.%f')
                )
                db.add(insumo)
                
    # 3. Leer movimientos
    with open('/tmp/movimientos.csv', mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            existe = db.query(MovimientoSQL).filter_by(id=row['id']).first()
            if not existe:
                movimiento = MovimientoSQL(
                    id=row['id'],
                    insumo_id=row['insumo_id'],
                    tipo_movimiento=row['tipo_movimiento'],
                    cantidad=int(row['cantidad']),
                    stock_resultante=int(row['stock_resultante']),
                    fecha=datetime.strptime(row['fecha'], '%Y-%m-%d %H:%M:%S.%f'),
                    observacion=row['observacion'],
                    origen='interno' # Origen por defecto para los CSV legados
                )
                db.add(movimiento)
                
    db.commit()
    db.close()
    print("✅ Insumos y Movimientos importados exitosamente desde el CSV.")

if __name__ == "__main__":
    importar_csv_a_supabase()
