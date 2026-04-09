"""
backend/scripts/demo_hackathon.py — Script de Preparación para Demo/Hackathon
==============================================================================
Genera datos de desabasto controlado y realista por cada Casa (sede) del sistema.

REGLAS DE DEMO:
  🔴 CRÍTICO (0-3 días): 2-3 insumos por Casa
  🟡 ATENCIÓN (4-7 días): 2-3 insumos por Casa
  ⚪ ESTABLE (>7 días): El resto — no aparecen en misiones

Consumo diario base * factor_ajuste_sede * padding 1.10 = consumo_estimado IA
Para garantizar que el cálculo sea correcto, ajustamos el STOCK ACTUAL para que:
  dias_restantes = stock / consumo_diario ≈ el rango deseado

Para ejecutar:
  cd /home/saul_rovelo/Documentos/mccare
  python backend/scripts/demo_hackathon.py
"""

import sys
import os
import uuid
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from database.connection import SessionLocal
from database.models import InsumoSQL, MovimientoSQL

# ─── Configuración de Demo ────────────────────────────────────────────────────
# Para cada Casa, definimos qué insumos deben quedar en zona roja y cuáles en amarilla.
# El stock_objetivo se calcula como:  stock = consumo_diario * dias_objetivo
# Con el safety padding de IA 1.10, el modelo verá: dias = stock / (consumo * 1.10)
# Por eso multiplicamos días objetivo por 1.15 (margen conservador).

SEDES = ["cdmx", "puebla", "edomex"]

# Configuración de stock destino por nombre de insumo
# dias_objetivo: días que queremos que muestre el sistema
# "critico" → 0-3 días  |  "atencion" → 4-7 días
ESCENARIO_DEMO = {
    # ── ROJOS (CRÍTICO, 0-3 días) ──────────────────────────────────────────
    "Pañales Etapa 3":          {"dias_objetivo": 0.1, "tipo": "critico"},  # "Se agota hoy"
    "Suero Oral (Pediátrico)":  {"dias_objetivo": 0.1, "tipo": "critico"},  # "Se agota hoy"
    "Paracetamol Gotas":        {"dias_objetivo": 2.0, "tipo": "critico"},  # "En 2 días"

    # ── AMARILLOS (ATENCIÓN, 4-7 días) ─────────────────────────────────────
    "Pañales RN":               {"dias_objetivo": 5.0, "tipo": "atencion"}, # "En 5 días"
    "Leche Entera 1L":          {"dias_objetivo": 6.0, "tipo": "atencion"}, # "En 6 días"
    "Biberones 8oz":            {"dias_objetivo": 7.0, "tipo": "atencion"}, # "En 7 días"

    # ── RESTANTES: quedan en estado estable (>7 días, no generan misiones) ─
    "Fórmula Infantil L1":      {"dias_objetivo": 15.0, "tipo": "estable"},
    "Jabón Neutro":             {"dias_objetivo": 20.0, "tipo": "estable"},
    "Toallas Húmedas Pqte":     {"dias_objetivo": 18.0, "tipo": "estable"},
    "Papillas Surtidas":        {"dias_objetivo": 12.0, "tipo": "estable"},
}

# Factor de ajuste por sede (para dar variedad visual entre casas)
VARIACION_SEDE = {
    "cdmx":   0.0,    # Stock exacto al objetivo
    "puebla": 0.3,    # Un poco menos (más urgente)
    "edomex": -0.2,   # Un poco más (menos urgente visualmente)
}

def calcular_stock_objetivo(consumo_diario: float, dias: float, variacion: float = 0.0) -> int:
    """
    Calcula el stock para obtener los días de cobertura deseados.
    Con el padding IA de 1.10, los días reales = stock / (consumo * 1.10)
    Para compensar: stock = dias * consumo * 1.10
    Variación: ± días extra para diferenciar visualmente las casas.
    """
    dias_ajustados = max(0.05, dias + variacion)
    stock = dias_ajustados * consumo_diario * 1.10  # compensar el safety padding de IA
    return max(0, round(stock))

