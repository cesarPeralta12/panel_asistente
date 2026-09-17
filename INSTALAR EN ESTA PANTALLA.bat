@echo off
rem ===========================================================================
rem  INMOL - PANEL INTERACTIVO DE FERIA
rem  Instala el panel en ESTA computadora, para que quede fijo durante la feria
rem
rem  Que hace (una sola vez, en la pantalla del stand):
rem    1. Copia la carpeta entera a C:\inmol_panel (desde el disco interno
rem       carga mas rapido que desde un USB, y no depende de que el disco
rem       externo siga enchufado).
rem    2. Crea el acceso directo "INMOL Panel" en el escritorio.
rem    3. Deja el panel en el inicio de Windows: cada vez que se prenda la
rem       pantalla y entre el usuario, el panel arranca solo a pantalla
rem       completa.
rem    4. Apaga la suspension y el apagado de pantalla, para que no se
rem       duerma en medio de la feria.
rem
rem  Ejecutar con doble clic. Si Windows pregunta, "Si".
rem  Para deshacer: DESINSTALAR DE ESTA PANTALLA.bat
rem ===========================================================================

setlocal enabledelayedexpansion
set "ORIGEN=%~dp0"
set "DESTINO=C:\inmol_panel"
if defined INMOL_DESTINO set "DESTINO=%INMOL_DESTINO%"
set "LANZADOR=%DESTINO%\INICIAR PANEL.bat"

echo.
echo  ============================================================
echo   INMOL - Instalacion del panel en esta pantalla
echo  ============================================================
echo.

if not exist "%ORIGEN%index.html" (
  echo  Este archivo tiene que ejecutarse DESDE la carpeta del panel,
  echo  junto a index.html. No lo mueva ni lo copie solo.
  echo.
  pause
  exit /b 1
)

rem --- 1. Copia al disco interno ----------------------------------------------
if /i "%ORIGEN%"=="%DESTINO%\" (
  echo  [1/4] Ya esta en %DESTINO%, no hace falta copiar.
) else (
  echo  [1/4] Copiando el panel a %DESTINO% ...
  echo        (son unos 900 MB, puede tardar unos minutos)
  robocopy "%ORIGEN%." "%DESTINO%" /MIR /NFL /NDL /NJH /NJS /NP /R:2 /W:2 >nul
  if errorlevel 8 (
    echo.
    echo  No se pudo copiar. Revise que haya espacio en C: y vuelva a intentar.
    pause
    exit /b 1
  )
  echo        Listo.
)

rem --- 2. Acceso directo en el escritorio ------------------------------------
echo  [2/4] Creando el acceso directo en el escritorio ...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$w = New-Object -ComObject WScript.Shell;" ^
  "$d = [Environment]::GetFolderPath('Desktop');" ^
  "$s = $w.CreateShortcut((Join-Path $d 'INMOL Panel.lnk'));" ^
  "$s.TargetPath = '%LANZADOR%';" ^
  "$s.WorkingDirectory = '%DESTINO%';" ^
  "$s.IconLocation = 'C:\Program Files\Google\Chrome\Application\chrome.exe,0';" ^
  "$s.Description = 'Panel interactivo INMOL';" ^
  "$s.Save()"

rem --- 3. Arranque automatico con Windows ------------------------------------
echo  [3/4] Dejando el panel en el inicio de Windows ...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$w = New-Object -ComObject WScript.Shell;" ^
  "$i = [Environment]::GetFolderPath('Startup');" ^
  "$s = $w.CreateShortcut((Join-Path $i 'INMOL Panel.lnk'));" ^
  "$s.TargetPath = '%LANZADOR%';" ^
  "$s.WorkingDirectory = '%DESTINO%';" ^
  "$s.WindowStyle = 7;" ^
  "$s.Save()"

rem --- 4. Que la pantalla no se duerma ---------------------------------------
echo  [4/4] Apagando la suspension y el apagado de pantalla ...
powercfg /change monitor-timeout-ac 0 >nul 2>&1
powercfg /change standby-timeout-ac 0 >nul 2>&1
powercfg /change hibernate-timeout-ac 0 >nul 2>&1
powercfg /change monitor-timeout-dc 0 >nul 2>&1
powercfg /change standby-timeout-dc 0 >nul 2>&1

echo.
echo  ============================================================
echo   Listo. El panel quedo instalado en esta pantalla.
echo.
echo   - Para abrirlo ahora:  doble clic en "INMOL Panel" (escritorio)
echo   - Cada vez que se prenda la computadora, arranca solo.
echo   - Para salir del panel: Alt + F4
echo.
echo   Ya puede desconectar el disco externo.
echo  ============================================================
echo.
choice /c SN /n /m "  Abrir el panel ahora? [S/N] "
if errorlevel 2 goto fin
start "" "%LANZADOR%"

:fin
endlocal
