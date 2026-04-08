import sys
import os

# Asegurar que la raíz del proyecto está en el PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from database.connection import SessionLocal, Base, engine
from database.models import UsuarioSQL, RolUsuario
from backend.auth.security import hash_password

def seed_admin():
    print("Iniciando seeder de admin...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Verificar si ya existe
        admin = db.query(UsuarioSQL).filter_by(email="admin@mccare.org").first()
        if admin:
            print("El usuario admin@mccare.org ya existe.")
            return

        nuevo_admin = UsuarioSQL(
            nombre="Administración Central",
            email="admin@mccare.org",
            password_hash=hash_password("admin123456"),
            rol=RolUsuario.admin,
            sede="cdmx",
        )
        db.add(nuevo_admin)
        db.commit()
        print("✅ Administrador creado exitosamente:")
        print("  Email: admin@mccare.org")
        print("  Pass:  admin123456")
    except Exception as e:
        db.rollback()
        print(f"Error creando admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
