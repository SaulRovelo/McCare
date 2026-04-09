"""
backend/services/impacto.py — Capa de Negocio: Orquestador B2C

Responsabilidad: cruzar datos de inventario, misiones activas y forecast
para producir objetos ImpactStory listos para consumo directo en el frontend.

v2.0 — Correcciones:
  - Campos faltantes en ImpactStory: historia, meta_cantidad, unidad, faltante
  - Lógica de faltante calculada correctamente en MXN
"""
import uuid
from typing import List

from sqlalchemy.orm import Session

from backend.models.domain import ImpactStory, Insumo, Movimiento
from backend.storage.crud import obtener_insumos
from backend.core.logic import generar_misiones
from analytics_ia.forecast import calcular_forecast


def compilar_historias(db: Session, limite_historias: int = 15, sede: str = None) -> List[ImpactStory]:
    """
    Transforma datos operativos (misiones) y analíticos (forecast) en objetos
    ImpactStory con narrativa lista para el frontend donante. El frontend
    no necesita calcular ni inferir nada: solo renderiza.
    """
    historias: List[ImpactStory] = []

    insumos_db = obtener_insumos(db, sede=sede)
    insumos_pydantic = [Insumo.model_validate(i) for i in insumos_db]
    misiones_activas = generar_misiones(insumos_pydantic)
    misiones_ids = {m.insumo_id for m in misiones_activas}

    predicciones = calcular_forecast(db, dias_historico=30, sede=sede)

    for f in predicciones:
        # --- NUEVA LOGICA: IGNORAR MISIONES DE MAS DE 7 DIAS ---
        if f.dias_para_nivel_critico > 7 and f.stock_actual > f.nivel_critico:
            continue
            
        # Impacto en familias: estimado según consumo semanal (3 unidades/familia/semana)
        familias = max(1, int(f.consumo_estimado * 7 / 3))

        # ── A. RESCATE CRÍTICO (ROJO: <= 3 días) ─────────────────────────
        if f.id in misiones_ids or f.stock_actual <= f.nivel_critico or f.dias_para_nivel_critico <= 3:
            # Cuántas unidades faltan para cubrir 14 días desde el stock mínimo
            faltante_ud = max(0, f.nivel_critico - f.stock_actual + int(f.consumo_estimado * 14))
            desc = (
                "El almacén ha quebrado su reserva mínima segura. "
                "Se requiere reabastecimiento inmediato para garantizar "
                "la operación pediátrica esta noche."
            )
            historia = ImpactStory(
                id=str(uuid.uuid4()),
                insumo_id=f.id,
                nombre_insumo=f.nombre,
                categoria=f.categoria,
                casa=f"Casa {f.sede.upper()}",
                tipo_historia="rescate_critico",
                severidad="alta",
                titulo=f"Rescate Urgente: {f.nombre}",
                descripcion=desc,
                impacto_resumido=f"Protege el bienestar de {familias} niños que esperan hoy.",
                tiempo_texto="Requerido en menos de 24 horas" if f.stock_actual <= f.nivel_critico else f"Requerido en menos de {round(f.dias_para_nivel_critico)} días",
                dias_restantes=f.dias_para_nivel_critico if f.stock_actual > f.nivel_critico else 0.0,
                accion_label="Apadrinar Rescate Inmediato",
                accion_tipo="transaccional_fuerte",
                origen="operacion_actual",
                confianza="alta",
                nivel_urgencia_relativa=10.0 + max(0.0, float(f.nivel_critico - f.stock_actual)),
                consumo_estimado=f.consumo_estimado,
                # Campos UI pública
                historia=desc,
                meta_cantidad=faltante_ud,
                unidad="unidades",
                faltante=f"{faltante_ud} unidades",
            )
            historias.append(historia)
            continue

        # ── B. PREVENCIÓN INTELIGENTE (NARANJA: 4-7 días) ─────────────
        dias = f.dias_para_nivel_critico
        faltante_ud = max(0, int(f.consumo_estimado * 14) - f.stock_actual + f.nivel_critico)
        
        desc = (
            f"Nuestro motor analítico proyecta que {f.nombre} alcanzará "
            f"el umbral crítico en aproximadamente {round(dias)} días si no hay intervención."
        )
        historia = ImpactStory(
            id=str(uuid.uuid4()),
            insumo_id=f.id,
            nombre_insumo=f.nombre,
            categoria=f.categoria,
            casa=f"Casa {f.sede.upper()}",
            tipo_historia="prevencion_inteligente",
            severidad="media",
            titulo=f"Prevención: {f.nombre} en riesgo próximo",
            descripcion=desc,
            impacto_resumido=f"Interviniendo hoy proteges a {familias} menores del desabasto.",
            tiempo_texto=f"Alerta proyectada en {round(dias)} días",
            dias_restantes=dias,
            accion_label="Apoyar esta Prevención",
            accion_tipo="transaccional_suave",
            origen="forecast_predictivo",
            confianza=f.confianza_basica,
            nivel_urgencia_relativa=10.0 - dias,
            consumo_estimado=f.consumo_estimado,
            # Campos UI pública
            historia=desc,
            meta_cantidad=faltante_ud,
            unidad="unidades",
            faltante=f"{faltante_ud} unidades",
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
        return None

    mas_critico = historias[0]
    cantidad_aportada = max(1, int(mas_critico.consumo_estimado * 7))

    return registrar_movimiento(
        db,
        MovimientoCreate(
            insumo_id=mas_critico.insumo_id,
            tipo_movimiento="entrada",
            cantidad=cantidad_aportada,
            origen="publico",
            observacion=f"Donación general inteligente por ${monto if monto else 'general'} — ruteada a item más urgente.",
        )
    )
