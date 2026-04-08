import sys
import os
import uuid
import random
from datetime import datetime, timedelta

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.connection import SessionLocal
from database.models import UsuarioSQL, InsumoSQL, MovimientoSQL, FamiliaSQL

def seed_distinto():
    db = SessionLocal()
    
    # 1. Familias por Sede
    sedes = ["cdmx", "puebla", "edomex"]
    apellidos = ["García", "Martínez", "López", "Pérez", "Hernández", "Rodríguez", "Sánchez", "Ramírez", "Cruz", "Gómez", "Flores", "Morales", "Ortiz", "Gutiérrez", "Ruiz"]
    
    # Agregando familias
    for sede in sedes:
        # Check if families already exist for this sede
        existentes = db.query(FamiliaSQL).filter(FamiliaSQL.sede == sede).count()
        if existentes == 0:
            print(f"Agregando familias a {sede}...")
            num_familias = random.randint(3, 8)
            admin = db.query(UsuarioSQL).filter(UsuarioSQL.sede == sede).first()
            admin_id = admin.id if admin else None

            for i in range(num_familias):
                dias_atr = random.randint(0, 5)
                fecha_in = datetime.utcnow() - timedelta(days=dias_atr)
                
                familia = FamiliaSQL(
                    id=str(uuid.uuid4()),
                    sede=sede,
                    numero_adultos=random.randint(1, 3),
                    numero_ninos=random.randint(1, 4),
                    dias_estancia_est=random.randint(5, 30),
                    habitacion=f"{sede[0].upper()}-{random.randint(10, 99)}",
                    paciente_edad=random.randint(1, 15),
                    paciente_referencia=f"Familia {random.choice(apellidos)} {random.choice(apellidos)}",
                    necesidades_especiales=random.choice(["Dieta blanda", "Silla de ruedas", "Alimentación por sonda", "Ninguna", "Oxígeno"]),
                    estado="activa",
                    usuario_registro_id=admin_id,
                    fecha_ingreso=fecha_in
                )
                db.add(familia)
        else:
            print(f"Familias ya existentes en {sede}")

    # 2. Inventarios diferentes (Productos Únicos por Sede)
    insumos_unicos = {
        "cdmx": [
            {"nombre": "Nutrición Parenteral Esp.", "categoria": "Médico", "consumo": 2, "critico": 10, "max": 50, "costo": 850.0, "stock": 15},
            {"nombre": "Juguetes Didácticos", "categoria": "Cuidado", "consumo": 0.5, "critico": 5, "max": 100, "costo": 120.0, "stock": 40},
            {"nombre": "Sillas de Ruedas Pediátricas", "categoria": "Logística", "consumo": 0.05, "critico": 1, "max": 10, "costo": 3500.0, "stock": 3},
        ],
        "puebla": [
            {"nombre": "Apoyo de Transporte (Boletos)", "categoria": "Logística", "consumo": 10, "critico": 30, "max": 200, "costo": 450.0, "stock": 80},
            {"nombre": "Despensas Comunitarias", "categoria": "Alimentos", "consumo": 5, "critico": 15, "max": 100, "costo": 350.0, "stock": 25},
            {"nombre": "Kits de Aseo Personal", "categoria": "Higiene", "consumo": 8, "critico": 20, "max": 150, "costo": 180.0, "stock": 40},
        ],
        "edomex": [
            {"nombre": "Cobijas Térmicas", "categoria": "Cuidado", "consumo": 1, "critico": 10, "max": 50, "costo": 250.0, "stock": 12},
            {"nombre": "Kit Pediátrico Respiratorio", "categoria": "Médico", "consumo": 3, "critico": 10, "max": 40, "costo": 600.0, "stock": 20},
            {"nombre": "Snacks Nutricionales", "categoria": "Alimentos", "consumo": 30, "critico": 100, "max": 500, "costo": 25.0, "stock": 150},
            {"nombre": "Colchonetas Extra", "categoria": "Cuidado", "consumo": 0.1, "critico": 5, "max": 30, "costo": 450.0, "stock": 8},
        ]
    }

    for sede, catalogo in insumos_unicos.items():
        for ins_data in catalogo:
            existente = db.query(InsumoSQL).filter(
                InsumoSQL.nombre == ins_data["nombre"],
                InsumoSQL.sede == sede
            ).first()

            if not existente:
                insumo = InsumoSQL(
                    id=str(uuid.uuid4()),
                    nombre=ins_data["nombre"],
                    categoria=ins_data["categoria"],
                    stock_actual=ins_data["stock"],
                    consumo_diario=ins_data["consumo"],
                    nivel_critico=ins_data["critico"],
                    capacidad_maxima=ins_data["max"],
                    costo_unitario=ins_data["costo"],
                    sede=sede
                )
                db.add(insumo)
                db.flush()
                
                mov = MovimientoSQL(
                    id=str(uuid.uuid4()),
                    insumo_id=insumo.id,
                    tipo_movimiento="entrada",
                    cantidad=ins_data["stock"],
                    stock_resultante=ins_data["stock"],
                    observacion="Equipamiento Especial Local",
                    origen="interno"
                )
                db.add(mov)

    db.commit()
    db.close()
    print("Familias e inventarios únicos agregados exitosamente!")

if __name__ == "__main__":
    seed_distinto()
