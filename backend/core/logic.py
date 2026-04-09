import uuid
from typing import List
from ..models.domain import MisionCritica, Insumo

def calcular_urgencia(consumo_diario: float, stock_actual: int) -> float:
    """Calcula el ratio de urgencia. Si no hay stock, define un ratio críticamente alto para priorizar."""
    if stock_actual <= 0:
        return consumo_diario * 10.0 if consumo_diario > 0 else 100.0
    return consumo_diario / stock_actual

def generar_misiones(insumos: List[Insumo]) -> List[MisionCritica]:
    """
    Evalúa insumos mediante la regla de negocio estricta en tiempo real y devuelve las misiones.
    """
    misiones = []
    
    for insumo in insumos:
        dias_restantes = float('inf')
        if insumo.stock_actual <= 0:
            dias_restantes = 0.0
        elif insumo.consumo_diario > 0:
            dias_restantes = insumo.stock_actual / insumo.consumo_diario
            
        # Condición de negocio: ¿Debe generarse una misión? (solo si días_restantes <= 7 o está bajo nivel crítico)
        if dias_restantes <= 7 or insumo.stock_actual <= insumo.nivel_critico:
            urgencia = calcular_urgencia(insumo.consumo_diario, insumo.stock_actual)
            
            # Formato de mensaje amigable de ejemplo: se estiman necesidades para 7 días
            cantidad_sugerida = max(1, int(insumo.consumo_diario * 7))
            mensaje = f"Se requieren {cantidad_sugerida} unidades de {insumo.nombre} en los próximos días."
            
            if insumo.stock_actual <= 0:
                mensaje = f"¡AGOTADO! " + mensaje

            mision = MisionCritica(
                id=str(uuid.uuid4()),
                insumo_id=insumo.id,
                nombre_insumo=insumo.nombre,
                nivel_urgencia=urgencia,
                mensaje=mensaje
            )
            misiones.append(mision)
            
    # Ordenar las misiones de forma descendente (las más críticas primero)
    misiones.sort(key=lambda m: m.nivel_urgencia, reverse=True)
    
    return misiones
