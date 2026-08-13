/* ============================================================================
   INMOL · Panel interactivo
   generar-presentacion.js — Arma la propuesta comercial en PowerPoint
   ----------------------------------------------------------------------------
   Usa las capturas de presentacion/capturas/, así que conviene correr antes:
     .\herramientas\capturar.ps1

   SÓLO PARA DESARROLLO. El panel de feria no necesita nada de esto.

   Uso:
     npm install pptxgenjs
     node herramientas/generar-presentacion.js
   ============================================================================ */

const pptxgen = require('pptxgenjs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const CAP = path.join(RAIZ, 'presentacion', 'capturas');
const SALIDA = path.join(RAIZ, 'presentacion', 'Panel Interactivo INMOL - Propuesta.pptx');

/* --- Paleta de marca INMOL --- */
const NEGRO = '08080A';
const CARTA = '15161D';
const CARTA2 = '1E1F29';
const ROJO = 'E3333E';
const BLANCO = 'FFFFFF';
const GRIS = '9A9AA5';
const GRIS_CLARO = 'C9C9D2';

const TIT = 'Arial';
const CUERPO = 'Calibri';

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';           // 13.33 x 7.5
pres.author = 'ProShop';
pres.company = 'INMOL';
pres.title = 'Panel Interactivo INMOL';

const W = 13.33, H = 7.5;
const HORIZ = 1080 / 1920;             // proporción de las capturas apaisadas
const VERT = 1920 / 1080;              // proporción de las capturas del tótem

/* ---------- Utilidades ---------- */
const sombra = () => ({ type: 'outer', color: '000000', blur: 18, offset: 6, angle: 90, opacity: 0.55 });

function nuevaDiapo(fondo) {
  const s = pres.addSlide();
  s.background = { color: fondo || NEGRO };
  /* Todo el texto se ancla arriba y sin relleno interno: así las columnas
     de cada diapositiva alinean entre sí. Cada llamada puede sobreescribirlo. */
  const original = s.addText.bind(s);
  s.addText = (t, o) => original(t, Object.assign({ valign: 'top', margin: 0 }, o));
  return s;
}

function encabezado(s, kicker, titulo, opts) {
  const o = opts || {};
  s.addText(kicker.toUpperCase(), {
    x: 0.68, y: 0.46, w: 11.9, h: 0.26,
    fontFace: CUERPO, fontSize: 10.5, bold: true, color: ROJO, charSpacing: 2.6
  });
  s.addText(titulo, {
    x: 0.66, y: 0.76, w: o.w || 11.0, h: o.h || 0.72,
    fontFace: TIT, fontSize: o.size || 29, bold: true, color: BLANCO
  });
  s.addImage({ path: path.join(RAIZ, 'assets', 'inmol-logo.png'), x: 12.03, y: 0.44, w: 0.6, h: 0.561 });
}

/* Captura con marco oscuro y sombra */
function pantalla(s, archivo, x, y, w, proporcion) {
  const h = w * (proporcion || HORIZ);
  s.addShape(pres.ShapeType.rect, {
    x: x - 0.055, y: y - 0.055, w: w + 0.11, h: h + 0.11,
    fill: { color: CARTA2 }, line: { color: '32333F', width: 0.75 }, shadow: sombra()
  });
  s.addImage({ path: path.join(CAP, archivo), x, y, w, h });
  return h;
}

function cuerpo(s, texto, o) {
  s.addText(texto, Object.assign({
    fontFace: CUERPO, fontSize: 13, color: GRIS_CLARO, lineSpacingMultiple: 1.2
  }, o));
}

function pie(s, texto) {
  s.addText(texto, {
    x: 0.68, y: 6.94, w: 11.9, h: 0.3,
    fontFace: CUERPO, fontSize: 9.5, color: '5C5D68', charSpacing: 1.2
  });
}

function bloqueNumerado(s, n, titulo, texto, x, y, w) {
  s.addShape(pres.ShapeType.ellipse, { x, y, w: 0.42, h: 0.42, fill: { color: ROJO } });
  s.addText(String(n), {
    x, y, w: 0.42, h: 0.42, align: 'center', valign: 'middle',
    fontFace: CUERPO, fontSize: 13, bold: true, color: BLANCO
  });
  s.addText(titulo, {
    x: x + 0.62, y: y - 0.03, w: w - 0.62, h: 0.32,
    fontFace: CUERPO, fontSize: 15, bold: true, color: BLANCO
  });
  s.addText(texto, {
    x: x + 0.62, y: y + 0.32, w: w - 0.62, h: 0.78,
    fontFace: CUERPO, fontSize: 12.5, color: GRIS, lineSpacingMultiple: 1.12
  });
}

function dato(s, valor, etiqueta, x, y, w) {
  s.addText(valor, { x, y, w, h: 0.78, fontFace: TIT, fontSize: 40, bold: true, color: BLANCO });
  s.addText(etiqueta.toUpperCase(), {
    x, y: y + 0.76, w, h: 0.5,
    fontFace: CUERPO, fontSize: 10, bold: true, color: GRIS, charSpacing: 1.8
  });
}

function tarjeta(s, x, y, w, h) {
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.06, fill: { color: CARTA }, line: { color: '2A2B36', width: 0.75 }
  });
}

