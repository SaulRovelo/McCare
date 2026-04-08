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


def verify_password(plain: str, hashed: str) -> bool:
    """Verifica si una contraseña coincide con su hash."""
    return pwd_context.verify(plain, hashed)
