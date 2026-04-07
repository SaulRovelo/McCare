"""
database/connection.py — Capa de Datos: Configuración de SQLAlchemy

Responsabilidad: configurar el engine, la sesión y la Base declarativa.
Para migrar a PostgreSQL: cambiar SQLALCHEMY_DATABASE_URL por la cadena de Postgres.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os

# URL configurable vía variable de entorno para facilitar migración futura
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./mccare.db")

# check_same_thread=False es necesario solo en SQLite con FastAPI (multi-thread)
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependencia de inyección FastAPI: abre y cierra la sesión por request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
