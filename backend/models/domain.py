from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Literal, List
from datetime import datetime
from uuid import UUID

class InsumoCreate(BaseModel):
    """Esquema para cuando el cliente envía un nuevo insumo a crear (el ID se generará en backend)"""
    nombre: str = Field(..., description="Nombre del insumo (ej: Pañales Talla G)")
    categoria: str = Field(..., description="Categoría para filtros (alimentos, higiene, etc)")
    stock_actual: int = Field(..., ge=0, description="Unidades que se encuentran en el almacén hoy")
    consumo_diario: float = Field(..., ge=0, description="Consumo promedio por día estimado")
    nivel_critico: int = Field(..., ge=0, description="Límite mínimo antes de declarar alerta")
    capacidad_maxima: int = Field(100, ge=0, description="Nivel máximo de bodega")
    sede: str = Field("cdmx", description="Sede operativa")
    costo_unitario: float = Field(10.0, ge=0, description="Costo por unidad de este insumo")

class Insumo(InsumoCreate):
    """Esquema para respuestas y lectura, incluye su identificador único"""
    id: UUID | str = Field(..., description="Identificador único del insumo generado por el servidor")
    model_config = ConfigDict(from_attributes=True)

class MisionCritica(BaseModel):
    """Esquema para las misiones generadas automáticamente si las reglas de urgencia se cumplen"""
    id: UUID | str = Field(..., description="Identificador único de la misión")
    insumo_id: UUID | str = Field(..., description="Referencia al insumo que necesita reabastecerse")
    nombre_insumo: str = Field(..., description="Nombre amigable para la interfaz de donadores")
    nivel_urgencia: float = Field(..., description="Ratio que indica qué tan crítico es (basado en consumo y stock)")
    mensaje: str = Field(..., description="Mensaje humano para los donadores y dashboard")

class MovimientoCreate(BaseModel):
    """Esquema para registrar un nuevo movimiento de inventario"""
    insumo_id: UUID | str = Field(..., description="ID del insumo afectado")
    tipo_movimiento: Literal['entrada', 'salida', 'ajuste'] = Field(..., description="Solo permite entrada, salida o ajuste")
    cantidad: int = Field(..., gt=0, description="Debe ser mayor a 0 estrictamente")
    observacion: Optional[str] = Field(None, description="Motivo del movimiento o ajuste")
    origen: Literal['interno', 'publico', 'corporativo', 'urgente'] = Field(
        'interno', description="Origen de la acción para trazabilidad"
    )

class AdminResumen(BaseModel):
    """KPIs ejecutivos calculados en el backend para el portal administrativo."""
    total_insumos: int
    insumos_criticos: int
    insumos_atencion: int
    insumos_estables: int
    insumos_sin_datos: int
    misiones_activas: int
    cobertura_promedio_dias: float
    movimientos_recientes: int
    porcentaje_catalogo_sano: float
    estado_general: Literal['optimo', 'alerta', 'critico']
    mensaje_estado: str

class ImpactoResumen(BaseModel):
    """Resumen calculado en backend para el Hero del portal público."""
    urgencias_criticas: int
    prevenciones_activas: int
    total_historias: int
    mensaje_principal: str
    submensaje: str
    mensaje_hero_emocional: str  # "Hoy puedes cambiar la noche de 65 niños"
    familias_en_riesgo: int      # Número animado en el hero
    tagline: str                 # "Donaciones con impacto real"


# ── Schemas Corporativos ────────────────────────────────────────────────────

class MisionFinanciable(BaseModel):
    """
    Misión estructurada para decision-making corporativo.
    Incluye impacto estimado, justificación y nivel de urgencia.
    """
    id: UUID | str                          # ID único de la misión/historia
    insumo_id: UUID | str
    nombre_insumo: str
    categoria: str
    tipo: Literal["rescate_critico", "prevencion_inteligente"]
    severidad: Literal["alta", "media"]
    titulo: str
    descripcion_ejecutiva: str       # Tono B2B, no emocional
    impacto_familias: int            # Calculo centralizado de metricas.py
    cobertura_actual_dias: float     # Días de stock restante
    dias_para_critico: float
    inversion_estimada_label: str    # Ej: "Reabastecimiento ~14 días"
    urgencia_relativa: float         # Para ordenar
    cta_label: str
    origen: str                      # "operacion_actual" | "forecast_predictivo"
    confianza: str

