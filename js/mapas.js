/* ============================================================================
   INMOL · PANEL INTERACTIVO
   mapas.js — Vista satelital offline, plano de lotes y mapa de referencias
   ----------------------------------------------------------------------------
   VISTA SATELITAL SIN INTERNET
   La app trabaja con una "torre de niveles": 4 imágenes fijas del mismo lugar
   a distinta altura (Región → Ciudad → Zona → Predio). Al pasar de una a otra
   se hace un zoom animado, y el resultado se percibe como Google Earth.

   Hoy esos 4 niveles se DIBUJAN por software (render procedural) para que el
   panel funcione y se pueda demostrar sin depender de nadie. Cuando INMOL
   entregue las capturas satelitales reales, se reemplazan poniendo la ruta de
   la imagen en  proyecto.satelital = ['n0.jpg','n1.jpg','n2.jpg','n3.jpg']
   y este archivo las usa automáticamente, sin tocar nada más.
   ============================================================================ */

/* --- Aleatoriedad reproducible (misma semilla = mismo terreno siempre) ----- */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash2(x, y, semilla) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(semilla | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function suavizar(t) { return t * t * (3 - 2 * t); }

function ruidoValor(x, y, semilla) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const a = hash2(xi, yi, semilla), b = hash2(xi + 1, yi, semilla);
  const c = hash2(xi, yi + 1, semilla), d = hash2(xi + 1, yi + 1, semilla);
  const u = suavizar(xf), v = suavizar(yf);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

function ruidoFractal(x, y, semilla, octavas) {
  let suma = 0, amp = 1, frec = 1, norm = 0;
  for (let i = 0; i < octavas; i++) {
    suma += ruidoValor(x * frec, y * frec, semilla + i * 7919) * amp;
    norm += amp; amp *= 0.5; frec *= 2;
  }
  return suma / norm;
}

/* --- Definición de los 4 niveles de altura -------------------------------- */
const NIVELES = [
  { id: 0, nombre: 'Región',  detalle: 'Santa Cruz y alrededores', metros: 42000 },
  { id: 1, nombre: 'Ciudad',  detalle: 'Trama urbana y accesos',    metros: 9000  },
  { id: 2, nombre: 'Zona',    detalle: 'Entorno inmediato',         metros: 1900  },
  { id: 3, nombre: 'Predio',  detalle: 'Terreno del proyecto',      metros: 660   }
];

/* --- Paleta del render satelital ------------------------------------------ */
const PALETA = {
  agua:      [ 38,  74,  96],
  vegetacion:[ 54,  80,  46],
  monte:     [ 74,  96,  56],
  cultivo:   [128, 132,  80],
  suelo:     [150, 128,  96],
  urbano:    [122, 122, 126],
  asfalto:   [ 58,  58,  62],
  techo:     [162, 146, 128]
};

function mezclar(c1, c2, t) {
  return [
    Math.round(c1[0] + (c2[0] - c1[0]) * t),
    Math.round(c1[1] + (c2[1] - c1[1]) * t),
    Math.round(c1[2] + (c2[2] - c1[2]) * t)
  ];
}

/* ============================================================================
   MUNDO: se genera una sola vez por proyecto, en metros, con el predio en (0,0)
   ----------------------------------------------------------------------------
   Reproduce los rasgos que se ven realmente en una imagen satelital de la zona
   de Santa Cruz: parcelas agrícolas rectangulares, manchas de monte, un río,
   carreteras y una trama urbana irregular alrededor del proyecto.
   ============================================================================ */
const _mundos = new Map();

function obtenerMundo(proyecto) {
  if (_mundos.has(proyecto.id)) return _mundos.get(proyecto.id);
  const rnd = mulberry32(proyecto.semilla);

  const mundo = {
    semilla: proyecto.semilla,
    vias: [], calles: [], celdas: [], campos: [], monte: [], rio: []
  };

  /* Orientación general de la trama (todo el barrio gira junto) */
  const giro = (rnd() - 0.5) * 0.5;
  const cos = Math.cos(giro), sen = Math.sin(giro);
  const rotar = (x, y) => [x * cos - y * sen, x * sen + y * cos];
  mundo.rotar = rotar;
  mundo.giro = giro;

  /* --- Río sinuoso ------------------------------------------------------- */
  {
    let x = -19000 + rnd() * 9000, y = -24000;
    const pts = [];
    while (y < 24000) {
      pts.push([x, y]);
      x += (rnd() - 0.45) * 3800;
      y += 2200 + rnd() * 1100;
    }
    mundo.rio = pts;
  }

  /* --- Parcelas agrícolas rectangulares (lo más característico del lugar) - */
  const clusters = 7;
  for (let c = 0; c < clusters; c++) {
    const ccx = (rnd() - 0.5) * 40000;
    const ccy = (rnd() - 0.5) * 40000;
    const angC = rnd() * Math.PI;
    const cantidad = 10 + Math.floor(rnd() * 16);
    for (let i = 0; i < cantidad; i++) {
      const largo = 700 + rnd() * 2400;
      const ancho = 320 + rnd() * 900;
      mundo.campos.push({
        x: ccx + (rnd() - 0.5) * 9000,
        y: ccy + (rnd() - 0.5) * 9000,
        w: largo, h: ancho,
        ang: angC + (rnd() - 0.5) * 0.22,
        tono: rnd()
      });
    }
  }

  /* --- Manchas de monte / vegetación densa -------------------------------- */
  for (let i = 0; i < 70; i++) {
    mundo.monte.push({
      x: (rnd() - 0.5) * 46000,
      y: (rnd() - 0.5) * 46000,
      r: 500 + rnd() * 3000,
      d: 0.35 + rnd() * 0.4
    });
  }

  /* --- Carreteras principales -------------------------------------------- */
  const anguloBase = giro + (rnd() - 0.5) * 0.3;
  for (let i = 0; i < 3; i++) {
    const ang = anguloBase + i * (Math.PI / 2.6) + (rnd() - 0.5) * 0.3;
    // La primera bordea el predio (es la vía de acceso del proyecto).
    // Ninguna carretera puede atravesarlo: se respeta una distancia mínima.
    let desfase = (i === 0) ? 330 + rnd() * 70 : (rnd() - 0.5) * 11000;
    if (Math.abs(desfase) < 330) desfase = 330 * Math.sign(desfase || 1) + desfase * 0.4;
    const nx = Math.cos(ang), ny = Math.sin(ang);
    mundo.vias.push({
      a: [-nx * 34000 - ny * desfase, -ny * 34000 + nx * desfase],
      b: [nx * 34000 - ny * desfase, ny * 34000 + nx * desfase],
      ancho: i === 0 ? 30 : 20
    });
  }

  /* --- Trama urbana irregular alrededor del predio ------------------------ */
  const R = 3200;                 // radio de la mancha urbana, en metros
  const paso = 135;
  const xs = [], ys = [];
  for (let v = -R; v < R; ) { xs.push(v); v += paso * (0.55 + rnd() * 1.45); }
  for (let v = -R; v < R; ) { ys.push(v); v += paso * (0.55 + rnd() * 1.45); }

  /* El borde de la mancha urbana es irregular, como el de un pueblo real:
     denso en el centro y deshilachado hacia la periferia. Nunca llega a las
     esquinas de la retícula, para que no se lea como un cuadrado. */
  const dentroUrbano = (x, y) => {
    const d = Math.sqrt(x * x + y * y) / R;
    const deforme = ruidoFractal(x / 1400, y / 1400, mundo.semilla + 555, 4);
    return d < 0.22 + deforme * 0.74;
  };

  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < ys.length - 1; j++) {
      const x0 = xs[i], x1 = xs[i + 1], y0 = ys[j], y1 = ys[j + 1];
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      if (!dentroUrbano(cx, cy)) continue;

      // El predio del proyecto se deja libre: se dibuja aparte.
      const esPredio = Math.abs(cx) < 230 && Math.abs(cy) < 170;

      const r = rnd();
      const tipo = esPredio ? 'predio'
                 : r < 0.13 ? 'verde'
                 : r < 0.22 ? 'baldio'
                 : r < 0.42 ? 'denso'
                 : 'residencial';

      const celda = { x0, y0, x1, y1, tipo, tono: rnd(), edificios: [] };

      if (tipo === 'residencial' || tipo === 'denso') {
        const densidad = tipo === 'denso' ? 12 : 7;
        const n = Math.floor(densidad * (0.6 + rnd() * 0.8));
        for (let k = 0; k < n; k++) {
          const w = (tipo === 'denso' ? 12 : 9) + rnd() * 15;
          const h = (tipo === 'denso' ? 11 : 8) + rnd() * 13;
          celda.edificios.push({
            x: x0 + 6 + rnd() * Math.max(1, (x1 - x0) - w - 12),
            y: y0 + 6 + rnd() * Math.max(1, (y1 - y0) - h - 12),
            w, h, tono: rnd()
          });
        }
      }
      mundo.celdas.push(celda);
    }
  }

  /* Las calles son el contorno de cada manzana: así quedan recortadas
     exactamente a la mancha urbana, sin sobresalir hacia el campo. */
  mundo.radioUrbano = R;
  mundo.predio = { x0: -200, y0: -145, x1: 200, y1: 145 };
  mundo.paso = paso;

  _mundos.set(proyecto.id, mundo);
  return mundo;
}

