"""
backend/storage/crud.py — CRUD: Acceso a Datos para la Capa de Negocio

Responsabilidad: operaciones transaccionales sobre SQLite. Importa modelos
desde database/ (capa de datos) y valida reglas de integridad.
"""
import logging
import uuid
from datetime import datetime

from sqlalchemy.orm import Session
from fastapi import HTTPException

from database.models import InsumoSQL, MovimientoSQL
from backend.models import domain

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def obtener_insumos(db: Session):
    logger.info("CRUD GET: Consultando inventario en SQLite.")
    return db.query(InsumoSQL).all()


def agregar_insumo(db: Session, insumo_data: domain.InsumoCreate):
    """Crea un insumo nuevo o acumula stock si el nombre ya existe (UPSERT)."""
    insumos_existentes = db.query(InsumoSQL).all()
    for existente in insumos_existentes:
        if existente.nombre.strip().lower() == insumo_data.nombre.strip().lower():
            logger.info(f"CRUD UPSERT: +{insumo_data.stock_actual} a '{existente.nombre}'")
            existente.stock_actual += insumo_data.stock_actual
            audit_mov = MovimientoSQL(
                id=str(uuid.uuid4()),
                insumo_id=existente.id,
                tipo_movimiento="entrada",
                cantidad=insumo_data.stock_actual,
                stock_resultante=existente.stock_actual,
                observacion="Auto-generado por Donación (Upsert de API)"
            )
            db.add(audit_mov)
            db.commit()
            db.refresh(existente)
            return existente

    logger.info(f"CRUD CREATE: '{insumo_data.nombre}'")
    db_insumo = InsumoSQL(
        id=str(uuid.uuid4()),
        nombre=insumo_data.nombre,
        categoria=insumo_data.categoria,
        stock_actual=insumo_data.stock_actual,
        consumo_diario=insumo_data.consumo_diario,
        nivel_critico=insumo_data.nivel_critico,
        capacidad_maxima=insumo_data.capacidad_maxima,
        sede=insumo_data.sede,
        costo_unitario=insumo_data.costo_unitario
    )
    db.add(db_insumo)
    db.flush()

    audit_mov = MovimientoSQL(
        id=str(uuid.uuid4()),
        insumo_id=db_insumo.id,
        tipo_movimiento="entrada",
        cantidad=db_insumo.stock_actual,
        stock_resultante=db_insumo.stock_actual,
        observacion="Inventario inicial declarado en creación"
    )
    db.add(audit_mov)
    db.commit()
    db.refresh(db_insumo)
    return db_insumo


def obtener_movimientos(db: Session, insumo_id: str):
    logger.info(f"CRUD GET: Historial del insumo {insumo_id}")
    return (db.query(MovimientoSQL)
              .filter(MovimientoSQL.insumo_id == insumo_id)
              .order_by(MovimientoSQL.fecha.desc())
              .all())


def obtener_movimientos_globales(db: Session, limit: int = 5):
    logger.info("CRUD GET: Historial global")
    return (db.query(MovimientoSQL)
              .order_by(MovimientoSQL.fecha.desc())
              .limit(limit)
              .all())


def registrar_movimiento(db: Session, mov_data: domain.MovimientoCreate, fecha_override: datetime = None):
    """Registra una transacción de inventario con validación de integridad."""
    insumo = db.query(InsumoSQL).filter(InsumoSQL.id == mov_data.insumo_id).first()
    if not insumo:
        raise HTTPException(status_code=404, detail="Insumo no encontrado en la base de datos")

    if mov_data.tipo_movimiento == "entrada":
        insumo.stock_actual += mov_data.cantidad
    elif mov_data.tipo_movimiento == "salida":
        if mov_data.cantidad > insumo.stock_actual:
            raise HTTPException(status_code=400, detail="Stock insuficiente para la salida solicitada")
        insumo.stock_actual -= mov_data.cantidad
    elif mov_data.tipo_movimiento == "ajuste":
        # Ajuste absoluto: establece el stock al valor exacto indicado
        insumo.stock_actual = mov_data.cantidad

    nuevo_movimiento = MovimientoSQL(
        id=str(uuid.uuid4()),
        insumo_id=insumo.id,
        tipo_movimiento=mov_data.tipo_movimiento,
        cantidad=mov_data.cantidad,
        stock_resultante=insumo.stock_actual,
        observacion=mov_data.observacion,
        fecha=fecha_override if fecha_override else datetime.utcnow()
    )

    db.add(nuevo_movimiento)
    db.commit()
    db.refresh(nuevo_movimiento)
    
    # [ML Online Hook] Educar al modelo River con la nueva transacción
    try:
        from analytics_ia.forecast import entrenar_transaccion_viva
        entrenar_transaccion_viva(nuevo_movimiento)
    except Exception as e:
        logger.error(f"Fallo al entrenar nodo River: {e}")
        
    return nuevo_movimiento
