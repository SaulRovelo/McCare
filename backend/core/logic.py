import uuid
from typing import List
from ..models.domain import MisionCritica, Insumo, ForecastResult

def calcular_urgencia(consumo_diario: float, stock_actual: int) -> float:
    """Calcula el ratio de urgencia. Si no hay stock, define un ratio críticamente alto para priorizar."""
    if stock_actual <= 0:
        return consumo_diario * 10.0 if consumo_diario > 0 else 100.0
    return consumo_diario / stock_actual

def generar_misiones_desde_forecast(forecasts: List[ForecastResult]) -> List[MisionCritica]:
    """
    Toma los resultados de la IA (River/ML) y los convierte en misiones para el donante.
    REGLA DEMO: Solo se generan misiones para insumos con 0-7 días de cobertura.
    - 0-3 días = CRÍTICO (rojo)
    - 4-7 días = ALTA (amarillo)
    - Más de 7 días = no visible en misiones
    """
    UMBRAL_DEMO_DIAS = 7.0  # Solo misiones con urgencia real

    misiones = []
    for f in forecasts:
        # FILTRO PRINCIPAL: solo insumos en rango de urgencia (0-7 días)
        if f.estado_forecast not in ("critico", "atencion"):
            continue
        if f.dias_restantes > UMBRAL_DEMO_DIAS:
            continue

        prefijo = "¡URGENCIA! " if f.urgencia_nivel == "CRÍTICO" else "Acción Requerida: "
        mensaje = f"{prefijo}{f.urgencia_label} — Se necesita reabastecimiento inmediato."

        if f.stock_actual <= 0:
            mensaje = "¡AGOTADO! Se requiere abastecimiento inmediato para no detener la operación."

        misiones.append(MisionCritica(
            id=str(uuid.uuid4()),
            insumo_id=f.id,
            nombre_insumo=f.nombre,
            categoria=f.categoria,
            sede=f.sede,
            nivel_urgencia=f.consumo_estimado / max(1, f.stock_actual),
            dias_restantes=f.dias_restantes,
            fecha_quiebre=f.fecha_quiebre,
            urgencia_label=f.urgencia_label,
            urgencia_nivel=f.urgencia_nivel,
            is_predicted=f.is_predicted,
            consumo_diario=f.consumo_estimado,
            stock_actual=f.stock_actual,
            capacidad_maxima=f.nivel_critico * 3,
            mensaje=mensaje
        ))

    # Ordenamos por días restantes ascendente (más urgente primero)
    misiones.sort(key=lambda m: m.dias_restantes)
    return misiones

def generar_misiones(insumos: List[Insumo]) -> List[MisionCritica]:
    """
    [DEPRECADO] Versión legacy basada en reglas fijas. 
    Favor de usar generar_misiones_desde_forecast para consistencia con la IA.
    """
    misiones = []
    for insumo in insumos:
        if insumo.stock_actual <= insumo.nivel_critico:
            urgencia = calcular_urgencia(insumo.consumo_diario, insumo.stock_actual)
            dias = round(insumo.stock_actual / insumo.consumo_diario) if insumo.consumo_diario > 0 else 0
            
            misiones.append(MisionCritica(
                id=str(uuid.uuid4()),
                insumo_id=insumo.id,
                nombre_insumo=insumo.nombre,
                nivel_urgencia=urgencia,
                dias_para_agotarse=float(dias),
                mensaje=f"Se requiere apoyo para {insumo.nombre}. Quedan aprox. {dias} días."
            ))
    return misiones
