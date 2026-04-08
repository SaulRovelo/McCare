import sys
import os

# Add project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.connection import SessionLocal
from database.models import UsuarioSQL, InsumoSQL, RolUsuario, MovimientoSQL
from backend.auth.security import hash_password
import uuid

def seed():
    db = SessionLocal()
    
    # 1. Crear Sedes y Administradores
    sedes = ["cdmx", "puebla", "edomex"]
    
    for sede in sedes:
        email = f"admin.{sede}@mccare.org"
        admin = db.query(UsuarioSQL).filter(UsuarioSQL.email == email).first()
        if not admin:
            print(f"Creating admin for {sede}")
            admin = UsuarioSQL(
                nombre=f"Admin {sede.capitalize()}",
                email=email,
                password_hash=hash_password("admin123"),
                rol=RolUsuario.admin,
                sede=sede
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
        else:
            print(f"Admin for {sede} already exists")

        # 2. Inyectar / Asegurar inventario para esta sede
        insumos_base = [
            {"nombre": "Pañales RN", "categoria": "Higiene", "consumo": 15, "critico": 50, "max": 500, "costo": 6.5, "stock": 100},
            {"nombre": "Pañales Etapa 3", "categoria": "Higiene", "consumo": 20, "critico": 60, "max": 600, "costo": 7.0, "stock": 120},
            {"nombre": "Fórmula Infantil L1", "categoria": "Alimentos", "consumo": 8, "critico": 24, "max": 200, "costo": 250.0, "stock": 30},
            {"nombre": "Suero Oral (Pediátrico)", "categoria": "Médico", "consumo": 10, "critico": 40, "max": 300, "costo": 18.0, "stock": 80},
            {"nombre": "Paracetamol Gotas", "categoria": "Médico", "consumo": 5, "critico": 15, "max": 100, "costo": 45.0, "stock": 25},
            {"nombre": "Jabón Neutro", "categoria": "Higiene", "consumo": 5, "critico": 20, "max": 150, "costo": 12.0, "stock": 60},
            {"nombre": "Toallas Húmedas Pqte", "categoria": "Higiene", "consumo": 12, "critico": 40, "max": 400, "costo": 35.0, "stock": 80},
            {"nombre": "Leche Entera 1L", "categoria": "Alimentos", "consumo": 10, "critico": 30, "max": 200, "costo": 25.0, "stock": 50},
            {"nombre": "Papillas Surtidas", "categoria": "Alimentos", "consumo": 25, "critico": 75, "max": 800, "costo": 14.5, "stock": 120},
            {"nombre": "Biberones 8oz", "categoria": "Alimentos", "consumo": 2, "critico": 10, "max": 50, "costo": 60.0, "stock": 22},
        ]
        
        # Modifier factor for each sede to vary stock visually across sedes
        sede_mult = 1.0 if sede == "cdmx" else (0.6 if sede == "puebla" else 1.3)

        for ins_data in insumos_base:
            # check if exists for this sede
            insumo_existente = db.query(InsumoSQL).filter(
                InsumoSQL.nombre == ins_data["nombre"],
                InsumoSQL.sede == sede
            ).first()

            if not insumo_existente:
                nuevo_stock = int(ins_data["stock"] * sede_mult)
                
                insumo = InsumoSQL(
                    id=str(uuid.uuid4()),
                    nombre=ins_data["nombre"],
                    categoria=ins_data["categoria"],
                    stock_actual=nuevo_stock,
                    consumo_diario=ins_data["consumo"],
                    nivel_critico=ins_data["critico"],
                    capacidad_maxima=ins_data["max"],
                    costo_unitario=ins_data["costo"],
                    sede=sede
                )
                db.add(insumo)
                db.flush()
                
                # Add initial movement
                mov = MovimientoSQL(
                    id=str(uuid.uuid4()),
                    insumo_id=insumo.id,
                    tipo_movimiento="entrada",
                    cantidad=nuevo_stock,
                    stock_resultante=nuevo_stock,
                    observacion="Plantilla Semilla Carga Operativa",
                    origen="interno"
                )
                db.add(mov)

    db.commit()
    db.close()
    print("Seeding completed!")

if __name__ == "__main__":
    seed()
