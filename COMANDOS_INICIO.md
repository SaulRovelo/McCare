# Guía de Comandos para Abrir el Entorno de McCare

A continuación se encuentran los comandos paso a paso junto con una versión lista para copiar y pegar, útil para cada vez que desees levantar el proyecto desde cero.

## 🚀 Versión Rápida (Para copiar y pegar)

Abre dos pestañas de terminal en la carpeta principal del proyecto (`/McCare`):

**Terminal 1 (Backend):**
```bash
source antigravity/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

---

## 📖 Explicación de cada comando

### Entorno y Backend (Python)
- **`source antigravity/bin/activate`**
  Prende tu "Entorno Virtual" aislado. Crea un espacio protegido para el proyecto donde instalarás librerías de Python sin afectar otros programas de tu computadora.
- **`pip install -r requirements.txt`**
  Descarga e instala automáticamente de internet todas las dependencias exactas que tu aplicación backend necesita para funcionar (como FastAPI). 
- **`uvicorn backend.main:app --reload`**
  Arranca el servidor de tu Backend (API). El atributo `--reload` hace que si cambias o modificas tu código de Python, el servidor detecte el cambio y se reinicie automáticamente al instante.

### Frontend (Next.js / Node)
- **`npm install`**
  Lee el archivo de configuración del frontend (`package.json`) y descarga todas las piezas y complementos visuales necesarios (botones, interfaz, React) dentro de una carpeta llamada `node_modules` para que pueda renderizarse tu página.
- **`npm run dev`**
  Arranca tu servidor visual de Next.js. De esta forma puedes abrir en tu navegador la dirección `http://localhost:3000` y ver, probar y manipular los cambios en la interfaz gráfica que estás programando.
