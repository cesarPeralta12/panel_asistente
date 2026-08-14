/* ============================================================================
   INMOL · PANEL INTERACTIVO
   app.js — Navegación, modo atracción y secciones
   ============================================================================ */

const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

const Estado = {
  pantalla: 'atraccion',
  proyecto: null,
  lotes: [],
  loteSel: null,
  filtro: 'todos',
  nivelSat: 0,
  seccion: 'resumen',
  sobrevolando: false,
  temporizadorAtraccion: null,
  temporizadorInactividad: null,
  indiceAtraccion: 0
};

/* Cache de renders satelitales: se dibuja una vez y se reutiliza siempre. */
const _cacheSat = new Map();
function canvasSatelital(proyecto, nivel, ancho, alto) {
  const clave = `${proyecto.id}|${nivel}|${ancho}x${alto}`;
  if (!_cacheSat.has(clave)) {
    _cacheSat.set(clave, generarVistaSatelital(proyecto, nivel, ancho, alto));
  }
  // Se devuelve una copia para poder tener el mismo nivel en varios lugares.
  const origen = _cacheSat.get(clave);
  const copia = document.createElement('canvas');
  copia.width = origen.width; copia.height = origen.height;
  copia.getContext('2d').drawImage(origen, 0, 0);
  return copia;
}

/* Fotografía real del proyecto; si falta, la vista satelital generada.
   `variante` permite que cada pasada del modo atracción muestre otra foto. */
function medioDeFondo(proyecto, variante, ancho, alto) {
  const fotos = proyecto.fotos || [];
  if (!fotos.length) return canvasSatelital(proyecto, 2, ancho, alto);
  const img = document.createElement('img');
  img.src = fotos[Math.abs(variante || 0) % fotos.length];
  img.alt = '';
  // Si la foto no carga, no se deja un hueco: se dibuja el satelital.
  img.addEventListener('error', () => {
    const cv = canvasSatelital(proyecto, 2, ancho, alto);
    cv.className = img.className;
    img.replaceWith(cv);
  }, { once: true });
  return img;
}

/* ============================================================================
   ICONOS DE PESTAÑA
   ============================================================================ */
const ICONO_TAB = {
  resumen:     'M4 6h16M4 12h16M4 18h10',
  ubicacion:   'M12 21s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12z M12 9.5a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z',
  referencias: 'M12 3v18M3 12h18M12 3a9 9 0 0 1 0 18 9 9 0 0 1 0-18z',
  lotes:       'M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v4H4zM14 15h6v4h-6z',
  avance:      'M4 19h16M6 19V11M11 19V6M16 19v-9'
};

/* «Qué hay cerca» se fusionó dentro de «Ubicación»: los puntos de referencia
   ahora son pines sobre el mismo mapa, no una sección aparte. */
const SECCIONES = [
  { id: 'resumen',   etiqueta: 'Resumen' },
  { id: 'ubicacion', etiqueta: 'Ubicación' },
  { id: 'lotes',     etiqueta: 'Disponibilidad' },
  { id: 'avance',    etiqueta: 'Avance de obra' }
];

