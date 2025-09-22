# INSTRUCCIONES PARA SUBIR A GITHUB

## Paso 1: Crear repositorio en GitHub

1. Ve a https://github.com
2. Haz click en el botón verde "New" o "+" → "New repository"
3. Configuración del repositorio:
   - **Repository name**: veterinaria-sistema
   - **Description**: Sistema completo de gestión veterinaria con React + Node + CockroachDB
   - **Visibility**: Private (o Public si quieres)
   - **NO** marques "Initialize this repository with README"
   - **NO** agregues .gitignore ni license
4. Click en "Create repository"

## Paso 2: Copiar la URL del repositorio

Después de crear, GitHub te mostrará comandos. Copia la URL que será algo como:
- HTTPS: `https://github.com/TU_USUARIO/veterinaria-sistema.git`
- SSH: `git@github.com:TU_USUARIO/veterinaria-sistema.git`

## Paso 3: Ejecutar estos comandos en tu terminal

Abre PowerShell o CMD en la carpeta del proyecto (C:\Users\chios\Proyectos\Veterinaria) y ejecuta:

```bash
# Agregar el repositorio remoto (reemplaza URL_DE_TU_REPOSITORIO)
git remote add origin URL_DE_TU_REPOSITORIO

# Verificar que se agregó correctamente
git remote -v

# Subir el código
git push -u origin main
```

## Paso 4: En tu laptop personal

Una vez subido, en tu laptop personal:

```bash
# Clonar el repositorio
git clone URL_DE_TU_REPOSITORIO
cd veterinaria-sistema

# Instalar dependencias del backend
cd backend
npm install
cp .env.example .env
# EDITA .env con tus credenciales de CockroachDB

# Instalar dependencias del frontend  
cd ../frontend
npm install

# Iniciar el sistema
cd ..
# En Windows:
iniciar.bat
# O manualmente:
# Terminal 1: cd backend && npm run dev
# Terminal 2: cd frontend && npm start
```

## IMPORTANTE - Estado actual

✅ **Ya está hecho:**
- Repositorio Git inicializado localmente
- Commit inicial con 357 archivos del backend y documentación
- Configuración de usuario Git

⚠️ **Falta hacer:**
- Crear el repositorio en GitHub.com
- Agregar el remote origin
- Hacer push del código

## Contenido del commit

El commit actual incluye:
- ✅ Todo el backend (backend/)
- ✅ Documentación (*.md, *.bat)
- ✅ Configuraciones (.env.example, .gitignore)
- ⚠️ Frontend está en una carpeta separada (necesitarás copiarlo manualmente si hay problemas)

## Si hay problemas con el frontend

Si el frontend no se sube correctamente, cópialo manualmente:
1. Copia toda la carpeta `frontend/` a tu laptop
2. Asegúrate de que esté en la misma estructura:
   ```
   veterinaria-sistema/
   ├── backend/
   ├── frontend/
   ├── iniciar.bat
   └── ...
   ```