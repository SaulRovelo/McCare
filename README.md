# McCare | Al cuidado de los niños

Plataforma enfocada en optimizar donaciones para Casas Ronald McDonald, detectando necesidades prioritarias y convirtiéndolas en "misiones críticas".

## Fase 1 - MVP

Esta arquitectura mantiene el Frontend (Next.js) y el Backend (FastAPI) separados, preparados para integraciones futuras de bases de datos e Inteligencia Artificial.

### Estructura Principal
- `/frontend/` - Aplicación UI conectada a React y Tailwind.
- `/backend/` - API transaccional en Python con dependencias instaladas en root.
- `/database/` - Carpeta reservada para migraciones esquematizadas e inserción inicial de datos.
- `/analytics_ia/` - Carpeta reservada para modulo asíncrono de predicción.

## Configuración de Entornos

Revisar las instrucciones locales (en cada subdirectorio o desde la raíz) para ejecutar el MVP.