/* ============================================================================
   RENDER DE UN NIVEL SATELITAL → devuelve un <canvas> listo para mostrar
   ============================================================================ */
function generarVistaSatelital(proyecto, nivel, ancho, alto) {
  const mundo = obtenerMundo(proyecto);
  const info = NIVELES[nivel];
  const cv = document.createElement('canvas');
  cv.width = ancho; cv.height = alto;
  const ctx = cv.getContext('2d');

  const escala = ancho / info.metros;                 // píxeles por metro
  const aMundo = (px, py) => [(px - ancho / 2) / escala, (py - alto / 2) / escala];
  const aPantalla = (mx, my) => [mx * escala + ancho / 2, my * escala + alto / 2];

  /* --- 1. Terreno base por ruido ----------------------------------------- */
  const div = 3;
  const bw = Math.ceil(ancho / div), bh = Math.ceil(alto / div);
  const img = ctx.createImageData(bw, bh);
  // Frecuencia fija en metros: el relieve es coherente entre niveles,
  // igual que en una imagen satelital real al hacer zoom.
  const fTerreno = 1 / 9000;
  // Textura fina relativa a la vista: siempre hay grano, en cualquier altura.
  const fGrano = 14 / info.metros;

  for (let py = 0; py < bh; py++) {
    for (let px = 0; px < bw; px++) {
      const [mx, my] = aMundo(px * div, py * div);
      const n1 = ruidoFractal(mx * fTerreno, my * fTerreno, mundo.semilla, 5);
      const n2 = ruidoFractal(mx * fGrano, my * fGrano, mundo.semilla + 31, 3);
      let c;
      if (n1 < 0.40)      c = mezclar(PALETA.vegetacion, PALETA.monte, (n1 / 0.40));
      else if (n1 < 0.54) c = mezclar(PALETA.monte, PALETA.cultivo, (n1 - 0.40) / 0.14);
      else if (n1 < 0.70) c = mezclar(PALETA.cultivo, PALETA.suelo, (n1 - 0.54) / 0.16);
      else                c = mezclar(PALETA.suelo, PALETA.urbano, (n1 - 0.70) / 0.30);
      const grano = (n2 - 0.5) * 22;
      const i = (py * bw + px) * 4;
      img.data[i]     = Math.max(0, Math.min(255, c[0] + grano));
      img.data[i + 1] = Math.max(0, Math.min(255, c[1] + grano));
      img.data[i + 2] = Math.max(0, Math.min(255, c[2] + grano));
      img.data[i + 3] = 255;
    }
  }
  const tmp = document.createElement('canvas');
  tmp.width = bw; tmp.height = bh;
  tmp.getContext('2d').putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(tmp, 0, 0, ancho, alto);

  /* --- 2. Parcelas agrícolas rectangulares -------------------------------- */
  const TONOS_CAMPO = [
    [132, 142,  80], [108, 126,  64], [164, 156,  96],
    [ 94, 114,  60], [184, 168, 116], [ 80, 102,  56]
  ];
  mundo.campos.forEach(c => {
    const [sx, sy] = aPantalla(c.x, c.y);
    const sw = c.w * escala, sh = c.h * escala;
    if (sw < 1.5 || sx < -sw * 2 || sy < -sh * 2 || sx > ancho + sw * 2 || sy > alto + sh * 2) return;
    const col = TONOS_CAMPO[Math.floor(c.tono * TONOS_CAMPO.length) % TONOS_CAMPO.length];
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(c.ang);
    ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},0.72)`;
    ctx.fillRect(-sw / 2, -sh / 2, sw, sh);
    if (sw > 26) {
      ctx.strokeStyle = 'rgba(0,0,0,0.20)';
      ctx.lineWidth = 1;
      ctx.strokeRect(-sw / 2, -sh / 2, sw, sh);
    }
    ctx.restore();
  });

  /* --- 3. Manchas de monte ------------------------------------------------ */
  mundo.monte.forEach(m => {
    const [sx, sy] = aPantalla(m.x, m.y);
    const r = m.r * escala;
    if (r < 2 || sx < -r || sy < -r || sx > ancho + r || sy > alto + r) return;
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
    const c = PALETA.vegetacion;
    g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${m.d})`);
    g.addColorStop(0.65, `rgba(${c[0]},${c[1]},${c[2]},${m.d * 0.55})`);
    g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill();
  });

  /* --- 4. Río ------------------------------------------------------------- */
  if (mundo.rio.length > 1) {
    ctx.strokeStyle = `rgba(${PALETA.agua[0]},${PALETA.agua[1]},${PALETA.agua[2]},0.92)`;
    ctx.lineWidth = Math.max(1.2, 80 * escala);
    ctx.lineJoin = ctx.lineCap = 'round';
    ctx.beginPath();
    mundo.rio.forEach((p, i) => {
      const [sx, sy] = aPantalla(p[0], p[1]);
      i === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
    });
    ctx.stroke();
  }

  /* --- 5. Mancha urbana: manzanas, calles y edificaciones ----------------- */
  ctx.save();
  ctx.translate(ancho / 2, alto / 2);
  ctx.rotate(mundo.giro);
  ctx.scale(escala, escala);     // a partir de aquí se dibuja en metros

  const visibleM = info.metros / 2 * 1.5;
  const enCuadro = c => !(c.x1 < -visibleM || c.x0 > visibleM || c.y1 < -visibleM || c.y0 > visibleM);

  /* Relleno de manzanas */
  mundo.celdas.forEach(c => {
    if (!enCuadro(c)) return;
    let col, alfa;
    if (c.tipo === 'verde')       { col = PALETA.vegetacion; alfa = 0.66; }
    else if (c.tipo === 'baldio') { col = PALETA.suelo;      alfa = 0.52; }
    else if (c.tipo === 'predio') { col = PALETA.suelo;      alfa = 0.60; }
    else {
      col = mezclar(PALETA.urbano, PALETA.suelo, c.tono);
      alfa = (c.tipo === 'denso' ? 0.58 : 0.40) + c.tono * 0.22;
    }
    ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${alfa})`;
    ctx.fillRect(c.x0, c.y0, c.x1 - c.x0, c.y1 - c.y0);
  });

  /* Calles: contorno de cada manzana (queda recortado a la mancha urbana) */
  if (8 * escala > 0.30) {
    ctx.strokeStyle = `rgba(${PALETA.asfalto[0]},${PALETA.asfalto[1]},${PALETA.asfalto[2]},${nivel <= 1 ? 0.55 : 0.85})`;
    ctx.lineWidth = Math.max(9, 0.7 / escala);
    ctx.lineJoin = 'miter';
    mundo.celdas.forEach(c => {
      if (!enCuadro(c)) return;
      ctx.strokeRect(c.x0, c.y0, c.x1 - c.x0, c.y1 - c.y0);
    });
  }

  /* Edificaciones: sólo con zoom suficiente para que se distingan */
  if (nivel >= 2) {
    mundo.celdas.forEach(c => {
      if (!enCuadro(c) || !c.edificios.length) return;
      c.edificios.forEach(e => {
        const col = mezclar(PALETA.techo, PALETA.urbano, e.tono);
        ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},0.9)`;
        ctx.fillRect(e.x, e.y, e.w, e.h);
      });
    });
  }

  /* --- El predio del proyecto: terreno limpio y amanzanado ---------------- */
  const P = mundo.predio;
  if (P) {
    const pw = P.x1 - P.x0, ph = P.y1 - P.y0;

    // Terreno desmontado, más claro que el entorno.
    ctx.fillStyle = 'rgba(146,126,96,0.88)';
    ctx.fillRect(P.x0, P.y0, pw, ph);

    if (nivel >= 2) {
      // Calles internas del proyecto.
      ctx.strokeStyle = 'rgba(96,86,74,0.95)';
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.moveTo(P.x0, 0); ctx.lineTo(P.x1, 0);
      ctx.moveTo(0, P.y0); ctx.lineTo(0, P.y1);
      ctx.stroke();

      // Subdivisión en lotes.
      ctx.strokeStyle = 'rgba(255,255,255,0.30)';
      ctx.lineWidth = Math.max(0.8, 1.1 / escala);
      for (let x = P.x0; x <= P.x1 + 0.1; x += pw / 12) {
        ctx.beginPath(); ctx.moveTo(x, P.y0); ctx.lineTo(x, P.y1); ctx.stroke();
      }
      for (let y = P.y0; y <= P.y1 + 0.1; y += ph / 8) {
        ctx.beginPath(); ctx.moveTo(P.x0, y); ctx.lineTo(P.x1, y); ctx.stroke();
      }
    }

    // Borde del predio, siempre visible.
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = Math.max(1.2, 1.6 / escala);
    ctx.strokeRect(P.x0, P.y0, pw, ph);
  }
  ctx.restore();

  /* --- 6. Carreteras principales ------------------------------------------ */
  mundo.vias.forEach(v => {
    const [ax, ay] = aPantalla(v.a[0], v.a[1]);
    const [bx, by] = aPantalla(v.b[0], v.b[1]);
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(26,26,28,0.8)';
    ctx.lineWidth = Math.max(1.6, v.ancho * escala * 1.5);
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    ctx.strokeStyle = 'rgba(188,182,170,0.72)';
    ctx.lineWidth = Math.max(0.9, v.ancho * escala * 0.85);
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
  });

  /* --- 7. Viñeteado sutil para que el texto encima se lea ---------------- */
  const vin = ctx.createRadialGradient(ancho / 2, alto / 2, alto * 0.30, ancho / 2, alto / 2, alto * 1.05);
  vin.addColorStop(0, 'rgba(0,0,0,0)');
  vin.addColorStop(1, 'rgba(0,0,0,0.24)');
  ctx.fillStyle = vin;
  ctx.fillRect(0, 0, ancho, alto);

  return cv;
}

