"""
backend/services/impacto.py — Capa de Negocio: Orquestador B2C

Responsabilidad: cruzar datos de inventario, misiones activas y forecast
para producir objetos ImpactStory listos para consumo directo en el frontend.

FIX 1 (aplicado): generar_misiones() recibe List[Insumo] (Pydantic), no Session.
"""
import uuid
from typing import List

from sqlalchemy.orm import Session

from backend.models.domain import ImpactStory, Insumo, Movimiento
from backend.storage.crud import obtener_insumos
from backend.core.logic import generar_misiones
from analytics_ia.forecast import calcular_forecast


def compilar_historias(db: Session, limite_historias: int = 15) -> List[ImpactStory]:
    """
    Transforma datos operativos (misiones) y analíticos (forecast) en objetos
    ImpactStory con narrativa lista para el frontend donante. El frontend
    no necesita calcular ni inferir nada: solo renderiza.
    """
    historias: List[ImpactStory] = []

    # ── Fix 1: obtener insumos y convertir a Pydantic antes de pasarlos ──
    insumos_db = obtener_insumos(db)
    insumos_pydantic = [Insumo.model_validate(i) for i in insumos_db]
    misiones_activas = generar_misiones(insumos_pydantic)
    misiones_ids = {m.insumo_id for m in misiones_activas}

    # Obtener predicciones de la capa analítica
    predicciones = calcular_forecast(db, dias_historico=30)

    for f in predicciones:
        # Impacto en familias: estimado según consumo semanal (3 unidades/familia/semana)
        familias = max(1, int(f.consumo_estimado * 7 / 3))

        # ── A. RESCATE CRÍTICO ──────────────────────────────────────────────
        # Condición: misión activa registrada O stock por debajo del nivel crítico
        if f.id in misiones_ids or f.stock_actual <= f.nivel_critico:
            historia = ImpactStory(
                id=str(uuid.uuid4()),
                insumo_id=f.id,
                nombre_insumo=f.nombre,
                categoria=f.categoria,
                casa="Casa CDMX",
                tipo_historia="rescate_critico",
                severidad="alta",
                titulo=f"Rescate Urgente: {f.nombre}",
                descripcion=(
                    "El almacén ha quebrado su reserva mínima segura. "
                    "Se requiere reabastecimiento inmediato para garantizar "
                    "la operación pediátrica esta noche."
                ),
                impacto_resumido=f"Protege el bienestar de {familias} niños que esperan hoy.",
                tiempo_texto="Requerido en menos de 24 horas",
                dias_restantes=0.0,
                accion_label="Apadrinar Rescate Inmediato",
                accion_tipo="transaccional_fuerte",
                origen="operacion_actual",
                confianza="alta",
                nivel_urgencia_relativa=10.0 + max(0, f.nivel_critico - f.stock_actual),
                consumo_estimado=f.consumo_estimado
            )
            historias.append(historia)
            continue

        # ── B. PREVENCIÓN INTELIGENTE ───────────────────────────────────────
        # Condición: forecast clasifica como 'atencion' (3-7 días para nivel crítico)
        if f.estado_forecast == "atencion":
            dias = f.dias_para_nivel_critico
            historia = ImpactStory(
                id=str(uuid.uuid4()),
                insumo_id=f.id,
                nombre_insumo=f.nombre,
                categoria=f.categoria,
                casa="Casa CDMX",
                tipo_historia="prevencion_inteligente",
                severidad="media",
                titulo=f"Prevención: {f.nombre} en riesgo próximo",
                descripcion=(
                    f"Nuestro motor analítico proyecta que {f.nombre} alcanzará "
                    f"el umbral crítico en aproximadamente {dias} días si no hay intervención."
                ),
                impacto_resumido=f"Interviniendo hoy proteges a {familias} menores del desabasto.",
                tiempo_texto=f"Alerta proyectada en {dias} días",
                dias_restantes=dias,
                accion_label="Apoyar esta Prevención",
                accion_tipo="transaccional_suave",
                origen="forecast_predictivo",
                confianza=f.confianza_basica,
                nivel_urgencia_relativa=10.0 - dias,  # más urgente = más cercano al umbral
                consumo_estimado=f.consumo_estimado
            )
            historias.append(historia)

    # Ordenar: nivel_urgencia_relativa DESC (críticos arriba, prevenciones abajo)
    historias.sort(key=lambda x: x.nivel_urgencia_relativa, reverse=True)

    return historias[:limite_historias]

def procesar_donacion_general(db: Session, monto: float = None) -> Movimiento:
    """
    Rutea una donación monetaria general hacia el insumo con mayor urgencia
    dictaminada por el modelo predictivo (CareForecast).
    """
    from backend.storage.crud import registrar_movimiento
    from backend.models.domain import MovimientoCreate

    historias = compilar_historias(db, limite_historias=1)
    if not historias:
        # En caso irreal de no haber ningún item en base
        return None
    
    mas_critico = historias[0]
    
    # Supongamos que una donación general aporta insumos para cubrir 1 semana de consumo
    cantidad_aportada = max(1, int(mas_critico.consumo_estimado * 7))

    return registrar_movimiento(
        db, 
        MovimientoCreate(
            insumo_id=mas_critico.insumo_id,
            tipo_movimiento="entrada",
            cantidad=cantidad_aportada,
            origen="publico",
            observacion=f"Donación general inteligente por ${monto if monto else 'general'} - ruteada a item más urgente."
        )
    )
