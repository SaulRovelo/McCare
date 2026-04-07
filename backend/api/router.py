from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from typing import List

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
    NotificacionOut,
    ConfiguracionOut,
    SolicitudUrgenteOut,
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
from backend.services.notificaciones import (
    crear_notificacion,
    obtener_notificaciones,
    marcar_leida,
    marcar_todas_leidas,
    enviar_alerta_critica_bg,
)


api_router = APIRouter()


# ── Sistema ──────────────────────────────────────────────────────────────────

@api_router.get("/health", tags=["Sistema"])
def health_check():
    return {"status": "ok", "version": "12.0.0", "database": "sqlite"}


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


# ── Misiones Urgentes ─────────────────────────────────────────────────────────

@api_router.post("/misiones/urgente", response_model=SolicitudUrgenteOut, tags=["Misiones"])
def solicitar_abastecimiento_urgente(
    insumo_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Botón 'Solicitar Abastecimiento Urgente' del CareForecast.
    Genera movimiento de entrada urgente + notificación interna + correo en background.
    """
    from database.models import InsumoSQL
    from backend.models.domain import MovimientoCreate

    insumo = db.query(InsumoSQL).filter(InsumoSQL.id == insumo_id).first()
    if not insumo:
        raise HTTPException(status_code=404, detail="Insumo no encontrado.")

    predicciones = calcular_forecast(db)
    forecast_item = next((f for f in predicciones if f.id == insumo_id), None)
    consumo_ref = forecast_item.consumo_estimado if forecast_item else insumo.consumo_diario
    cantidad = max(10, int(consumo_ref * 14))

    movimiento = crud.registrar_movimiento(
        db,
        MovimientoCreate(
            insumo_id=insumo_id,
            tipo_movimiento="entrada",
            cantidad=cantidad,
            origen="urgente",
            observacion="Abastecimiento urgente solicitado manualmente desde CareForecast.",
        ),
    )

    notif = crear_notificacion(
        db,
        tipo="urgente",
        titulo=f"Abastecimiento urgente: {insumo.nombre}",
        mensaje=f"Entrada de {cantidad} uds registrada. Stock nuevo: {insumo.stock_actual}.",
        insumo_id=insumo_id,
    )

    background_tasks.add_task(
        enviar_alerta_critica_bg,
        db_url="",
        insumo_nombre=insumo.nombre,
        stock=insumo.stock_actual,
        tipo="urgente",
    )

    return SolicitudUrgenteOut(
        movimiento_id=movimiento.id,
        insumo_id=insumo_id,
        insumo_nombre=insumo.nombre,
        cantidad_reabastecida=cantidad,
        stock_nuevo=insumo.stock_actual,
        notificacion_id=notif.id,
        mensaje=f"Abastecimiento urgente de {cantidad} uds registrado.",
    )


# ── Notificaciones ────────────────────────────────────────────────────────────

@api_router.get("/notificaciones", response_model=List[NotificacionOut], tags=["Notificaciones"])
def listar_notificaciones(solo_no_leidas: bool = False, limit: int = 20, db: Session = Depends(get_db)):
    """Notificaciones del sistema para el panel administrativo."""
    rows = obtener_notificaciones(db, solo_no_leidas=solo_no_leidas, limit=limit)
    result = []
    for r in rows:
        out = NotificacionOut.model_validate(r)
        out.insumo_nombre = r.insumo.nombre if r.insumo else None
        result.append(out)
    return result


@api_router.get("/notificaciones/count", tags=["Notificaciones"])
def contar_no_leidas(db: Session = Depends(get_db)):
    """Badge count del sidebar: número de notificaciones no leídas."""
    from database.models import NotificacionSQL
    count = db.query(NotificacionSQL).filter(NotificacionSQL.leida == False).count()
    return {"no_leidas": count}


@api_router.patch("/notificaciones/{notificacion_id}/leer", response_model=NotificacionOut, tags=["Notificaciones"])
def leer_notificacion(notificacion_id: str, db: Session = Depends(get_db)):
    """Marca una notificación como leída."""
    notif = marcar_leida(db, notificacion_id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notificación no encontrada.")
    return NotificacionOut.model_validate(notif)


@api_router.post("/notificaciones/leer-todas", tags=["Notificaciones"])
def leer_todas_notificaciones(db: Session = Depends(get_db)):
    """Limpia la bandeja: marca todas como leídas."""
    count = marcar_todas_leidas(db)
    return {"marcadas": count}


# ── Configuración Global ──────────────────────────────────────────────────────

@api_router.get("/configuracion", response_model=List[ConfiguracionOut], tags=["Admin"])
def listar_configuracion(db: Session = Depends(get_db)):
    """Parámetros globales del sistema."""
    from database.models import ConfiguracionSQL
    return db.query(ConfiguracionSQL).all()


@api_router.patch("/configuracion/{clave}", response_model=ConfiguracionOut, tags=["Admin"])
def actualizar_parametro(clave: str, valor: str, db: Session = Depends(get_db)):
    """Actualiza un parámetro del sistema sin redeploy (ej: familias_actuales=52)."""
    from database.models import ConfiguracionSQL
    row = db.query(ConfiguracionSQL).filter_by(clave=clave).first()
    if not row:
        raise HTTPException(status_code=404, detail=f"Clave '{clave}' no encontrada.")
    row.valor = valor
    db.commit()
    db.refresh(row)
    return row
