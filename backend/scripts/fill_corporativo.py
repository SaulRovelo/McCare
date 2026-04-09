"""
Script de relleno completo para el usuario corporativo existente en Supabase.
Conserva al usuario y solo actualiza/rellena sus tablas satélite.
"""
import sys
import os
import uuid
from datetime import datetime, timedelta, timezone

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from database.connection import SessionLocal
from database.models import (
    UsuarioSQL, PerfilDonanteSQL, VoluntariadoCorporativoSQL,
    CampaniaCorporativaSQL, DocumentoFiscalSQL
)

CORP_EMAIL = "director@globalcorp.com"

def rellenar():
    db = SessionLocal()
    try:
        # 1. Encontrar al usuario existente
        usr = db.query(UsuarioSQL).filter_by(email=CORP_EMAIL).first()
        if not usr:
            print(f"❌ Usuario '{CORP_EMAIL}' no encontrado en la BD.")
            return

        uid = usr.id
        print(f"✅ Usuario encontrado: {usr.nombre} (ID: {uid})")

        # 2. Limpiar registros previos en tablas satélite
        print("🧹 Limpiando registros anteriores...")
        db.query(VoluntariadoCorporativoSQL).filter_by(usuario_id=uid).delete()
        db.query(CampaniaCorporativaSQL).filter_by(usuario_id=uid).delete()
        db.query(DocumentoFiscalSQL).filter_by(usuario_id=uid).delete()
        
        # Actualizar perfil al nivel platino
        perfil = db.query(PerfilDonanteSQL).filter_by(usuario_id=uid).first()
        if perfil:
            perfil.nivel = "platino"
            perfil.empresa_nombre = "Global Corp S.A. de C.V."
            perfil.empresa_rfc = "GLO800101QW1"
            perfil.total_donado_mxn = 380000.0
        else:
            db.add(PerfilDonanteSQL(
                id=str(uuid.uuid4()),
                usuario_id=uid,
                nivel="platino",
                empresa_nombre="Global Corp S.A. de C.V.",
                empresa_rfc="GLO800101QW1",
                total_donado_mxn=380000.0
            ))
        
        db.flush()

        # 3. Voluntariado
        print("🤝 Insertando registros de voluntariado...")
        db.add_all([
            VoluntariadoCorporativoSQL(
                id=str(uuid.uuid4()), usuario_id=uid,
                horas_totales=200, empleados_participantes=55,
                descripcion_actividad="Jornada de pintura en Casa RMHCDMX",
                fecha_actividad=datetime.now(timezone.utc) - timedelta(days=60)
            ),
            VoluntariadoCorporativoSQL(
                id=str(uuid.uuid4()), usuario_id=uid,
                horas_totales=140, empleados_participantes=34,
                descripcion_actividad="Campaña de donación de juguetes y ropa infantil",
                fecha_actividad=datetime.now(timezone.utc) - timedelta(days=20)
            ),
        ])

        # 4. Campañas Matching Gifts
        print("📊 Insertando campaña Matching Gifts...")
        db.add(CampaniaCorporativaSQL(
            id=str(uuid.uuid4()), usuario_id=uid,
            nombre_campania="Matching Gifts 2026 — Semestre Invierno",
            tipo_matching="1:1",
            estado="activa",
            meta_mxn=200000.0,
            progreso_empleados_mxn=85000.0,
            progreso_empresa_mxn=72000.0,
            fecha_creacion=datetime.now(timezone.utc) - timedelta(days=30)
        ))

        # 5. Documentos fiscales
        print("📄 Insertando documentos fiscales...")
        docs = [
            ("Septiembre 2025", 2025,  42500.0),
            ("Octubre 2025",    2025,  38000.0),
            ("Noviembre 2025",  2025,  35000.0),
            ("Enero 2026",      2026,  50000.0),
            ("Febrero 2026",    2026,  47000.0),
            ("Marzo 2026",      2026,  41000.0),
        ]
        for mes_txt, anio, monto in docs:
            db.add(DocumentoFiscalSQL(
                id=str(uuid.uuid4()), usuario_id=uid,
                mes_texto=mes_txt, anio=anio,
                monto_amparado=monto,
                url_xml="https://example.com/cfdi.xml",
                url_pdf="https://example.com/cfdi.pdf",
                fecha_creacion=datetime.now(timezone.utc) - timedelta(days=10)
            ))

        db.commit()
        print("\n🎉 ¡Listo! Tablas corporativas rellenadas exitosamente en Supabase.")
        print("   Recarga /corporativo en el navegador para ver los cambios.")

    except Exception as e:
        db.rollback()
        import traceback
        print("❌ Error:", e)
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    rellenar()
