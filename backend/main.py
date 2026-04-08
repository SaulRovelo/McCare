"""
backend/main.py — Entry point FastAPI

v3.0 — Agrega:
  - auth_router con endpoints de autenticación y perfiles
  - Importación de todos los modelos para create_all
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.router import api_router
from backend.api.auth_router import auth_router
from database.connection import engine, Base

from backend.api.familias_router import familias_router

# ── Importar todos los modelos para que create_all los registre ───────────────
from database.models import (  # noqa: F401
    InsumoSQL,
    MovimientoSQL,
    DonacionSQL,
    NotificacionSQL,
    ConfiguracionSQL,
    UsuarioSQL,
    PerfilDonanteSQL,
    FamiliaSQL,
)

# Crear tablas al arrancar (solo crea las que no existen — no destructivo)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="McCare API",
    description="Motor operativo McCare | Al cuidado de los niños",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router,      prefix="/api")
app.include_router(auth_router,     prefix="/api")
app.include_router(familias_router, prefix="/api")



@app.get("/")
def root():
    return {
        "message": "McCare Backend v3 — Auth + Analytics + Inventory",
        "docs": "/docs",
    }
