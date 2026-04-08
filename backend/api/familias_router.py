from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime

from database.connection import get_db
from database.models import FamiliaSQL, UsuarioSQL
from backend.models.domain import FamiliaCreate, FamiliaOut, FamiliaStats
from backend.auth.dependencies import get_current_user, require_admin

familias_router = APIRouter(prefix="/familias", tags=["Familias"])

@familias_router.get("", response_model=List[FamiliaOut])
def listar_familias(sede: str = None, estado: str = "activa", db: Session = Depends(get_db)):
    """Lista las familias. Filtrable por sede y estado. Ejecuta auto-alta a caducadas (+2 días)."""
    # 1. Auto-alta de familias vencidas 
    # (las que llevan > dias_estancia_est + 2)
    now = datetime.utcnow()
    activas = db.query(FamiliaSQL).filter(FamiliaSQL.estado == "activa").all()
    for f in activas:
        dias_lleva = (now - f.fecha_ingreso).days
        if dias_lleva > (f.dias_estancia_est + 2):
            f.estado = "alta"
            f.fecha_alta = now
            f.dias_reales = max(1, dias_lleva)
    db.commit()

    # 2. Consultar y retornar la info
    query = db.query(FamiliaSQL)
    if sede:
        query = query.filter(FamiliaSQL.sede == sede)
    if estado:
        query = query.filter(FamiliaSQL.estado == estado)
    
    return query.order_by(FamiliaSQL.fecha_ingreso.desc()).all()

@familias_router.post("", response_model=FamiliaOut, status_code=status.HTTP_201_CREATED)
def registrar_familia(
    data: FamiliaCreate, 
    db: Session = Depends(get_db),
    current_user: UsuarioSQL = Depends(require_admin)
):
    """Registra una nueva familia en el albergue (Solo Admin)."""
    nueva_familia = FamiliaSQL(
        sede=data.sede,
        numero_adultos=data.numero_adultos,
        numero_ninos=data.numero_ninos,
        dias_estancia_est=data.dias_estancia_est,
        habitacion=data.habitacion,
        paciente_edad=data.paciente_edad,
        paciente_referencia=data.paciente_referencia,
        necesidades_especiales=data.necesidades_especiales,
        usuario_registro_id=current_user.id
    )
    db.add(nueva_familia)
    db.commit()
    db.refresh(nueva_familia)
    return nueva_familia

@familias_router.patch("/{familia_id}/dar-alta", response_model=FamiliaOut)
def dar_alta_familia(
    familia_id: str, 
    db: Session = Depends(get_db),
    current_user: UsuarioSQL = Depends(require_admin)
):
    """Marca a una familia como 'alta' (ya no está en la sede)."""
    familia = db.query(FamiliaSQL).filter_by(id=familia_id).first()
    if not familia:
        raise HTTPException(status_code=404, detail="Familia no encontrada")
    if familia.estado == "alta":
        return familia

    familia.estado = "alta"
    familia.fecha_alta = datetime.utcnow()
    # Calcular días reales si es necesario
    delta = (familia.fecha_alta - familia.fecha_ingreso).days
    familia.dias_reales = max(1, delta)
    db.commit()
    db.refresh(familia)
    return familia

@familias_router.patch("/{familia_id}/prorroga", response_model=FamiliaOut)
def extender_prorroga_familia(
    familia_id: str, 
    db: Session = Depends(get_db),
    current_user: UsuarioSQL = Depends(require_admin)
):
    """Extiende la estancia de la familia en la sede por 3 días más."""
    familia = db.query(FamiliaSQL).filter_by(id=familia_id).first()
    if not familia:
        raise HTTPException(status_code=404, detail="Familia no encontrada")
    if familia.estado == "alta":
        raise HTTPException(status_code=400, detail="No se puede extender una familia dada de alta")

    familia.dias_estancia_est += 3
    db.commit()
    db.refresh(familia)
    return familia

@familias_router.get("/stats", response_model=FamiliaStats)
def stats_familias(sede: str = None, db: Session = Depends(get_db)):
    """Devuelve estadísticas operativas para el dashboard."""
    query = db.query(FamiliaSQL).filter(FamiliaSQL.estado == "activa")
    if sede:
        query = query.filter(FamiliaSQL.sede == sede)
        
    familias = query.all()
    
    total_activas = len(familias)
    total_adultos = sum(f.numero_adultos for f in familias)
    total_ninos = sum(f.numero_ninos for f in familias)
    dias_promedio = sum(f.dias_estancia_est for f in familias) / total_activas if total_activas > 0 else 0
    
    return FamiliaStats(
        total_activas=total_activas,
        total_adultos=total_adultos,
        total_ninos=total_ninos,
        promedio_dias_estancia=dias_promedio
    )