class CampaniaOut(BaseModel):
    id: UUID | str
    nombre_campania: str
    tipo_matching: str
    estado: str
    meta_mxn: float
    progreso_empleados_mxn: float
    progreso_empresa_mxn: float
    model_config = ConfigDict(from_attributes=True)

class DocumentoFiscalOut(BaseModel):
    id: UUID | str
    mes_texto: str
    anio: int
    monto_amparado: float
    url_xml: Optional[str] = None
    url_pdf: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class ImpactoMensualItem(BaseModel):
    """Un punto de datos en la gráfica de impacto social mensual."""
    mes: str          # Abreviatura: Ene, Feb, ..., Dic
    donacion: float   # Suma de donaciones MXN ese mes
    voluntariado: int # Suma de horas de voluntariado ese mes

class CorporativoResumen(BaseModel):
    """KPIs ejecutivos para el portal corporativo."""
    periodo_dias: int
    misiones_financiables: int
    misiones_criticas: int
    misiones_preventivas: int
    familias_potenciales: int        # Total familias beneficiables si se patrocinan todas
    unidades_entrada_periodo: int    # Unidades recibidas como donación/entrada en el período
    cobertura_promedio_dias: float
    estado_general: Literal["optimo", "alerta", "critico"]
    frase_ejecutiva: str             # Una frase clara para el resumen C-level
    
    # Extensiones B2B
    nivel_partnership: str = "Oro"
    inversion_social_acumulada: float = 0.0
    horas_voluntariado: int = 0
    empleados_voluntarios: int = 0
    campanias_activas: List[CampaniaOut] = []
    documentos_fiscales: List[DocumentoFiscalOut] = []

class ItemHistoricoImpacto(BaseModel):
    """Un movimiento de entrada presentado como evento de impacto trazable."""
    fecha: datetime
    insumo_nombre: str
    categoria: str
    cantidad: int
    stock_resultante: int
    origen_movimiento: str           # 'interno' | 'publico' | 'corporativo'
    observacion: Optional[str]

class ReporteCorporativo(BaseModel):
    """Reporte exportable ESG/RSE — respuesta del endpoint de export."""
    generado_en: datetime
    periodo_dias: int
    resumen: CorporativoResumen
    misiones_activas: List[MisionFinanciable]
    historial_entradas: List[ItemHistoricoImpacto]
    recomendaciones_predictivas: List[MisionFinanciable]


class Movimiento(MovimientoCreate):
    """Esquema de respuesta histórico de auditoría"""
    id: UUID | str
    stock_resultante: int
    fecha: datetime
    model_config = ConfigDict(from_attributes=True)

class ForecastResult(BaseModel):
    """Proyección de días restantes (CareForecast V2)"""
    id: UUID | str
    nombre: str
    categoria: str
    stock_actual: int
    nivel_critico: int
    consumo_base: float
    consumo_estimado: float
    metodo_usado: str
    dias_para_nivel_critico: float
    dias_para_agotarse: float
    estado_forecast: Literal["estable", "atencion", "critico", "sin_datos"]
    confianza_basica: Literal["alta", "media", "baja"]
    mensaje_forecast: str
    
    # Contexto Operativo Real (Familias)
    ocupacion_actual: Optional[int] = None
    factor_ajuste: Optional[float] = None
    personas_en_sede: Optional[int] = None

class ImpactStory(BaseModel):
    """Historia Narrativa Oficial (B2C) dictaminada por la capa de Negocio."""
    id: UUID | str
    insumo_id: UUID | str
    nombre_insumo: str
    categoria: str
    casa: str
    tipo_historia: Literal["rescate_critico", "prevencion_inteligente"]
    severidad: Literal["alta", "media"]
    titulo: str
    descripcion: str
    impacto_resumido: str
    tiempo_texto: str
    dias_restantes: float
    accion_label: str
    accion_tipo: Literal["transaccional_fuerte", "transaccional_suave"]
    origen: Literal["operacion_actual", "forecast_predictivo"]
    confianza: Literal["alta", "media", "baja"]
    nivel_urgencia_relativa: float
    consumo_estimado: float      # Para que el frontend calcule reabastecimiento sin llamada extra
    # Campos para la UI pública (/impacto/page.tsx)
    historia: str                # Alias legíble de `descripcion` (narrativa emocional)
    meta_cantidad: int           # Unidades necesarias para cubrir 14 días (=capacidad_maxima)
    unidad: str                  # "unidades" por defecto
    faltante: str                # "X unidades" calculado en impacto.py


