/* ============================================================================
   INMOL · Panel interactivo
   descargar-calles.js — Guía de nombres de calles y avenidas para el mapa
   ----------------------------------------------------------------------------
   POR QUÉ EXISTE
   La vista satelital muestra las manzanas pero no dice cómo se llama cada
   avenida. INMOL pidió esa guía, «como en Google Earth o Google Maps».
   Google no se puede usar sin conexión (sus condiciones prohíben guardar las
   teselas), y la capa de rótulos de Esri no tiene datos de Bolivia arriba del
   zoom 16. Así que los nombres se toman de OpenStreetMap y el panel los dibuja
   él mismo: quedan nítidos a cualquier zoom y pesan unos pocos KB.

   REQUISITOS (sólo para generar; el kiosco no los necesita)
     Conexión a internet EN ESTE PASO únicamente.

   USO
     node herramientas/descargar-calles.js
     node herramientas/descargar-calles.js 5000        (radio en metros)

   Escribe js/calles.js. Volver a correrlo actualiza los nombres si OSM mejoró.
   ============================================================================ */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const https = require('https');

const RAIZ = path.resolve(__dirname, '..');
const DESTINO = path.join(RAIZ, 'js', 'calles.js');
const RADIO = parseInt(process.argv[2], 10) || 3500;

/* Jerarquía: define qué se dibuja con más peso y qué aparece antes al alejarse.
   1 = avenida troncal, 3 = calle de barrio. */
const RANGO = {
  motorway: 1, trunk: 1, primary: 1,
  secondary: 2, tertiary: 2,
  residential: 3, unclassified: 3, living_street: 3, service: 3
};

/* --- datos.js da las coordenadas de cada proyecto ------------------------- */
const ctx = {};
vm.createContext(ctx);
['disponibilidad-el-encanto.js', 'disponibilidad-libertad.js',
 'disponibilidad-el-encanto-2.js', 'rutas.js', 'datos.js'].forEach(f => {
  const p = path.join(RAIZ, 'js', f);
  if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx);
});
vm.runInContext('this.PANEL = PANEL;', ctx);
const PANEL = ctx.PANEL;

