"""
backend/auth/dependencies.py — Dependencias FastAPI para protección de rutas

Proporciona:
  - get_current_user     → extrae y valida el usuario del JWT
  - require_admin        → falla si el usuario no es admin
  - require_corporativo  → falla si no es corporativo o admin

Uso en endpoints:
    @router.get("/admin-only")
    def endpoint(user = Depends(require_admin)):
        ...
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import UsuarioSQL
from backend.auth.jwt import verificar_token

# FastAPI extrae el Bearer token del header Authorization automáticamente
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> UsuarioSQL:
    """
    Dependencia principal de autenticación.
    Inyectada en cualquier endpoint que requiera un usuario autenticado.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado. Inicia sesión nuevamente.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = verificar_token(token)
    if not payload:
        raise credentials_exception

    usuario_id: str = payload.get("sub")
    if not usuario_id:
        raise credentials_exception

    usuario = db.query(UsuarioSQL).filter_by(id=usuario_id, activo=True).first()
    if not usuario:
        raise credentials_exception

    return usuario


def require_admin(current_user: UsuarioSQL = Depends(get_current_user)) -> UsuarioSQL:
    """Requiere rol admin. Falla con 403 si no lo es."""
    if current_user.rol.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso restringido al equipo administrativo de McCare.",
        )
    return current_user


def require_corporativo(current_user: UsuarioSQL = Depends(get_current_user)) -> UsuarioSQL:
    """Requiere rol corporativo o admin."""
    if current_user.rol.value not in ("corporativo", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso exclusivo para socios corporativos.",
        )
    return current_user


def get_optional_user(
    token: str | None = Depends(OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)),
    db: Session = Depends(get_db),
) -> UsuarioSQL | None:
    """
    Versión opcional: retorna el usuario si hay token, o None si el endpoint es público.
    Usado en endpoints mixtos (público + personalizado para donantes logueados).
    """
    if not token:
        return None
    payload = verificar_token(token)
    if not payload:
        return None
    return db.query(UsuarioSQL).filter_by(id=payload.get("sub"), activo=True).first()
