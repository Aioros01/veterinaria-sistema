@echo off
echo ========================================
echo  SISTEMA DE GESTION VETERINARIA
echo  Configuracion Inicial
echo ========================================
echo.

echo [1/4] Instalando dependencias del Backend...
cd backend
call npm install
echo.

echo [2/4] Instalando dependencias del Frontend...
cd ../frontend
call npm install
echo.

echo [3/4] Volviendo al directorio principal...
cd ..
echo.

echo ========================================
echo  CONFIGURACION COMPLETADA!
echo ========================================
echo.
echo Para ejecutar el sistema:
echo.
echo 1. OPCION A - Con Docker (recomendado):
echo    docker-compose up -d
echo.
echo 2. OPCION B - Manual:
echo    - Terminal 1: cd backend && npm run dev
echo    - Terminal 2: cd frontend && npm start
echo.
echo Credenciales por defecto:
echo  Email: admin@veterinaria.com
echo  Password: admin123
echo.
echo Para acceso remoto, consulta el README.md
echo ========================================
pause