/* ══════════════════════ 1 · PORTADA ══════════════════════ */
{
  const s = nuevaDiapo();
  pantalla(s, '00-portada.png', 6.45, 1.72, 7.35, 745 / 1320);
  s.addImage({ path: path.join(RAIZ, 'assets', 'inmol-logo.png'), x: 0.68, y: 0.58, w: 1.02, h: 0.953 });
  s.addText('PROPUESTA · STAND DE FERIA', {
    x: 0.7, y: 2.28, w: 5.6, h: 0.3,
    fontFace: CUERPO, fontSize: 11, bold: true, color: ROJO, charSpacing: 2.8
  });
  s.addText('Panel\nInteractivo', {
    x: 0.66, y: 2.66, w: 5.5, h: 1.85,
    fontFace: TIT, fontSize: 46, bold: true, color: BLANCO, lineSpacingMultiple: 0.92
  });
  cuerpo(s, 'Presentación digital de los tres proyectos, en pantalla táctil y sin conexión a internet.',
    { x: 0.7, y: 4.62, w: 5.3, h: 0.95, fontSize: 15 });
  s.addText('Desarrollos Inmobiliarios con respaldo y confianza', {
    x: 0.7, y: 6.5, w: 5.6, h: 0.3, fontFace: CUERPO, fontSize: 10.5, color: '5C5D68', charSpacing: 1.4
  });
  s.addNotes('El panel reemplaza la maqueta física del stand con una presentación digital táctil que funciona sin internet.');
}

/* ══════════════════════ 2 · DE LA MAQUETA A LA PANTALLA ══════════════════════ */
{
  const s = nuevaDiapo();
  encabezado(s, 'El planteamiento', 'De la maqueta a la pantalla');
  cuerpo(s, 'La maqueta hacía una sola cosa que ningún video hace: permitía señalar «este lote, acá, este es el tuyo». El panel conserva eso y agrega lo que la maqueta nunca pudo mostrar.',
    { x: 0.68, y: 1.78, w: 5.15, h: 1.3, fontSize: 14, lineSpacingMultiple: 1.24 });

  bloqueNumerado(s, 1, 'Los tres proyectos en un solo lugar',
    'Ubicación, plano, disponibilidad y avance de obra, organizados por proyecto.', 0.68, 3.20, 5.15);
  bloqueNumerado(s, 2, 'Se actualiza en minutos',
    'La disponibilidad cambia durante la feria; el panel se actualiza sin rehacer nada.', 0.68, 4.44, 5.15);
  bloqueNumerado(s, 3, 'Ocupa el espacio, no el presupuesto',
    'Una carpeta en un pendrive reemplaza el transporte y armado de la maqueta.', 0.68, 5.68, 5.15);

  pantalla(s, '03-resumen.png', 6.5, 2.55, 6.25);
  cuerpo(s, 'Ficha de proyecto: descripción, servicios y cifras principales',
    { x: 6.5, y: 6.24, w: 6.25, h: 0.34, fontSize: 11.5, color: GRIS });
  pie(s, 'Panel Interactivo INMOL · Propuesta');
  s.addNotes('El valor central es poder señalar un lote concreto, igual que con la maqueta, pero con información que la maqueta no tenía.');
}

