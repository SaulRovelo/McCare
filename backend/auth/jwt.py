"""
backend/auth/jwt.py — Gestión de tokens JWT

Usa python-jose con algoritmo HS256.

Preparado para migración a Supabase:
  - Si se activa Supabase Auth, reemplazar SOLO esta función de verificación
    por la verificación del JWT de Supabase (misma interfaz, distinto secreto).
  - El resto del código del sistema NO cambia.

Configuración via variables de entorno:
  JWT_SECRET_KEY  — secreto para firmar tokens (requerido en producción)
  JWT_EXPIRE_DAYS — días de validez (default: 7)
"""
import os
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt

# ── Configuración ─────────────────────────────────────────────────────────────
# En producción, JWT_SECRET_KEY debe ser un string de 32+ caracteres aleatorios.
# Comando para generar: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY  = os.getenv("JWT_SECRET_KEY", "mccare-dev-secret-change-in-production-32chars")
ALGORITHM   = "HS256"
EXPIRE_DAYS = int(os.getenv("JWT_EXPIRE_DAYS", "7"))


# ── Crear token ───────────────────────────────────────────────────────────────

def crear_token(usuario_id: str, rol: str, nombre: str) -> str:
    """
    Genera un JWT firmado con HS256.
    El payload incluye id, rol y nombre para que el frontend pueda leerlo
    sin necesidad de llamar a /auth/me en cada render.
    """
    payload = {
        "sub": usuario_id,
        "rol": rol,
        "nombre": nombre,
        "exp": datetime.utcnow() + timedelta(days=EXPIRE_DAYS),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# ── Verificar token ───────────────────────────────────────────────────────────

def verificar_token(token: str) -> Optional[dict]:
    """
    Decodifica y valida un JWT.
    Retorna el payload o None si el token es inválido/expirado.
    """
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
