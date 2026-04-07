"""
database/seeders/simulate_data.py — Seeder: Historial Sintético de Movimientos

Responsabilidad: generar movimientos realistas de los últimos N días en SQLite
para que la capa analítica (forecast.py) tenga datos históricos reales de consumo.

Importante: solo agrega movimientos tipo 'salida' y 'entrada' (nunca 'ajuste').
Los ajustes son para la capa de demo, no para el historial orgánico.

Uso:
    python -m database.seeders.simulate_data --days 30
    python -m database.seeders.simulate_data --days 30 --seed 42   # reproducible
    python -m database.seeders.simulate_data --days 30 --dry-run   # sin guardar
"""
import argparse
import random
import sys
import os
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from database.connection import SessionLocal
from backend.storage.crud import obtener_insumos, registrar_movimiento
from backend.models.domain import MovimientoCreate


def simular_historial(dias: int, dry_run: bool):
    db = SessionLocal()
    insumos = obtener_insumos(db)

    if not insumos:
        print("❌ Base vacía. Ejecuta primero: python seed.py")
        db.close()
        return

    print(f"🚀 Simulando historial de {dias} días ({len(insumos)} insumos)...")
    if dry_run:
        print("🟡 DRY-RUN: sin escritura en SQLite.")

    total_movimientos = 0
    hoy = datetime.utcnow()

    for dia_offset in range(dias, 0, -1):
        fecha_simulada = hoy - timedelta(days=dia_offset)

        for insumo in insumos:
            # Salida diaria con varianza moderada (±20%)
            varianza = random.uniform(0.8, 1.2)
            salida_tentativa = max(1, int(insumo.consumo_diario * varianza)) if insumo.consumo_diario > 0 else 0

            # Reposición preventiva si el stock caería por debajo del nivel crítico
            if salida_tentativa > 0 and (insumo.stock_actual - salida_tentativa) < insumo.nivel_critico:
                dias_repo = random.randint(7, 14)
                cantidad_entrada = max(1, int(insumo.consumo_diario * dias_repo))
                if not dry_run:
                    registrar_movimiento(
                        db,
                        MovimientoCreate(
                            insumo_id=insumo.id,
                            tipo_movimiento="entrada",
                            cantidad=cantidad_entrada,
                            observacion=f"Reposición preventiva simulada (día -{dia_offset})"
                        ),
                        fecha_override=fecha_simulada
                    )
                else:
                    insumo.stock_actual += cantidad_entrada
                total_movimientos += 1

            # Registrar salida del día
            if salida_tentativa > 0:
                salida_real = min(salida_tentativa, insumo.stock_actual)
                if salida_real > 0:
                    if not dry_run:
                        registrar_movimiento(
                            db,
                            MovimientoCreate(
                                insumo_id=insumo.id,
                                tipo_movimiento="salida",
                                cantidad=salida_real,
                                observacion=f"Consumo diario simulado (día -{dia_offset})"
                            ),
                            fecha_override=fecha_simulada
                        )
                    else:
                        insumo.stock_actual -= salida_real
                    total_movimientos += 1

    if dry_run:
        db.rollback()
        print(f"✅ [DRY-RUN] {total_movimientos} movimientos simulados. Sin cambios en BD.")
    else:
        print(f"✅ {total_movimientos} movimientos escritos en SQLite.")

    db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generador de historial sintético de McCare")
    parser.add_argument("--days",    type=int,  default=30,   help="Días hacia atrás a simular")
    parser.add_argument("--seed",    type=int,  default=None, help="Semilla para reproducibilidad")
    parser.add_argument("--dry-run", action="store_true",     help="Simula sin escribir en SQLite")
    args = parser.parse_args()

    if args.seed is not None:
        random.seed(args.seed)

    simular_historial(args.days, args.dry_run)
