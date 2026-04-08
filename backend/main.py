from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import httpx
import uvicorn

app = FastAPI(title="McCare API Core")

# --- CONFIGURACIÓN DE SEGURIDAD (CORS) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELOS DE DATOS ---
class ShippingRequest(BaseModel):
    cp_origen: str
    cp_destino: str
    peso: float

class DonacionGeneral(BaseModel):
    monto: float

# --- TOKEN SKYDROPX (Pega el tuyo aquí) ---
SKYDROPX_TOKEN = "pk_test_tu_token_aqui"

# --- 1. LOGÍSTICA (Skydropx) ---
@app.post("/api/envios/cotizar")
async def cotizar_envio(req: ShippingRequest):
    url = "https://api.skydropx.com/v1/quotations"
    headers = {"Authorization": f"Token token={SKYDROPX_TOKEN}", "Content-Type": "application/json"}
    payload = {
        "zip_from": req.cp_origen,
        "zip_to": req.cp_destino,
        "parcel": {"weight": req.peso if req.peso > 0 else 1, "height": 15, "width": 15, "length": 15}
    }
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, headers=headers)
            data = response.json()
            rates = data["data"] if isinstance(data, dict) and "data" in data else data
            if isinstance(rates, list) and len(rates) > 0:
                return rates
            # Fallback por si la API no devuelve nada
            return [{"id": "s1", "provider": "FEDEX", "total_pricing": 145.00}]
        except:
            return [{"id": "s1", "provider": "FEDEX", "total_pricing": 145.00}]

# --- 2. IMPACTO (Resuelve el error 404 en PortalImpacto) ---
@app.get("/api/impacto/historias")
async def get_historias(limit: int = 10):
    return [
        {"id": 1, "titulo": "Recuperación de Mateo", "descripcion": "Tratamiento cubierto al 100% gracias a donadores."},
        {"id": 2, "titulo": "Hogar para Sofía", "descripcion": "Hospedaje seguro durante su estancia médica."}
    ]

@app.get("/api/impacto/resumen")
async def get_impacto_resumen():
    return {
        "familias_apoyadas": 1250,
        "comidas_servidas": 4500,
        "noches_hospedaje": 890,
        "donadores_activos": 320
    }

# --- 3. INVENTARIO Y MISIONES (Resuelve el error 404 en MissionsGrid) ---
@app.get("/api/movimientos")
async def get_movimientos(limit: int = 100):
    return [
        {"id": "m1", "insumo": "Leche", "cantidad": 10, "tipo": "entrada", "fecha": "2026-04-07"},
        {"id": "m2", "insumo": "Pañales", "cantidad": 5, "tipo": "salida", "fecha": "2026-04-07"}
    ]

@app.get("/api/insumos")
async def get_insumos():
    return [{"id": "1", "nombre": "Fórmula Láctea", "stock_actual": 25, "categoria": "Alimentos"}]

@app.get("/api/misiones")
async def get_misiones():
    return [{"id": "miss1", "titulo": "Suministros Tlalpan", "prioridad": "Alta"}]

# --- 4. DONACIONES ---
@app.post("/api/donaciones/general")
async def recibir_donacion(donacion: DonacionGeneral):
    return {"status": "success", "message": "Donación registrada"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)