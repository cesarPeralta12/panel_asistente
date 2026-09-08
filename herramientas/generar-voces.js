/* ============================================================================
   INMOL · Panel interactivo
   generar-voces.js — Graba las respuestas del asistente con voz neuronal
   ----------------------------------------------------------------------------
   POR QUÉ EXISTE
   La voz del sistema (SAPI de Windows) suena robótica. Como las respuestas del
   asistente son un conjunto FIJO y corto —22 frases—, no hace falta sintetizar
   en vivo: se graban una sola vez con una voz neuronal y el panel reproduce el
   audio. Resultado: suena humano, arranca al instante y sigue funcionando
   100 % sin internet, porque los MP3 viajan dentro de la carpeta.

   Se usa la voz boliviana  es-BO-SofiaNeural  (o Marcelo, la masculina).

   REQUISITOS (sólo para generar; el kiosco no los necesita)
     pip install edge-tts
     Conexión a internet EN ESTE PASO únicamente.

   USO
     node herramientas/generar-voces.js
     node herramientas/generar-voces.js es-BO-MarceloNeural
   ============================================================================ */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { spawnSync } = require('child_process');

const RAIZ = path.resolve(__dirname, '..');
const SALIDA = path.join(RAIZ, 'assets', 'voz');

const VOZ = process.argv[2] || 'es-BO-SofiaNeural';
// Un poco más pausada: se entiende mejor en un pabellón ruidoso.
const RITMO = '-6%';

/* --- Se lee datos.js tal cual, sin tocarlo -------------------------------- */
/* datos.js referencia los archivos de disponibilidad y rutas, así que se
   cargan primero, en el mismo orden que index.html. */
const previos = ['disponibilidad-el-encanto.js', 'disponibilidad-libertad.js',
                 'disponibilidad-el-encanto-2.js', 'rutas.js'];
const codigo = fs.readFileSync(path.join(RAIZ, 'js', 'datos.js'), 'utf8');
const contexto = {};
vm.createContext(contexto);
previos.forEach(f => {
  const p = path.join(RAIZ, 'js', f);
  if (fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), contexto);
});
vm.runInContext(codigo + '\n;this.PANEL = PANEL;', contexto);
const PANEL = contexto.PANEL;

/* --- Lista de frases a grabar -------------------------------------------- */
const frases = [];
frases.push({ clave: 'saludo', texto: PANEL.asistente.saludo });

PANEL.proyectos.forEach(p => {
  frases.push({
    clave: `proyecto-${p.id}`,
    texto: `${p.nombre}. ${p.claim} ${p.descripcion}`
  });
  PANEL.asistente.preguntas.forEach(q => {
    frases.push({ clave: `${p.id}--${q.id}`, texto: q.respuesta(p) });
  });
});

/* --- Generación ----------------------------------------------------------- */
fs.mkdirSync(SALIDA, { recursive: true });

console.log(`Voz: ${VOZ}   ·   ritmo ${RITMO}   ·   ${frases.length} frases\n`);

const indice = {};
let fallos = 0;

frases.forEach((f, i) => {
  const archivo = path.join(SALIDA, f.clave + '.mp3');
  // El ritmo va pegado con "=" porque empieza con "-" y si no argparse lo
  // confunde con una bandera.
  const r = spawnSync('python', [
    '-m', 'edge_tts',
    '--voice', VOZ,
    `--rate=${RITMO}`,
    '--text', f.texto,
    '--write-media', archivo
  ], { encoding: 'utf8' });

  const ok = r.status === 0 && fs.existsSync(archivo) && fs.statSync(archivo).size > 800;
  const n = String(i + 1).padStart(2, ' ');
  if (ok) {
    const kb = Math.round(fs.statSync(archivo).size / 1024);
    indice[f.clave] = 'assets/voz/' + f.clave + '.mp3';
    console.log(`${n}  OK    ${f.clave.padEnd(28)} ${String(kb).padStart(4)} KB   «${f.texto.slice(0, 42)}…»`);
  } else {
    fallos++;
    console.log(`${n}  FALLA ${f.clave.padEnd(28)} ${(r.stderr || '').trim().split('\n')[0]}`);
  }
});

/* --- Índice que lee el panel ---------------------------------------------- */
const cabecera =
  '/* Índice de audios pregrabados del asistente.\n' +
  '   GENERADO AUTOMÁTICAMENTE por herramientas/generar-voces.js — no editar a mano.\n' +
  `   Voz: ${VOZ}   ·   ${Object.keys(indice).length} frases   ·   ${new Date().toISOString().slice(0, 10)}\n` +
  '   Si un audio falta, el asistente usa la voz del sistema como respaldo. */\n';

fs.writeFileSync(
  path.join(SALIDA, 'indice.js'),
  cabecera + 'const VOCES = ' + JSON.stringify(indice, null, 2) + ';\n',
  'utf8'
);

console.log(`\n${Object.keys(indice).length} audios generados en assets/voz/`);
if (fallos) {
  console.log(`${fallos} fallaron. ¿Está instalado edge-tts?  pip install edge-tts`);
  process.exit(1);
}
console.log('Índice actualizado: assets/voz/indice.js');
