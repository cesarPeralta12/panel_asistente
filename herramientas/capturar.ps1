# ============================================================================
# INMOL · Panel interactivo
# capturar.ps1 — Toma capturas de pantalla del panel en 1920x1080
#
# No necesita servidor: lee el archivo directamente.
# Uso:   .\herramientas\capturar.ps1
# ============================================================================

$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chrome)) { $chrome = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" }

$base    = Split-Path -Parent $PSScriptRoot
$salida  = Join-Path $base "presentacion\capturas"
$perfil  = Join-Path $env:TEMP "inmol-chrome-perfil"
New-Item -ItemType Directory -Force -Path $salida | Out-Null

# Se borra el perfil de Chrome antes de capturar: si no, sirve el CSS y el HTML
# desde la caché y las capturas salen con la versión anterior.
if (Test-Path $perfil) { Remove-Item -LiteralPath $perfil -Recurse -Force -ErrorAction SilentlyContinue }

# Se lee el archivo directamente: no depende de ningún servidor y nunca
# captura una versión cacheada.
$rutaHtml = (Join-Path $base "index.html") -replace '\\', '/' -replace ' ', '%20'
$raiz = "file:///$rutaHtml`?quieto=1"

$vistas = @(
  @{ n = "01-atraccion";        r = "#/atraccion" },
  @{ n = "02-menu";             r = "#/menu" },
  @{ n = "03-resumen";          r = "#/proyecto/el-encanto/resumen" },
  @{ n = "04-satelital-ciudad"; r = "#/proyecto/el-encanto/ubicacion/nivel-1" },
  @{ n = "05-satelital-predio"; r = "#/proyecto/el-encanto/ubicacion/nivel-3" },
  @{ n = "07-lotes";            r = "#/proyecto/el-encanto/lotes/lote-5" },
  @{ n = "08-ficha-tecnica";    r = "#/proyecto/el-encanto/ficha" },
  @{ n = "10-libertad";         r = "#/proyecto/libertad/resumen" },
  @{ n = "11-libertad-locales"; r = "#/proyecto/libertad/lotes/lote-3" },
  @{ n = "09-ficha-libertad";   r = "#/proyecto/libertad/ficha" },
  @{ n = "12-tercer-proyecto";  r = "#/proyecto/vista-linda/resumen" }
)

# Vistas del tótem vertical, para la propuesta
$verticales = @(
  @{ n = "v-01-atraccion"; r = "#/atraccion" },
  @{ n = "v-02-menu";      r = "#/menu" },
  @{ n = "v-03-lotes";     r = "#/proyecto/el-encanto/lotes/lote-5" },
  @{ n = "v-04-ubicacion"; r = "#/proyecto/el-encanto/ubicacion/nivel-2" }
)

function Capturar($lista, $ancho, $alto) {
  foreach ($v in $lista) {
    $destino = Join-Path $salida ("{0}.png" -f $v.n)
    $a = @(
      "--headless=new", "--disable-gpu", "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "--window-size=$ancho,$alto",
      "--virtual-time-budget=9000",
      "--user-data-dir=$perfil",
      "--screenshot=$destino",
      ($raiz + $v.r)
    )
    & $chrome @a 2>$null | Out-Null
    if (Test-Path $destino) {
      $kb = [math]::Round((Get-Item $destino).Length / 1KB)
      Write-Output ("  OK  {0}  ({1} KB)" -f $v.n, $kb)
    } else {
      Write-Output ("  --  {0}  FALLO" -f $v.n)
    }
  }
}

Write-Output "Horizontal 1920x1080"
Capturar $vistas 1920 1080
Write-Output ""
Write-Output "Vertical 1080x1920 (totem)"
Capturar $verticales 1080 1920

Write-Output ""
Write-Output ("Capturas en: " + $salida)
