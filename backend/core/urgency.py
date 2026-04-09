from datetime import datetime, timedelta
from typing import TypedDict

class UrgencyMetrics(TypedDict):
    dias_restantes: float
    fecha_quiebre: str
    urgencia_label: str
    urgencia_nivel: str
    is_predicted: bool

def calcular_metricas_urgencia(stock_actual: int, consumo_estimado: float, nivel_critico: int) -> UrgencyMetrics:
    """
    Motor centralizado de cálculo de urgencia para unificar la verdad entre CareForecast y Misiones.
    """
    # 1. Calcular días restantes estadísticos
    dias_restantes = max(0.0, stock_actual / consumo_estimado) if consumo_estimado > 0 else 999.0
    dias_restantes = round(dias_restantes, 1)

    # 2. Fecha de quiebre absoluto
    if dias_restantes < 999.0:
        fecha_quiebre = (datetime.now() + timedelta(days=dias_restantes)).strftime("%Y-%m-%d")
    else:
        fecha_quiebre = "N/A"

    # 3. Nivel Crítico (la clasificación base de semaforización)
    if stock_actual <= nivel_critico or dias_restantes <= 3.0:
        urgencia_nivel = "CRÍTICO"
    elif dias_restantes <= 7.0:
        urgencia_nivel = "ALTA"
    else:
        urgencia_nivel = "ESTABLE"

    # 4. Etiqueta Visual de Tiempo ("El frontend NO debe calcular nada")
    # Para ser exactos y generar urgencia en la demo
    if dias_restantes <= 0.5:
        urgencia_label = "Se agota hoy"
    elif dias_restantes <= 1.5:
        urgencia_label = "Se agota mañana"
    else:
        urgencia_label = f"En {round(dias_restantes)} días"

    return {
        "dias_restantes": dias_restantes,
        "fecha_quiebre": fecha_quiebre,
        "urgencia_label": urgencia_label,
        "urgencia_nivel": urgencia_nivel,
        "is_predicted": True
    }
