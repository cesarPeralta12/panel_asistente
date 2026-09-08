/* ============================================================================
   INMOL · Panel interactivo
   probar-voz.js — El asistente habla del proyecto correcto y de a una voz
   ----------------------------------------------------------------------------
   QUÉ COMPRUEBA
     1. Tocar la TARJETA de un proyecto lo hace explicar ese proyecto, no
        seguir con la bienvenida.
     2. Tocar una PESTAÑA lo hace explicar esa sección.
     3. Nunca hay dos voces sonando a la vez.
     4. El asistente no muestra texto ni lista de opciones: sólo narra.

   SÓLO PARA DESARROLLO.
   Uso:  node herramientas/probar-voz.js
   ============================================================================ */
const puppeteer = require('puppeteer-core');
const path = require('path');
const URL = 'file:///' + path.resolve(__dirname, '..', 'index.html')
  .split(path.sep).join('/').replace(/ /g, '%20');

(async () => {
  const nav = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--window-size=1920,1080', '--disable-gpu', '--force-device-scale-factor=1',
           '--autoplay-policy=no-user-gesture-required']
  });
  const pg = await nav.newPage();
  await pg.setViewport({ width: 1920, height: 1080 });
  await pg.setCacheEnabled(false);

  /* Registro de todo lo que suena, con marca de tiempo, para detectar solapes */
  await pg.evaluateOnNewDocument(() => {
    window.__voz = [];
    const play = Audio.prototype.play;
    Audio.prototype.play = function () {
      if (this.src) window.__voz.push({ t: Date.now(), clave: this.src.split('/').pop(), tipo: 'mp3' });
      return play.apply(this, arguments);
    };
    const speak = speechSynthesis.speak.bind(speechSynthesis);
    speechSynthesis.speak = u => {
      window.__voz.push({ t: Date.now(), clave: (u.text || '').slice(0, 30), tipo: 'sistema' });
      return speak(u);
    };
  });

  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const res = [];
  const ok = (n, c) => res.push((c ? '  OK  ' : ' FALLA ') + n);
  const sonando = () => pg.evaluate(() => window.__voz.map(v => v.clave));

  await pg.goto(URL, { waitUntil: 'networkidle0' });
  await esperar(2500);

  /* 1. Sin cuadro de texto */
  const burbuja = await pg.evaluate(() => !!document.getElementById('asisBurbuja'));
  ok('No se muestra el texto de lo que dice el asistente', !burbuja);

  /* 2. Tarjeta grande → explica ESE proyecto */
  await pg.evaluate(() => { irA('menu'); window.__voz = []; });
  await esperar(400);
  await pg.evaluate(() => document.querySelectorAll('.tarjeta')[1].click());
  await esperar(1800);
  let v = await sonando();
  const e = await pg.evaluate(() => Estado.proyecto.id);
  ok(`Tarjeta grande «Libertad» → abre ${e} y dice ${v.join(', ') || 'NADA'}`,
     e === 'libertad' && v.some(x => x.includes('proyecto-libertad')) &&
     !v.some(x => x.includes('saludo')));

  /* 3. El asistente quedó sin lista de opciones: sólo narra */
  const sinLista = await pg.evaluate(() => ({
    opciones: document.querySelectorAll('.asis-opcion').length,
    caja: !!document.getElementById('asisOpciones'),
    cabecera: !!document.querySelector('.asis-cabecera'),
    silencio: !!document.getElementById('asisSilencio')
  }));
  ok('El asistente no tiene lista de opciones, sólo cabecera y «Detener voz»',
     sinLista.opciones === 0 && !sinLista.caja && sinLista.cabecera && sinLista.silencio);

  /* Cambiar de proyecto desde otra tarjeta lo explica igual */
  await pg.evaluate(() => { irA('menu'); Estado.proyecto = null; window.__voz = []; });
  await esperar(400);
  await pg.evaluate(() => document.querySelectorAll('.tarjeta')[2].click());
  await esperar(1800);
  v = await sonando();
  const e2 = await pg.evaluate(() => Estado.proyecto.id);
  ok(`Tarjeta «El Encanto 2» → abre ${e2} y dice ${v.join(', ') || 'NADA'}`,
     e2 === 'el-encanto-2' && v.some(x => x.includes('proyecto-el-encanto-2')) &&
     v.filter(x => x.includes('proyecto-')).length === 1);

  /* 4. Cambiar rápido de opción no deja dos voces encima */
  const solapes = await pg.evaluate(async () => {
    window.__voz = [];
    const ops = [...document.querySelectorAll('.tab')];
    for (let i = 0; i < 6; i++) { ops[i % ops.length].click(); await new Promise(r => setTimeout(r, 260)); }
    await new Promise(r => setTimeout(r, 900));
    /* El reproductor del asistente no vive en el DOM (es un new Audio), así que
       se lo pregunta directo a Voz. Dos voces = el mp3 sonando Y la síntesis
       del sistema al mismo tiempo, que es lo que se oía antes. */
    const mp3 = !!(Voz.audio && !Voz.audio.paused && !Voz.audio.ended);
    return { pedidos: window.__voz.length, mp3, sintesis: !!speechSynthesis.speaking,
             pista: (Voz.audio.src || '').split('/').pop() };
  });
  ok(`6 pestañas seguidas → ${solapes.pedidos} pedidos · suena «${solapes.pista}» ` +
     `(mp3 ${solapes.mp3}, síntesis ${solapes.sintesis}) — nunca las dos`,
     !(solapes.mp3 && solapes.sintesis));

  /* 5. La bienvenida no vuelve a aparecer una vez elegido un proyecto */
  await pg.evaluate(() => { window.__voz = []; });
  await esperar(1500);
  v = await sonando();
  ok('No reaparece la bienvenida estando dentro de un proyecto',
     !v.some(x => x.includes('saludo')));

  /* 6. EL ESCENARIO DEL DEFECTO: Chrome bloquea el audio hasta el primer toque.
        Ese toque suele ser «abrir un proyecto». Antes el desbloqueo relanzaba
        la bienvenida en fase de captura y quedaban las dos voces encima. */
  await pg.close();
  /* Los casos 6 y 8 necesitan que Chrome bloquee el audio de verdad, así que
     van en un navegador aparte, SIN --autoplay-policy. Con la bandera puesta
     no probaban nada: el audio sonaba solo desde el arranque. */
  const nav2 = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--window-size=1920,1080', '--disable-gpu', '--force-device-scale-factor=1']
  });
  const pg2 = await nav2.newPage();
  await pg2.setViewport({ width: 1920, height: 1080 });
  await pg2.setCacheEnabled(false);
  await pg2.evaluateOnNewDocument(() => {
    window.__voz = [];
    const play = Audio.prototype.play;
    Audio.prototype.play = function () {
      if (this.src) window.__voz.push(this.src.split('/').pop());
      return play.apply(this, arguments);
    };
  });
  await pg2.goto(URL, { waitUntil: 'networkidle0' });
  await esperar(2200);
  const bloqueado = await pg2.evaluate(() => +(Voz.audio.currentTime || 0) === 0);
  ok('La portada arranca en silencio, sin depender del autoplay', bloqueado);
  await pg2.evaluate(() => { irA('menu'); window.__voz = []; });
  await esperar(300);
  // Toque real del mouse: dispara pointerdown y despues click, como un dedo
  const caja = await pg2.evaluate(() => {
    const b = document.querySelectorAll('.tarjeta')[0].getBoundingClientRect();
    return { x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) };
  });
  await pg2.mouse.click(caja.x, caja.y);
  await esperar(2600);
  const d = await pg2.evaluate(() => ({ voz: window.__voz, proy: Estado.proyecto.id }));
  ok('Con autoplay bloqueado, tocar la tarjeta abre ' + d.proy + ' y suena [' +
     (d.voz.join(', ') || 'nada') + '] sin que se cuele la bienvenida',
     d.proy === 'el-encanto' && !d.voz.some(x => x.includes('saludo')));

  /* 7. Si el cliente se va, el panel vuelve solo a la atracción: el asistente
        tiene que callarse, no seguir narrando frente a una pantalla vacía. */
  const inac = await pg2.evaluate(async () => {
    Voz.callar(); abrirProyecto('libertad');
    await new Promise(r => setTimeout(r, 1200));
    const hablaba = Voz.sonando();
    PANEL.config.segundosInactividad = 1; reiniciarInactividad();
    await new Promise(r => setTimeout(r, 1800));
    return { hablaba, pantalla: Estado.pantalla, sigue: Voz.sonando() };
  });
  ok('Al volver por inactividad (' + inac.pantalla + ') el asistente se calla',
     inac.hablaba && inac.pantalla === 'atraccion' && !inac.sigue);

  /* 8. La contracara del punto 6: si el primer toque cae en la pantalla de
        atracción —que es lo normal— la bienvenida SÍ tiene que sonar, aunque
        Chrome haya bloqueado el audio al cargar. */
  const pg3 = await nav2.newPage();
  await pg3.setViewport({ width: 1920, height: 1080 });
  await pg3.setCacheEnabled(false);
  await pg3.goto(URL, { waitUntil: 'networkidle0' });
  await esperar(2600);
  const mudo = await pg3.evaluate(() => +(Voz.audio.currentTime || 0).toFixed(1));
  await pg3.mouse.click(700, 540);
  await esperar(2500);
  const tras = await pg3.evaluate(() => ({
    t: +(Voz.audio.currentTime || 0).toFixed(1),
    pista: (Voz.audio.src || '').split('/').pop(),
    pantalla: Estado.pantalla
  }));
  ok('El 1er toque en la portada arranca la bienvenida (' +
     tras.pista + ' ' + tras.t + 's, pantalla ' + tras.pantalla + ')' +
     ' — y como sale de un toque, Chrome no la bloquea',
     mudo === 0 && tras.t > 0 && tras.pista.includes('saludo') && tras.pantalla === 'menu');

  /* 9. Las pestañas de arriba también hacen hablar al asistente, con la
        respuesta que corresponde a cada una. */
  const pg4 = await nav.newPage();
  await pg4.setViewport({ width: 1920, height: 1080 });
  await pg4.setCacheEnabled(false);
  await pg4.evaluateOnNewDocument(() => {
    window.__voz = [];
    const play = Audio.prototype.play;
    Audio.prototype.play = function () {
      if (this.src) window.__voz.push(this.src.split('/').pop());
      return play.apply(this, arguments);
    };
  });
  await pg4.goto(URL, { waitUntil: 'networkidle0' });
  await esperar(1800);
  await pg4.evaluate(() => abrirProyecto('libertad'));
  await esperar(1200);

  const esperado = { resumen: 'servicios', ubicacion: 'ubicacion',
                     lotes: 'disponibilidad', ficha: 'ficha' };
  for (const sec of Object.keys(esperado)) {
    await pg4.evaluate(() => { window.__voz = []; });
    await pg4.evaluate(s => document.querySelector(`.tab[data-sec="${s}"]`).click(), sec);
    await esperar(1100);
    const r = await pg4.evaluate(() => ({
      voz: window.__voz,
      seccion: Estado.seccion,
    }));
    const clave = `libertad--${esperado[sec]}.mp3`;
    ok(`Pestaña «${sec}» → sección ${r.seccion}, dice ${r.voz.join(', ') || 'NADA'}` +
       ``,
       r.seccion === sec && r.voz.length === 1 && r.voz[0] === clave);
  }

  console.log(res.join('\n'));
  const fallas = res.filter(r => r.startsWith(' FALLA')).length;
  console.log(fallas === 0 ? '\nTODO CORRECTO' : `\n${fallas} PRUEBAS FALLIDAS`);
  await nav.close();
  await nav2.close();
  process.exit(fallas === 0 ? 0 : 1);
})().catch(e => { console.error('ERROR: ' + e.message); process.exit(2); });
