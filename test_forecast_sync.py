import requests

BASE_URL = "http://127.0.0.1:8000/api"

def test_sync():
    print("--- Verificando Sincronización Misiones vs Forecast ---")
    
    # 1. Obtener Forecast
    f_res = requests.get(f"{BASE_URL}/forecast")
    forecasts = {f['id']: f for f in f_res.json()}
    
    # 2. Obtener Misiones
    m_res = requests.get(f"{BASE_URL}/misiones")
    misiones = m_res.json()
    
    print(f"Misiones encontradas: {len(misiones)}")
    
    mismatches = 0
    for m in misiones:
        f = forecasts.get(m['insumo_id'])
        if not f:
            print(f"ERROR: Misión para {m['nombre_insumo']} no existe en el forecast.")
            mismatches += 1
            continue
            
        diff = abs(m['dias_para_agotarse'] - f['dias_para_agotarse'])
        if diff > 0.1:
            print(f"DISCREPANCIA en {m['nombre_insumo']}: Misión={m['dias_para_agotarse']}d, Forecast={f['dias_para_agotarse']}d")
            mismatches += 1
        else:
            print(f"OK: {m['nombre_insumo']} -> {m['dias_para_agotarse']} días en ambos.")

    if mismatches == 0:
        print("\n--- ¡Sincronización Exitosa! Todas las misiones coinciden con la IA ---")
    else:
        print(f"\n--- Fallo: Se encontraron {mismatches} discrepancias ---")

if __name__ == "__main__":
    try:
        test_sync()
    except Exception as e:
        print(f"Error de conexión: {e}. Asegúrate que el backend esté corriendo en el puerto 8000.")
