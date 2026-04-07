"""
backend/services/corporativo.py — Capa de Negocio: Portal Corporativo (RSE/ESG)

Responsabilidad: transformar datos operativos y analíticos en objetos orientados
a decisiones empresariales. Tono ejecutivo, trazabilidad verificable, impacto medible.

Usa funciones centralizadas de metricas.py para no duplicar cálculos.
"""
import uuid
from typing import List, Optional
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from database.models import MovimientoSQL, InsumoSQL
from backend.models.domain import (
    Insumo, MisionFinanciable, CorporativoResumen,
    ItemHistoricoImpacto, ReporteCorporativo, ImpactStory
)
from backend.storage.crud import obtener_insumos
from backend.core.logic import generar_misiones
from analytics_ia.forecast import calcular_forecast
from backend.services.metricas import calcular_familias_beneficiadas, calcular_cobertura_dias
from backend.services.impacto import compilar_historias


def _historia_a_mision_financiable(h: ImpactStory, consumo_estimado: float, stock_actual: int, nivel_critico: int) -> MisionFinanciable:
    """
    Convierte una ImpactStory en MisionFinanciable con tono ejecutivo B2B.
    Narrativa sin emoción: datos verificables, impacto cuantificado, inversión estimada.
    """
    familias = calcular_familias_beneficiadas(consumo_estimado, dias=7)
    cobertura = calcular_cobertura_dias(stock_actual, consumo_estimado)
    dias_14 = round(consumo_estimado * 14)

    if h.tipo_historia == "rescate_critico":
        descripcion = (
            f"El nivel de {h.nombre_insumo} ha caído por debajo del umbral operativo crítico. "
            f"Stock actual insuficiente para cubrir la demanda proyectada. "
            f"Se requiere reabastecimiento inmediato para mantener continuidad operativa."
        )
        cta = "Financiar rescate"
        inversion_label = f"~{dias_14} unidades (cobertura 14 días)"
    else:
        descripcion = (
            f"El motor analítico proyecta que {h.nombre_insumo} alcanzará el umbral crítico "
            f"en {round(h.dias_restantes)} días bajo el patrón de consumo actual "
            f"({round(consumo_estimado, 1)} unidades/día promedio últimos 30 días). "
            f"La intervención preventiva reduce costos logísticos vs. rescate de emergencia."
        )
        cta = "Financiar prevención"
        inversion_label = f"~{dias_14} unidades (cobertura 14 días preventiva)"

    return MisionFinanciable(
        id=h.id,
        insumo_id=h.insumo_id,
        nombre_insumo=h.nombre_insumo,
        categoria=h.categoria,
        tipo=h.tipo_historia,
        severidad=h.severidad,
        titulo=h.titulo,
        descripcion_ejecutiva=descripcion,
        impacto_familias=familias,
        cobertura_actual_dias=cobertura,
        dias_para_critico=h.dias_restantes,
        inversion_estimada_label=inversion_label,
        urgencia_relativa=h.nivel_urgencia_relativa,
        cta_label=cta,
        origen=h.origen,
        confianza=h.confianza,
    )


def obtener_misiones_financiables(db: Session) -> List[MisionFinanciable]:
    """
    Lista de misiones financiables para el portal corporativo.
    Usa las mismas ImpactStories del portal público pero con narrativa ejecutiva.
    """
    historias = compilar_historias(db, limite_historias=20)
    predicciones = {f.id: f for f in calcular_forecast(db)}

    misiones: List[MisionFinanciable] = []
    for h in historias:
        fc = predicciones.get(h.insumo_id)
        consumo = h.consumo_estimado
        stock   = fc.stock_actual  if fc else 0
        critico = fc.nivel_critico if fc else 0
        misiones.append(_historia_a_mision_financiable(h, consumo, stock, critico))

    misiones.sort(key=lambda m: m.urgencia_relativa, reverse=True)
    return misiones