# ── Schemas de Notificaciones ───────────────────────────────────────────────

class NotificacionOut(BaseModel):
    """Notificación del sistema para el panel administrativo."""
    id: str
    tipo: str                       # critico | urgente | atencion | info
    insumo_id: Optional[str]
    titulo: str
    mensaje: str
    leida: bool
    fecha: datetime
    insumo_nombre: Optional[str] = None  # Enriquecido por el endpoint
    model_config = ConfigDict(from_attributes=True)


class ConfiguracionOut(BaseModel):
    """Parámetro configurable del sistema."""
    clave: str
    valor: str
    tipo: str
    descripcion: Optional[str]
    model_config = ConfigDict(from_attributes=True)


class SolicitudUrgenteOut(BaseModel):
    """Respuesta del endpoint POST /api/misiones/urgente."""
    movimiento_id: str
    insumo_id: str
    insumo_nombre: str
    cantidad_reabastecida: int
    stock_nuevo: int
    notificacion_id: str
    mensaje: str


# ── Schemas de Autenticación y Usuarios ────────────────────────────────────────

class RegistroRequest(BaseModel):
    """Payload para registrar un nuevo usuario."""
    nombre: str = Field(..., min_length=2, max_length=150)
    email: str  = Field(..., description="Email único del usuario")
    password: str = Field(..., min_length=8, description="Mínimo 8 caracteres")
    rol: Literal["donante", "corporativo", "admin"] = "donante"
    sede: Optional[str] = None              # Solo para admin
    empresa_nombre: Optional[str] = None    # Para rol corporativo
    empresa_rfc: Optional[str] = None       # Para rol corporativo


class LoginRequest(BaseModel):
    """Credenciales para inicio de sesión."""
    email: str
    password: str


class TokenOut(BaseModel):
    """Token JWT devuelto tras login o registro exitoso."""
    access_token: str
    token_type: str = "bearer"
    rol: str
    nombre: str
    usuario_id: str
    sede: Optional[str] = None


class PerfilDonanteOut(BaseModel):
    """Perfil extendido del donante para el panel personal."""
    usuario_id: str
    preferencias_categoria: Optional[str]   # JSON string
    nivel_urgencia_pref: Optional[str]
    tipo_donacion_pref: Optional[str]
    total_donado_mxn: float
    total_movimientos: int
    nivel: str                              # bronce | plata | oro | platino
    avatar_url: Optional[str]
    bio: Optional[str]
    empresa_nombre: Optional[str]
    empresa_rfc: Optional[str]
    model_config = ConfigDict(from_attributes=True)


class UsuarioOut(BaseModel):
    """Datos del usuario autenticado — devuelto por GET /auth/me."""
    id: str
    nombre: str
    email: str
    rol: str
    activo: bool
    sede: Optional[str]
    fecha_creacion: datetime
    ultimo_login: Optional[datetime]
    perfil: Optional[PerfilDonanteOut] = None
    model_config = ConfigDict(from_attributes=True)


class ActualizarPerfilRequest(BaseModel):
    """Campos actualizables por el propio usuario."""
    nombre: Optional[str] = Field(None, min_length=2, max_length=150)
    preferencias_categoria: Optional[str] = None   # JSON string
    nivel_urgencia_pref: Optional[str] = None
    tipo_donacion_pref: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=300)
    avatar_url: Optional[str] = None


# ── Schemas de Familias ────────────────────────────────────────

class FamiliaCreate(BaseModel):
    sede: str = "cdmx"
    numero_adultos: int = Field(..., ge=1)
    numero_ninos: int = Field(..., ge=0)
    dias_estancia_est: int = Field(7, ge=1)
    habitacion: Optional[str] = None
    paciente_edad: Optional[int] = None
    paciente_referencia: Optional[str] = None
    necesidades_especiales: Optional[str] = None  # JSON dict string

class FamiliaOut(BaseModel):
    id: str
    sede: str
    numero_adultos: int
    numero_ninos: int
    dias_estancia_est: int
    dias_reales: int
    habitacion: Optional[str]
    paciente_edad: Optional[int]
    paciente_referencia: Optional[str]
    necesidades_especiales: Optional[str]
    estado: str
    fecha_ingreso: datetime
    fecha_alta: Optional[datetime]
    model_config = ConfigDict(from_attributes=True)

class FamiliaStats(BaseModel):
    total_activas: int
    total_adultos: int
    total_ninos: int
    promedio_dias_estancia: float

