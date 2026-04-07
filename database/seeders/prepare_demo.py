"""
database/seeders/prepare_demo.py — Seeder: Escenario Controlado para Demo/Hackathon

Responsabilidad: ajustar el estado de SQLite a un escenario predecible y reproducible
para presentaciones. NO es parte de la operación normal del sistema.

FIX 3: Este script ahora genera TANTO ajustes de stock COMO movimientos de salida
históricas retroactivos, para que el forecast tenga datos de consumo reales con qué
calcular las prevenciones (estado 'atencion').

Escenario 'hackathon':
  - 2 insumos críticos  → stock <= nivel_critico → misiones activas + rescate en /impacto
  - 2 insumos en riesgo → stock ≈ nivel_critico * 1.3 → prevención en /impacto (forecast 'atencion')
  - Resto estables      → no aparecen en /impacto

Uso:
    python -m database.seeders.prepare_demo --scenario hackathon
"""
import sys
import os
import random
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from database.connection import SessionLocal
from backend.storage.crud import obtener_insumos, registrar_movimiento
from backend.models.domain import MovimientoCreate


def _registrar_salidas_retroactivas(db, insumo, consumo_diario_objetivo: float, dias: int = 20):
    """
    Registra movimientos de salida backdateados para que el forecast
    detecte el insumo como de alto consumo estimado y lo clasifique correctamente.
    """
    hoy = datetime.utcnow()
    for dia_offset in range(dias, 0, -1):
        fecha = hoy - timedelta(days=dia_offset)
        varianza = random.uniform(0.85, 1.15)
        cantidad = max(1, int(consumo_diario_objetivo * varianza))
        # Solo registrar si no llevaría el stock negativo (la BD lo rechazaría)
        try:
            registrar_movimiento(
                db,
                MovimientoCreate(
                    insumo_id=insumo.id,
                    tipo_movimiento="salida",
                    cantidad=cantidad,
                    observacion=f"Consumo demo retroactivo (día -{dia_offset})"
                ),
                fecha_override=fecha
            )
        except Exception:
            # Si el stock se agota durante el backdating, detenemos para ese insumo
            break


def ensayar_hackathon():
    db = SessionLocal()
    insumos = obtener_insumos(db)

    if len(insumos) < 4:
        print("❌ Se necesitan al menos 4 insumos. Ejecuta: python seed.py")
        db.close()
        return

    random.seed(42)  # Reproducible

    criticos   = insumos[0:2]   # Primeros 2 → estado crítico
    en_riesgo  = insumos[2:4]   # Siguientes 2 → zona de atención
    sanos      = insumos[4:]    # Resto → estables

    print("🎭 Preparando Escenario Hackathon...\n")

    # --- 1. CRÍTICOS: stock por debajo del nivel_critico ---
    for insumo in criticos:
        # Dejar el stock en ~40% del nivel_critico (claramente crítico)
        stock_critico = max(1, int(insumo.nivel_critico * 0.4))
        registrar_movimiento(
            db,
            MovimientoCreate(
                insumo_id=insumo.id,
                tipo_movimiento="ajuste",
                cantidad=stock_critico,
                observacion="Escenario demo: nivel crítico forzado"
            )
        )
        print(f"🚨 CRÍTICO  | {insumo.nombre:<35} → stock ajustado a {stock_critico} (nivel_critico={insumo.nivel_critico})")

    print()

    # --- 2. EN RIESGO: stock ≈ nivel_critico * 1.3 + salidas históricas ---
    for insumo in en_riesgo:
        # Stock en zona de atención (entre nivel_critico y nivel_critico * 1.5)
        stock_riesgo = int(insumo.nivel_critico * 1.3)
        registrar_movimiento(
            db,
            MovimientoCreate(
                insumo_id=insumo.id,
                tipo_movimiento="ajuste",
                cantidad=stock_riesgo,
                observacion="Escenario demo: zona de atención"
            )
        )
        # Registrar salidas históricas retroactivas para que forecast calcule bien
        # Consumo alto para que dias_para_nivel_critico quede entre 3 y 7 días
        consumo_alto = insumo.consumo_diario * 1.5
        _registrar_salidas_retroactivas(db, insumo, consumo_alto, dias=20)
        dias_estimados = round((stock_riesgo - insumo.nivel_critico) / consumo_alto, 1)
        print(f"⚠️  ATENCIÓN | {insumo.nombre:<35} → stock={stock_riesgo}, ~{dias_estimados} días para nivel crítico")

    print()

    # --- 3. SANOS: stock saludable (> nivel_critico * 2) ---
    for insumo in sanos:
        stock_sano = max(insumo.nivel_critico * 3, 50)
        registrar_movimiento(
            db,
            MovimientoCreate(
                insumo_id=insumo.id,
                tipo_movimiento="ajuste",
                cantidad=stock_sano,
                observacion="Escenario demo: stock sano"
            )
        )
        print(f"💚 ESTABLE  | {insumo.nombre:<35} → stock={stock_sano}")

    print("\n✅ Escenario Hackathon listo.")
    print("   → /api/misiones        mostrará misiones para insumos críticos")
    print("   → /api/impacto/historias mostrará rescates + prevenciones")
    print("   → localhost:3000/impacto  vista donante completamente poblada")
    db.close()


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Preparador de Escenario Demo McCare")
    parser.add_argument("--scenario", type=str, choices=["hackathon"], default="hackathon")
    args = parser.parse_args()

    if args.scenario == "hackathon":
        ensayar_hackathon()