function svgIcono(d, tam = 22) {
  return `<svg viewBox="0 0 24 24" width="${tam}" height="${tam}">
    <path d="${d}" fill="none" stroke="currentColor" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/* ============================================================================
   NAVEGACIÓN ENTRE PANTALLAS
   ============================================================================ */
function irA(pantalla) {
  $$('.pantalla').forEach(p => p.classList.toggle('activa', p.id === pantalla));
  Estado.pantalla = pantalla;

  if (pantalla === 'atraccion') iniciarAtraccion();
  else detenerAtraccion();

  reiniciarInactividad();
}

/* ============================================================================
   1. MODO ATRACCIÓN
   ============================================================================ */
function iniciarAtraccion() {
  detenerAtraccion();
  Estado.indiceAtraccion = 0;
  pintarPuntosAtraccion();
  mostrarSlideAtraccion(0);
}

function detenerAtraccion() {
  clearTimeout(Estado.temporizadorAtraccion);
  Estado.temporizadorAtraccion = null;
}

function pintarPuntosAtraccion() {
  $('#atrPuntos').innerHTML = PANEL.proyectos
    .map(() => '<div class="atr-punto"></div>').join('');
}

function mostrarSlideAtraccion(i) {
  const p = PANEL.proyectos[i];
  const fondo = $('#atrFondo');
  const segundos = PANEL.config.segundosPorSlide;

  /* Fondo: fotografía real del proyecto con efecto Ken Burns.
     Si el proyecto todavía no tiene fotos, cae a la vista satelital generada. */
  const cv = medioDeFondo(p, i, 1400, 800);
  fondo.appendChild(cv);
  requestAnimationFrame(() => {
    cv.classList.add('visible');
    const previos = Array.from(fondo.children).slice(0, -1);
    previos.forEach(c => {
      c.classList.remove('visible');
      setTimeout(() => c.remove(), 1700);
    });
  });

  /* Texto */
  $('#atrKicker').textContent = `Proyecto ${i + 1} de ${PANEL.proyectos.length} · ${p.tipo}`;
  $('#atrTitulo').textContent = p.nombre;
  $('#atrClaim').textContent = p.claim;
  $('#atrDatos').innerHTML = p.destacados.slice(0, 3)
    .map(d => `<div class="atr-dato"><b>${d.valor}</b><span>${d.etiqueta}</span></div>`).join('');

  const centro = $('.atr-centro');
  centro.classList.remove('atr-anim', 'entrar');
  void centro.offsetWidth;                       // fuerza reinicio de la animación
  centro.classList.add('atr-anim', 'entrar');

  /* Barra de progreso del slide */
  $$('.atr-punto').forEach((pt, j) => {
    pt.style.setProperty('--dur', segundos + 's');
    pt.classList.remove('on');
    if (j === i) { void pt.offsetWidth; pt.classList.add('on'); }
  });

  Estado.indiceAtraccion = i;
  if (QUIETO) return;
  Estado.temporizadorAtraccion = setTimeout(
    () => mostrarSlideAtraccion((i + 1) % PANEL.proyectos.length),
    segundos * 1000
  );
}

/* ============================================================================
   2. MENÚ DE PROYECTOS
   ============================================================================ */
function construirMenu() {
  $('#pieWeb').textContent = PANEL.empresa.web;
  $('#pieTel').textContent = PANEL.empresa.telefono;

  const cont = $('#tarjetas');
  cont.innerHTML = '';

  PANEL.proyectos.forEach(p => {
    const t = document.createElement('button');
    t.className = 'tarjeta';
    t.innerHTML = `
      ${p.pendiente ? '<span class="tj-pendiente">Contenido pendiente</span>' : ''}
      <div class="tj-cuerpo">
        <span class="tj-tipo">${p.tipo}</span>
        <h3 class="tj-nombre">${p.nombre}</h3>
        <p class="tj-sub">${p.subtitulo}</p>
        <div class="tj-datos">
          ${p.destacados.slice(0, 2).map(d =>
            `<div class="tj-dato"><b>${d.valor}</b><span>${d.etiqueta}</span></div>`).join('')}
        </div>
      </div>
      <div class="tj-flecha">${svgIcono('M5 12h13M13 6l6 6-6 6', 20)}</div>`;

    t.prepend(medioDeFondo(p, 0, 760, 900));

    t.addEventListener('pointerdown', () => t.classList.add('pulsada'));
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev =>
      t.addEventListener(ev, () => setTimeout(() => t.classList.remove('pulsada'), 160)));
    t.addEventListener('click', () => abrirProyecto(p.id));

    cont.appendChild(t);
  });
}

/* ============================================================================
   3. PANTALLA DE PROYECTO
   ============================================================================ */
function abrirProyecto(id, seccion = 'resumen') {
  const p = PANEL.proyectos.find(x => x.id === id);
  if (!p) return;

  Estado.proyecto = p;
  Estado.lotes = generarLotes(p);
  Estado.loteSel = null;
  Estado.filtro = 'todos';

  $('#proyNombre').textContent = p.nombre;
  $('#proySub').textContent = `${p.subtitulo} · ${p.tipo}`;

  construirTabs();
  llenarResumen(p);
  prepararUbicacion(p);
  llenarReferencias(p);
  llenarLotes(p);
  llenarAvance(p);

  irA('proyecto');
  mostrarSeccion(seccion);
}

function construirTabs() {
  const nav = $('#tabs');
  nav.innerHTML = '';
  SECCIONES.forEach(s => {
    const b = document.createElement('button');
    b.className = 'tab';
    b.dataset.sec = s.id;
    b.innerHTML = svgIcono(ICONO_TAB[s.id], 20) + `<span>${s.etiqueta}</span>`;
    b.addEventListener('click', () => mostrarSeccion(s.id));
    nav.appendChild(b);
  });
}

function mostrarSeccion(id) {
  Estado.seccion = id;
  $$('.tab').forEach(t => t.classList.toggle('activa', t.dataset.sec === id));
  $$('.pane').forEach(p => p.classList.toggle('activa', p.dataset.pane === id));

  if (id === 'ubicacion') {
    setTimeout(() => { ajustarMarcadorSat(); MapaReal.redimensionar(); }, 60);
  }
  if (id === 'avance')    { setTimeout(() => animarAvance(), 120); }
  reiniciarInactividad();
}

/* --- 3.1 Resumen --------------------------------------------------------- */
function llenarResumen(p) {
  $('#resClaim').textContent = p.claim;
  $('#resDesc').textContent = p.descripcion;
  $('#resServicios').innerHTML = p.servicios.map(s => `<li>${s}</li>`).join('');

  /* Recuento real de unidades a partir del plano generado */
  const total = Estado.lotes.length;
  const disp  = Estado.lotes.filter(l => l.estado === 'disponible').length;
  const dest  = p.destacados.map(d => ({ ...d }));
  if (!p.pendiente) {
    dest[0] = { valor: String(total), etiqueta: `${p.plano.unidadPlural} totales` };
    dest[1] = { valor: String(disp),  etiqueta: `${p.plano.unidadPlural} disponibles` };
  }
  $('#resDestacados').innerHTML = dest
    .map(d => `<div class="dest"><b>${d.valor}</b><span>${d.etiqueta}</span></div>`).join('');

  /* Galería: el video del proyecto arriba y sus fotografías reales debajo */
  const gal = $('#resGaleria');
  gal.innerHTML = '';

  if (p.video) {
    const marco = document.createElement('div');
    marco.className = 'foto foto-video';
    const v = document.createElement('video');
    v.src = p.video;
    v.muted = true;          // en feria el audio molesta y no se escucha
    v.loop = true;
    v.playsInline = true;
    v.autoplay = true;
    v.preload = 'auto';
    v.addEventListener('error', () => marco.remove(), { once: true });
    marco.appendChild(v);
    const etq = document.createElement('span');
    etq.className = 'foto-etq';
    etq.textContent = 'Video del proyecto';
    marco.appendChild(etq);
    gal.appendChild(marco);
  }

  (p.fotos || []).slice(0, p.video ? 4 : 5).forEach(ruta => {
    const d = document.createElement('div');
    d.className = 'foto';
    const img = document.createElement('img');
    img.src = ruta;
    img.alt = '';
    img.addEventListener('error', () => d.remove(), { once: true });
    d.appendChild(img);
    gal.appendChild(d);
  });
}

/* --- 3.2 Ubicación: vista satelital por niveles --------------------------- */
function prepararUbicacion(p) {
  const esc = $('#satEscenario');
  esc.querySelectorAll('canvas').forEach(c => c.remove());
  Estado.nivelSat = 0;

  /* Se intenta el mapa real; si no hay internet, sigue la vista generada. */
  Estado.usaMapaReal = MapaReal.crear($('#mapaReal'), p);
  MapaReal.alFallar = () => {                       // las teselas no cargaron
    if (!Estado.usaMapaReal) return;
    Estado.usaMapaReal = false;
    aplicarModoMapa(p);
    pintarNivelSat(Estado.nivelSat, null);
  };
  aplicarModoMapa(p);
  if (Estado.usaMapaReal) { setTimeout(() => MapaReal.redimensionar(), 60); }

  const lista = $('#satNiveles');
  lista.innerHTML = '';
  NIVELES.forEach(n => {
    const b = document.createElement('button');
    b.className = 'sat-nivel';
    b.dataset.nivel = n.id;
    b.innerHTML = `<i>${n.id + 1}</i><div><b>${n.nombre}</b><span>${n.detalle}</span></div>`;
    b.addEventListener('click', () => cambiarNivelSat(n.id));
    lista.appendChild(b);
  });

  $('#satDireccion').textContent = p.direccion;
  const c = p.coordenadas;
  $('#satCoord').textContent =
    `${Math.abs(c.lat).toFixed(4)}° ${c.lat < 0 ? 'S' : 'N'}   ·   ${Math.abs(c.lng).toFixed(4)}° ${c.lng < 0 ? 'O' : 'E'}`;

  if (!Estado.usaMapaReal) pintarNivelSat(0, null);
}

/* Muestra el mapa real o la vista satelital generada, y los controles que
   correspondan a cada uno. */
function aplicarModoMapa(p) {
  const real = Estado.usaMapaReal;
  $('#mapaReal').hidden = !real;
  $('#satMarcador').hidden = real;      // el mapa real trae su propio pin
  $('#satNiveles').hidden = real;
  $('#btnSobrevuelo').hidden = real;
  $('#btnVerTodo').hidden = !real;
  $('#btnAcercar').hidden = !real;

  $('#satNivelNombre').textContent = real ? 'Ubicación' : NIVELES[0].nombre;
  $('#satNivelDet').textContent = real
    ? `${(p.referencias || []).length} puntos de referencia`
    : NIVELES[0].detalle;
  $('.sat-atrib').textContent = real
    ? 'OpenStreetMap · mapa navegable'
    : 'Vista satelital · imagen precargada · sin conexión';
}

function pintarNivelSat(nivel, direccion) {
  const p = Estado.proyecto;
  const esc = $('#satEscenario');
  const anterior = esc.querySelector('canvas.visible');

  const cv = canvasSatelital(p, nivel, 1500, 860);
  if (direccion === 'adentro') cv.classList.add('entrando-adentro');
  if (direccion === 'afuera')  cv.classList.add('entrando-afuera');
  esc.insertBefore(cv, esc.firstChild);

  requestAnimationFrame(() => requestAnimationFrame(() => {
    cv.classList.remove('entrando-adentro', 'entrando-afuera');
    cv.classList.add('visible');
    if (anterior) {
      anterior.classList.remove('visible');
      anterior.classList.add(direccion === 'afuera' ? 'saliendo-afuera' : 'saliendo-adentro');
      setTimeout(() => anterior.remove(), 1300);
    }
  }));

  const info = NIVELES[nivel];
  $('#satNivelNombre').textContent = info.nombre;
  $('#satNivelDet').textContent = info.detalle;
  $$('.sat-nivel').forEach(b => b.classList.toggle('activo', +b.dataset.nivel === nivel));

  Estado.nivelSat = nivel;
  ajustarMarcadorSat();
}

function ajustarMarcadorSat() {
  const esc = $('#satEscenario');
  const caja = $('.sat-caja');
  if (!esc || !caja || !Estado.proyecto) return;

  const g = geometriaPredio(Estado.proyecto, Estado.nivelSat);

  /* El canvas se muestra con object-fit:cover; se replica ese cálculo para
     que el recuadro caiga justo sobre el terreno dibujado. */
  const escala = Math.max(esc.clientWidth / SAT_ANCHO, esc.clientHeight / SAT_ALTO);
  const pxPorMetro = escala * (SAT_ANCHO / g.metros);

  caja.style.width  = Math.max(10, g.anchoM * pxPorMetro) + 'px';
  caja.style.height = Math.max(8,  g.altoM  * pxPorMetro) + 'px';
  caja.style.transform = `translate(-50%, -50%) rotate(${g.giro}rad)`;
  caja.style.opacity = Estado.nivelSat === 0 ? '0.6' : '1';
}

function cambiarNivelSat(nivel) {
  // Con el mapa real activo no existen los niveles de la vista generada.
  if (Estado.usaMapaReal) return;
  if (nivel === Estado.nivelSat) return;
  const dir = nivel > Estado.nivelSat ? 'adentro' : 'afuera';
  pintarNivelSat(nivel, dir);
  reiniciarInactividad();
}

function sobrevuelo() {
  if (Estado.sobrevolando) return;
  Estado.sobrevolando = true;
  $('#btnSobrevuelo').disabled = true;

  pintarNivelSat(0, 'afuera');
  let n = 0;
  const paso = () => {
    n++;
    if (n > 3) {
      Estado.sobrevolando = false;
      $('#btnSobrevuelo').disabled = false;
      return;
    }
    pintarNivelSat(n, 'adentro');
    setTimeout(paso, 1700);
  };
  setTimeout(paso, 1100);
}

/* --- 3.3 Referencias ----------------------------------------------------- */
/* Lista de referencias dentro de la ficha de ubicación. Tocar una lleva el
   mapa hasta ese pin. */
function llenarReferencias(p) {
  const lista = $('#satRefs');
  lista.innerHTML = '';
  (p.referencias || []).forEach((r, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<b>${r.nombre}</b><span>${r.distancia}</span>`;
    li.addEventListener('click', () => {
      $$('#satRefs li').forEach(o => o.classList.remove('activa'));
      li.classList.add('activa');
      MapaReal.irAReferencia(i);
    });
    lista.appendChild(li);
  });
}

