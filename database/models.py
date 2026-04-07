"""
database/models.py — Capa de Datos: Modelos ORM SQLAlchemy

Responsabilidad: definir la estructura física de las tablas en SQLite/PostgreSQL.
No contiene lógica de negocio.
"""
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from .connection import Base


class InsumoSQL(Base):
    __tablename__ = "insumos"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    nombre = Column(String(100), index=True, nullable=False)
    categoria = Column(String(100), nullable=False)
    stock_actual = Column(Integer, nullable=False, default=0)
    consumo_diario = Column(Float, nullable=False, default=0.0)
    nivel_critico = Column(Integer, nullable=False, default=0)
    capacidad_maxima = Column(Integer, nullable=False, default=100)
    sede = Column(String(50), nullable=False, default="cdmx")
    costo_unitario = Column(Float, nullable=False, default=10.0)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)

    movimientos = relationship("MovimientoSQL", back_populates="insumo")


class MovimientoSQL(Base):
    __tablename__ = "movimientos_inventario"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    insumo_id = Column(String, ForeignKey("insumos.id"), nullable=False)
    tipo_movimiento = Column(String(50), nullable=False)  # entrada | salida | ajuste
    cantidad = Column(Integer, nullable=False)
    stock_resultante = Column(Integer, nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow)
    observacion = Column(String(200), nullable=True)

    insumo = relationship("InsumoSQL", back_populates="movimientos")
