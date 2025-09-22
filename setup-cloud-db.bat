@echo off
echo ========================================
echo  CONFIGURACION DE BASE DE DATOS EN LA NUBE
echo  100%% GRATUITA Y SEGURA
echo ========================================
echo.
echo OPCIONES RECOMENDADAS (Todas gratuitas):
echo.
echo [1] SUPABASE (Recomendado)
echo    - 500MB gratis
echo    - Backups automaticos
echo    - Panel web incluido
echo    - https://supabase.com
echo.
echo [2] NEON DATABASE  
echo    - 3GB gratis
echo    - Branching de DB
echo    - https://neon.tech
echo.
echo [3] ELEPHANTSQL
echo    - 20MB gratis (suficiente para empezar)
echo    - Simple y rapido
echo    - https://elephantsql.com
echo.
echo [4] AIVEN
echo    - $300 creditos gratis
echo    - Alta disponibilidad
echo    - https://aiven.io
echo.
echo ========================================
echo PASOS PARA CONFIGURAR:
echo ========================================
echo.
echo 1. Elige una opcion y crea cuenta gratis
echo 2. Crea una nueva base de datos
echo 3. Copia las credenciales
echo 4. Actualiza el archivo backend\.env con:
echo    - DB_HOST=tu_host_de_la_nube
echo    - DB_PORT=5432
echo    - DB_USERNAME=tu_usuario
echo    - DB_PASSWORD=tu_password
echo    - DB_DATABASE=tu_database
echo.
echo 5. Ejecuta: npm run seed (para crear usuario admin)
echo.
echo ========================================
echo VENTAJAS DE LA NUBE:
echo ========================================
echo ✅ Acceso desde cualquier lugar
echo ✅ No se pierde si te roban la PC
echo ✅ Backups automaticos
echo ✅ Disponible 24/7
echo ✅ Gratis para siempre (con limites)
echo.
pause

echo.
echo ¿Quieres que abra las paginas? (S/N)
set /p respuesta=

if /i "%respuesta%"=="S" (
    start https://supabase.com
    start https://neon.tech
    start https://elephantsql.com
    echo.
    echo Paginas abiertas en tu navegador!
)

echo.
echo Una vez configurada la base de datos:
echo 1. Actualiza backend\.env
echo 2. Ejecuta: cd backend ^&^& npm run seed
echo 3. Ejecuta: npm run dev
echo.
pause