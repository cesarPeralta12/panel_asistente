@echo off
rem ===========================================================================
rem  INMOL - PANEL INTERACTIVO DE FERIA
rem  Abre el panel en modo kiosco (pantalla completa, sin barras del navegador)
rem
rem  Para salir del modo kiosco:  Alt + F4
rem  Panel tecnico dentro del panel:  tecla D
rem ===========================================================================

setlocal enabledelayedexpansion
set "CARPETA=%~dp0"

set "NAVEGADOR=C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist "%NAVEGADOR%" set "NAVEGADOR=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
if not exist "%NAVEGADOR%" set "NAVEGADOR=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
if not exist "%NAVEGADOR%" set "NAVEGADOR=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not exist "%NAVEGADOR%" set "NAVEGADOR=C:\Program Files\Microsoft\Edge\Application\msedge.exe"

if not exist "%NAVEGADOR%" (
  echo.
  echo  No se encontro Google Chrome ni Microsoft Edge en este equipo.
  echo  Instale Google Chrome y vuelva a ejecutar este archivo.
  echo.
  pause
  exit /b 1
)

rem ---------------------------------------------------------------------------
rem  Comprobacion de la copia. En la feria el panel se instala copiando esta
rem  carpeta a mano: si una subcarpeta de assets se queda a medio copiar, el
rem  panel abre igual y los huecos recien se ven cuando hay gente delante.
rem  Mejor avisar aca.
rem ---------------------------------------------------------------------------
set "FALTA="
for %%C in (tiles fichas medios planos logos fonts tour leaflet) do (
  if not exist "%CARPETA%assets\%%C\" set "FALTA=%%C !FALTA!"
)
if not exist "%CARPETA%index.html" set "FALTA=index.html !FALTA!"

if defined FALTA (
  echo.
  echo  La copia esta incompleta. No se encontro:
  echo     !FALTA!
  echo.
  echo  Copie la carpeta ENTERA de nuevo antes de abrir el panel.
  echo.
  pause
  exit /b 1
)

start "" "%NAVEGADOR%" ^
  --kiosk ^
  --start-fullscreen ^
  --no-first-run ^
  --disable-infobars ^
  --disable-session-crashed-bubble ^
  --disable-features=TranslateUI,Translate ^
  --overscroll-history-navigation=0 ^
  --disable-pinch ^
  --user-data-dir="%LOCALAPPDATA%\InmolPanel" ^
  "file:///%CARPETA%index.html"

endlocal