/* --- 3.4 Lotes ----------------------------------------------------------- */
function llenarLotes(p) {
  const cont = $('#planoCont');
  cont.innerHTML = '';
  /* El plano se arma según la forma real del hueco disponible: en horizontal
     las manzanas quedan en fila, en un tótem vertical se apilan. */
  const proporcion = cont.clientHeight > 0 ? cont.clientWidth / cont.clientHeight : 0;
  const svg = construirPlanoSVG(p, Estado.lotes, proporcion);
  cont.appendChild(svg);

  svg.querySelectorAll('.lote').forEach(g => {
    g.addEventListener('click', () => seleccionarLote(+g.dataset.idx));
  });

  const cuenta = e => Estado.lotes.filter(l => l.estado === e).length;
  $('#cntDisp').textContent = cuenta('disponible');
  $('#cntRes').textContent  = cuenta('reservado');
  $('#cntVen').textContent  = cuenta('vendido');

  const filtros = [
    { id: 'todos',      etq: 'Todos' },
    { id: 'disponible', etq: 'Sólo disponibles' },
    { id: 'reservado',  etq: 'Reservados' },
    { id: 'vendido',    etq: 'Vendidos' }
  ];
  const cf = $('#filtros');
  cf.innerHTML = '';
  filtros.forEach(f => {
    const b = document.createElement('button');
    b.className = 'filtro' + (f.id === 'todos' ? ' activo' : '');
    b.textContent = f.etq;
    b.addEventListener('click', () => aplicarFiltro(f.id, b));
    cf.appendChild(b);
  });

  $('#fichaVacia').hidden = false;
  $('#fichaDatos').hidden = true;
}