/* ══════════════════════ 3 · CÓMO SE USA ══════════════════════ */
{
  const s = nuevaDiapo();
  encabezado(s, 'Operación', 'Cómo se usa durante la feria');

  const pasos = [
    ['Se enciende y arranca solo',
     'Al dar energía a la pantalla, el panel retoma la presentación sin que nadie toque nada. No depende de que alguien se acuerde de abrirlo cada mañana.'],
    ['Atrae desde el pasillo',
     'Rota entre los tres proyectos con el nombre grande, una frase corta y tres datos. Sin audio, para que funcione en un pabellón ruidoso.'],
    ['El visitante toca y explora',
     'Elige un proyecto y navega su ubicación, el plano de lotes y el avance de obra. El vendedor acompaña sobre la misma pantalla.'],
    ['Vuelve solo a la atracción',
     'Tras 90 segundos sin uso regresa a la presentación. Nunca queda «trabado» en la pantalla que dejó el visitante anterior.']
  ];

  const anchoT = 2.92, gap = 0.28;
  const x0 = (W - (anchoT * 4 + gap * 3)) / 2;
  pasos.forEach((p, i) => {
    const x = x0 + i * (anchoT + gap);
    tarjeta(s, x, 2.05, anchoT, 3.35);
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.3, y: 2.38, w: 0.5, h: 0.5, fill: { color: ROJO } });
    s.addText(String(i + 1), {
      x: x + 0.3, y: 2.38, w: 0.5, h: 0.5, align: 'center', valign: 'middle',
      fontFace: CUERPO, fontSize: 15, bold: true, color: BLANCO
    });
    s.addText(p[0], {
      x: x + 0.3, y: 3.06, w: anchoT - 0.6, h: 0.64,
      fontFace: CUERPO, fontSize: 14.5, bold: true, color: BLANCO, lineSpacingMultiple: 1.05
    });
    s.addText(p[1], {
      x: x + 0.3, y: 3.74, w: anchoT - 0.6, h: 1.5,
      fontFace: CUERPO, fontSize: 11.5, color: GRIS, lineSpacingMultiple: 1.16
    });
  });

  s.addText('El equipo comercial no tiene que administrar la pantalla: sólo usarla cuando hay alguien delante.', {
    x: 0.68, y: 5.95, w: 11.95, h: 0.5, align: 'center', fontFace: CUERPO, fontSize: 14, color: GRIS_CLARO
  });
  pie(s, 'Ciclo completo, sin intervención · atracción → menú → proyecto → atracción');
  s.addNotes('Insistir en que arranca solo al encender y vuelve solo a la atracción.');
}

