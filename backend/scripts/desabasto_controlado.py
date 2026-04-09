import sys
import os
import uuid
from datetime import datetime

# Add project root to sys.path so we can import from database
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from database.connection import SessionLocal
from database.models import InsumoSQL, MovimientoSQL

def crear_desabasto():
    db = SessionLocal()
    
    # Obtener todos los insumos
    insumos = db.query(InsumoSQL).all()
    
    if not insumos:
        print("No hay insumos en la base de datos. Ejecuta seed_sedes.py primero.")
        return
        
    # Agrupar por sede
    sedes = {}
    for insumo in insumos:
        if insumo.sede not in sedes:
            sedes[insumo.sede] = []
        sedes[insumo.sede].append(insumo)
        
    for sede, lista_insumos in sedes.items():
        print(f"\nGenerando desabasto en la sede: {sede.upper()}")
        
        # Tomar los primeros 6 insumos para forzar misiones
        # (El prompt pide de 5 a 6 misiones por casa)
        seleccionados = lista_insumos[:6]
        
        for insumo in seleccionados:
            # Ponemos el stock por debajo del nivel crítico (-2) para forzar una misión de rescate crítico
            nuevo_stock = max(0, insumo.nivel_critico - 2)
            
            # Si el stock ya es menor o igual al crítico, lo reducimos un poco más
            if insumo.stock_actual <= insumo.nivel_critico:
                nuevo_stock = max(0, insumo.stock_actual - int(insumo.consumo_diario))
                
            print(f" - [Desabasto] {insumo.nombre}: de {insumo.stock_actual} a {nuevo_stock} (Crítico: {insumo.nivel_critico})")
            
            insumo.stock_actual = nuevo_stock
            
            # Registrar el movimiento de salida/ajuste para mantener integridad e historial
            mov = MovimientoSQL(
                id=str(uuid.uuid4()),
                insumo_id=insumo.id,
                tipo_movimiento="ajuste",
                cantidad=nuevo_stock,  # En ajuste, la cantidad es el stock final
                stock_resultante=nuevo_stock,
                observacion="Desabasto controlado (Script) para forzar misiones",
                origen="interno",
                fecha=datetime.utcnow()
            )
            db.add(mov)
            
    db.commit()
    db.close()
    print("\n¡Desabasto generado exitosamente en todas las casas/sedes!")

if __name__ == "__main__":
    crear_desabasto()