function aplicarFiltro(id, boton) {
  Estado.filtro = id;
  $$('.filtro').forEach(b => b.classList.toggle('activo', b === boton));
  $$('.plano-svg .lote').forEach(g => {
    const apagar = id !== 'todos' && g.dataset.estado !== id;
    g.classList.toggle('apagado', apagar);
  });
  reiniciarInactividad();
}

function seleccionarLote(idx) {
  const l = Estado.lotes[idx];
  if (!l) return;
  Estado.loteSel = l;

  $$('.plano-svg .lote').forEach(g => g.classList.toggle('sel', +g.dataset.idx === idx));

  const est = $('#fEstado');
  est.textContent = COLOR_ESTADO[l.estado].texto;
  est.className = 'ficha-estado ' + l.estado;

  $('#fCodigo').textContent = l.codigo;
  $('#fManzana').textContent = l.manzana;
  $('#fSuperficie').textContent = `${l.superficie} m²`;
  $('#fCategoria').textContent = l.categoria;

  $('#fichaVacia').hidden = true;
  $('#fichaDatos').hidden = false;
  reiniciarInactividad();
}

/* --- 3.5 Avance ---------------------------------------------------------- */
function llenarAvance(p) {
  $('#avanceEtapas').innerHTML = p.avance.map(e => `
    <div class="etapa-fila ${e.porcentaje >= 100 ? 'completa' : ''}">
      <div class="etapa-nom">${e.etapa}</div>
      <div class="etapa-barra"><div class="etapa-relleno" data-pct="${e.porcentaje}"></div></div>
      <div class="etapa-pct">${e.porcentaje}%</div>
    </div>`).join('');
}

