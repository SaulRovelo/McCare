"""
backend/api/auth_router.py — Endpoints de Autenticación y Perfil

Endpoints:
  POST /api/auth/registro   — Crear cuenta nueva
  POST /api/auth/login      — Iniciar sesión, obtener JWT
  GET  /api/auth/me         — Datos del usuario autenticado
  PATCH /api/auth/me        — Actualizar nombre, bio, preferencias
  POST /api/auth/logout     — (Stateless, instrucción al frontend de borrar token)
"""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import UsuarioSQL, PerfilDonanteSQL, RolUsuario
from backend.models.domain import (
    RegistroRequest, LoginRequest, TokenOut,
    UsuarioOut, ActualizarPerfilRequest,
)
from backend.auth.security import hash_password, verify_password
from backend.auth.jwt import crear_token
from backend.auth.dependencies import get_current_user

auth_router = APIRouter(prefix="/auth", tags=["Autenticación"])


# ── POST /auth/registro ────────────────────────────────────────────────────────

@auth_router.post("/registro", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def registrar_usuario(data: RegistroRequest, db: Session = Depends(get_db)):
    """
    Crea un nuevo usuario y su perfil extendido.
    - Si rol = donante o corporativo: se crea PerfilDonanteSQL automáticamente.
    - Devuelve JWT listo para usar, sin necesidad de hacer login después.
    """
    # Verificar email único
    if db.query(UsuarioSQL).filter_by(email=data.email.lower().strip()).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una cuenta con ese correo electrónico.",
        )

    usuario = UsuarioSQL(
        nombre        = data.nombre.strip(),
        email         = data.email.lower().strip(),
        password_hash = hash_password(data.password),
        rol           = RolUsuario(data.rol),
        sede          = data.sede,
        ultimo_login  = datetime.utcnow(),
    )
    db.add(usuario)
    db.flush()  # Necesitamos el ID antes de crear el perfil

    # Crear perfil extendido para donantes y corporativos
    if data.rol in ("donante", "corporativo"):
        perfil = PerfilDonanteSQL(
            usuario_id     = usuario.id,
            empresa_nombre = data.empresa_nombre,
            empresa_rfc    = data.empresa_rfc,
        )
        db.add(perfil)

    db.commit()
    db.refresh(usuario)

    token = crear_token(usuario.id, usuario.rol.value, usuario.nombre)
    return TokenOut(
        access_token = token,
        rol          = usuario.rol.value,
        nombre       = usuario.nombre,
        usuario_id   = usuario.id,
    )


# ── POST /auth/login ───────────────────────────────────────────────────────────

@auth_router.post("/login", response_model=TokenOut)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """
    Valida credenciales y devuelve JWT.
    El token incluye id, rol y nombre para lectura client-side sin llamada extra.
    """
    usuario = db.query(UsuarioSQL).filter_by(
        email=data.email.lower().strip()
    ).first()

    if not usuario or not verify_password(data.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos.",
        )

    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta desactivada. Contacta al administrador.",
        )

    # Actualizar último login
    usuario.ultimo_login = datetime.utcnow()
    db.commit()

    token = crear_token(usuario.id, usuario.rol.value, usuario.nombre)
    return TokenOut(
        access_token = token,
        rol          = usuario.rol.value,
        nombre       = usuario.nombre,
        usuario_id   = usuario.id,
    )


# ── GET /auth/me ───────────────────────────────────────────────────────────────

@auth_router.get("/me", response_model=UsuarioOut)
def obtener_mi_perfil(current_user: UsuarioSQL = Depends(get_current_user)):
    """
    Retorna los datos completos del usuario autenticado, incluyendo su perfil.
    Ideal para el header del dashboard y la página de perfil.
    """
    return current_user


# ── PATCH /auth/me ─────────────────────────────────────────────────────────────

@auth_router.patch("/me", response_model=UsuarioOut)
def actualizar_mi_perfil(
    data: ActualizarPerfilRequest,
    current_user: UsuarioSQL = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Actualiza nombre y/o datos del perfil del usuario autenticado.
    Solo puede editar sus propios datos.
    """
    if data.nombre:
        current_user.nombre = data.nombre.strip()

    if current_user.perfil:
        perfil = current_user.perfil
        if data.preferencias_categoria is not None:
            perfil.preferencias_categoria = data.preferencias_categoria
        if data.nivel_urgencia_pref is not None:
            perfil.nivel_urgencia_pref = data.nivel_urgencia_pref
        if data.tipo_donacion_pref is not None:
            perfil.tipo_donacion_pref = data.tipo_donacion_pref
        if data.bio is not None:
            perfil.bio = data.bio
        if data.avatar_url is not None:
            perfil.avatar_url = data.avatar_url

    db.commit()
    db.refresh(current_user)
    return current_user


# ── POST /auth/logout ──────────────────────────────────────────────────────────

@auth_router.post("/logout")
def logout():
    """
    El logout en JWT es stateless — el backend solo confirma que el frontend
    debe eliminar el token local. No hay revocación server-side en este MVP.
    (Para producción: implementar lista negra de tokens o usar Supabase Auth).
    """
    return {"mensaje": "Sesión cerrada. Elimina el token del cliente."}
