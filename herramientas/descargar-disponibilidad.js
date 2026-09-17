/* Baja la disponibilidad de los tres proyectos desde el sistema de INMOL
   (inmol.sistemas-orange.com.bo, «Plano de Disponibilidad») y la escribe en
   js/disponibilidad-<proyecto>.js, que es lo que lee el panel.

       node herramientas/descargar-disponibilidad.js
       node herramientas/descargar-disponibilidad.js --solo libertad

   De cada unidad trae lo mismo que muestra el sistema al tocarla: estado,
   posición en el plano, superficie, sector y categoría (el Comercial),
   precio por m² y precio de lista. Son unas 1.700 consultas (una por
   unidad): tarda unos minutos.

   Las direcciones salen del documento «DATOS PARA ELABORACION SISTEMA
   EXPOCRUZ» de INMOL: modulos/uv/?u=3 (El Encanto), u=4 (Comercial),
   u=5 (El Encanto 2). El servicio no pide usuario: es el mismo plano
   público que INMOL comparte.

   Hay que volver a correrlo cada vez que se quiera la disponibilidad al
   día (antes de la feria, y durante si INMOL avisa de ventas). Después:
       python herramientas/categorias-lotes.py
   para las urbanizaciones, que el sistema no les da la categoría. */

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const BASE = 'https://inmol.sistemas-orange.com.bo/modulos/uv/view.gestor.php';
const PAUSA = 60;                                   // ms entre consultas

const PROYECTOS = {
  'el-encanto':   { u: 3, constante: 'DISP_EL_ENCANTO' },
  'libertad':     { u: 4, constante: 'DISP_LIBERTAD' },
  'el-encanto-2': { u: 5, constante: 'DISP_EL_ENCANTO_2' },
};

const ESTADOS = { Disponible: 'disponible', Vendido: 'vendido', Reservado: 'reservado', Bloqueado: 'bloqueado' };

async function servicio(accion, u, cuerpo) {
  const url = `${BASE}?c=&a=${accion}&mapa=${u}&acc=undefined&u=${u}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest',
               'User-Agent': 'Mozilla/5.0 (panel INMOL)' },
    body: cuerpo,
  });
  if (!r.ok) throw new Error('HTTP ' + r.status + ' en ' + accion);
  return r.json();
}

const attr = (html, nombre) => (html.match(new RegExp(`data-${nombre}="([^"]*)"`)) || [])[1];

/* El sistema devuelve la info de la unidad como HTML: «<b>Superficie: </b>
   12.60 M2.<br/><b>Sector: </b> Moda…». Se lee campo por campo. */
function campo(html, etiqueta) {
  const m = html.match(new RegExp(`<b>${etiqueta}:\\s*</b>\\s*([^<]*)`, 'i'));
  return m ? m[1].trim() : null;
}
/* «12.60 M2.» → 12.6 ; «32,405.23 $us.» → 32405.23. Sólo el primer número: el «2» de
   M2 no cuenta. */
const numero = t => { const m = t && t.match(/-?[\d,]*\.?\d+/); return m ? parseFloat(m[0].replace(/,/g, '')) || null : null; };

async function bajar(id, cfg) {
  const ruta = path.join(RAIZ, 'js', `disponibilidad-${id}.js`);
  /* Las categorías de las urbanizaciones (A, B, C… por color del plano) no
     vienen del sistema: se conservan las del archivo que ya está. */
  const previas = new Map();
  if (fs.existsSync(ruta)) {
    const s = fs.readFileSync(ruta, 'utf8');
    JSON.parse(s.slice(s.indexOf('['), s.lastIndexOf(']') + 1))
      .forEach(l => previas.set(l.manzana + '|' + l.numero, l.categoria));
  }

  const mapa = await servicio('getMapView', cfg.u, `id=${cfg.u}`);
  const marcadores = mapa.data.markers;
  process.stdout.write(`${id}: ${mapa.data.map.name} · ${marcadores.length} unidades `);

  const lotes = [];
  let n = 0;
  for (const m of marcadores) {
    const manzana = attr(m.html, 'manz'), num = attr(m.html, 'nro');
    const info = (await servicio('loteInfo', cfg.u, `&id=${m.id}`)).data.info || '';
    const lote = {
      manzana, numero: num,
      estado: ESTADOS[m.typeCssName] || 'bloqueado',
      x: +m.x, y: +m.y,
    };
    const cat = campo(info, 'Categoria');
    if (cat) lote.categoria = cat;
    else if (previas.get(manzana + '|' + num)) lote.categoria = previas.get(manzana + '|' + num);
    const sup = numero(campo(info, 'Superficie'));
    if (sup) lote.superficie = sup;
    const sector = campo(info, 'Sector');
    if (sector) lote.sector = sector;
    const pm2 = numero(campo(info, 'Precio M2'));
    if (pm2) lote.precioM2 = pm2;
    const precio = numero(campo(info, 'Precio Lista'));
    if (precio) lote.precio = precio;
    lotes.push(lote);
    if (++n % 100 === 0) process.stdout.write('.');
    await new Promise(r => setTimeout(r, PAUSA));
  }

  const hoy = new Date().toISOString().slice(0, 10);
  const cab = `/* Disponibilidad real, bajada del sistema de INMOL (inmol.sistemas-orange.com.bo,
   Plano de Disponibilidad, u=${cfg.u}) el ${hoy} con herramientas/descargar-disponibilidad.js.
   x,y = posición en el plano original (assets/planos/${id}.jpg está a escala 0.5).

   Por unidad: estado, superficie, sector y categoría (cuando el sistema los da),
   precio por m² y precio de lista. «categoria» en las urbanizaciones se lee del
   color del plano con herramientas/categorias-lotes.py, no del sistema.
   */\r\n`;
  fs.writeFileSync(ruta, cab + `const ${cfg.constante} = ` + JSON.stringify(lotes) + ';\r\n');

  const est = {};
  lotes.forEach(l => est[l.estado] = (est[l.estado] || 0) + 1);
  const conPrecio = lotes.filter(l => l.precio != null).length;
  console.log(`\n   ${JSON.stringify(est)} · con precio: ${conPrecio} · escrito ${path.basename(ruta)}`);
}

(async () => {
  const solo = process.argv.includes('--solo') ? process.argv[process.argv.indexOf('--solo') + 1] : null;
  for (const [id, cfg] of Object.entries(PROYECTOS)) {
    if (solo && id !== solo) continue;
    try { await bajar(id, cfg); }
    catch (e) { console.log(`\n   ${id}: FALLÓ — ${e.message} (el archivo anterior queda como estaba)`); }
  }
})();
