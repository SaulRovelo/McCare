"""
database/models.py — Capa de Datos: Modelos ORM SQLAlchemy

Responsabilidad: definir la estructura física de las tablas.
Diseñado para SQLite en desarrollo y PostgreSQL/Supabase en producción
sin cambios en el código de negocio — solo cambia la DATABASE_URL en .env.

v3.0 — Agrega:
  - UsuarioSQL        (gestión de roles y autenticación)
  - PerfilDonanteSQL  (perfil extendido, preferencias e historial)
  - FK usuario_id en DonacionSQL y NotificacionSQL
"""
import uuid
import enum
from datetime import datetime

from sqlalchemy import (
    Column, String, Float, Integer, DateTime,
    ForeignKey, Boolean, Text, Enum as SAEnum,
)
from sqlalchemy.orm import relationship

from .connection import Base


# ── Enum: Roles de usuario ────────────────────────────────────────────────────

class RolUsuario(str, enum.Enum):
    admin       = "admin"
    donante     = "donante"
    corporativo = "corporativo"


# ── Usuarios ──────────────────────────────────────────────────────────────────

class UsuarioSQL(Base):
    """
    Tabla central de autenticación y roles.
    Preparada para migración a PostgreSQL:
      - UUIDs como PK (compatibles con Supabase Auth)
      - Sin dependencias de autoincrement de SQLite
    """
    __tablename__ = "usuarios"

    id             = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    nombre         = Column(String(150), nullable=False)
    email          = Column(String(150), unique=True, index=True, nullable=False)
    password_hash  = Column(String(200), nullable=False)
    rol            = Column(SAEnum(RolUsuario), nullable=False, default=RolUsuario.donante)
    activo         = Column(Boolean, nullable=False, default=True)
    sede           = Column(String(50), nullable=True)          # Solo para admin casa
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    ultimo_login   = Column(DateTime, nullable=True)

    perfil         = relationship("PerfilDonanteSQL", back_populates="usuario", uselist=False,
                                  cascade="all, delete-orphan")
    donaciones     = relationship("DonacionSQL", back_populates="usuario")
    notificaciones_propias = relationship("NotificacionSQL", back_populates="usuario_destino")


# ── Perfil Donante ─────────────────────────────────────────────────────────────

class PerfilDonanteSQL(Base):
    """
    Perfil extendido de cada donante.
    Se crea automáticamente al registrarse con rol=donante o corporativo.
    Las preferencias guían el Motor de Misiones para mostrar misiones personalizadas.
    """
    __tablename__ = "perfiles_donante"

    id                      = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    usuario_id              = Column(String, ForeignKey("usuarios.id", ondelete="CASCADE"),
                                     unique=True, nullable=False, index=True)

    # Preferencias de impacto
    preferencias_categoria  = Column(Text, nullable=True)   # JSON str: ["Alimentos","Higiene"]
    nivel_urgencia_pref     = Column(String(30), nullable=True, default="cualquiera")  # critico|cualquiera
    tipo_donacion_pref      = Column(String(30), nullable=True, default="monetaria")   # monetaria|especie|ambas

    # Estadísticas acumuladas (actualizadas al procesar donaciones)
    total_donado_mxn        = Column(Float, nullable=False, default=0.0)
    total_movimientos       = Column(Integer, nullable=False, default=0)

    # Nivel de reconocimiento gamificado
    nivel                   = Column(String(30), nullable=False, default="bronce")  # bronce|plata|oro|platino

    # Datos opcionales
    avatar_url              = Column(String(300), nullable=True)
    bio                     = Column(String(300), nullable=True)

    # Datos corporativos (solo si rol=corporativo)
    empresa_nombre          = Column(String(150), nullable=True)
    empresa_rfc             = Column(String(50),  nullable=True)

    fecha_creacion          = Column(DateTime, default=datetime.utcnow)

    usuario                 = relationship("UsuarioSQL", back_populates="perfil")


# ── Familias (Operativo) ────────────────────────────────────────────────────────

class FamiliaSQL(Base):
    """
    Representa una familia alojada en el albergue.
    Da contexto real (ocupación) al motor predictivo CareForecast.
    """
    __tablename__ = "familias"

    id                  = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    sede                = Column(String(50), nullable=False, default="cdmx")
    numero_adultos      = Column(Integer, nullable=False, default=1)
    numero_ninos        = Column(Integer, nullable=False, default=1)
    dias_estancia_est   = Column(Integer, nullable=False, default=7)  # Estancia estimada en días
    dias_reales         = Column(Integer, nullable=False, default=0)
    habitacion          = Column(String(50), nullable=True)
    paciente_edad       = Column(Integer, nullable=True)
    paciente_referencia = Column(String(150), nullable=True)
    necesidades_especiales = Column(Text, nullable=True)  # JSON String: ["transporte", "ropa"]
    estado              = Column(String(30), nullable=False, default="activa")  # activa | alta
    usuario_registro_id = Column(String, ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True)
    fecha_ingreso       = Column(DateTime, default=datetime.utcnow)
    fecha_alta          = Column(DateTime, nullable=True)

    usuario_registro    = relationship("UsuarioSQL")


