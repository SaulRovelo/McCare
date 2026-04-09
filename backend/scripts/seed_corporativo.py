import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from database.connection import SessionLocal, engine, Base
from database.models import (
    UsuarioSQL, RolUsuario, VoluntariadoCorporativoSQL, 
    CampaniaCorporativaSQL, DocumentoFiscalSQL, DonacionSQL
)
from datetime import datetime, timedelta

def seed_corporativo():
    print("Creando nuevas tablas si no existen en la BD...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Buscar usuario corporativo "Global Corp / Empresa Socialmente Responsable"
        corp_user = db.query(UsuarioSQL).filter(UsuarioSQL.rol == RolUsuario.corporativo).first()
        if not corp_user:
            print("No se encontró usuario corporativo. Asegúrate de tener al menos uno registrado.")
            return

        print(f"Sembrando datos (Mocks) para corporativo: {corp_user.email} (ID: {corp_user.id})")

        # === LIMPIAR ANTERIORES PARA NO DUPLICAR (Opcional, pero util en desarrollo) ===
        db.query(VoluntariadoCorporativoSQL).filter_by(usuario_id=corp_user.id).delete()
        db.query(CampaniaCorporativaSQL).filter_by(usuario_id=corp_user.id).delete()
        db.query(DocumentoFiscalSQL).filter_by(usuario_id=corp_user.id).delete()
        
        # 1. Sembrar Voluntariado (tarjeta "Horas de Voluntariado: 340")
        voluntariado = VoluntariadoCorporativoSQL(
            usuario_id=corp_user.id,
            horas_totales=340,
            empleados_participantes=89,
            descripcion_actividad="Voluntariado corporativo de rescate 2026",
            fecha_actividad=datetime.utcnow() - timedelta(days=5)
        )
        db.add(voluntariado)

        # 2. Sembrar Campañas (tarjeta "Matching Gifts - 157,000 MXN")
        campania = CampaniaCorporativaSQL(
            usuario_id=corp_user.id,
            nombre_campania="Campaña Interna: Empleados vs Empresa",
            tipo_matching="1:1",
            estado="activa",
            meta_mxn=200000.0,
            progreso_empleados_mxn=85000.0,
            progreso_empresa_mxn=72000.0,
            fecha_creacion=datetime.utcnow() - timedelta(days=30)
        )
        db.add(campania)

        # 3. Sembrar Documentos Fiscales
        meses = [("Septiembre", 38000.0), ("Agosto", 30000.0), ("Julio", 35000.0)]
        for mes, monto in meses:
            doc = DocumentoFiscalSQL(
                usuario_id=corp_user.id,
                mes_texto=mes,
                anio=2026,
                monto_amparado=monto,
                url_xml=f"/facturas/{mes}_2026.xml",
                url_pdf=f"/facturas/{mes}_2026.pdf"
            )
            db.add(doc)
            
        db.commit()
        print("... ¡Mocks creados exitosamente en SQLite!")
        print("Ahora puedes obtener los datos en las API.")
    except Exception as e:
        print(f"Error sembrando datos: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_corporativo()
