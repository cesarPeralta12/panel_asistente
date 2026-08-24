/* ============================================================================
   INMOL · Panel interactivo
   importar-rutas.js — Convierte líneas dibujadas a mano en js/rutas.js
   ----------------------------------------------------------------------------
   PARA QUÉ SIRVE
   Las líneas de acceso que se ven sobre el mapa satelital (pestaña Ubicación)
   viven en js/rutas.js como listas de coordenadas. Esta herramienta las genera
   a partir de un archivo dibujado en Google My Maps (o en geojson.io), para no
   tener que copiar coordenadas a mano.

   CÓMO DIBUJARLAS
     1. Entrar a  https://www.google.com/maps/d/  y crear un mapa.
     2. Herramienta «Dibujar una línea» → marcar el recorrido con clics.
        - Doble clic para terminar la línea.
        - Ponerle un nombre claro: se usa tal cual en el panel («Ingreso 1»).
        - El color que se elija en My Maps también se respeta.
     3. Menú de tres puntos → «Exportar a KML/KMZ».
        MARCAR la casilla «Exportar como KML en lugar de KMZ».
     4. Guardar el archivo con el ID del proyecto como nombre:
          el-encanto.kml   ·   libertad.kml   ·   el-encanto-2.kml

   USO
     node herramientas/importar-rutas.js el-encanto.kml libertad.kml
     node herramientas/importar-rutas.js recorridos/*.kml

   Los proyectos que no aparezcan entre los archivos conservan sus rutas
   actuales: se pueden actualizar de a uno sin perder los demás.

   SÓLO PARA DESARROLLO. El panel de feria no necesita Node ni nada de esto.
   ============================================================================ */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.resolve(__dirname, '..');
const DESTINO = path.join(RAIZ, 'js', 'rutas.js');

/* Colores de reserva, en el orden en que se numeran las rutas en el mapa.
   Sólo se usan si la línea no traía color propio desde My Maps. */
const PALETA = ['#E3333E', '#2F6FE3', '#B23FD6', '#1E9E6A', '#E08A1E'];

const archivos = process.argv.slice(2);
if (!archivos.length) {
  console.log('Uso: node herramientas/importar-rutas.js <archivo.kml|.geojson> ...');
  console.log('El nombre del archivo debe ser el id del proyecto: el-encanto.kml');
  process.exit(1);
}

/* --- Utilidades ----------------------------------------------------------- */

/* KML guarda el color como aabbggrr (alfa primero y los canales al revés).
   El panel necesita #rrggbb. */
function colorDesdeKml(kml) {
  if (!kml || kml.length < 6) return null;
  const h = kml.trim().toLowerCase().slice(-6);
  return '#' + (h.slice(4, 6) + h.slice(2, 4) + h.slice(0, 2)).toUpperCase();
}

function limpiar(t) {
  return (t || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

// 6 decimales ≈ 11 cm. Más que suficiente y mantiene el archivo liviano.
const red = n => Math.round(n * 1e6) / 1e6;

/* --- Lectura de KML (lo que exporta My Maps) ------------------------------ */
function leerKml(texto) {
  /* Tabla de estilos: <Style id="..."><LineStyle><color>aabbggrr</color> */
  const estilos = {};
  const reEstilo = /<Style\s+id="([^"]+)"[\s\S]*?<\/Style>/g;
  let m;
  while ((m = reEstilo.exec(texto))) {
    const color = /<LineStyle>[\s\S]*?<color>([0-9a-fA-F]+)<\/color>/.exec(m[0]);
    if (color) estilos[m[1]] = colorDesdeKml(color[1]);
  }
  /* My Maps agrupa los estilos en <StyleMap>, que apunta al <Style> normal. */
  const reMapa = /<StyleMap\s+id="([^"]+)"([\s\S]*?)<\/StyleMap>/g;
  while ((m = reMapa.exec(texto))) {
    const destino = /<styleUrl>#?([^<]+)<\/styleUrl>/.exec(m[2]);
    if (destino && estilos[destino[1]]) estilos[m[1]] = estilos[destino[1]];
  }

  const rutas = [];
  const rePlace = /<Placemark>([\s\S]*?)<\/Placemark>/g;
  while ((m = rePlace.exec(texto))) {
    const cuerpo = m[1];
    // Sólo interesan las líneas: los pines sueltos se ignoran.
    const coords = /<LineString>[\s\S]*?<coordinates>([\s\S]*?)<\/coordinates>/.exec(cuerpo);
    if (!coords) continue;

    /* KML escribe  longitud,latitud[,altura]  — al revés que Leaflet. */
    const puntos = coords[1].trim().split(/\s+/).map(par => {
      const t = par.split(',').map(Number);
      return [red(t[1]), red(t[0])];
    }).filter(p => Number.isFinite(p[0]) && Number.isFinite(p[1]));
    if (puntos.length < 2) continue;

    const nombre = limpiar((/<name>([\s\S]*?)<\/name>/.exec(cuerpo) || [])[1]);
    const url = (/<styleUrl>#?([^<]+)<\/styleUrl>/.exec(cuerpo) || [])[1];
    const propio = (/<LineStyle>[\s\S]*?<color>([0-9a-fA-F]+)<\/color>/.exec(cuerpo) || [])[1];

    rutas.push({
      nombre: nombre || ('Ingreso ' + (rutas.length + 1)),
      color: colorDesdeKml(propio) || estilos[url] || null,
      puntos
    });
  }
  return rutas;
}