# ── Inventario ────────────────────────────────────────────────────────────────

class InsumoSQL(Base):

    __tablename__ = "insumos"

    id               = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    nombre           = Column(String(100), index=True, nullable=False)
    categoria        = Column(String(100), nullable=False)
    stock_actual     = Column(Integer, nullable=False, default=0)
    consumo_diario   = Column(Float, nullable=False, default=0.0)
    nivel_critico    = Column(Integer, nullable=False, default=0)
    capacidad_maxima = Column(Integer, nullable=False, default=100)
    sede             = Column(String(50), nullable=False, default="cdmx")
    costo_unitario   = Column(Float, nullable=False, default=10.0)
    fecha_creacion   = Column(DateTime, default=datetime.utcnow)

    movimientos      = relationship("MovimientoSQL",   back_populates="insumo", cascade="all, delete-orphan")
    donaciones       = relationship("DonacionSQL",     back_populates="insumo")
    notificaciones   = relationship("NotificacionSQL", back_populates="insumo")


# ── Movimientos de Inventario ─────────────────────────────────────────────────

class MovimientoSQL(Base):
    __tablename__ = "movimientos_inventario"

    id               = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    insumo_id        = Column(String, ForeignKey("insumos.id", ondelete="CASCADE"), nullable=False, index=True)
    tipo_movimiento  = Column(String(50), nullable=False)
    cantidad         = Column(Integer, nullable=False)
    stock_resultante = Column(Integer, nullable=False)
    origen           = Column(String(30), nullable=False, default="interno")
    observacion      = Column(String(300), nullable=True)
    fecha            = Column(DateTime, default=datetime.utcnow, index=True)

    insumo           = relationship("InsumoSQL", back_populates="movimientos")


# ── Donaciones ────────────────────────────────────────────────────────────────

class DonacionSQL(Base):
    __tablename__ = "donaciones"

    id               = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    insumo_id        = Column(String, ForeignKey("insumos.id", ondelete="SET NULL"),   nullable=True, index=True)
    usuario_id       = Column(String, ForeignKey("usuarios.id", ondelete="SET NULL"),  nullable=True, index=True)
    monto_mxn        = Column(Float,   nullable=True)
    cantidad_especie = Column(Integer, nullable=True)
    tipo             = Column(String(20), nullable=False, default="monetaria")
    origen           = Column(String(30), nullable=False, default="publico")
    donante_nombre   = Column(String(150), nullable=True)
    donante_email    = Column(String(150), nullable=True)
    observacion      = Column(String(300), nullable=True)
    fecha            = Column(DateTime, default=datetime.utcnow, index=True)

    insumo           = relationship("InsumoSQL",   back_populates="donaciones")
    usuario          = relationship("UsuarioSQL",  back_populates="donaciones")


# ── Notificaciones ────────────────────────────────────────────────────────────

class NotificacionSQL(Base):
    __tablename__ = "notificaciones"

    id              = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    tipo            = Column(String(50), nullable=False)
    insumo_id       = Column(String, ForeignKey("insumos.id",   ondelete="SET NULL"), nullable=True, index=True)
    usuario_id      = Column(String, ForeignKey("usuarios.id",  ondelete="SET NULL"), nullable=True, index=True)
    titulo          = Column(String(200), nullable=False)
    mensaje         = Column(Text, nullable=False)
    leida           = Column(Boolean, nullable=False, default=False)
    fecha           = Column(DateTime, default=datetime.utcnow, index=True)

    insumo          = relationship("InsumoSQL",  back_populates="notificaciones")
    usuario_destino = relationship("UsuarioSQL", back_populates="notificaciones_propias")


# ── Configuración Global ──────────────────────────────────────────────────────

class ConfiguracionSQL(Base):
    __tablename__ = "configuracion"

    clave       = Column(String(100), primary_key=True, index=True)
    valor       = Column(Text, nullable=False)
    tipo        = Column(String(20), nullable=False, default="str")
    descripcion = Column(String(300), nullable=True)
    actualizado = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
