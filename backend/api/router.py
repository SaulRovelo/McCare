"""
backend/api/router.py — Endpoints HTTP de McCare corregido con Google OAuth
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import os

# Librerías para Google Auth
from google.oauth2 import id_token
from google.auth.transport import requests

from database.connection import get_db
from backend.models.domain import (
    Insumo, InsumoCreate,
    MisionCritica,
    Movimiento, MovimientoCreate,
    ForecastResult,
    ImpactStory,
    AdminResumen,
    ImpactoResumen,
    MisionFinanciable,
    CorporativoResumen,
    ReporteCorporativo,
)
from backend.storage import crud
from backend.core import logic
from analytics_ia.forecast import calcular_forecast
from backend.services.impacto import compilar_historias
from backend.services.metricas import obtener_resumen_admin, obtener_resumen_impacto
from backend.services.corporativo import (
    obtener_misiones_financiables,
    obtener_resumen_corporativo,
    generar_reporte_esg,
)

api_router = APIRouter()

# CONFIGURACIÓN DE GOOGLE (Pega aquí tu Client ID de la captura anterior)
GOOGLE_CLIENT_ID = "478417727238-671ot37tmqh9ol7dmf23582dv1nug5ma.apps.googleusercontent.com"

# ── Sistema & Auth ──────────────────────────────────────────────────────────

@api_router.get("/health", tags=["Sistema"])
def health_check():
    return {"status": "ok", "version": "12.0.0", "database": "sqlite"}

@api_router.post("/auth/google", tags=["Sistema"])
async def autenticar_con_google(data: dict, db: Session = Depends(get_db)):
    """
    Recibe el token JWT de Google desde el frontend, lo valida y 
    devuelve la sesión del usuario.
    """
    token = data.get("token")
    if not token:
        raise HTTPException(status_code=400, detail="Token no proporcionado")

    try:
        # Validar el token contra los servidores de Google
        id_info = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        
        # Aquí puedes extraer la info para McCare
        # id_info contiene: 'email', 'name', 'picture', 'sub' (ID único)
        return {
            "mensaje": "Autenticación exitosa",
            "usuario": {
                "email": id_info.get("email"),
                "nombre": id_info.get("name"),
                "avatar": id_info.get("picture")
            }
        }
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de Google inválido o expirado"
        )

# ── Inventario ───────────────────────────────────────────────────────────────

@api_router.get("/insumos", response_model=List[Insumo], tags=["Inventario"])
def listar_insumos(db: Session = Depends(get_db)):
    """Lista completa del inventario actual."""
    return crud.obtener_insumos(db)

@api_router.post("/insumos", response_model=Insumo, tags=["Inventario"])
def agregar_nuevo_insumo(insumo_data: InsumoCreate, db: Session = Depends(get_db)):
    """Crea un insumo o acumula stock si el nombre ya existe (UPSERT)."""
    return crud.agregar_insumo(db, insumo_data)

# ── Misiones ─────────────────────────────────────────────────────────────────

@api_router.get("/misiones", response_model=List[MisionCritica], tags=["Misiones"])
def obtener_misiones(db: Session = Depends(get_db)):
    """Evalúa el inventario actual y devuelve misiones críticas activas."""
    insumos_db = crud.obtener_insumos(db)
    insumos_pydantic = [Insumo.model_validate(i) for i in insumos_db]
    return logic.generar_misiones(insumos_pydantic)

# ── Auditoría ─────────────────────────────────────────────────────────────────

@api_router.get("/movimientos", response_model=List[Movimiento], tags=["Auditoría"])
def listar_movimientos_globales(limit: int = 20, db: Session = Depends(get_db)):
    """Últimos N movimientos de todo el almacén."""
    return crud.obtener_movimientos_globales(db, limit=limit)

@api_router.post("/movimientos", response_model=Movimiento, tags=["Auditoría"])
def crear_movimiento(movimiento_data: MovimientoCreate, db: Session = Depends(get_db)):
    """Registra un movimiento auditado. El campo 'origen' permite trazabilidad."""
    return crud.registrar_movimiento(db, movimiento_data)

@api_router.get("/insumos/{insumo_id}/movimientos", response_model=List[Movimiento], tags=["Auditoría"])
def listar_movimientos_por_insumo(insumo_id: str, db: Session = Depends(get_db)):
    """Historial completo de un insumo específico."""
    return crud.obtener_movimientos(db, insumo_id)

# ── Analítica ─────────────────────────────────────────────────────────────────

@api_router.get("/forecast", response_model=List[ForecastResult], tags=["Analítica"])
def obtener_forecast(limit: int = 20, db: Session = Depends(get_db)):
    """Proyecciones de agotamiento por insumo (analytics_ia/forecast.py)."""
    return calcular_forecast(db)[:limit]

# ── Admin ─────────────────────────────────────────────────────────────────────

@api_router.get("/admin/resumen", response_model=AdminResumen, tags=["Admin"])
def obtener_resumen_administrativo(db: Session = Depends(get_db)):
    return obtener_resumen_admin(db)

# ── Producto B2C (Público) ───────────────────────────────────────────────────

@api_router.get("/impacto/historias", response_model=List[ImpactStory], tags=["B2C Donantes"])
def obtener_historias_donante(limit: int = 15, db: Session = Depends(get_db)):
    return compilar_historias(db, limit)

@api_router.get("/impacto/resumen", response_model=ImpactoResumen, tags=["B2C Donantes"])
def obtener_resumen_publico(db: Session = Depends(get_db)):
    historias = compilar_historias(db, 50)
    return obtener_resumen_impacto(db, historias)

@api_router.post("/impacto/donar_general", response_model=Movimiento, tags=["B2C Donantes"])
def donacion_general_b2c(monto: float = None, db: Session = Depends(get_db)):
    from backend.services.impacto import procesar_donacion_general
    movimiento = procesar_donacion_general(db, monto)
    if not movimiento:
        raise HTTPException(status_code=400, detail="No hay insumos para asignar donación.")
    return movimiento

# ── Corporativo (RSE / ESG) ────────────────────────────────────────────────────

@api_router.get("/corporativo/resumen", response_model=CorporativoResumen, tags=["Corporativo"])
def obtener_resumen_corporativo_endpoint(periodo: int = 30, db: Session = Depends(get_db)):
    return obtener_resumen_corporativo(db, periodo_dias=periodo)

@api_router.get("/corporativo/misiones-financiables", response_model=List[MisionFinanciable], tags=["Corporativo"])
def obtener_misiones_financiables_endpoint(db: Session = Depends(get_db)):
    return obtener_misiones_financiables(db)

@api_router.get("/corporativo/reporte", response_model=ReporteCorporativo, tags=["Corporativo"])
def obtener_reporte_esg(periodo: int = 30, db: Session = Depends(get_db)):
    return generar_reporte_esg(db, periodo_dias=periodo)