/* Geometría real del predio, para que el recuadro rojo que dibuja la interfaz
   coincida exactamente con el terreno del render. */
function geometriaPredio(proyecto, nivel) {
  const m = obtenerMundo(proyecto);
  return {
    anchoM: m.predio.x1 - m.predio.x0,
    altoM:  m.predio.y1 - m.predio.y0,
    giro:   m.giro,
    metros: NIVELES[nivel].metros
  };
}

/* Dimensiones con las que se renderiza cada nivel (las usa el marcador). */
const SAT_ANCHO = 1500, SAT_ALTO = 860;

/* ============================================================================
   PLANO DE LOTES
   ============================================================================ */
function generarLotes(proyecto) {
  const cfg = proyecto.plano;
  const rnd = mulberry32(proyecto.semilla + 4242);
  const cats = cfg.categorias || ['Estándar'];
  const lotes = [];

  for (let m = 0; m < cfg.manzanas; m++) {
    for (let l = 0; l < cfg.lotesPorManzana; l++) {
      const r = rnd();
      // Centro comercial y otros proyectos "de disposición": no se marca
      // disponible/reservado/vendido, cada área tiene su propio precio y
      // sólo interesa mostrar la distribución física.
      const estado = cfg.disposicion ? 'unidad'
                   : proyecto.pendiente ? 'disponible'
                   : r < 0.46 ? 'disponible'
                   : r < 0.63 ? 'reservado'
                   : 'vendido';
      const esEsquina = (l === 0 || l === cfg.lotesPorManzana - 1 ||
                         l === cfg.lotesPorManzana / 2 - 1 || l === cfg.lotesPorManzana / 2);
      const catIdx = esEsquina && cats.length > 1
        ? cats.length - 1
        : Math.floor(rnd() * Math.max(1, cats.length - 1));
      const base = cfg.superficieBase || 300;
      const superficie = Math.round((base + rnd() * (cfg.superficieRango || 180)) / 5) * 5;

      lotes.push({
        codigo: `${cfg.prefijo}-${String(m + 1).padStart(2, '0')}-${String(l + 1).padStart(2, '0')}`,
        manzana: m + 1,
        numero: l + 1,
        superficie,
        categoria: cats[catIdx] || cats[0],
        estado
      });
    }
  }
  return lotes;
}

