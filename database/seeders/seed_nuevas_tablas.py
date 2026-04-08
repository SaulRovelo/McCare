import sys
import os
import uuid
from datetime import datetime, timedelta
import random

# Agregamos la ruta base para que Python encuentre los módulos
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from database.connection import SessionLocal
from database.models import DonacionSQL, NotificacionSQL, ConfiguracionSQL, InsumoSQL

def seed_nuevas_tablas():
    db = SessionLocal()
    
    print("Verificando insumos base...")
    insumos = db.query(InsumoSQL).all()
    if not insumos:
        print("❌ ¡Espera! Todavía no has subido tu archivo 'insumos.csv' a Supabase.")
        print("Sube tus insumos primero desde el panel web de Supabase para poder amarrarlos a las donaciones.")
        db.close()
        return

    # 1. Configuracion Global
    print("⚙️ Llenando tabla: ConfiguracionSQL...")
    configuraciones = [
        ConfiguracionSQL(clave="familias_actuales", valor="120", tipo="int", descripcion="Número de familias alojadas actualmente"),
        ConfiguracionSQL(clave="nombre_casa", valor="Casa McCare Central", tipo="str", descripcion="Nombre de la sede principal operativa"),
        ConfiguracionSQL(clave="dias_cobertura_meta", valor="30", tipo="int", descripcion="Meta de días de inventario ideal")
    ]
    for conf in configuraciones:
        if not db.query(ConfiguracionSQL).filter_by(clave=conf.clave).first():
            db.add(conf)
            
    # 2. Donaciones (15 simuladas)
    print("💰 Llenando tabla: DonacionSQL (15 donaciones de prueba)...")
    nombres = ["Juan Pérez", "María Sánchez", "Tech Corp S.A.", "Fundación Vida", "Anónimo", "Ana Gómez"]
    for i in range(15):
        insumo_azar = random.choice(insumos)
        es_monetaria = random.choice([True, False])
        
        donacion = DonacionSQL(
            id=str(uuid.uuid4()),
            insumo_id=insumo_azar.id,
            tipo="monetaria" if es_monetaria else "especie",
            monto_mxn=random.uniform(500.0, 15000.0) if es_monetaria else None,
            cantidad_especie=None if es_monetaria else random.randint(10, 100),
            origen=random.choice(["publico", "corporativo", "interno"]),
            donante_nombre=random.choice(nombres),
            donante_email="demo@hackathon.com",
            observacion="Apoyo de campaña de primavera" if es_monetaria else "Aportación física directa",
            fecha=datetime.utcnow() - timedelta(days=random.randint(0, 10))
        )
        db.add(donacion)
        
    # 3. Notificaciones (5 simuladas)
    print("🔔 Llenando tabla: NotificacionSQL (5 alertas)...")
    mensajes = [
        ("critico", "🚨 Suministro bajo", "El nivel de pañales ha llegado a estado crítico, requiere atención hoy."),
        ("info", "📦 Donación fuerte recibida", "Se recibió un cargamento corporativo de limpieza."),
        ("atencion", "👁️ Revisión de almacén", "Recordatorio para auditar los alimentos perecederos."),
        ("urgente", "⚠️ Alerta climática", "Prepara botiquines por probable contingencia en sede Sur."),
        ("info", "✅ Meta cumplida", "Llegamos a los 30 días de cobertura en la categoría Médicos.")
    ]
    
    for tipo, titulo, mensaje in mensajes:
        notif = NotificacionSQL(
            id=str(uuid.uuid4()),
            tipo=tipo,
            insumo_id=random.choice(insumos).id,
            titulo=titulo,
            mensaje=mensaje,
            leida=random.choice([True, False]),
            fecha=datetime.utcnow() - timedelta(hours=random.randint(1, 72))
        )
        db.add(notif)

    db.commit()
    db.close()
    print("✅ ¡Misión Cumplida! Las 3 nuevas tablas ya tienen información lista para tu Hackathon.")

if __name__ == "__main__":
    seed_nuevas_tablas()
q