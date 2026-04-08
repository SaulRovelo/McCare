"""
analytics_ia/forecast.py — Capa Analítica: Online Machine Learning Predictivo

Implementa un Árbol de Hoeffding (Hoeffding Tree Regressor) a través
del framework River para flujos continuos. Sustituye al modelo de batch tradicional
por aprendizaje incremental en vivo. Modela Pipeline con StandardScaler y Regresión.
"""
from typing import List, Dict
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from database.models import InsumoSQL, MovimientoSQL
from backend.models.domain import ForecastResult

from river import compose
from river import preprocessing
from river import tree

# Estado y Variables Globales del Modelo (ML en Streaming persistente en memoria)
_pipeline_ml = None
_model_warm = False

def _iniciar_pipeline_River():
    """
    Construye el pipeline solicitado por la Dirección:
    Normalización de entradas -> Clasificador Treenode Regresor
    """
    global _pipeline_ml
    _pipeline_ml = compose.Pipeline(
        preprocessing.StandardScaler(),
        tree.HoeffdingTreeRegressor(grace_period=5, leaf_prediction='adaptive')
    )

def extraer_features(fecha: datetime, stock_presente: int) -> Dict[str, float]:
    """Vectoriza las features continuas para el Scanner online de River."""
    return {
        "mes": float(fecha.month),
        "dia_semana": float(fecha.weekday()),
        "es_fin_semana": 1.0 if fecha.weekday() >= 5 else 0.0,
        "stock_logico": float(stock_presente)
    }

def entrenar_transaccion_viva(movimiento: MovimientoSQL):
    """
    Llamado directo desde el CRUD cuando un donante aporta
    o el almacén consume un producto, educando la IA online un registro a la vez.
    """
    global _pipeline_ml
    if _pipeline_ml is None:
        _iniciar_pipeline_River()
        
    if movimiento.tipo_movimiento == "salida":
        stock_antes_salida = movimiento.stock_resultante + movimiento.cantidad
        x = extraer_features(movimiento.fecha, stock_antes_salida)
        y = float(movimiento.cantidad)
        _pipeline_ml.learn_one(x, y)

def _calentar_modelo_desde_cero(db: Session):
    """Simulation loop para cold-start iterando la BD viva una sola vez"""
    global _model_warm
    salidas_historicas = db.query(MovimientoSQL).filter(MovimientoSQL.tipo_movimiento == "salida").order_by(MovimientoSQL.fecha.asc()).all()
    
    for mov in salidas_historicas:
        entrenar_transaccion_viva(mov)
        
    _model_warm = True


def calcular_forecast(db: Session, dias_historico: int = 30, sede: str = None) -> List[ForecastResult]:
    global _pipeline_ml, _model_warm
    
    if _pipeline_ml is None:
        _iniciar_pipeline_River()
        
    if not _model_warm:
        _calentar_modelo_desde_cero(db)

    query_insumos = db.query(InsumoSQL)
    if sede:
        query_insumos = query_insumos.filter(InsumoSQL.sede == sede)
    insumos_db = query_insumos.all()
    resultados: List[ForecastResult] = []
    now = datetime.utcnow()

    # ── [NUEVO] Contexto Operativo Real: Familias ──
    from database.models import FamiliaSQL
    from sqlalchemy import func

    # Calcular ocupación real sumando personas (adultos + ninos) en familias activas
    query_fam = db.query(func.sum(FamiliaSQL.numero_adultos + FamiliaSQL.numero_ninos)).filter(FamiliaSQL.estado == "activa")
    if sede:
        query_fam = query_fam.filter(FamiliaSQL.sede == sede)
        
    total_personas_activas = query_fam.scalar() or 0

    personas_en_sede = total_personas_activas
    
    # Asumimos una ocupación "base" operativa de diseño para el albergue
    OCUPACION_BASE = 50.0
    ocupacion_relativa = personas_en_sede / OCUPACION_BASE if OCUPACION_BASE > 0 else 0
    # Multiplicador exponencial de estrés logístico: Si rebasa 100%, el estrés crece más agresivo.
    factor_ajuste = (ocupacion_relativa ** 1.15) if ocupacion_relativa > 1.0 else max(1.0, ocupacion_relativa)


    for insumo in insumos_db:
        # Predecir consumo medio usando al Oráculo de Hoeffding para los prox. 3 días
        predicciones = []
        for offset in range(1, 4):
            fut_date = now + timedelta(days=offset)
            x_test = extraer_features(fut_date, insumo.stock_actual)
            y_pred = _pipeline_ml.predict_one(x_test)
            predicciones.append(max(0.1, float(y_pred)))
            
        consumo_estimado = sum(predicciones) / len(predicciones)
        metodo = "River_HoeffdingTree"
        confianza = "alta" if _model_warm else "media"

        # Fallback de sanidad si predice casi 0 por haber pocas "salidas" (falta historia real)
        if consumo_estimado <= 0.1:
            consumo_estimado = insumo.consumo_diario if insumo.consumo_diario > 0 else 0.5
            metodo = "fallback_base"
            confianza = "baja"

        # Aplicar el factor de ajuste poblacional al consumo estimado
        consumo_estimado = consumo_estimado * factor_ajuste

        # [NUEVO] Safety Padding: Añadir 10% de variabilidad estadística a la expectativa de salida
        # para siempre alertar al sistema levemente más temprano y evitar que realmente toque cero.
        consumo_estimado = consumo_estimado * 1.10

        stock = insumo.stock_actual
        nivel_critico = insumo.nivel_critico

        # Lógica general (Conservando la semántica visual para UI)
        dias_agotarse = max(0.0, round(stock / consumo_estimado, 1))

        if stock <= nivel_critico:
            dias_critico = 0.0
            estado = "critico"
            mensaje = "Emergencia [ML]: Umbral crítico rebasado."
        else:
            dias_critico = max(0.0, round((stock - nivel_critico) / consumo_estimado, 1))
            if dias_critico <= 3:
                estado = "critico"
                mensaje = f"Inminente [Hoeffding]: Caerá a zona crítica en {round(dias_critico)} días."
            elif dias_critico <= 7:
                estado = "atencion"
                mensaje = f"Prevención River ML: Alcanzará alerta en aprox. {round(dias_critico)} días."
            else:
                estado = "estable"
                mensaje = f"Sano: {round(dias_critico)} días de margen antes del nivel crítico."

        # Identificar casos sin datos puros
        if (metodo == "fallback_base" and stock > nivel_critico and insumo.consumo_diario <= 0):
            estado = "sin_datos"
            mensaje = "Datos insuficientes para entrenamiento de River."

        resultados.append(ForecastResult(
            id=insumo.id,
            nombre=insumo.nombre,
            categoria=insumo.categoria,
            stock_actual=stock,
            nivel_critico=nivel_critico,
            consumo_base=insumo.consumo_diario,
            consumo_estimado=round(consumo_estimado, 2),
            metodo_usado=metodo,
            dias_para_nivel_critico=dias_critico,
            dias_para_agotarse=dias_agotarse,
            estado_forecast=estado,
            confianza_basica=confianza,
            mensaje_forecast=mensaje,
            ocupacion_actual=total_personas_activas,
            factor_ajuste=round(factor_ajuste, 2),
            personas_en_sede=personas_en_sede
        ))

    resultados.sort(key=lambda x: (
        x.dias_para_nivel_critico,
        x.dias_para_agotarse,
        -x.consumo_estimado
    ))

    return resultados
