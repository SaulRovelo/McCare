import sys
import os

# Asegurar que la raíz del proyecto está en el PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from database.connection import SessionLocal, Base, engine
from database.models import UsuarioSQL, PerfilDonanteSQL, RolUsuario
from backend.auth.security import hash_password

def seed_test_users():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    users = [
        {
            "nombre": "Admin McCare",
            "email": "admin@mccare.org",
            "password": "password123",
            "rol": RolUsuario.admin,
            "sede": "cdmx",
        },
        {
            "nombre": "Juan Pérez",
            "email": "donante@mccare.org",
            "password": "password123",
            "rol": RolUsuario.donante,
            "sede": None,
        },
        {
            "nombre": "Empresa Socialmente Responsable",
            "email": "corporativo@mccare.org",
            "password": "password123",
            "rol": RolUsuario.corporativo,
            "sede": None,
            "empresa_nombre": "Global Corp S.A. de C.V.",
            "empresa_rfc": "GCO180214XYZ"
        }
    ]

    print("--- Creando/Verificando Usuarios de Prueba ---")
    
    try:
        for u in users:
            existing = db.query(UsuarioSQL).filter_by(email=u["email"]).first()
            if not existing:
                nuevo_user = UsuarioSQL(
                    nombre=u["nombre"],
                    email=u["email"],
                    password_hash=hash_password(u["password"]),
                    rol=u["rol"],
                    sede=u["sede"],
                )
                db.add(nuevo_user)
                db.flush() # Para obtener el ID

                # Crear perfil si es donante o corporativo
                if u["rol"] in (RolUsuario.donante, RolUsuario.corporativo):
                    perfil = PerfilDonanteSQL(
                        usuario_id=nuevo_user.id,
                        empresa_nombre=u.get("empresa_nombre"),
                        empresa_rfc=u.get("empresa_rfc"),
                    )
                    db.add(perfil)
                
                print(f"✅ {u['rol'].value.capitalize()} creado: {u['email']} | Pass: {u['password']}")
            else:
                print(f"➡️ {u['rol'].value.capitalize()} ya existe: {u['email']} | Pass: {u['password']}")
                # Podemos forzar el password para asegurarnos que es el que dictamos aquí
                existing.password_hash = hash_password(u["password"])

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error creando usuarios: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_test_users()