/* ══════════════════════ 4 · MODO ATRACCIÓN ══════════════════════ */
{
  const s = nuevaDiapo();
  encabezado(s, 'Pantalla 1', 'Modo atracción: frenar a quien pasa');
  pantalla(s, '01-atraccion.png', 0.68, 1.88, 7.55);
  cuerpo(s, 'Rota entre los tres proyectos con el nombre grande, una frase corta y tres datos. Sin audio, para que funcione en un pabellón ruidoso.',
    { x: 8.62, y: 1.95, w: 4.05, h: 1.55, fontSize: 13.5, lineSpacingMultiple: 1.24 });
  dato(s, '9 s', 'por proyecto', 8.62, 3.66, 2.0);
  dato(s, '3', 'proyectos en rotación', 10.78, 3.66, 2.55);
  dato(s, '0', 'clics para iniciar', 8.62, 5.16, 2.0);
  dato(s, '90 s', 'y vuelve solo', 10.78, 5.16, 2.55);
  pie(s, 'Tipografía dimensionada para lectura a 6–8 metros');
  s.addNotes('El trabajo de esta pantalla es uno solo: frenar a la gente que camina por el pasillo.');
}

/* ══════════════════════ 5 · MENÚ DE PROYECTOS ══════════════════════ */
{
  const s = nuevaDiapo();
  encabezado(s, 'Pantalla 2', 'Los tres proyectos, de un vistazo');
  pantalla(s, '02-menu.png', 3.06, 1.94, 7.2);
  cuerpo(s, 'Cada tarjeta muestra el tipo de proyecto, su ubicación y dos datos clave. Un toque abre el proyecto completo.',
    { x: 0.68, y: 5.68, w: 5.9, h: 1.0, fontSize: 13.5, lineSpacingMultiple: 1.24 });
  cuerpo(s, 'El tercer proyecto ya está construido y espera su contenido: nombre, plano, fotos y avance de obra.',
    { x: 6.9, y: 5.68, w: 5.75, h: 1.0, fontSize: 13.5, color: GRIS, lineSpacingMultiple: 1.24 });
  pie(s, 'Urbanización El Encanto · Centro Comercial Libertad · tercer proyecto por definir');
  s.addNotes('Mostrar que el tercer proyecto ya tiene su lugar reservado y toda la estructura hecha.');
}

/* ══════════════════════ 6 · CINCO SECCIONES ══════════════════════ */
{
  const s = nuevaDiapo();
  encabezado(s, 'Dentro de un proyecto', 'Todo organizado en cinco secciones');
  pantalla(s, '03-resumen.png', 6.28, 2.45, 6.4);

  const secs = [
    ['Resumen', 'Descripción, servicios y cifras principales'],
    ['Ubicación', 'Vista satelital con zoom, desde la región al terreno'],
    ['Qué hay cerca', 'Puntos de referencia con su distancia real'],
    ['Disponibilidad', 'Plano de lotes tocable, con estado y superficie'],
    ['Avance de obra', 'Porcentaje general y detalle por etapa']
  ];
  secs.forEach((sec, i) => {
    const y = 1.95 + i * 0.94;
    s.addShape(pres.ShapeType.ellipse, { x: 0.68, y: y + 0.06, w: 0.34, h: 0.34, fill: { color: ROJO } });
    s.addText(String(i + 1), {
      x: 0.68, y: y + 0.06, w: 0.34, h: 0.34, align: 'center', valign: 'middle',
      fontFace: CUERPO, fontSize: 11, bold: true, color: BLANCO
    });
    s.addText(sec[0], { x: 1.2, y, w: 4.7, h: 0.32, fontFace: CUERPO, fontSize: 15.5, bold: true, color: BLANCO });
    s.addText(sec[1], { x: 1.2, y: y + 0.33, w: 4.7, h: 0.5, fontFace: CUERPO, fontSize: 12, color: GRIS, lineSpacingMultiple: 1.1 });
  });

  pie(s, 'La misma estructura para los tres proyectos');
  s.addNotes('Cinco secciones fijas: el vendedor siempre sabe dónde está cada cosa.');
}

