from database.connection import SessionLocal
from database.models import UsuarioSQL

def list_users():
    db = SessionLocal()
    try:
        users = db.query(UsuarioSQL).all()
        for user in users:
            print(f"ID: {user.id}, Nombre: {user.nombre}, Email: {user.email}, Rol: {user.rol}, Hash: {user.password_hash}")
    finally:
        db.close()

if __name__ == "__main__":
    list_users()
