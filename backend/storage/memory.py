import uuid
from typing import List, Optional
from ..models.domain import Insumo, InsumoCreate

_insumos_db: List[Insumo] = []

def obtener_insumos() -> List[Insumo]:
    return _insumos_db

def agregar_insumo(insumo_data: InsumoCreate) -> Insumo:
    # Soporte para la Demo Funcional (Fase 4): Upsert encubierto.
    # Si ingresa un POST con el mismo nombre, sumamos el stock simulando donación.
    for insumo in _insumos_db:
        if insumo.nombre.strip().lower() == insumo_data.nombre.strip().lower():
            insumo.stock_actual += insumo_data.stock_actual
            return insumo
            
    nuevo_insumo = Insumo(
        id=str(uuid.uuid4()),
        **insumo_data.model_dump()
    )
    _insumos_db.append(nuevo_insumo)
    return nuevo_insumo

def actualizar_stock(insumo_id: str, nuevo_stock: int) -> Optional[Insumo]:
    for insumo in _insumos_db:
        if insumo.id == insumo_id:
            insumo.stock_actual = nuevo_stock
            return insumo
    return None