/* ══════════════════════ 7 · UBICACIÓN SATELITAL ══════════════════════ */
{
  const s = nuevaDiapo();
  encabezado(s, 'Ubicación', 'Vista satelital que funciona sin conexión');
  cuerpo(s, 'El panel guarda cuatro alturas de la misma ubicación —Región, Ciudad, Zona y Predio— y las encadena con un zoom animado. Se percibe como Google Earth, pero no pide nada a la red.',
    { x: 0.68, y: 1.74, w: 11.95, h: 0.72, fontSize: 13.5 });

  pantalla(s, '04-satelital-ciudad.png', 0.68, 2.72, 5.9);
  pantalla(s, '05-satelital-predio.png', 6.78, 2.72, 5.9);

  s.addText('Nivel 2 · Ciudad', { x: 0.68, y: 6.14, w: 5.9, h: 0.3, fontFace: CUERPO, fontSize: 12.5, bold: true, color: BLANCO });
  s.addText('La trama urbana, los accesos y el predio señalado.', { x: 0.68, y: 6.44, w: 5.9, h: 0.3, fontFace: CUERPO, fontSize: 11.5, color: GRIS });
  s.addText('Nivel 4 · Predio', { x: 6.78, y: 6.14, w: 5.9, h: 0.3, fontFace: CUERPO, fontSize: 12.5, bold: true, color: BLANCO });
  s.addText('El terreno con su subdivisión de lotes y la vía de acceso.', { x: 6.78, y: 6.44, w: 5.9, h: 0.3, fontFace: CUERPO, fontSize: 11.5, color: GRIS });

  pie(s, 'Botón «Sobrevuelo automático»: recorre los cuatro niveles solo, para presentar sin tocar');
  s.addNotes('Google Maps no funciona sin internet y sus términos prohíben guardar los tiles. La solución es capturar las cuatro alturas desde Google Earth Pro antes de la feria.');
}

/* ══════════════════════ 8 · QUÉ HAY CERCA ══════════════════════ */
{
  const s = nuevaDiapo();
  encabezado(s, 'Entorno', 'Los puntos de referencia, a escala');
  pantalla(s, '06-referencias.png', 5.9, 1.96, 6.78);
  cuerpo(s, 'Cada referencia se ubica en su ángulo y a su distancia real sobre anillos de 1, 2 y 3 kilómetros.',
    { x: 0.68, y: 2.0, w: 4.8, h: 1.05, fontSize: 14, lineSpacingMultiple: 1.24 });
  cuerpo(s, 'Es más legible a distancia que un mapa navegable, y responde la pregunta que el cliente hace de verdad: «¿qué tengo cerca?».',
    { x: 0.68, y: 3.2, w: 4.8, h: 1.2, fontSize: 13, color: GRIS, lineSpacingMultiple: 1.24 });
  dato(s, '5', 'referencias por proyecto', 0.68, 4.62, 2.2);
  dato(s, '3 km', 'de radio mostrado', 3.16, 4.62, 2.3);
  pie(s, 'Las referencias y distancias se cargan desde un solo archivo de datos');
  s.addNotes('Los nombres actuales son de ejemplo; INMOL debe entregar las referencias reales.');
}

/* ══════════════════════ 9 · DISPONIBILIDAD ══════════════════════ */
{
  const s = nuevaDiapo();
  encabezado(s, 'El corazón del panel', 'Disponibilidad: lo que reemplaza la maqueta');
  pantalla(s, '07-lotes.png', 0.68, 1.88, 8.0);
  cuerpo(s, 'Cada unidad es tocable. Al tocarla aparece su código, manzana, superficie y categoría.',
    { x: 9.05, y: 1.94, w: 3.62, h: 1.15, fontSize: 13.5, lineSpacingMultiple: 1.24 });

  [['Disponible', '35B36B'], ['Reservado', 'E0A33A'], ['Vendido', '55565F']].forEach((e, i) => {
    const y = 3.28 + i * 0.52;
    s.addShape(pres.ShapeType.roundRect, { x: 9.05, y: y + 0.05, w: 0.22, h: 0.22, rectRadius: 0.03, fill: { color: e[1] } });
    s.addText(e[0], { x: 9.42, y, w: 3.2, h: 0.32, fontFace: CUERPO, fontSize: 13, color: GRIS_CLARO });
  });

  s.addText('Sin precios en pantalla', { x: 9.05, y: 5.12, w: 3.62, h: 0.32, fontFace: CUERPO, fontSize: 14, bold: true, color: BLANCO });
  cuerpo(s, 'La cotización se prepara de forma personalizada. En feria, además, evita que la competencia se lleve la lista de precios en una foto.',
    { x: 9.05, y: 5.48, w: 3.62, h: 1.3, fontSize: 12, color: GRIS, lineSpacingMultiple: 1.18 });

  pie(s, 'Filtros rápidos: todos · sólo disponibles · reservados · vendidos');
  s.addNotes('Esta es la pantalla que más se va a usar: permite señalar un lote concreto durante la conversación comercial.');
}

