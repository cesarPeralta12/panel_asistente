/* ============================================================================
   INMOL · Panel interactivo
   probar-saludo.js — El asistente debe saludar UNA sola vez por visitante
   ----------------------------------------------------------------------------
   QUÉ COMPRUEBA
     1. Al cargar el panel, la presentación suena sola: una vez.
     2. El primer toque (atracción → menú) NO la repite.
     3. Entrar a un proyecto tampoco la repite.
     4. Cuando el panel vuelve solo al modo atracción por inactividad, el
        siguiente visitante SÍ vuelve a escucharla.

   SÓLO PARA DESARROLLO.
   Uso:  node herramientas/probar-saludo.js
   ============================================================================ */
const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = 'file:///' +
  path.resolve(__dirname, '..', 'index.html').split(path.sep).join('/').replace(/ /g, '%20');

(async () => {
  const navegador = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--window-size=1920,1080', '--disable-gpu', '--force-device-scale-factor=1',
           '--autoplay-policy=no-user-gesture-required']
  });
  const pagina = await navegador.newPage();
  await pagina.setViewport({ width: 1920, height: 1080 });
  await pagina.setCacheEnabled(false);

  /* Contador de saludos: se cuenta tanto el MP3 pregrabado como el respaldo
     de la voz del sistema, porque cualquiera de los dos se oye igual. */
  await pagina.evaluateOnNewDocument(() => {
    window.__saludos = [];
    const play = Audio.prototype.play;
    Audio.prototype.play = function () {
      if ((this.src || '').includes('saludo.mp3')) window.__saludos.push('mp3');
      return play.apply(this, arguments);
    };
    const speak = speechSynthesis.speak.bind(speechSynthesis);
    speechSynthesis.speak = u => {
      if ((u.text || '').startsWith('Bienvenido a INMOL')) window.__saludos.push('sistema');
      return speak(u);
    };
  });

  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const cuenta = () => pagina.evaluate(() => window.__saludos.length);
  const clic = async (x, y) => { await pagina.mouse.click(x, y); await esperar(400); };

  const res = [];
  const ok = (n, c) => res.push((c ? '  OK  ' : ' FALLA ') + n);

  await pagina.goto(URL, { waitUntil: 'networkidle0' });
  await esperar(2000);

  const c1 = await cuenta();
  ok(`Al cargar, la presentación suena ${c1} vez/veces`, c1 === 1);

  // Toque en el centro del área de contenido: atracción → menú
  await clic(700, 540);
  const c2 = await cuenta();
  ok(`Tras el primer toque (menú): ${c2} en total — no se repite`, c2 === 1);

  // Entrar a un proyecto
  await pagina.evaluate(() => {
    const r = document.querySelector('.tarjeta').getBoundingClientRect();
    document.querySelector('.tarjeta').click();
  });
  await esperar(600);
  const c3 = await cuenta();
  ok(`Tras entrar a un proyecto: ${c3} en total — no se repite`, c3 === 1);
  const pantalla = await pagina.evaluate(() => Estado.pantalla);
  ok(`La navegación sigue funcionando (pantalla: ${pantalla})`, pantalla === 'proyecto');

  /* Vuelta al modo atracción por el temporizador REAL de inactividad:
     se acorta a 1 segundo para no esperar los 90 de la feria. */
  await pagina.evaluate(() => {
    PANEL.config.segundosInactividad = 1;
    reiniciarInactividad();
  });
  await esperar(1800);
  const vuelta = await pagina.evaluate(() => ({ p: Estado.pantalla, s: Estado.yaSaludo }));
  ok(`La inactividad devuelve a atracción y reinicia el saludo (${vuelta.p}, yaSaludo=${vuelta.s})`,
     vuelta.p === 'atraccion' && vuelta.s === false);
  await clic(700, 540);
  const c4 = await cuenta();
  ok(`Visitante nuevo tras la inactividad: ${c4} en total — sí vuelve a saludar`, c4 === 2);

  console.log(res.join('\n'));
  const fallas = res.filter(r => r.startsWith(' FALLA')).length;
  console.log(fallas === 0 ? '\nTODO CORRECTO' : `\n${fallas} PRUEBAS FALLIDAS`);
  await navegador.close();
  process.exit(fallas === 0 ? 0 : 1);
})().catch(e => { console.error('ERROR: ' + e.message); process.exit(2); });
