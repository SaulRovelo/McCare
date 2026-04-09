from database.connection import SessionLocal
from database.models import DonacionSQL, UsuarioSQL
from sqlalchemy import desc

def debug_historial():
    db = SessionLocal()
    try:
        usuario_id = "f5c69742-4e30-42ae-b9f8-4ae48704e256"
        donaciones = (
            db.query(DonacionSQL)
            .filter(DonacionSQL.usuario_id == usuario_id)
            .order_by(DonacionSQL.fecha.desc())
            .all()
        )
        print(f"Found {len(donaciones)} donaciones")
        for d in donaciones:
            print(f"ID: {d.id}, Tipo: {d.tipo}, Insumo: {d.insumo.nombre if d.insumo else 'None'}")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    debug_historial()
