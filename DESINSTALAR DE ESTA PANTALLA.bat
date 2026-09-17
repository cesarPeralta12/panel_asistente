@echo off
rem ===========================================================================
rem  INMOL - PANEL INTERACTIVO DE FERIA
rem  Deshace lo que hizo "INSTALAR EN ESTA PANTALLA.bat":
rem    - saca el panel del inicio de Windows
rem    - borra el acceso directo del escritorio
rem    - borra la copia de C:\inmol_panel (pregunta antes)
rem  No toca la carpeta desde la que se instalo (el disco externo).
rem ===========================================================================

set "DESTINO=C:\inmol_panel"
if defined INMOL_DESTINO set "DESTINO=%INMOL_DESTINO%"

echo.
echo  INMOL - Quitar el panel de esta pantalla
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "Remove-Item -LiteralPath (Join-Path ([Environment]::GetFolderPath('Startup')) 'INMOL Panel.lnk') -ErrorAction SilentlyContinue;" ^
  "Remove-Item -LiteralPath (Join-Path ([Environment]::GetFolderPath('Desktop')) 'INMOL Panel.lnk') -ErrorAction SilentlyContinue"
echo  - Ya no arranca con Windows y no esta en el escritorio.

if exist "%DESTINO%\index.html" (
  choice /c SN /n /m "  Borrar tambien la copia de %DESTINO%? [S/N] "
  if errorlevel 2 goto fin
  rmdir /s /q "%DESTINO%"
  echo  - Copia borrada.
)

:fin
echo.
pause
