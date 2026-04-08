"""
backend/services/notificaciones.py — Capa de Servicios: Alertas y Correos

Responsabilidad:
  - Crear y recuperar notificaciones internas del sistema.
  - Enviar correos de alerta (desactivado por defecto, activable via ConfiguracionSQL).

Las notificaciones se crean en background (FastAPI BackgroundTask) para no bloquear
el endpoint que las genera.

Correo:
  - Usa smtplib + STARTTLS (configurado en .env pero OFF por defecto).
  - Para activar: poner notificaciones_correo_activas = "true" en ConfiguracionSQL.
"""
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import Optional, List

from sqlalchemy.orm import Session

from database.models import NotificacionSQL, ConfiguracionSQL

logger = logging.getLogger(__name__)


# ── Helpers de configuración ──────────────────────────────────────────────────

def _get_config(db: Session, clave: str, default: str = "") -> str:
    """Lee un valor de ConfiguracionSQL. Nunca lanza excepción."""
    row = db.query(ConfiguracionSQL).filter_by(clave=clave).first()
    return row.valor if row else default


def get_familias_actuales(db: Session) -> int:
    """Devuelve el número de familias alojadas actualmente (configurable desde BD)."""
    try:
        return int(_get_config(db, "familias_actuales", "47"))
    except ValueError:
        return 47


# ── Crear notificaciones ──────────────────────────────────────────────────────

def crear_notificacion(
    db: Session,
    tipo: str,
    titulo: str,
    mensaje: str,
    insumo_id: Optional[str] = None,
) -> NotificacionSQL:
    """
    Persiste una nueva notificación en la BD.
    Llamado en background — no bloquea el endpoint.
    """
    notif = NotificacionSQL(
        tipo=tipo,
        insumo_id=insumo_id,
        titulo=titulo,
        mensaje=mensaje,
        leida=False,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    logger.info(f"[Notificaciones] Creada: [{tipo}] {titulo}")
    return notif


# ── Recuperar notificaciones ──────────────────────────────────────────────────

def obtener_notificaciones(db: Session, solo_no_leidas: bool = False, limit: int = 20) -> List[NotificacionSQL]:
    q = db.query(NotificacionSQL)
    if solo_no_leidas:
        q = q.filter(NotificacionSQL.leida == False)  # noqa: E712
    return q.order_by(NotificacionSQL.fecha.desc()).limit(limit).all()


def marcar_leida(db: Session, notificacion_id: str) -> Optional[NotificacionSQL]:
    notif = db.query(NotificacionSQL).filter_by(id=notificacion_id).first()
    if notif:
        notif.leida = True
        db.commit()
        db.refresh(notif)
    return notif


def marcar_todas_leidas(db: Session) -> int:
    """Marca todas las notificaciones no leídas como leídas. Retorna el conteo actualizado."""
    count = db.query(NotificacionSQL).filter(NotificacionSQL.leida == False).count()  # noqa
    db.query(NotificacionSQL).filter(NotificacionSQL.leida == False).update({"leida": True})  # noqa
    db.commit()
    return count


# ── Envío de correos (BackgroundTask) ────────────────────────────────────────

def enviar_alerta_critica_bg(db_url: str, insumo_nombre: str, stock: int, tipo: str = "critico") -> None:
    """
    Función pensada para ejecutarse como BackgroundTask de FastAPI.
    Recibe db_url porque BackgroundTask corre fuera del request context.

    Se activa SOLO si la config 'notificaciones_correo_activas' == 'true'.
    """
    # ── Re-crear sesión de BD en el contexto del background task ──
    from database.connection import SessionLocal
    import os

    db = SessionLocal()
    try:
        activas = _get_config(db, "notificaciones_correo_activas", "false").lower() == "true"
        if not activas:
            logger.info("[Correo] Notificaciones desactivadas en configuración. Saltando envío.")
            return

        destino     = _get_config(db, "email_alertas", "")
        nombre_casa = _get_config(db, "nombre_casa", "Casa Ronald McDonald")
        smtp_host   = os.getenv("SMTP_HOST", "smtp.gmail.com")
        smtp_port   = int(os.getenv("SMTP_PORT", "587"))
        smtp_user   = os.getenv("SMTP_USER", "")
        smtp_pass   = os.getenv("SMTP_PASS", "")

        if not destino or not smtp_user:
            logger.warning("[Correo] Faltan credenciales SMTP o email_alertas. Saltando.")
            return

        asunto = f"🚨 Alerta {tipo.upper()}: {insumo_nombre} — {nombre_casa}"
        cuerpo = f"""
        <h2>Alerta de Inventario — CareForecast</h2>
        <p>El insumo <strong>{insumo_nombre}</strong> ha entrado en estado <strong>{tipo}</strong>.</p>
        <p>Stock actual: <strong>{stock} unidades</strong></p>
        <p>El modelo River ML recomienda acción inmediata.</p>
        <hr>
        <small>Generado automáticamente por {nombre_casa} · McCare v2.0</small>
        """

        msg = MIMEMultipart("alternative")
        msg["From"]    = smtp_user
        msg["To"]      = destino
        msg["Subject"] = asunto
        msg.attach(MIMEText(cuerpo, "html"))

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, destino, msg.as_string())

        logger.info(f"[Correo] Alerta enviada a {destino}: {asunto}")

    except Exception as e:
        logger.error(f"[Correo] Fallo al enviar: {e}")
    finally:
        db.close()