/* --- Lectura de GeoJSON (geojson.io, o la respuesta cruda de OSRM) -------- */
function leerGeoJson(texto) {
  const doc = JSON.parse(texto);
  const rasgos = doc.type === 'FeatureCollection' ? doc.features
               : doc.type === 'Feature' ? [doc] : [];
  const rutas = [];

  const agregar = (coordenadas, props, i) => {
    const puntos = coordenadas
      .map(c => [red(c[1]), red(c[0])])
      .filter(p => Number.isFinite(p[0]) && Number.isFinite(p[1]));
    if (puntos.length < 2) return;
    rutas.push({
      nombre: (props && (props.name || props.nombre)) || ('Ingreso ' + (i + 1)),
      color: (props && (props.stroke || props.color)) || null,
      puntos
    });
  };

  rasgos.forEach((f, i) => {
    const g = f.geometry;
    if (!g) return;
    if (g.type === 'LineString') agregar(g.coordinates, f.properties, i);
    else if (g.type === 'MultiLineString') g.coordinates.forEach(l => agregar(l, f.properties, i));
  });
  return rutas;
}

/* --- Rutas que ya existen: sólo se reemplazan las de los archivos dados --- */
let anterior = {};
if (fs.existsSync(DESTINO)) {
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(DESTINO, 'utf8') + '\n;this.RUTAS = RUTAS;', ctx);
  anterior = ctx.RUTAS || {};
}

/* --- Proceso -------------------------------------------------------------- */
const resultado = Object.assign({}, anterior);
let total = 0;

archivos.forEach(archivo => {
  const ruta = path.resolve(archivo);
  if (!fs.existsSync(ruta)) { console.log('  FALTA  ' + archivo); return; }

  const ext = path.extname(ruta).toLowerCase();
  if (ext === '.kmz') {
    console.log('  KMZ    ' + path.basename(ruta) + ' — un KMZ es un ZIP; en My Maps hay que');
    console.log('         marcar «Exportar como KML en lugar de KMZ» al exportar.');
    return;
  }

  const proyecto = path.basename(ruta, ext);
  const texto = fs.readFileSync(ruta, 'utf8');
  const rutas = ext === '.kml' ? leerKml(texto) : leerGeoJson(texto);

  if (!rutas.length) {
    console.log('  VACÍO  ' + path.basename(ruta) + ' — no tiene líneas');
    return;
  }

  // Se completa el color sólo donde el dibujo no traía uno.
  rutas.forEach((r, i) => { if (!r.color) r.color = PALETA[i % PALETA.length]; });

  resultado[proyecto] = rutas;
  console.log('  OK     ' + proyecto.padEnd(14) + ' ' + rutas.length + ' línea(s)');
  rutas.forEach((r, i) => {
    console.log('         ' + (i + 1) + '. ' + r.nombre.padEnd(38) +
                String(r.puntos.length).padStart(4) + ' puntos  ' + r.color);
    total += r.puntos.length;
  });
});

if (!Object.keys(resultado).length) { console.log('\nNo se generó nada.'); process.exit(1); }

const cabecera =
  '/* Rutas de acceso que se dibujan sobre el mapa satelital (pestaña Ubicación).\n' +
  '   GENERADO por herramientas/importar-rutas.js — no editar a mano.\n' +
  '   ' + new Date().toISOString().slice(0, 10) + '  ·  ' + total + ' puntos en total.\n' +
  '   Para cambiarlas: redibujar en https://www.google.com/maps/d/, exportar el\n' +
  '   KML y volver a correr la herramienta. Ver las instrucciones en su cabecera. */\n';

fs.writeFileSync(DESTINO, cabecera + 'const RUTAS = ' + JSON.stringify(resultado) + ';\n', 'utf8');
console.log('\njs/rutas.js actualizado · ' + Object.keys(resultado).length +
            ' proyecto(s), ' + total + ' puntos.');
console.log('Recargar el panel para verlas.');
