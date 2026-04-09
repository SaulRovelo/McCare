import sys
import os
import uuid
from datetime import datetime, timedelta, timezone

# Aseguramos que Python encuentre el módulo `backend` y `database`
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy import text
from database.connection import SessionLocal
from database.models import (
    UsuarioSQL, RolUsuario, PerfilDonanteSQL, DonacionSQL,
    VoluntariadoCorporativoSQL, CampaniaCorporativaSQL, DocumentoFiscalSQL
)

def fix_postgres_schema(db):
    """Fuerza la creación de la columna usuario_id de forma tolerante a fallos"""
    print("⚙️ Verificando si donaciones tiene la relación usuario_id...")
    try:
        db.execute(text("ALTER TABLE donaciones ADD COLUMN IF NOT EXISTS usuario_id VARCHAR(50)"))
        db.commit()
    except Exception as e:
        db.rollback()
        # Si no lo permite, lo loggeamos
        print("⚠️ Aviso: No se pudo inyectar el DDL (Puede que tu usuario SQL no tenga permisos o ya exista):", e)


def poblar_corporativo():
    print("🌱 Iniciando conexión a Supabase PostgreSQL...")
    db = SessionLocal()
    
    try:
        # 1. Asegurar la integridad de Supabase
        fix_postgres_schema(db)

        # 2. Empezar limpieza
        email_corp = "director@globalcorp.com"
        usuario_existente = db.query(UsuarioSQL).filter(UsuarioSQL.email == email_corp).first()

        if usuario_existente:
            print("🧹 Borrando registros viejos del corporativo...")
            db.query(DonacionSQL).filter(DonacionSQL.usuario_id == usuario_existente.id).delete()
            db.query(VoluntariadoCorporativoSQL).filter(VoluntariadoCorporativoSQL.usuario_id == usuario_existente.id).delete()
            db.query(CampaniaCorporativaSQL).filter(CampaniaCorporativaSQL.usuario_id == usuario_existente.id).delete()
            db.query(DocumentoFiscalSQL).filter(DocumentoFiscalSQL.usuario_id == usuario_existente.id).delete()
            db.query(PerfilDonanteSQL).filter(PerfilDonanteSQL.usuario_id == usuario_existente.id).delete()
            db.delete(usuario_existente)
            db.commit()

        # 3. Crear nuevo líder corporativo B2B
        print("👤 Creando Usuario Corporativo Base...")
        nuevo_id = str(uuid.uuid4())
        nuevo_usuario = UsuarioSQL(
            id=nuevo_id,
            nombre="Global Corp S.A. de C.V.",
            email=email_corp,
            password_hash="sha256$dummyhash",
            rol=RolUsuario.corporativo,
            activo=True,
            sede="cdmx"
        )
        db.add(nuevo_usuario)
        
        # Perfil Corporativo asociado
        db.add(PerfilDonanteSQL(
            id=str(uuid.uuid4()),
            usuario_id=nuevo_id,
            total_donado_mxn=0, # Dinámico
            nivel="platino",
            empresa_nombre="Global Corp S.A. de C.V.",
            empresa_rfc="GLO800101QW1"
        ))
        db.flush() # Reservamos los UUIDs

        # 4. Sembrar Financiamiento (Donaciones) - Sumará para la "Inversión Social"
        print("💵 Sembrando $380,000 MXN en donaciones acumuladas...")
        donaciones = [
            DonacionSQL(id=str(uuid.uuid4()), usuario_id=nuevo_id, monto_mxn=200000.0, origen="corporativo"),
            DonacionSQL(id=str(uuid.uuid4()), usuario_id=nuevo_id, monto_mxn=150000.0, origen="corporativo"),
            DonacionSQL(id=str(uuid.uuid4()), usuario_id=nuevo_id, monto_mxn=30000.0, origen="corporativo")
        ]
        db.add_all(donaciones)

        # 5. Sembrar Voluntariado Corporativo
        print("🤝 Sembrando Horas de Voluntariado...")
        db.add(VoluntariadoCorporativoSQL(
            id=str(uuid.uuid4()),
            usuario_id=nuevo_id,
            horas_totales=340,
            empleados_participantes=89,
            descripcion_actividad="Pintura y Mantenimiento de la Casa RMCDMX",
            fecha_actividad=datetime.now(timezone.utc) - timedelta(days=20)
        ))

        # 6. Sembrar Matching Gifts (Campañas)
        print("📊 Sembrando Campaña Matching Gifts Activa...")
        db.add(CampaniaCorporativaSQL(
            id=str(uuid.uuid4()),
            usuario_id=nuevo_id,
            nombre_campania="Matching Gifts 2026 - Invierno",
            tipo_matching="1:1",
            estado="activa",
            meta_mxn=200000.0,
            progreso_empleados_mxn=85000.0,
            progreso_empresa_mxn=72000.0
        ))

        # 7. Sembrar Historial de Facturas Deducibles
        print("📄 Generando Constancias y Documentos Fiscales...")
        meses = [("Septiembre", 9), ("Octubre", 10), ("Noviembre", 11)]
        for mes_str, mes_int in meses:
            db.add(DocumentoFiscalSQL(
                id=str(uuid.uuid4()),
                usuario_id=nuevo_id,
                mes_texto=f"{mes_str} 2026",
                anio=2026,
                monto_amparado=42500.0,
                url_xml="https://example.com/factura.xml",
                url_pdf="https://example.com/factura.pdf",
                fecha_creacion=datetime.now(timezone.utc) - timedelta(days=(12-mes_int)*30)
            ))

        db.commit()
        print("✅ ¡ÉXITO TOTAL! Datos B2B sembrados correctamente en la base de datos Supabase/PostgreSQL.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error fatal en la carga de datos: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    poblar_corporativo()
