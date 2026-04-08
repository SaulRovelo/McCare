import sys
import os
import uuid
from datetime import datetime, timedelta

# Asegurar que la raíz del proyecto está en el PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from database.connection import SessionLocal, Base, engine
from database.models import FamiliaSQL

def seed_familias():
    # Asegúrate de que las tablas existen
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Algunas familias mock
    familias = [
        {
            "sede": "cdmx",
            "habitacion": "A01",
            "numero_adultos": 2,
            "numero_ninos": 1,
            "estado": "activa",
            "dias_estancia_est": 14,
            "paciente_referencia": "Familia de Luisito",
            "paciente_edad": 8,
            "necesidades_especiales": "Dieta blanda",
            "fecha_ingreso": datetime.utcnow() - timedelta(days=2)
        },
        {
            "sede": "cdmx",
            "habitacion": "B12",
            "numero_adultos": 1,
            "numero_ninos": 2,
            "estado": "activa",
            "dias_estancia_est": 30,
            "paciente_referencia": "Pac. María Jiménez",
            "paciente_edad": 12,
            "necesidades_especiales": "Necesita transporte al hospital 2x semana",
            "fecha_ingreso": datetime.utcnow() - timedelta(days=5)
        },
        {
            "sede": "cdmx",
            "habitacion": "C04",
            "numero_adultos": 2,
            "numero_ninos": 2,
            "estado": "activa",
            "dias_estancia_est": 7,
            "paciente_referencia": "Pérez Familia",
            "paciente_edad": 4,
            "necesidades_especiales": "Ninguna",
            "fecha_ingreso": datetime.utcnow() - timedelta(days=1)
        },
        {
            "sede": "cdmx",
            "habitacion": "A02",
            "numero_adultos": 1,
            "numero_ninos": 1,
            "estado": "activa",
            "dias_estancia_est": 3,
            "paciente_referencia": "Familia Gómez",
            "paciente_edad": 15,
            "necesidades_especiales": "",
            "fecha_ingreso": datetime.utcnow()
        },
        {
            "sede": "cdmx",
            "habitacion": "B05",
            "numero_adultos": 2,
            "numero_ninos": 3,
            "estado": "activa",
            "dias_estancia_est": 10,
            "paciente_referencia": "Pac. Sofía Martínez (Urgencia)",
            "paciente_edad": 6,
            "necesidades_especiales": "Monitorización",
            "fecha_ingreso": datetime.utcnow() - timedelta(hours=5)
        }
    ]

    print("--- Poblando Familias de Prueba ---")
    try:
        agregadas = 0
        for f in familias:
            nueva_familia = FamiliaSQL(
                id=str(uuid.uuid4()),
                sede=f["sede"],
                habitacion=f["habitacion"],
                numero_adultos=f["numero_adultos"],
                numero_ninos=f["numero_ninos"],
                estado=f["estado"],
                fecha_ingreso=f["fecha_ingreso"],
                dias_estancia_est=f["dias_estancia_est"],
                paciente_referencia=f["paciente_referencia"],
                paciente_edad=f["paciente_edad"],
                necesidades_especiales=f["necesidades_especiales"]
            )
            db.add(nueva_familia)
            agregadas += 1
            
        db.commit()
        print(f"✅ Se agregaron {agregadas} familias simuladas de forma exitosa.")
        print("Total de personas simuladas:", sum(f["numero_adultos"] + f["numero_ninos"] for f in familias))
    except Exception as e:
        db.rollback()
        print(f"Error creando familias: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_familias()
