"""
seed.py — Delegador de conveniencia (raíz del proyecto)

Permite ejecutar `python seed.py` como atajo.
Delega la lógica real a database/seeders/seed_inicial.py
"""
from database.seeders.seed_inicial import run

if __name__ == "__main__":
    run()
