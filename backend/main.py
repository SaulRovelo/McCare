"""
backend/main.py — Entry point FastAPI

Importa conexión y modelos desde database/ (capa de datos).
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.router import api_router
from database.connection import engine, Base
from database.models import InsumoSQL, MovimientoSQL  # noqa: F401 — needed for create_all

# Crear tablas en SQLite al arrancar si no existen
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="McCare API",
    description="Motor operativo McCare | Al cuidado de los niños",
    version="12.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/")
def root():
    return {"message": "McCare Backend v12 — analytics_ia + database + backend"}
