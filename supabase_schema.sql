-- EJECUTA ESTE CÓDIGO EN EL SQL EDITOR DE SUPABASE LOGIKAMENTO ANTES DE IMPORTAR LOS CSV

-- 1. Crear tabla Insumos
CREATE TABLE insumos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    stock_actual INTEGER NOT NULL DEFAULT 0,
    consumo_diario DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    nivel_critico INTEGER NOT NULL DEFAULT 0,
    capacidad_maxima INTEGER NOT NULL DEFAULT 100,
    sede VARCHAR(50) NOT NULL DEFAULT 'cdmx',
    costo_unitario DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Crear tabla Movimientos_Inventario
CREATE TABLE movimientos_inventario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    insumo_id UUID NOT NULL,
    tipo_movimiento VARCHAR(50) NOT NULL,
    cantidad INTEGER NOT NULL,
    stock_resultante INTEGER NOT NULL,
    fecha TIMESTAMP WITHOUT TIME ZONE DEFAULT timezone('utc'::text, now()),
    observacion VARCHAR(200),
    FOREIGN KEY (insumo_id) REFERENCES insumos (id) ON DELETE CASCADE
);

-- 3. Crear índices de optimización idénticos a los de tu SQLAlchemy
CREATE INDEX ix_insumos_id ON insumos (id);
CREATE INDEX ix_insumos_nombre ON insumos (nombre);
CREATE INDEX ix_movimientos_inventario_id ON movimientos_inventario (id);

-- Opcional RLS (si el API controlará acceso directo sin RLS de Supabase apagarlo o dejar inactivo):
-- ALTER TABLE insumos ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Permitir todo temporalmente para Backend API" ON insumos FOR ALL USING (true);

-- 4. Tablas Corporativas Satélite (Relacionadas a usuarios)

CREATE TABLE voluntariado_corporativo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL,
    horas_totales INTEGER NOT NULL DEFAULT 0,
    empleados_participantes INTEGER NOT NULL DEFAULT 0,
    descripcion_actividad VARCHAR(300),
    fecha_actividad TIMESTAMP WITHOUT TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE campanias_corporativas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL,
    nombre_campania VARCHAR(150) NOT NULL,
    tipo_matching VARCHAR(50) NOT NULL DEFAULT '1:1',
    estado VARCHAR(30) NOT NULL DEFAULT 'activa',
    meta_mxn DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    progreso_empleados_mxn DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    progreso_empresa_mxn DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE documentos_fiscales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL,
    mes_texto VARCHAR(30) NOT NULL,
    anio INTEGER NOT NULL,
    monto_amparado DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    url_xml VARCHAR(300),
    url_pdf VARCHAR(300),
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX ix_voluntariado_usuario_id ON voluntariado_corporativo (usuario_id);
CREATE INDEX ix_campanias_usuario_id ON campanias_corporativas (usuario_id);
CREATE INDEX ix_documentos_usuario_id ON documentos_fiscales (usuario_id);