/* ══════════════════════ 10 · AVANCE DE OBRA ══════════════════════ */
{
  const s = nuevaDiapo();
  encabezado(s, 'Obra', 'Avance real, etapa por etapa');
  pantalla(s, '08-avance.png', 3.06, 2.02, 7.2);
  cuerpo(s, 'Un porcentaje general y el detalle por etapa. Se actualiza editando un número: no hay que rehacer ninguna imagen.',
    { x: 3.06, y: 6.2, w: 7.2, h: 0.75, fontSize: 13.5, align: 'center' });
  pie(s, 'Las etapas y porcentajes los define INMOL para cada proyecto');
  s.addNotes('Responde una de las preguntas más frecuentes en feria: ¿en qué estado está la obra hoy?');
}

/* ══════════════════════ 11 · TÓTEM VERTICAL ══════════════════════ */
{
  const s = nuevaDiapo();
  encabezado(s, 'Formato', 'El mismo panel, vertical u horizontal');
  cuerpo(s, 'Los tótems de feria son verticales. El panel detecta la proporción de la pantalla y reacomoda todo solo: no hay dos versiones que mantener.',
    { x: 0.68, y: 1.8, w: 6.2, h: 1.0, fontSize: 14, lineSpacingMultiple: 1.24 });

  bloqueNumerado(s, 1, 'El plano se reacomoda',
    'En horizontal las manzanas van en fila; en vertical se apilan y los lotes salen casi al doble de tamaño.', 0.68, 3.15, 6.2);
  bloqueNumerado(s, 2, 'La letra mantiene su tamaño físico',
    'Escala con el lado más largo de la pantalla, así que se lee igual de lejos en las dos orientaciones.', 0.68, 4.45, 6.2);
  bloqueNumerado(s, 3, 'Verificado con clics reales',
    'Se prueba automáticamente en 1920×1080 y en 1080×1920 antes de cada entrega.', 0.68, 5.75, 6.2);

  pantalla(s, 'v-02-menu.png', 7.45, 2.05, 2.5, VERT);
  pantalla(s, 'v-03-lotes.png', 10.25, 2.05, 2.5, VERT);
  s.addText('Menú', { x: 7.45, y: 6.62, w: 2.5, h: 0.3, align: 'center', fontFace: CUERPO, fontSize: 11.5, color: GRIS });
  s.addText('Disponibilidad', { x: 10.25, y: 6.62, w: 2.5, h: 0.3, align: 'center', fontFace: CUERPO, fontSize: 11.5, color: GRIS });
  s.addNotes('Sirve para cerrar la duda sobre qué tótem comprar: cualquiera de los dos formatos funciona.');
}