function animarAvance() {
  const p = Estado.proyecto;
  const prom = Math.round(p.avance.reduce((a, e) => a + e.porcentaje, 0) / p.avance.length);

  const circ = 2 * Math.PI * 86;
  const anillo = $('#anilloProg');
  anillo.style.strokeDasharray = `0 ${circ}`;
  requestAnimationFrame(() => {
    anillo.style.strokeDasharray = `${circ * prom / 100} ${circ}`;
  });

  /* Conteo animado del porcentaje */
  const salida = $('#avanceNum');
  let n = 0;
  clearInterval(salida._t);
  salida.textContent = '0';
  salida._t = setInterval(() => {
    n += Math.max(1, Math.round(prom / 28));
    if (n >= prom) { n = prom; clearInterval(salida._t); }
    salida.textContent = n;
  }, 42);

  $$('.etapa-relleno').forEach((el, i) => {
    el.style.transform = 'scaleX(0)';
    setTimeout(() => { el.style.transform = `scaleX(${el.dataset.pct / 100})`; }, 90 + i * 110);
  });
}

/* ============================================================================
   5. INACTIVIDAD — vuelve solo al modo atracción
   ============================================================================ */
/* Modo "quieto": ?quieto=1 congela la rotación y el retorno automático.
   Se usa sólo para tomar capturas de pantalla del panel. */