def obtener_historial_impacto(db: Session, periodo_dias: int = 30) -> List[ItemHistoricoImpacto]:
    """
    Movimientos de tipo 'entrada' del período — presentados como eventos de impacto trazables.
    Cada entrada representa una donación o reabastecimiento real en la BD.
    """
    fecha_limite = datetime.utcnow() - timedelta(days=periodo_dias)

    entradas = (
        db.query(MovimientoSQL)
        .filter(
            MovimientoSQL.tipo_movimiento == "entrada",
            MovimientoSQL.fecha >= fecha_limite
        )
        .order_by(MovimientoSQL.fecha.desc())
        .limit(50)
        .all()
    )

    # Join manual con insumos para nombre y categoría
    insumos_map = {i.id: i for i in db.query(InsumoSQL).all()}

    items: List[ItemHistoricoImpacto] = []
    for e in entradas:
        insumo = insumos_map.get(e.insumo_id)
        # Extraer origen de la observación si no viene en campo dedicado
        obs = e.observacion or ""
        if "corporativo" in obs.lower():
            origen = "corporativo"
        elif "público" in obs.lower() or "publico" in obs.lower() or "donación" in obs.lower():
            origen = "publico"
        else:
            origen = "interno"

        items.append(ItemHistoricoImpacto(
            fecha=e.fecha,
            insumo_nombre=insumo.nombre if insumo else "Insumo desconocido",
            categoria=insumo.categoria if insumo else "—",
            cantidad=e.cantidad,
            stock_resultante=e.stock_resultante,
            origen_movimiento=origen,
            observacion=e.observacion
        ))

    return items


def obtener_resumen_corporativo(db: Session, periodo_dias: int = 30) -> CorporativoResumen:
    """
    KPIs ejecutivos para el header del portal corporativo.
    """
    misiones = obtener_misiones_financiables(db)
    historial = obtener_historial_impacto(db, periodo_dias)
    predicciones = calcular_forecast(db)

    criticas   = sum(1 for m in misiones if m.tipo == "rescate_critico")
    preventivas = sum(1 for m in misiones if m.tipo == "prevencion_inteligente")
    familias   = sum(m.impacto_familias for m in misiones)

    unidades_entrada = sum(h.cantidad for h in historial)

    coberturas = [
        calcular_cobertura_dias(f.stock_actual, f.consumo_estimado)
        for f in predicciones
        if f.consumo_estimado > 0
    ]
    cobertura_promedio = round(sum(coberturas) / len(coberturas), 1) if coberturas else 0.0

    if criticas > 0:
        estado = "critico"
        frase = f"{criticas} insumo(s) crítico(s) requieren financiamiento urgente. Impacto en {familias} familias potenciales."
    elif preventivas > 0:
        estado = "alerta"
        frase = f"Sistema en alerta preventiva. {preventivas} oportunidad(es) de intervención antes de crisis."
    else:
        estado = "optimo"
        frase = f"Operación dentro de parámetros. {unidades_entrada} unidades recibidas en los últimos {periodo_dias} días."

    return CorporativoResumen(
        periodo_dias=periodo_dias,
        misiones_financiables=len(misiones),
        misiones_criticas=criticas,
        misiones_preventivas=preventivas,
        familias_potenciales=familias,
        unidades_entrada_periodo=unidades_entrada,
        cobertura_promedio_dias=cobertura_promedio,
        estado_general=estado,
        frase_ejecutiva=frase
    )


def generar_reporte_esg(db: Session, periodo_dias: int = 30) -> ReporteCorporativo:
    """
    Genera el reporte exportable completo para comités ESG/RSE.
    """
    resumen    = obtener_resumen_corporativo(db, periodo_dias)
    misiones   = obtener_misiones_financiables(db)
    historial  = obtener_historial_impacto(db, periodo_dias)
    recomend   = [m for m in misiones if m.tipo == "prevencion_inteligente"]

    return ReporteCorporativo(
        generado_en=datetime.utcnow(),
        periodo_dias=periodo_dias,
        resumen=resumen,
        misiones_activas=[m for m in misiones if m.tipo == "rescate_critico"],
        historial_entradas=historial,
        recomendaciones_predictivas=recomend
    )