const COLOR_ESTADO = {
  /* Colores calibrados para leerse sobre el plano blanco */
  disponible: { relleno: '#1E9E5A', borde: '#177C46', texto: 'Disponible' },
  reservado:  { relleno: '#D79626', borde: '#B87D18', texto: 'Reservado'  },
  vendido:    { relleno: '#CBD3DE', borde: '#AEB8C6', texto: 'Vendido'    },
  // Proyectos "de disposición": un solo color neutro para todas las áreas.
  unidad:     { relleno: '#3E7CB8', borde: '#2F5F8F', texto: 'Unidad'     }
};

function construirPlanoSVG(proyecto, lotes, proporcionObjetivo) {
  const cfg = proyecto.plano;
  const NS = 'http://www.w3.org/2000/svg';
  const porFila = Math.ceil(cfg.lotesPorManzana / 2);

  const anchoLote = 38, altoLote = 72, calle = 52, margen = 44;
  const anchoMz = porFila * anchoLote;
  const altoMz = altoLote * 2;

  /* Se elige la distribución de manzanas cuya proporción se acerque más a la
     del contenedor real, para que los lotes salgan lo más grandes posible y
     sean cómodos de tocar. En una pantalla horizontal las manzanas quedan en
     fila; en un tótem vertical se apilan solas. */
  const objetivo = proporcionObjetivo && isFinite(proporcionObjetivo) && proporcionObjetivo > 0.15
    ? proporcionObjetivo : 2.05;

  const dims = c => ({
    cols: c,
    filas: Math.ceil(cfg.manzanas / c),
    W: margen * 2 + c * anchoMz + (c - 1) * calle,
    H: margen * 2 + Math.ceil(cfg.manzanas / c) * altoMz +
       (Math.ceil(cfg.manzanas / c) - 1) * calle + 52
  });
  // Se compara en escala logarítmica: así una proporción del doble y una de la
  // mitad se penalizan igual, y no gana siempre la distribución más ancha.
  const error = d => Math.abs(Math.log((d.W / d.H) / objetivo));
  let mejor = dims(1);
  for (let c = 2; c <= cfg.manzanas; c++) {
    const d = dims(c);
    if (error(d) < error(mejor)) mejor = d;
  }
  const { cols, filas, W, H } = mejor;

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('class', 'plano-svg');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  const crear = (tag, attrs) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  };

  /* Fondo: terreno + calles */
  svg.appendChild(crear('rect', { x: 0, y: 0, width: W, height: H, fill: '#FFFFFF', rx: 10 }));

  lotes.forEach((lote, idx) => {
    const m = lote.manzana - 1;
    const col = m % cols, fila = Math.floor(m / cols);
    const i = lote.numero - 1;
    const filaLote = i < porFila ? 0 : 1;
    const colLote = i < porFila ? i : i - porFila;

    const x = margen + col * (anchoMz + calle) + colLote * anchoLote;
    const y = margen + fila * (altoMz + calle) + filaLote * altoLote;

    const c = COLOR_ESTADO[lote.estado];
    const g = crear('g', { class: 'lote', 'data-idx': idx, 'data-estado': lote.estado });
    g.appendChild(crear('rect', {
      x: x + 1.5, y: y + 1.5, width: anchoLote - 3, height: altoLote - 3,
      rx: 3, fill: c.relleno, stroke: c.borde, 'stroke-width': 1,
      'fill-opacity': lote.estado === 'vendido' ? 0.55 : 0.85
    }));
    const t = crear('text', {
      x: x + anchoLote / 2, y: y + altoLote / 2 + 4,
      'text-anchor': 'middle', class: 'lote-num'
    });
    t.textContent = lote.numero;
    g.appendChild(t);
    svg.appendChild(g);
  });

  /* Etiquetas de manzana */
  for (let m = 0; m < cfg.manzanas; m++) {
    const col = m % cols, fila = Math.floor(m / cols);
    const x = margen + col * (anchoMz + calle) + anchoMz / 2;
    const y = margen + fila * (altoMz + calle) - 12;
    const t = crear('text', { x, y, 'text-anchor': 'middle', class: 'mz-label' });
    t.textContent = `MANZANA ${m + 1}`;
    svg.appendChild(t);
  }

  /* Rosa de los vientos */
  const gN = crear('g', { transform: `translate(${W - margen - 6}, ${H - 34})` });
  const n = crear('text', { x: 0, y: 0, 'text-anchor': 'middle', class: 'norte' });
  n.textContent = 'N ▲';
  gN.appendChild(n);
  svg.appendChild(gN);

  return svg;
}