/* ══════════════════════ 12 · LOS TRES PROYECTOS ══════════════════════ */
{
  const s = nuevaDiapo();
  encabezado(s, 'Alcance', 'Listo para los tres proyectos');
  const w = 3.9, gap = 0.3;
  const x0 = (W - (w * 3 + gap * 2)) / 2;
  const fichas = [
    ['10-libertad.png', 'Centro Comercial Libertad', 'Santa Cruz de la Sierra · 96 locales'],
    ['11-libertad-locales.png', 'Plano de locales', 'Misma mecánica, adaptada a un centro comercial'],
    ['12-tercer-proyecto.png', 'Tercer proyecto', 'Estructura completa, esperando su contenido']
  ];
  fichas.forEach((f, i) => {
    const x = x0 + i * (w + gap);
    pantalla(s, f[0], x, 2.35, w);
    s.addText(f[1], { x, y: 4.66, w, h: 0.34, fontFace: CUERPO, fontSize: 14, bold: true, color: BLANCO });
    s.addText(f[2], { x, y: 5.0, w, h: 0.62, fontFace: CUERPO, fontSize: 11.5, color: GRIS, lineSpacingMultiple: 1.14 });
  });
  s.addText('Cambiar de proyecto no cambia la forma de usar el panel: las cinco secciones son siempre las mismas.', {
    x: 0.68, y: 5.95, w: 11.95, h: 0.6, align: 'center', fontFace: CUERPO, fontSize: 13, color: GRIS_CLARO
  });
  pie(s, 'Agregar un cuarto proyecto no requiere rehacer el panel');
  s.addNotes('El sistema sirve igual para una urbanización y para un centro comercial.');
}

/* ══════════════════════ 13 · SIN INTERNET ══════════════════════ */
{
  const s = nuevaDiapo();
  encabezado(s, 'Decisión técnica', 'Todo vive dentro del equipo');
  cuerpo(s, 'En el pabellón la conexión falla cuando se llena de gente. Por eso el panel no depende de la red en ningún momento: mapas, tipografías y datos están dentro del propio equipo.',
    { x: 0.68, y: 1.78, w: 11.95, h: 0.72, fontSize: 14 });

  const cifras = [
    ['0', 'peticiones a internet'],
    ['0', 'servicios que pagar por mes'],
    ['1', 'carpeta que se copia a un pendrive'],
    ['10 días', 'de feria sin reiniciar']
  ];
  const w = 2.92, gap = 0.28;
  const x0 = (W - (w * 4 + gap * 3)) / 2;
  cifras.forEach((c, i) => {
    const x = x0 + i * (w + gap);
    tarjeta(s, x, 2.78, w, 1.72);
    s.addText(c[0], { x: x + 0.3, y: 2.98, w: w - 0.6, h: 0.8, fontFace: TIT, fontSize: 36, bold: true, color: ROJO });
    s.addText(c[1], { x: x + 0.3, y: 3.78, w: w - 0.6, h: 0.6, fontFace: CUERPO, fontSize: 12, color: GRIS_CLARO, lineSpacingMultiple: 1.12 });
  });

  s.addText('Lo que sí conviene preparar', { x: 0.68, y: 4.9, w: 11.95, h: 0.34, fontFace: CUERPO, fontSize: 15, bold: true, color: BLANCO });
  s.addText([
    { text: 'Equipo de respaldo con la misma carpeta copiada, listo para enchufar.', options: { bullet: true, breakLine: true } },
    { text: 'UPS para que un microcorte no cueste cinco minutos frente a un cliente.', options: { bullet: true, breakLine: true } },
    { text: 'Windows con actualizaciones, suspensión y notificaciones desactivadas.', options: { bullet: true, breakLine: true } },
    { text: 'Quince minutos de capacitación al equipo comercial: si no lo saben usar, vuelven al celular.', options: { bullet: true } }
  ], { x: 0.68, y: 5.3, w: 11.95, h: 1.5, fontFace: CUERPO, fontSize: 12.5, color: GRIS, lineSpacingMultiple: 1.1, paraSpaceAfter: 6 });

  pie(s, 'Starlink deja de ser un requisito para que el stand funcione');
  s.addNotes('Este es el argumento que baja el riesgo: la feria no depende de la conexión ni de Starlink.');
}

