/* Descarga las teselas satelitales que le faltan al panel para funcionar sin
   conexión (assets/tiles/<proyecto>/<z>/<x>/<y>.jpg).

   El panel arrancó con un cuadrado alrededor de cada proyecto, pero después le
   sumamos los recorridos de acceso: el del Comercial arranca en la Av. Santos
   Dumont, a 12 km, y ahí ya no había imagen. Al seguir la ruta con el dedo el
   mapa quedaba en blanco. Esto rellena el corredor de las rutas y de los
   puntos de referencia, con un margen de una tesela.

       node herramientas/descargar-teselas.js            (dice qué falta)
       node herramientas/descargar-teselas.js --bajar    (lo descarga)
       node herramientas/descargar-teselas.js --bajar --solo el-encanto-2

   Imágenes de Esri World Imagery, la misma capa que ya usa el panel y que se
   cita en la atribución del mapa. */

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const DESTINO = path.join(RAIZ, 'assets', 'tiles');
const URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile';
const ZOOMS = [13, 14, 15, 16, 17];        // corredor de rutas y referencias
const ZOOMS_PREDIO = [18, 19];             // sólo alrededor del terreno
const MARGEN_PREDIO = 0.007;               // grados (~750 m) alrededor del predio en 18-19
const MARGEN = 1;              // teselas de más a cada lado del corredor
const PAUSA = 80;              // ms entre descargas, para no castigar al servidor

const leer = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');

/* rutas.js es un solo `const RUTAS = {...};`, así que alcanza con quedarse
   con lo que hay después del primer `=`. */
function objetoDe(txt, nombre) {
  const i = txt.indexOf('const ' + nombre);
  const cuerpo = txt.slice(txt.indexOf('=', i) + 1).trim().replace(/;\s*$/, '');
  return eval('(' + cuerpo + ')');
}

const RUTAS = objetoDe(leer('js/rutas.js'), 'RUTAS');
const PREDIOS = objetoDe(leer('js/predios.js'), 'PREDIOS');

/* De datos.js sólo interesan las coordenadas —las del proyecto y las de sus
   referencias—, así que se sacan por lectura directa en vez de evaluar el
   archivo entero, que depende del navegador. */
const COORDS = [...leer('js/datos.js').matchAll(/lat:\s*(-?[\d.]+),\s*lng:\s*(-?[\d.]+)/g)]
  .map(m => [parseFloat(m[1]), parseFloat(m[2])]);

const aTesela = (lat, lon, z) => {
  const n = 2 ** z, r = lat * Math.PI / 180;
  return [Math.floor((lon + 180) / 360 * n),
          Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * n)];
};

/* Las rutas vienen etiquetadas por proyecto; las coordenadas de datos.js no,
   así que cada proyecto se queda con las que le caen dentro de la caja de sus
   propias rutas más un par de kilómetros. */
function puntosDe(proy) {
  const pts = [];
  RUTAS[proy].forEach(r => r.puntos.forEach(p => pts.push(p)));
  /* El contorno del terreno también: el predio puede asomar fuera del
     corredor de las rutas (El Encanto 2 termina en punta hacia el sur). */
  (PREDIOS[proy] || []).forEach(pr => pr.puntos.forEach(p => pts.push(p)));
  const lat = pts.map(p => p[0]), lon = pts.map(p => p[1]);
  const S = Math.min(...lat) - 0.02, N = Math.max(...lat) + 0.02;
  const W = Math.min(...lon) - 0.02, E = Math.max(...lon) + 0.02;
  COORDS.forEach(p => {
    if (p[0] > S && p[0] < N && p[1] > W && p[1] < E) pts.push(p);
  });
  return pts;
}

function agregarCaja(lista, proy, zooms, N, S, W, E) {
  for (const z of zooms) {
    const [x0, y0] = aTesela(N, W, z), [x1, y1] = aTesela(S, E, z);
    for (let x = x0 - MARGEN; x <= x1 + MARGEN; x++) {
      for (let y = y0 - MARGEN; y <= y1 + MARGEN; y++) {
        const rel = path.join(proy, String(z), String(x), y + '.jpg');
        if (!fs.existsSync(path.join(DESTINO, rel))) lista.push({ proy, z, x, y, rel });
      }
    }
  }
}

function faltantes() {
  const lista = [];
  const solo = process.argv[process.argv.indexOf('--solo') + 1];
  for (const proy of Object.keys(RUTAS)) {
    if (process.argv.includes('--solo') && proy !== solo) continue;
    /* Zooms medios: todo el corredor (rutas, referencias y predio). */
    const pts = puntosDe(proy);
    const lat = pts.map(p => p[0]), lon = pts.map(p => p[1]);
    agregarCaja(lista, proy, ZOOMS, Math.max(...lat), Math.min(...lat), Math.min(...lon), Math.max(...lon));

    /* Zooms 18 y 19: sólo alrededor del terreno. A ese detalle el corredor
       entero serían decenas de miles de teselas, y nadie acerca tanto lejos
       del proyecto. */
    const pp = (PREDIOS[proy] || []).flatMap(pr => pr.puntos);
    if (pp.length) {
      const la = pp.map(p => p[0]), lo = pp.map(p => p[1]);
      agregarCaja(lista, proy, ZOOMS_PREDIO,
        Math.max(...la) + MARGEN_PREDIO, Math.min(...la) - MARGEN_PREDIO,
        Math.min(...lo) - MARGEN_PREDIO, Math.max(...lo) + MARGEN_PREDIO);
    }
  }
  return lista;
}

(async () => {
  const lista = faltantes();
  const porProy = {};
  lista.forEach(t => {
    porProy[t.proy] = porProy[t.proy] || {};
    porProy[t.proy][t.z] = (porProy[t.proy][t.z] || 0) + 1;
  });
  console.log('Teselas que faltan:');
  for (const p of Object.keys(porProy)) console.log(' ' + p + ':', JSON.stringify(porProy[p]));
  console.log(' total: ' + lista.length);

  if (!process.argv.includes('--bajar')) {
    console.log('\n(sin --bajar no se descarga nada)');
    return;
  }

  let ok = 0, mal = 0;
  for (const t of lista) {
    const destino = path.join(DESTINO, t.rel);
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    try {
      const r = await fetch(URL + '/' + t.z + '/' + t.y + '/' + t.x);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      fs.writeFileSync(destino, Buffer.from(await r.arrayBuffer()));
      ok++;
    } catch (e) {
      mal++;
      if (mal < 15) console.log('  falló ' + t.rel + ': ' + e.message);
    }
    if ((ok + mal) % 50 === 0) process.stdout.write('\r  ' + (ok + mal) + '/' + lista.length);
    await new Promise(r => setTimeout(r, PAUSA));
  }
  console.log('\nlisto: ' + ok + ' descargadas, ' + mal + ' con error');
})();