const QUIETO = new URLSearchParams(location.search).has('quieto');

function reiniciarInactividad() {
  clearTimeout(Estado.temporizadorInactividad);
  if (QUIETO || Estado.pantalla === 'atraccion') return;
  Estado.temporizadorInactividad = setTimeout(() => {
    Estado.proyecto = null;
    irA('atraccion');
  }, PANEL.config.segundosInactividad * 1000);
}

/* ============================================================================
   6. PANEL TÉCNICO (tecla D) — para el montaje y el soporte en feria
   ============================================================================ */
function alternarDiagnostico() {
  const d = $('#diag');
  if (!d.hidden) { d.hidden = true; return; }
  d.hidden = false;
  const refrescar = () => {
    if (d.hidden) return;
    d.innerHTML = `
      <div><b>PANEL INMOL</b> · diagnóstico</div>
      <div>Resolución: ${window.innerWidth} × ${window.innerHeight}</div>
      <div>Pantalla actual: ${Estado.pantalla}</div>
      <div>Proyecto: ${Estado.proyecto ? Estado.proyecto.nombre : '—'}</div>
      <div>Conexión: ${navigator.onLine ? 'con internet' : 'sin internet (correcto)'}</div>
      <div>Renders en caché: ${_cacheSat.size}</div>
      <div style="margin-top:.5rem;color:#5A5A66">A: atracción · M: menú · D: cerrar</div>`;
    setTimeout(refrescar, 1000);
  };
  refrescar();
}

