import sys
import os
import random
from datetime import datetime, timedelta

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ajustar PYTHONPATH para que Python rutee imports bien (backend/database)
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from database.models import InsumoSQL, MovimientoSQL
from database.connection import engine, SessionLocal

def simular_crisis():
    db = SessionLocal()
    print("Iniciando inyección de crisis de inventario para Testing de ML...")

    # Forzar un modelo limpio
    # Agarramos 3 insumos críticos conocidos
    nombres_criticos = ["Fórmula Láctea Etapa 1", "Pañales Prematuro", "Paracetamol Pediátrico"]
    insumos_afectados = db.query(InsumoSQL).filter(InsumoSQL.nombre.in_(nombres_criticos)).all()

    # Si por alguna razon no existen, agarramos los primeros 3
    if len(insumos_afectados) < 3:
        insumos_afectados = db.query(InsumoSQL).limit(3).all()

    now = datetime.utcnow()

    for insumo in insumos_afectados:
        print(f"Modificando insumo: {insumo.nombre} (Stock actual: {insumo.stock_actual}) a 0.")
        
        stock_original = insumo.stock_actual
        insumo.stock_actual = 0  # Reducir a cero absoluto
        
        # Inyectar 10 movimientos de salida masivos durante la redada de los ultimos 5 días
        # Esto forzará al árbol de Hoeffding (River) a aprender que la demanda subió muchísimo.
        stock_iter = stock_original
        # Borrar movimientos anteriores si existen para "ensuciar" la IA (Opcional, mejor sumamos salidas gruesas)
        
        for i in range(5, 0, -1):
            qty = stock_original // 5
            if qty <= 0: qty = 1
            
            stock_iter = max(0, stock_iter - qty)
            
            db.add(MovimientoSQL(
                insumo_id=insumo.id,
                tipo_movimiento="salida",
                cantidad=qty,
                stock_resultante=stock_iter,
                observacion="Salida por contingencia climática",
                fecha=now - timedelta(days=i)
            ))

    db.commit()
    print("Crisis inyectada exitosamente en la BD. Frontend reflejará alertas máximas rojas.")
    db.close()

if __name__ == "__main__":
    simular_crisis()
