"""
backend/api/donantes_router.py — Endpoints privados del Donante Individual (B2C)

Endpoints:
  GET   /api/donantes/{usuario_id}/perfil    — Datos de perfil y KPIs acumulados
  GET   /api/donantes/{usuario_id}/historial — Últimas N donaciones del usuario
  GET   /api/donantes/{usuario_id}/recibos   — Recibos fiscales del usuario
  GET   /api/donantes/{usuario_id}/cuenta    — Datos de perfil y KPIs (GET agregado en RamaMax)
  PATCH /api/donantes/{usuario_id}/cuenta    — Actualizar nombre, RFC, empresa
  PATCH /api/donantes/{usuario_id}/cuenta/password — Cambio de contraseña
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from database.connection import get_db
from database.models import UsuarioSQL, PerfilDonanteSQL, DonacionSQL, MovimientoSQL
from backend.auth.security import hash_password
from backend.auth.dependencies import get_current_user

donantes_router = APIRouter(prefix="/donantes", tags=["Donantes B2C"])


# ── Schemas de respuesta ────────────────────────────────────────────────────────

class PerfilDonanteOut(BaseModel):
    usuario_id: str
    nombre: str
    email: str
    nivel: str
    total_donado_mxn: float
    total_movimientos: int
    familias_impactadas_acumuladas: int
    empresa_nombre: Optional[str] = None
    empresa_rfc: Optional[str] = None
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class HistorialItemOut(BaseModel):
    id: str
    fecha: datetime
    monto_mxn: Optional[float] = None
    tipo: str
    observacion: Optional[str] = None
    insumo_nombre: Optional[str] = None

    class Config:
        from_attributes = True


class ReciboOut(BaseModel):
    folio: str
    fecha_emision: datetime
    concepto: str
    monto: float
    estatus: str
    url_pdf: Optional[str] = None
    url_xml: Optional[str] = None

    class Config:
        from_attributes = True


class ActualizarCuentaRequest(BaseModel):
    nombre: Optional[str] = None
    empresa_nombre: Optional[str] = None
    empresa_rfc: Optional[str] = None


class CambiarPasswordRequest(BaseModel):
    password: str


# ── Helpers ──────────────────────────────────────────────────────────────────────

def _verificar_acceso(usuario_id: str, current_user: UsuarioSQL):
    """Garantiza que el usuario autenticado sólo pueda acceder a sus propios datos."""
    if current_user.id != usuario_id and current_user.rol.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para acceder a estos datos."
        )


# ── GET /donantes/{usuario_id}/perfil ───────────────────────────────────────────

@donantes_router.get("/{usuario_id}/perfil", response_model=PerfilDonanteOut)
def obtener_perfil_donante(
    usuario_id: str,
    db: Session = Depends(get_db),
    current_user: UsuarioSQL = Depends(get_current_user),
):
    """
    Retorna datos del perfil del donante (datos de usuario + perfil extendido).
    Restringido: sólo el propio donante o un admin puede consultar.
    """
    _verificar_acceso(usuario_id, current_user)

    usuario = db.query(UsuarioSQL).filter_by(id=usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    perfil = usuario.perfil  # puede ser None si nunca se creó

    # Calcular familias impactadas estimadas (heurística: 1 familia × cada 3 movimientos)
    familias_est = max(0, (perfil.total_movimientos // 3)) if perfil else 0

    return PerfilDonanteOut(
        usuario_id=usuario.id,
        nombre=usuario.nombre,
        email=usuario.email,
        nivel=perfil.nivel if perfil else "bronce",
        total_donado_mxn=perfil.total_donado_mxn if perfil else 0.0,
        total_movimientos=perfil.total_movimientos if perfil else 0,
        familias_impactadas_acumuladas=familias_est,
        empresa_nombre=perfil.empresa_nombre if perfil else None,
        empresa_rfc=perfil.empresa_rfc if perfil else None,
        avatar_url=perfil.avatar_url if perfil else None,
    )


# ── GET /donantes/{usuario_id}/historial ────────────────────────────────────────

@donantes_router.get("/{usuario_id}/historial", response_model=List[HistorialItemOut])
def obtener_historial_donante(
    usuario_id: str,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: UsuarioSQL = Depends(get_current_user),
):
    """
    Retorna las últimas N donaciones registradas para este donante.
    Restringido al propio usuario (filtrado por usuario_id en BD).
    """
    _verificar_acceso(usuario_id, current_user)

    try:
        donaciones = (
            db.query(DonacionSQL)
            .filter(DonacionSQL.usuario_id == usuario_id)
            .order_by(DonacionSQL.fecha.desc())
            .limit(limit)
            .all()
        )

        resultado = []
        for d in donaciones:
            # Forzar carga de relación si es necesario
            insumo_nom = d.insumo.nombre if d.insumo else None
            
            resultado.append(HistorialItemOut(
                id=str(d.id),
                fecha=d.fecha,
                monto_mxn=float(d.monto_mxn) if d.monto_mxn is not None else None,
                tipo=str(d.tipo),
                observacion=str(d.observacion) if d.observacion else None,
                insumo_nombre=insumo_nom,
            ))

        return resultado
    except Exception as e:
        print(f"ERROR en obtener_historial_donante: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ── GET /donantes/{usuario_id}/recibos ──────────────────────────────────────────

@donantes_router.get("/{usuario_id}/recibos", response_model=List[ReciboOut])
def obtener_recibos_donante(
    usuario_id: str,
    db: Session = Depends(get_db),
    current_user: UsuarioSQL = Depends(get_current_user),
):
    """
    Retorna el historial de recibos fiscales (CFDI) del donante.
    En esta versión MVP se genera desde las donaciones reales.
    Un recibo existe por cada donación monetaria registrada.
    """
    _verificar_acceso(usuario_id, current_user)

    donaciones = (
        db.query(DonacionSQL)
        .filter(
            DonacionSQL.usuario_id == usuario_id,
            DonacionSQL.tipo == "monetaria",
        )
        .order_by(DonacionSQL.fecha.desc())
        .all()
    )

    recibos = []
    for i, d in enumerate(donaciones, start=1):
        folio = f"MCR-{d.fecha.strftime('%Y%m')}-{str(i).zfill(4)}"
        concepto = f"Donación a {d.insumo.nombre}" if d.insumo else (d.observacion or "Donación general")
        recibos.append(ReciboOut(
            folio=folio,
            fecha_emision=d.fecha,
            concepto=concepto,
            monto=d.monto_mxn or 0.0,
            estatus="Facturado",  # En MVP consideramos todas facturadas
            url_pdf=None,        # Pendiente integración CFDI
            url_xml=None,
        ))

    return recibos


# ── GET /donantes/{usuario_id}/cuenta ───────────────────────────────────────────

@donantes_router.get("/{usuario_id}/cuenta")
def obtener_cuenta_donante(
    usuario_id: str,
    db: Session = Depends(get_db),
    current_user: UsuarioSQL = Depends(get_current_user),
):
    """
    Retorna los datos editables de la cuenta del donante
    (nombre, email, empresa_nombre, empresa_rfc).
    """
    _verificar_acceso(usuario_id, current_user)

    usuario = db.query(UsuarioSQL).filter_by(id=usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    perfil = usuario.perfil
    return {
        "nombre": usuario.nombre,
        "email": usuario.email,
        "empresa_nombre": perfil.empresa_nombre if perfil else None,
        "empresa_rfc": perfil.empresa_rfc if perfil else None,
    }


# ── PATCH /donantes/{usuario_id}/cuenta ─────────────────────────────────────────

@donantes_router.patch("/{usuario_id}/cuenta")
def actualizar_cuenta_donante(
    usuario_id: str,
    data: ActualizarCuentaRequest,
    db: Session = Depends(get_db),
    current_user: UsuarioSQL = Depends(get_current_user),
):
    """
    Actualiza nombre del usuario y datos fiscales del perfil donante.
    """
    _verificar_acceso(usuario_id, current_user)

    usuario = db.query(UsuarioSQL).filter_by(id=usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    if data.nombre:
        usuario.nombre = data.nombre.strip()

    perfil = usuario.perfil
    if perfil:
        if data.empresa_nombre is not None:
            perfil.empresa_nombre = data.empresa_nombre
        if data.empresa_rfc is not None:
            perfil.empresa_rfc = data.empresa_rfc

    db.commit()
    return {"ok": True, "mensaje": "Perfil actualizado correctamente."}


# ── PATCH /donantes/{usuario_id}/cuenta/password ────────────────────────────────

@donantes_router.patch("/{usuario_id}/cuenta/password")
def cambiar_password(
    usuario_id: str,
    data: CambiarPasswordRequest,
    db: Session = Depends(get_db),
    current_user: UsuarioSQL = Depends(get_current_user),
):
    """
    Cambia la contraseña del donante.
    La nueva contraseña se encripta con bcrypt antes de almacenarse.
    """
    _verificar_acceso(usuario_id, current_user)

    usuario = db.query(UsuarioSQL).filter_by(id=usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    usuario.password_hash = hash_password(data.password)
    db.commit()
    return {"ok": True, "mensaje": "Contraseña actualizada correctamente."}
