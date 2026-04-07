"""
backend/api/router.py — Endpoints HTTP de McCare

Responsabilidad: recibir peticiones HTTP, delegar a servicios y capa analítica,
y devolver respuestas JSON tipadas. No contiene lógica de negocio.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database.connection import get_db, engine
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


# ── Sistema ──────────────────────────────────────────────────────────────────

@api_router.get("/health", tags=["Sistema"])
def health_check():
    return {"status": "ok", "version": "12.0.0", "database": engine.name}


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
    """
    KPIs ejecutivos calculados en backend para el portal admin.
    Incluye: estado general, insumos por categoría de riesgo, cobertura promedio,
    misiones activas, movimientos recientes y porcentaje de catálogo sano.
    """
    return obtener_resumen_admin(db)


# ── Producto B2C (Público) ───────────────────────────────────────────────────

@api_router.get("/impacto/historias", response_model=List[ImpactStory], tags=["B2C Donantes"])
def obtener_historias_donante(limit: int = 15, db: Session = Depends(get_db)):
    """Historias de impacto para la vista donante. Combina misiones + forecast."""
    return compilar_historias(db, limit)


@api_router.get("/impacto/resumen", response_model=ImpactoResumen, tags=["B2C Donantes"])
def obtener_resumen_publico(db: Session = Depends(get_db)):
    """
    Resumen calculado en backend para el Hero del portal público.
    Evita que el frontend calcule urgencias o construya mensajes.
    """
    historias = compilar_historias(db, 50)
    return obtener_resumen_impacto(db, historias)


@api_router.post("/impacto/donar_general", response_model=Movimiento, tags=["B2C Donantes"])
def donacion_general_b2c(monto: float = None, db: Session = Depends(get_db)):
    """
    Recibe una donación general y la asigna automáticamente al insumo
    más crítico dictaminado por CareForecast.
    """
    from backend.services.impacto import procesar_donacion_general
    from fastapi import HTTPException
    
    movimiento = procesar_donacion_general(db, monto)
    if not movimiento:
        raise HTTPException(status_code=400, detail="No hay insumos para asignar donación.")
    return movimiento

# ── Corporativo (RSE / ESG) ────────────────────────────────────────────────────

@api_router.get("/corporativo/resumen", response_model=CorporativoResumen, tags=["Corporativo"])
def obtener_resumen_corporativo_endpoint(periodo: int = 30, db: Session = Depends(get_db)):
    """
    KPIs ejecutivos para el portal corporativo.
    periodo: ventana de análisis en días (default 30). Acepta 7, 30, 90.
    """
    return obtener_resumen_corporativo(db, periodo_dias=periodo)


@api_router.get("/corporativo/misiones-financiables", response_model=List[MisionFinanciable], tags=["Corporativo"])
def obtener_misiones_financiables_endpoint(db: Session = Depends(get_db)):
    """
    Misiones financiables con narrativa ejecutiva B2B, impacto estimado y trazabilidad.
    Ordenadas por urgencia_relativa descendente (más críticas primero).
    """
    return obtener_misiones_financiables(db)


@api_router.get("/corporativo/reporte", response_model=ReporteCorporativo, tags=["Corporativo"])
def obtener_reporte_esg(periodo: int = 30, db: Session = Depends(get_db)):
    """
    Reporte exportable ESG/RSE completo del período.
    Incluye: resumen ejecutivo, misiones activas, historial de entradas
    y recomendaciones predictivas. Exportable como JSON desde el frontend.
    """
    return generar_reporte_esg(db, periodo_dias=periodo)

