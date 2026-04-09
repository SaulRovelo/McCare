import requests

BASE_URL = "http://127.0.0.1:8000"

def test_donor_endpoints():
    # 1. Login to get token
    login_data = {"email": "donante@mccare.org", "password": "password123"}
    try:
        r = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
        r.raise_for_status()
        login_res = r.json()
        token = login_res["access_token"]
        user_id = login_res["usuario_id"]
        print(f"✅ Login successful for {user_id}")
    except Exception as e:
        print(f"❌ Login failed: {e}")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Test profile endpoint
    try:
        r = requests.get(f"{BASE_URL}/api/donantes/{user_id}/perfil", headers=headers)
        r.raise_for_status()
        print(f"✅ Profile endpoint works: {r.json()}")
    except Exception as e:
        print(f"❌ Profile endpoint failed: {e}")

    # 3. Test historial endpoint
    try:
        r = requests.get(f"{BASE_URL}/api/donantes/{user_id}/historial", headers=headers)
        r.raise_for_status()
        print(f"✅ Historial endpoint works: {len(r.json())} items found")
    except Exception as e:
        print(f"❌ Historial endpoint failed: {e}")

if __name__ == "__main__":
    test_donor_endpoints()
