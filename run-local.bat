@echo off
echo ========================================
echo  INICIANDO SISTEMA VETERINARIO
echo ========================================
echo.
echo IMPORTANTE: Necesitas tener instalado:
echo - PostgreSQL (ejecutandose en puerto 5432)
echo - Redis (opcional, mejora el rendimiento)
echo.
echo Si no tienes PostgreSQL/Redis, usa: docker-compose up -d
echo.
pause

echo.
echo [1/3] Creando base de datos inicial...
cd backend
call npm run seed
echo.

echo [2/3] Iniciando Backend (Puerto 3001)...
start cmd /k "cd backend && npm run dev"
timeout /t 5

echo [3/3] Iniciando Frontend (Puerto 3000)...
start cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo  SISTEMA INICIADO!
echo ========================================
echo.
echo Accede a: http://localhost:3000
echo.
echo Credenciales:
echo  Admin: admin@veterinaria.com / admin123
echo  Veterinario: vet@veterinaria.com / vet123
echo  Cliente: cliente@example.com / cliente123
echo.
echo Para compartir con otros:
echo  1. Encuentra tu IP: ipconfig
echo  2. Comparte: http://TU_IP:3000
echo.
echo Presiona cualquier tecla para cerrar todo...
pause
taskkill /F /IM node.exe