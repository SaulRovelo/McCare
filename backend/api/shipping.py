from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI()

# Configura CORS para que Next.js pueda conectar
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TOKEN DE PRUEBAS DE SKYDROPX
SKYDROPX_TOKEN = "TU_TOKEN_AQUI" 

class ShippingRequest(BaseModel):
    cp_origen: str
    cp_destino: str
    peso: float

@app.post("/api/envios/cotizar")
async def cotizar_envio(req: ShippingRequest):
    url = "https://api.skydropx.com/v1/quotations"
    headers = {
        "Authorization": f"Token token={SKYDROPX_TOKEN}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "zip_from": req.cp_origen,
        "zip_to": req.cp_destino,
        "parcel": {
            "weight": req.peso,
            "height": 10, "width": 10, "length": 10
        }
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, headers=headers)
            if response.status_code != 200:
                return {"error": "No se pudieron obtener tarifas", "details": response.json()}
            
            data = response.json()
            # Retornamos las tarifas crudas para que el Front las filtre
            return data
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))