/* ============================================================================
   7. ARRANQUE
   ============================================================================ */
function iniciar() {
  if (QUIETO) document.body.classList.add('sin-animacion');
  $('#aviso').hidden = !PANEL.config.datosDeEjemplo;
  construirMenu();

  /* Modo atracción: cualquier toque abre el menú */
  $('#atraccion').addEventListener('click', () => irA('menu'));

  $('#btnVolver').addEventListener('click', () => { Estado.proyecto = null; irA('menu'); });
  $('#btnSobrevuelo').addEventListener('click', sobrevuelo);
  $('#btnVerTodo').addEventListener('click', () => MapaReal.centrar());
  $('#btnAcercar').addEventListener('click', () => MapaReal.acercar());

  /* Cualquier interacción reinicia el contador de inactividad */
  ['pointerdown', 'keydown', 'wheel'].forEach(ev =>
    document.addEventListener(ev, reiniciarInactividad, { passive: true }));

  /* Si cambia el tamaño o la orientación de la pantalla, se rehace el plano
     para que las manzanas se reacomoden a la nueva forma. */
  let temporizadorMedida;
  window.addEventListener('resize', () => {
    clearTimeout(temporizadorMedida);
    temporizadorMedida = setTimeout(() => {
      if (Estado.seccion === 'ubicacion') { ajustarMarcadorSat(); MapaReal.redimensionar(); }
      if (Estado.proyecto) {
        const sel = Estado.loteSel;
        llenarLotes(Estado.proyecto);
        if (sel) seleccionarLote(Estado.lotes.findIndex(l => l.codigo === sel.codigo));
      }
    }, 220);
  });

  /* Atajos para el operador durante el montaje */
  document.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    if (k === 'd') alternarDiagnostico();
    if (k === 'a') irA('atraccion');
    if (k === 'm') irA('menu');
    if (k === 'escape') irA('menu');
  });

  /* Arranca siempre en modo atracción: al encender la pantalla,
     el panel retoma la presentación solo, sin que nadie toque nada.
     Con un enlace directo (#/proyecto/el-encanto/lotes) se puede abrir
     cualquier vista concreta — útil para pruebas y para capturas. */
  aplicarRuta();
  window.addEventListener('hashchange', aplicarRuta);
}

function aplicarRuta() {
  const ruta = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  if (!ruta) { irA('atraccion'); return; }

  const [destino, proyId, seccion, extra] = ruta.split('/');

  if (destino === 'menu')      { irA('menu'); return; }
  if (destino === 'atraccion') { irA('atraccion'); return; }

  if (destino === 'proyecto' && proyId) {
    abrirProyecto(proyId, seccion || 'resumen');
    if (extra && extra.startsWith('lote-')) {
      setTimeout(() => seleccionarLote(parseInt(extra.slice(5), 10) || 0), 250);
    }
    if (seccion === 'ubicacion' && extra && extra.startsWith('nivel-')) {
      setTimeout(() => cambiarNivelSat(parseInt(extra.slice(6), 10) || 0), 250);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciar);
} else {
  iniciar();
}
