/* ============================================================================
   INMOL · Panel interactivo
   probar-clics.js — Verifica con CLICS REALES que toda la pantalla responda
   ----------------------------------------------------------------------------
   Abre el panel en un Chrome de verdad y hace clic en 36 puntos repartidos por
   toda la superficie, en las tres tarjetas, en las pestañas, en un lote, en los
   filtros y en los niveles satelitales.

   SÓLO PARA DESARROLLO. El panel de feria no necesita nada de esto: se abre
   con doble clic y no tiene dependencias.

   Uso:
     npm install puppeteer-core
     node herramientas/probar-clics.js
     node herramientas/probar-clics.js "http://localhost:5173/index.html"
   ============================================================================ */
const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORDEFECTO = 'file:///' +
  path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/').replace(/ /g, '%20');
const URL = process.argv[2] || PORDEFECTO;

/* Resolución a probar. Horizontal por defecto; para el tótem vertical:
   node herramientas/probar-clics.js "" 1080 1920                          */
const ANCHO = parseInt(process.argv[3], 10) || 1920;
const ALTO  = parseInt(process.argv[4], 10) || 1080;

(async () => {
  const navegador = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: [`--window-size=${ANCHO},${ALTO}`, '--disable-gpu', '--force-device-scale-factor=1']
  });
  const pagina = await navegador.newPage();
  await pagina.setViewport({ width: ANCHO, height: ALTO });
  await pagina.setCacheEnabled(false);

  const errores = [];
  pagina.on('pageerror', e => errores.push('JS: ' + e.message));
  pagina.on('console', m => { if (m.type() === 'error') errores.push('consola: ' + m.text()); });

  console.log(`Probando ${ANCHO}x${ALTO}: ${URL}\n`);
  await pagina.goto(URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));

  const estado = () => pagina.evaluate(() => ({
    pantalla: Estado.pantalla,
    proyecto: Estado.proyecto ? Estado.proyecto.nombre : null,
    seccion: Estado.seccion,
    lote: Estado.loteSel ? Estado.loteSel.codigo : null,
    filtro: Estado.filtro,
    nivel: Estado.nivelSat
  }));
  const ir = p => pagina.evaluate(x => irA(x), p);
  const esperar = ms => new Promise(r => setTimeout(r, ms));

  const resultados = [];
  const ok = (n, c) => resultados.push((c ? '  OK  ' : ' FALLA ') + n);

  /* 1. Toda la superficie de la atracción debe abrir el menú */
  const zona = await pagina.evaluate(() => {
    const a = document.getElementById('asistente').getBoundingClientRect();
    const alPie = a.top > innerHeight / 2;          // en el tótem va abajo
    return {
      ancho: alPie ? innerWidth : Math.round(a.left) - 8,
      alto:  alPie ? Math.round(a.top) - 8 : innerHeight
    };
  });
  const puntos = [];
  for (const fy of [0.02, 0.2, 0.4, 0.6, 0.8, 0.98])
    for (const fx of [0.02, 0.2, 0.4, 0.6, 0.8, 0.98])
      puntos.push([Math.round(zona.ancho * fx), Math.round(zona.alto * fy)]);

  const fallidos = [];
  for (const [x, y] of puntos) {
    await ir('atraccion'); await esperar(90);
    await pagina.mouse.click(x, y); await esperar(140);
    if ((await estado()).pantalla !== 'menu') fallidos.push(`(${x},${y})`);
  }
  ok(`Atracción: ${puntos.length - fallidos.length}/${puntos.length} puntos del área de contenido (${zona.ancho}x${zona.alto}) abren el menú` +
     (fallidos.length ? ' — fallan ' + fallidos.join(' ') : ''), fallidos.length === 0);

  /* 2. Las tres tarjetas: cuerpo y flecha */
  for (let i = 0; i < 3; i++) {
    for (const [sel, nombre] of [['.tj-flecha', 'flecha'], ['.tarjeta', 'cuerpo']]) {
      await ir('menu');
      await pagina.evaluate(() => { Estado.proyecto = null; });
      await esperar(120);
      const c = await pagina.evaluate((s, idx) => {
        const r = document.querySelectorAll(s)[idx].getBoundingClientRect();
        return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
      }, sel, i);
      await pagina.mouse.click(c.x, c.y); await esperar(300);
      const e = await estado();
      ok(`Tarjeta ${i + 1} (${nombre}) → ${e.proyecto || 'NADA'}`,
         e.pantalla === 'proyecto' && !!e.proyecto);
    }
  }

  /* 3. Dentro del proyecto */
  const clicSel = async (sel, idx) => {
    const c = await pagina.evaluate((s, i) => {
      const el = document.querySelectorAll(s)[i];
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    }, sel, idx);
    if (!c) return false;
    await pagina.mouse.click(c.x, c.y);
    return true;
  };

  const esperadas = ['resumen', 'ubicacion', 'lotes', 'ficha'];
  for (let i = 0; i < esperadas.length; i++) {
    await clicSel('.tab', i); await esperar(280);
    const e = await estado();
    ok(`Pestaña ${i + 1} → ${e.seccion}`, e.seccion === esperadas[i]);
  }

  /* El plano oficial se dibuja con Leaflet: cada unidad es un path
     .leaflet-interactive sobre la imagen del plano. */
  await clicSel('.tab', 2); await esperar(1500);
  const sel = await pagina.evaluate(() =>
    document.querySelectorAll('.leaflet-interactive').length ? '.leaflet-interactive'
    : (document.querySelectorAll('.unidad').length ? '.unidad' : '.plano-svg .lote'));
  const total = await pagina.evaluate(s => document.querySelectorAll(s).length, sel);
  await clicSel(sel, Math.min(40, Math.max(0, total - 1))); await esperar(400);
  let e = await estado();
  ok(`Clic en una unidad del plano (${total} unidades) → ${e.lote || 'NADA'}`, !!e.lote);

  await clicSel('.filtro', 1); await esperar(220);
  e = await estado();
  ok(`Filtro «sólo disponibles» → ${e.filtro}`, e.filtro === 'disponible');

  /* El mapa satelital es offline y siempre está: ya no hay respaldo generado. */
  await clicSel('.tab', 1); await esperar(1200);
  const mapa = await pagina.evaluate(() => {
    const c = document.getElementById('mapaReal').getBoundingClientRect();
    return {
      pines: document.querySelectorAll('.pin-ref').length,
      proyecto: document.querySelectorAll('.pin-proyecto').length,
      teselas: document.querySelectorAll('.leaflet-tile-loaded').length,
      alto: Math.round(c.height)
    };
  });
  ok(`Mapa satelital offline · ${mapa.teselas} teselas, contenedor de ${mapa.alto}px de alto`,
     mapa.teselas > 0 && mapa.alto > 100);
  ok(`Pin del proyecto y ${mapa.pines} pines de referencia`,
     mapa.proyecto === 1 && mapa.pines >= 3);

  await clicSel('#btnAcercar', 0); await esperar(2600);
  const z1 = await pagina.evaluate(() => MapaReal.mapa.getZoom());
  ok(`«Acercar al proyecto» → zoom ${z1}`, z1 >= 16);

  await clicSel('#btnVerTodo', 0); await esperar(1400);
  const z2 = await pagina.evaluate(() => MapaReal.mapa.getZoom());
  ok(`«Ver todo» encuadra las referencias → zoom ${z2}`, z2 < z1);

  /* 4. El asistente ocupa su columna sin taparle nada al contenido */
  await esperar(4000);
  const geo = await pagina.evaluate(() => {
    const a = document.getElementById('asistente').getBoundingClientRect();
    const p = document.querySelector('.pane.activa').getBoundingClientRect();
    const b = document.querySelector('.barra-proy').getBoundingClientRect();
    const sep = (r1, r2) => r1.right <= r2.left + 1 || r2.right <= r1.left + 1 ||
                            r1.bottom <= r2.top + 1 || r2.bottom <= r1.top + 1;
    return {
      separado: sep(a, p) && sep(a, b),
      margen: Math.round(innerWidth - a.right),
      radio: parseFloat(getComputedStyle(document.getElementById('asistente')).borderRadius),
      hayBoton: !!document.querySelector('#btnAsistente, .btn-asistente')
    };
  });
  ok('El asistente no se superpone con el contenido', geo.separado);
  ok(`Separado del borde (${geo.margen}px), redondeado (${geo.radio}px), sin botón`,
     geo.margen >= 8 && geo.radio >= 8 && !geo.hayBoton);

  await clicSel('#btnVolver', 0); await esperar(400);
  e = await estado();
  ok(`Botón «Proyectos» vuelve al menú → ${e.pantalla}`, e.pantalla === 'menu');

  console.log(resultados.join('\n'));
  console.log('\nErrores de JavaScript: ' + (errores.length ? errores.join(' | ') : 'ninguno'));
  const fallas = resultados.filter(r => r.startsWith(' FALLA')).length;
  console.log(fallas === 0 ? '\nTODO CORRECTO' : `\n${fallas} PRUEBAS FALLIDAS`);

  await navegador.close();
  process.exit(fallas === 0 ? 0 : 1);
})().catch(e => { console.error('ERROR: ' + e.message); process.exit(2); });
