"""
database/models.py — Capa de Datos: Modelos ORM SQLAlchemy

Responsabilidad: definir la estructura física de las tablas en SQLite/PostgreSQL.
No contiene lógica de negocio.

v2.0 — Agrega:
  - MovimientoSQL.origen (campo de trazabilidad faltante)
  - NotificacionSQL    (sistema de alertas internas)
  - DonacionSQL        (registro de donaciones con monto MXN)
  - ConfiguracionSQL   (parámetros globales configurables desde BD)
"""
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from .connection import Base


# ── Inventario ────────────────────────────────────────────────────────────────

class InsumoSQL(Base):
    __tablename__ = "insumos"

    id              = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    nombre          = Column(String(100), index=True, nullable=False)
    categoria       = Column(String(100), nullable=False)  # Alimentos | Higiene | Médico | Cuidado | Logística | Otros
    stock_actual    = Column(Integer, nullable=False, default=0)
    consumo_diario  = Column(Float, nullable=False, default=0.0)
    nivel_critico   = Column(Integer, nullable=False, default=0)
    capacidad_maxima= Column(Integer, nullable=False, default=100)
    sede            = Column(String(50), nullable=False, default="cdmx")
    costo_unitario  = Column(Float, nullable=False, default=10.0)   # MXN
    fecha_creacion  = Column(DateTime, default=datetime.utcnow)

    movimientos     = relationship("MovimientoSQL", back_populates="insumo", cascade="all, delete-orphan")
    donaciones      = relationship("DonacionSQL",   back_populates="insumo")
    notificaciones  = relationship("NotificacionSQL", back_populates="insumo")


# ── Movimientos de Inventario ─────────────────────────────────────────────────

class MovimientoSQL(Base):
    __tablename__ = "movimientos_inventario"

    id               = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    insumo_id        = Column(String, ForeignKey("insumos.id", ondelete="CASCADE"), nullable=False, index=True)
    tipo_movimiento  = Column(String(50), nullable=False)   # entrada | salida | ajuste
    cantidad         = Column(Integer, nullable=False)
    stock_resultante = Column(Integer, nullable=False)
    origen           = Column(String(30), nullable=False, default="interno")  # interno | publico | corporativo | urgente
    observacion      = Column(String(300), nullable=True)
    fecha            = Column(DateTime, default=datetime.utcnow, index=True)

    insumo           = relationship("InsumoSQL", back_populates="movimientos")


# ── Donaciones ────────────────────────────────────────────────────────────────

class DonacionSQL(Base):
    """
    Registro auditado de cada donación recibida.
    Separa la transacción económica del movimiento de inventario asociado.
    """
    __tablename__ = "donaciones"

    id              = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    insumo_id       = Column(String, ForeignKey("insumos.id", ondelete="SET NULL"), nullable=True, index=True)
    monto_mxn       = Column(Float, nullable=True)          # Donación monetaria (nullable si es en especie)
    cantidad_especie= Column(Integer, nullable=True)        # Donación en especie (nullable si es monetaria)
    tipo            = Column(String(20), nullable=False, default="monetaria")  # monetaria | especie
    origen          = Column(String(30), nullable=False, default="publico")    # publico | corporativo | interno
    donante_nombre  = Column(String(150), nullable=True)
    donante_email   = Column(String(150), nullable=True)
    observacion     = Column(String(300), nullable=True)
    fecha           = Column(DateTime, default=datetime.utcnow, index=True)

    insumo          = relationship("InsumoSQL", back_populates="donaciones")


# ── Notificaciones ────────────────────────────────────────────────────────────

class NotificacionSQL(Base):
    """
    Centro de alertas internas del sistema.
    Alimentado por: entradas en estado crítico, abastecimientos urgentes,
    umbrales de CareForecast.
    """
    __tablename__ = "notificaciones"

    id          = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    tipo        = Column(String(50), nullable=False)        # critico | urgente | atencion | info
    insumo_id   = Column(String, ForeignKey("insumos.id", ondelete="SET NULL"), nullable=True, index=True)
    titulo      = Column(String(200), nullable=False)
    mensaje     = Column(Text, nullable=False)
    leida       = Column(Boolean, nullable=False, default=False)
    fecha       = Column(DateTime, default=datetime.utcnow, index=True)

    insumo      = relationship("InsumoSQL", back_populates="notificaciones")


# ── Configuración Global ──────────────────────────────────────────────────────

class ConfiguracionSQL(Base):
    """
    Tabla de parámetros configurables sin necesidad de redeploy.
    Clave-valor con tipo y descripción.

    Claves reservadas del sistema:
      - familias_actuales   : int   — Número de familias actualmente alojadas
      - nombre_casa         : str   — Nombre visible de la sede
      - dias_cobertura_meta : int   — Meta de días de cobertura por insumo
    """
    __tablename__ = "configuracion"

    clave       = Column(String(100), primary_key=True, index=True)
    valor       = Column(Text, nullable=False)
    tipo        = Column(String(20), nullable=False, default="str")  # str | int | float | bool
    descripcion = Column(String(300), nullable=True)
    actualizado = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
