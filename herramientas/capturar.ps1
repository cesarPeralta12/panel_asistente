# ============================================================================
# INMOL · Panel interactivo
# capturar.ps1 — Toma capturas de pantalla del panel en 1920x1080
#
# Requiere el servidor local corriendo:   python -m http.server 5173
# Uso:                                    .\herramientas\capturar.ps1
# ============================================================================

$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chrome)) { $chrome = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" }

$base    = Split-Path -Parent $PSScriptRoot
$salida  = Join-Path $base "presentacion\capturas"
$perfil  = Join-Path $env:TEMP "inmol-chrome-perfil"
New-Item -ItemType Directory -Force -Path $salida | Out-Null

$raiz = "http://localhost:5173/index.html?quieto=1"

$vistas = @(
  @{ n = "01-atraccion";        r = "#/atraccion" },
  @{ n = "02-menu";             r = "#/menu" },
  @{ n = "03-resumen";          r = "#/proyecto/el-encanto/resumen" },
  @{ n = "04-satelital-ciudad"; r = "#/proyecto/el-encanto/ubicacion/nivel-1" },
  @{ n = "05-satelital-predio"; r = "#/proyecto/el-encanto/ubicacion/nivel-3" },
  @{ n = "06-referencias";      r = "#/proyecto/el-encanto/referencias" },
  @{ n = "07-lotes";            r = "#/proyecto/el-encanto/lotes/lote-5" },
  @{ n = "08-avance";           r = "#/proyecto/el-encanto/avance" },
  @{ n = "09-asistente";        r = "#/proyecto/el-encanto/resumen/asistente" },
  @{ n = "10-libertad";         r = "#/proyecto/libertad/resumen" },
  @{ n = "11-libertad-locales"; r = "#/proyecto/libertad/lotes/lote-3" },
  @{ n = "12-tercer-proyecto";  r = "#/proyecto/proyecto-3/resumen" }
)

foreach ($v in $vistas) {
  $destino = Join-Path $salida ("{0}.png" -f $v.n)
  $url = $raiz + $v.r
  $args = @(
    "--headless=new", "--disable-gpu", "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--window-size=1920,1080",
    "--virtual-time-budget=9000",
    "--user-data-dir=$perfil",
    "--screenshot=$destino",
    $url
  )
  & $chrome @args 2>$null | Out-Null
  if (Test-Path $destino) {
    $kb = [math]::Round((Get-Item $destino).Length / 1KB)
    Write-Output ("  OK  {0}  ({1} KB)" -f $v.n, $kb)
  } else {
    Write-Output ("  --  {0}  FALLO" -f $v.n)
  }
}

Write-Output ""
Write-Output ("Capturas en: " + $salida)