def run_demo():
    db = SessionLocal()
    print("\n" + "═" * 60)
    print("  🚀 McCare — Preparación de Datos para Demo/Hackathon")
    print("═" * 60)

    stats = {"critico": 0, "atencion": 0, "estable": 0, "no_encontrado": 0}

    for sede in SEDES:
        print(f"\n📍 Casa {sede.upper()}")
        print("─" * 50)

        insumos_sede = db.query(InsumoSQL).filter(InsumoSQL.sede == sede).all()

        if not insumos_sede:
            print(f"  ⚠️  Sin insumos. Ejecuta seed_sedes.py primero.")
            continue

        for insumo in insumos_sede:
            config = ESCENARIO_DEMO.get(insumo.nombre)

            if not config:
                print(f"  ℹ️  [{insumo.nombre}] — sin configuración de demo (sin cambio)")
                continue

            variacion = VARIACION_SEDE.get(sede, 0.0)

            # Para insumos críticos con stock=0, variamos hacia agotado en cdmx y leve en otras
            if config["dias_objetivo"] <= 0.5 and sede != "cdmx":
                dias_efectivos = config["dias_objetivo"] + abs(variacion) + 0.2
            else:
                dias_efectivos = config["dias_objetivo"]

            stock_nuevo = calcular_stock_objetivo(
                consumo_diario=insumo.consumo_diario,
                dias=dias_efectivos,
                variacion=0.0  # variación ya aplicada arriba
            )

            stock_anterior = insumo.stock_actual
            insumo.stock_actual = stock_nuevo

            # Registrar movimiento de ajuste para mantener integridad del historial
            delta = abs(stock_anterior - stock_nuevo)
            if delta > 0:
                mov = MovimientoSQL(
                    id=str(uuid.uuid4()),
                    insumo_id=insumo.id,
                    tipo_movimiento="ajuste",
                    cantidad=max(1, delta),
                    stock_resultante=stock_nuevo,
                    observacion=f"[DEMO HACKATHON] Ajuste a {config['tipo'].upper()} ({dias_efectivos:.1f}d objetivo)",
                    origen="interno",
                    fecha=datetime.utcnow()
                )
                db.add(mov)

            tipo_icon = "🔴" if config["tipo"] == "critico" else ("🟡" if config["tipo"] == "atencion" else "✅")
            print(f"  {tipo_icon} {insumo.nombre:<35} {stock_anterior:>5} → {stock_nuevo:>5} uds  (~{dias_efectivos:.1f}d)")
            stats[config["tipo"]] += 1

    db.commit()
    db.close()

    print("\n" + "═" * 60)
    print("  ✅ Datos de demo generados correctamente")
    print(f"  🔴 Insumos CRÍTICOS configurados : {stats['critico']}")
    print(f"  🟡 Insumos ATENCIÓN configurados : {stats['atencion']}")
    print(f"  ✅ Insumos ESTABLES configurados : {stats['estable']}")
    print("═" * 60)

    # Reiniciar el modelo River ML automáticamente
    print("\n  ⟳  Reiniciando modelo River ML...")
    try:
        import urllib.request
        req = urllib.request.Request(
            "http://127.0.0.1:8000/api/forecast/reset",
            method="POST",
            headers={"Content-Type": "application/json"},
            data=b"",
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            print("  ✅ Modelo River ML reiniciado exitosamente.")
    except Exception as e:
        print(f"  ℹ️  Backend no disponible para reset automático ({e}).")
        print("     Reinicia manualmente: uvicorn backend.main:app --reload")

    print("\n  PRÓXIMOS PASOS:")
    print("  1. El modelo River ML ya fue reiniciado. Los datos son frescos.")
    print("  2. Navega a CareForecast — verás misiones rojas y amarillas.")
    print("  3. Navega a Misiones Críticas — solo 0-7 días por Casa.")
    print()

if __name__ == "__main__":
    run_demo()
