"""
backend/services/metricas.py — Capa de Negocio: Funciones Centralizadas de Métricas

Responsabilidad: calcular KPIs de impacto y resumen de forma reutilizable
por cualquier endpoint (admin, corporativo, público). Sin lógica duplicada.
"""
from typing import List
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from database.models import MovimientoSQL, InsumoSQL
from backend.models.domain import (
    Insumo, AdminResumen, ImpactoResumen, ForecastResult, ImpactStory
)
from backend.core.logic import generar_misiones
from backend.storage.crud import obtener_insumos
from analytics_ia.forecast import calcular_forecast


# ── Función Central de Impacto ────────────────────────────────────────────────

def calcular_familias_beneficiadas(consumo_estimado: float, dias: int = 7) -> int:
    """
    Estima el número de familias beneficiadas en función del consumo estimado.
    Supuesto: 3 unidades por día cubren las necesidades básicas de una familia.
    Centralizado para usarse en impacto.py, corporativo y admin sin duplicar.
    """
    if consumo_estimado <= 0:
        return 0
    return max(1, int(consumo_estimado * dias / 3))


def calcular_cobertura_dias(stock_actual: int, consumo_estimado: float) -> float:
    """
    Días de cobertura = stock actual / consumo estimado diario.
    Si consumo es 0, retorna infinito práctico (999) para indicar stock inmovilizado.
    """
    if consumo_estimado <= 0:
        return 999.0
    return round(stock_actual / consumo_estimado, 1)


# ── Resumen Administrativo ────────────────────────────────────────────────────

def obtener_resumen_admin(db: Session, sede: str = None) -> AdminResumen:
    """
    Calcula todos los KPIs operativos para el portal administrativo.
    Una sola llamada, todo calculado en backend.
    """
    insumos_db = obtener_insumos(db, sede=sede)
    insumos_pydantic = [Insumo.model_validate(i) for i in insumos_db]
    predicciones = calcular_forecast(db, sede=sede)
    misiones = generar_misiones(insumos_pydantic)

    # Clasificación por estado de forecast
    criticos   = sum(1 for f in predicciones if f.estado_forecast == "critico")
    atencion   = sum(1 for f in predicciones if f.estado_forecast == "atencion")
    estables   = sum(1 for f in predicciones if f.estado_forecast == "estable")
    sin_datos  = sum(1 for f in predicciones if f.estado_forecast == "sin_datos")
    total      = len(insumos_db)

    # Cobertura promedio (días) de todos los insumos
    coberturas = [
        calcular_cobertura_dias(f.stock_actual, f.consumo_estimado)
        for f in predicciones
        if f.consumo_estimado > 0
    ]
    cobertura_promedio = round(sum(coberturas) / len(coberturas), 1) if coberturas else 0.0

    # Movimientos de las últimas 24 horas
    hace_24h = datetime.utcnow() - timedelta(hours=24)
    q_movs = db.query(MovimientoSQL).join(InsumoSQL, MovimientoSQL.insumo_id == InsumoSQL.id).filter(
        MovimientoSQL.fecha >= hace_24h
    )
    if sede:
        q_movs = q_movs.filter(InsumoSQL.sede == sede)
    movimientos_recientes = q_movs.count()

    # Porcentaje del catálogo en estado sano
    pct_sano = round((estables / total * 100), 1) if total > 0 else 0.0

    # Estado general del sistema
    if criticos > 0:
        estado_general = "critico"
        mensaje = f"{criticos} insumo(s) bajo el nivel mínimo. Intervención necesaria."
    elif atencion > 0:
        estado_general = "alerta"
        mensaje = f"{atencion} insumo(s) en zona de prevención. Monitoreo activo."
    else:
        estado_general = "optimo"
        mensaje = "Operación estable. Todos los insumos dentro de márgenes seguros."

    return AdminResumen(
        total_insumos=total,
        insumos_criticos=criticos,
        insumos_atencion=atencion,
        insumos_estables=estables,
        insumos_sin_datos=sin_datos,
        misiones_activas=len(misiones),
        cobertura_promedio_dias=cobertura_promedio,
        movimientos_recientes=movimientos_recientes,
        porcentaje_catalogo_sano=pct_sano,
        estado_general=estado_general,
        mensaje_estado=mensaje
    )


# ── Resumen Público ──────────────────────────────────────────────────────────

def obtener_resumen_impacto(db: Session, historias: List[ImpactStory]) -> ImpactoResumen:
    """
    Calcula el resumen para el Hero del portal público.
    familias_en_riesgo: valor configurable desde ConfiguracionSQL, sin redeploy.
    """
    criticas    = sum(1 for h in historias if h.tipo_historia == "rescate_critico")
    preventivas = sum(1 for h in historias if h.tipo_historia == "prevencion_inteligente")
    total       = len(historias)

    # Fuente de verdad: BD configurable (panel admin puede actualizar este número)
    from backend.services.notificaciones import get_familias_actuales
    familias_total = get_familias_actuales(db)

    if criticas > 0:
        principal = f"{criticas} {'urgencia crítica' if criticas == 1 else 'urgencias críticas'} activa{'s' if criticas > 1 else ''}"
        sub = "Se necesita acción inmediata para cubrir las necesidades del albergue esta noche."
        hero = f"Hoy puedes cambiar la noche de {familias_total} niños"
    elif preventivas > 0:
        principal = f"{preventivas} {'necesidad próxima' if preventivas == 1 else 'necesidades próximas'} detectada{'s' if preventivas > 1 else ''}"
        sub = "No hay crisis hoy, pero nuestro sistema predice desabasto en los próximos días."
        hero = f"Ayuda a {familias_total} niños antes de que llegue la crisis"
    else:
        principal = "Todo cubierto por ahora"
        sub = "El inventario del albergue está en niveles seguros. Puedes apoyar para el futuro."
        hero = "Casa CDMX está protegida hoy. ¡Gracias a donantes como tú!"

    return ImpactoResumen(
        urgencias_criticas=criticas,
        prevenciones_activas=preventivas,
        total_historias=total,
        mensaje_principal=principal,
        submensaje=sub,
        mensaje_hero_emocional=hero,
        familias_en_riesgo=familias_total,
        tagline="Donaciones con impacto real"
    )

