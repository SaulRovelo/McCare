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