/* ══════════════════════ 14 · PRÓXIMOS PASOS ══════════════════════ */
{
  const s = nuevaDiapo();
  encabezado(s, 'Para avanzar', 'Qué necesitamos de INMOL');
  cuerpo(s, 'El desarrollo ya está hecho. Lo que define la fecha de entrega es el material.',
    { x: 0.68, y: 1.76, w: 11.95, h: 0.36, fontSize: 14 });

  const izq = [
    'Planos de los tres proyectos, en vectorial si es posible',
    'Tabla o Excel de disponibilidad de lotes',
    'Fotografías actualizadas de cada proyecto',
    'Puntos de referencia reales y sus distancias'
  ];
  const der = [
    'Etapas de obra y su porcentaje de avance',
    'Nombre y datos del tercer proyecto',
    'Capturas satelitales desde Google Earth Pro',
    'Diseño del stand y ubicación de las pantallas'
  ];

  tarjeta(s, 0.68, 2.34, 5.95, 2.72);
  tarjeta(s, 6.98, 2.34, 5.67, 2.72);
  s.addText('Material del proyecto', { x: 1.0, y: 2.6, w: 5.3, h: 0.32, fontFace: CUERPO, fontSize: 14.5, bold: true, color: BLANCO });
  s.addText('Obra y montaje', { x: 7.3, y: 2.6, w: 5.0, h: 0.32, fontFace: CUERPO, fontSize: 14.5, bold: true, color: BLANCO });
  izq.forEach((t, i) => s.addText(t, { x: 1.0, y: 3.06 + i * 0.46, w: 5.3, h: 0.42, fontFace: CUERPO, fontSize: 12, color: GRIS_CLARO, bullet: true }));
  der.forEach((t, i) => s.addText(t, { x: 7.3, y: 3.06 + i * 0.46, w: 5.0, h: 0.42, fontFace: CUERPO, fontSize: 12, color: GRIS_CLARO, bullet: true }));

  s.addText('Próximos pasos', { x: 0.68, y: 5.34, w: 11.95, h: 0.34, fontFace: CUERPO, fontSize: 15, bold: true, color: BLANCO });
  const pasos = [
    ['Prototipo en tablet', 'Para probar la navegación táctil con el equipo comercial'],
    ['Carga de contenido real', 'Reemplaza el material de ejemplo por el de INMOL'],
    ['Pruebas en la pantalla real', 'Verificar legibilidad a distancia antes del montaje'],
    ['Soporte durante la feria', 'Los diez días, con equipo de respaldo preparado']
  ];
  const wp = 2.92, gp = 0.28;
  const xp = (W - (wp * 4 + gp * 3)) / 2;
  pasos.forEach((p, i) => {
    const x = xp + i * (wp + gp);
    s.addShape(pres.ShapeType.ellipse, { x, y: 5.8, w: 0.36, h: 0.36, fill: { color: ROJO } });
    s.addText(String(i + 1), { x, y: 5.8, w: 0.36, h: 0.36, align: 'center', valign: 'middle', fontFace: CUERPO, fontSize: 11.5, bold: true, color: BLANCO });
    s.addText(p[0], { x: x + 0.48, y: 5.78, w: wp - 0.48, h: 0.3, fontFace: CUERPO, fontSize: 12.5, bold: true, color: BLANCO });
    s.addText(p[1], { x: x + 0.48, y: 6.08, w: wp - 0.48, h: 0.68, fontFace: CUERPO, fontSize: 10.5, color: GRIS, lineSpacingMultiple: 1.12 });
  });

  pie(s, 'www.inmol.com.bo   ·   +591 755 90031');
  s.addNotes('Cerrar pidiendo una fecha concreta para la entrega del material: es lo que determina si se llega con margen a la feria.');
}

pres.writeFile({ fileName: SALIDA })
  .then(f => console.log('Generado: ' + f))
  .catch(e => { console.error('ERROR: ' + e.message); process.exit(1); });