/* --- Overpass ------------------------------------------------------------- */
function consultar(consulta) {
  return new Promise((resolve, reject) => {
    const cuerpo = 'data=' + encodeURIComponent(consulta);
    const req = https.request({
      host: 'overpass-api.de', path: '/api/interpreter', method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(cuerpo),
        'User-Agent': 'INMOL-panel/1.0'
      }
    }, res => {
      let s = '';
      res.on('data', d => s += d);
      res.on('end', () => {
        // Cuando Overpass está saturado responde un XML de error, no JSON.
        if (s.trim()[0] !== '{') return reject(new Error('Overpass ocupado'));
        try { resolve(JSON.parse(s)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(cuerpo);
    req.end();
  });
}

const dormir = ms => new Promise(r => setTimeout(r, ms));

async function conReintentos(consulta, etiqueta) {
  for (let i = 1; i <= 4; i++) {
    try { return await consultar(consulta); }
    catch (e) {
      if (i === 4) throw e;
      console.log(`   ${etiqueta}: ${e.message}, reintento ${i}…`);
      await dormir(15000);
    }
  }
}

/* --- Simplificación (Douglas-Peucker) ------------------------------------
   Una avenida puede traer 200 vértices; para dibujar una línea fina y colgarle
   el nombre alcanzan unos pocos. Reduce el archivo sin que se note.          */
function distanciaARecta(p, a, b) {
  const k = Math.cos(p[0] * Math.PI / 180);
  const px = (p[1] - a[1]) * k, py = p[0] - a[0];
  const bx = (b[1] - a[1]) * k, by = b[0] - a[0];
  const L = bx * bx + by * by;
  if (!L) return Math.hypot(px, py);
  let t = Math.max(0, Math.min(1, (px * bx + py * by) / L));
  return Math.hypot(px - bx * t, py - by * t);
}

function simplificar(pts, tol) {
  if (pts.length < 3) return pts;
  let peor = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = distanciaARecta(pts[i], pts[0], pts[pts.length - 1]);
    if (d > peor) { peor = d; idx = i; }
  }
  if (peor <= tol) return [pts[0], pts[pts.length - 1]];
  return simplificar(pts.slice(0, idx + 1), tol)
    .slice(0, -1)
    .concat(simplificar(pts.slice(idx), tol));
}

const red = n => Math.round(n * 1e5) / 1e5;   // ~1 m, de sobra para rotular

function metros(a, b) {
  const dy = (b[0] - a[0]) * 111320;
  const dx = (b[1] - a[1]) * 111320 * Math.cos(a[0] * Math.PI / 180);
  return Math.hypot(dx, dy);
}

const largo = p => p.reduce((d, _, i) => i ? d + metros(p[i - 1], p[i]) : 0, 0);

/* --- Proceso --------------------------------------------------------------- */
(async () => {
  const salida = {};
  console.log(`Radio ${RADIO} m alrededor de cada proyecto\n`);

  for (const proy of PANEL.proyectos) {
    const c = proy.coordenadas;
    const consulta = `[out:json][timeout:80];way(around:${RADIO},${c.lat},${c.lng})` +
                     `[highway][name];out geom;`;
    const datos = await conReintentos(consulta, proy.id);

    /* Los tramos con el mismo nombre son la misma calle partida en pedazos por
       los cruces. Se agrupan y se rotula una sola vez, sobre el tramo más
       largo: si no, la pantalla se llena del mismo nombre repetido. */
    const porNombre = new Map();
    (datos.elements || []).forEach(w => {
      const nombre = w.tags.name;
      const pts = simplificar(
        (w.geometry || []).map(g => [red(g.lat), red(g.lon)]),
        0.00012                                  // ≈ 13 m
      );
      if (pts.length < 2) return;
      if (!porNombre.has(nombre)) {
        porNombre.set(nombre, { nombre, rango: RANGO[w.tags.highway] || 3, tramos: [] });
      }
      const c = porNombre.get(nombre);
      c.rango = Math.min(c.rango, RANGO[w.tags.highway] || 3);
      c.tramos.push(pts);
    });

    const calles = [...porNombre.values()].map(c => {
      // El tramo más largo es el que aguanta el rótulo sin quedar apretado.
      const principal = c.tramos.reduce((a, b) => largo(b) > largo(a) ? b : a);
      return { n: c.nombre, r: c.rango, l: Math.round(largo(principal)),
               t: c.tramos, p: principal };
    }).filter(c => c.l > 60)                    // pedacitos sueltos: no aportan
      .sort((a, b) => a.r - b.r || b.l - a.l);

    salida[proy.id] = calles;
    const porRango = [1, 2, 3].map(r => calles.filter(c => c.r === r).length);
    console.log(`  ${proy.id.padEnd(14)} ${String(calles.length).padStart(3)} calles ` +
                `(troncales ${porRango[0]}, secundarias ${porRango[1]}, barrio ${porRango[2]})`);
    console.log(`      ${calles.slice(0, 5).map(c => c.n).join(' · ')}`);
    await dormir(2500);                          // no atosigar a Overpass
  }

  const cabecera =
    '/* Guía de calles y avenidas que se rotula sobre el mapa satelital.\n' +
    '   GENERADO por herramientas/descargar-calles.js — no editar a mano.\n' +
    `   Datos © OpenStreetMap (ODbL)  ·  ${new Date().toISOString().slice(0, 10)}\n` +
    '   n = nombre · r = rango (1 troncal, 2 secundaria, 3 barrio)\n' +
    '   l = largo en metros del tramo principal · t = tramos · p = tramo a rotular */\n';

  fs.writeFileSync(DESTINO, cabecera + 'const CALLES = ' + JSON.stringify(salida) + ';\n', 'utf8');
  const kb = Math.round(fs.statSync(DESTINO).size / 1024);
  console.log(`\njs/calles.js escrito · ${kb} KB`);
  console.log('Falta cargarlo en index.html si todavía no está.');
})().catch(e => { console.error('ERROR: ' + e.message); process.exit(1); });