/* ============================================================================
   MAPA DE PUNTOS DE REFERENCIA (esquemático, legible a distancia)
   ============================================================================ */
const ICONOS = {
  via:      'M4 20 L20 4 M8 20 L24 4',
  colegio:  'M4 11 L14 5 L24 11 L14 17 Z M20 13 v6',
  salud:    'M11 5 h6 v6 h6 v6 h-6 v6 h-6 v-6 H5 v-6 h6 Z',
  comercio: 'M5 10 h18 l-2 12 H7 Z M10 10 V6 a4 4 0 0 1 8 0 v4',
  plaza:    'M14 4 a10 10 0 1 0 0.1 0 M14 9 v10 M9 14 h10'
};

function construirMapaReferencias(proyecto) {
  const NS = 'http://www.w3.org/2000/svg';
  const W = 1000, H = 620, cx = W / 2, cy = H / 2;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('class', 'refs-svg');
  const crear = (tag, attrs, txt) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    if (txt != null) el.textContent = txt;
    return el;
  };

  /* Anillos de distancia, rotulados en diagonal para no chocar con los pines */
  [1, 2, 3].forEach(i => {
    const r = i * 88;
    svg.appendChild(crear('circle', {
      cx, cy, r, fill: 'none',
      stroke: 'rgba(0,0,0,0.10)', 'stroke-width': 1,
      'stroke-dasharray': '4 8'
    }));
    svg.appendChild(crear('text', {
      x: cx + r * 0.72, y: cy - r * 0.68, class: 'anillo', 'text-anchor': 'middle'
    }, `${i} km`));
  });

  /* Puntos de referencia. El radio mínimo evita que los más cercanos
     se monten sobre el marcador central. */
  proyecto.referencias.forEach((r, i) => {
    const km = parseFloat(String(r.distancia).replace(/[^0-9.]/g, '')) || (i + 1) * 0.8;
    const radio = Math.min(268, Math.max(124, 46 + km * 74));
    const a = (r.angulo || i * 70) * Math.PI / 180;
    const x = cx + Math.cos(a) * radio;
    const y = cy + Math.sin(a) * radio;

    svg.appendChild(crear('line', {
      x1: cx, y1: cy, x2: x, y2: y,
      stroke: 'rgba(227,51,62,0.30)', 'stroke-width': 1.5, 'stroke-dasharray': '3 6'
    }));

    const g = crear('g', { transform: `translate(${x},${y})`, class: 'ref-pin' });
    g.appendChild(crear('circle', { cx: 0, cy: 0, r: 27, fill: '#FFFFFF', stroke: 'rgba(0,0,0,0.14)', 'stroke-width': 1.5 }));
    const icono = crear('path', {
      d: ICONOS[r.icono] || ICONOS.plaza,
      transform: 'translate(-14,-14)', fill: 'none',
      stroke: '#E3333E', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'
    });
    g.appendChild(icono);
    g.appendChild(crear('text', { x: 0, y: 48, 'text-anchor': 'middle', class: 'ref-nombre' }, r.nombre));
    g.appendChild(crear('text', { x: 0, y: 70, 'text-anchor': 'middle', class: 'ref-dist' }, r.distancia));
    svg.appendChild(g);
  });

  /* Marcador del proyecto en el centro */
  const gp = crear('g', { transform: `translate(${cx},${cy})`, class: 'ref-centro' });
  gp.appendChild(crear('circle', { cx: 0, cy: 0, r: 46, fill: 'rgba(227,51,62,0.14)' }));
  gp.appendChild(crear('circle', { cx: 0, cy: 0, r: 30, fill: '#E3333E' }));
  gp.appendChild(crear('text', { x: 0, y: 8, 'text-anchor': 'middle', class: 'ref-centro-txt' }, 'AQUÍ'));
  svg.appendChild(gp);

  return svg;
}
