@echo off
echo ====================================================
echo    SUBIR CODIGO A GITHUB
echo ====================================================
echo.
echo Cuando te pida credenciales:
echo Usuario: Aioros01
echo Password: (pega tu token que empieza con github_pat_)
echo.
echo IMPORTANTE: Despues de subir, REVOCA el token en:
echo https://github.com/settings/tokens
echo.
pause
git push -u origin master
pause