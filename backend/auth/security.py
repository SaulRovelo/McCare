"""
backend/auth/security.py — Criptografía de contraseñas

Usa passlib[bcrypt] — preparado para Supabase:
  En Supabase, las contraseñas se gestionan por Supabase Auth y este
  módulo queda como fallback para usuarios creados directamente via API.
"""
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    """Genera un hash bcrypt de la contraseña en texto plano."""
    return pwd_context.hash(plain)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # 1. Intento Pro: Verificar si es un hash válido de Passlib
    try:
        # identify() revisa si el string tiene formato de hash ($2b$...)
        if pwd_context.identify(hashed_password):
            return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # Si algo falla en la identificación, seguimos al plan B
        pass

    # 2. Plan B: Comparación de seguridad para datos heredados (texto plano)
    # Esto permite que los usuarios viejos sigan entrando sin errores
    return plain_password == hashed_password
