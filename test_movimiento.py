from fastapi.testclient import TestClient
from backend.main import app
from database.connection import SessionLocal
from database.models import InsumoSQL

db = SessionLocal()
panal = db.query(InsumoSQL).filter(InsumoSQL.nombre == "Pañales Etapa 3").first()
insumo_id = panal.id

client = TestClient(app)
response = client.post(
    "/api/movimientos",
    json={
        "insumo_id": insumo_id,
        "tipo_movimiento": "entrada",
        "cantidad": 2,
        "origen": "publico",
        "observacion": "Test script"
    }
)
print("Status:", response.status_code)
print("Body:", response.json() if response.status_code < 500 else response.text)
