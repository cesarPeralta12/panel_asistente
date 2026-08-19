/* ============================================================================
   INMOL · PANEL INTERACTIVO
   mapa-real.js — Mapa satelital navegable, 100% offline
   ----------------------------------------------------------------------------
   Usa Leaflet (incluido en assets/leaflet/) sobre teselas satelitales reales
   (Esri World Imagery) descargadas de antemano en assets/tiles/<proyecto>/.
   Se puede arrastrar, hacer zoom con dos dedos y tocar cada pin. No depende
   de internet: todas las imágenes ya están en el disco del panel.

   Zoom disponible: 10 (toda la ciudad) a 19 (detalle del predio). Dos capas
   de teselas se combinan según el zoom:
     - assets/tiles/ciudad/       → 10-13, Santa Cruz completa, siempre activa.
     - assets/tiles/<proyecto>/   → 14-19, detalle de cada predio, se cambia
                                    al abrir cada proyecto.
   Así se puede alejar hasta ver la ciudad entera (con los tres proyectos
   marcados) y acercarse de nuevo a cualquiera de ellos. Fuera de ese rango,
   o si faltara alguna tesela puntual, Leaflet deja el cuadro en blanco.
   ============================================================================ */

const MapaReal = {
  mapa: null,
  capaCiudad: null,
  capaBase: null,
  proyectoTeselas: null,   // id del proyecto cuyas teselas están cargadas
  marcadores: [],
  marcadoresOtros: [],     // pines discretos de los demás proyectos
  rutas: [],               // líneas de acceso (ver dibujarRutas)
  disponible: false,
  proyectoActual: null,
  limiteProyecto: null,    // límite de arrastre cuando se está en zoom de detalle

  ZOOM_MIN_CIUDAD: 10,
  ZOOM_MIN_PROYECTO: 14,
  ZOOM_MAX: 19,
  // Radio real cubierto por la descarga de teselas de cada proyecto (ver
  // herramientas de descarga): un poco menor al radio descargado, de margen.
  RADIO_DESCARGADO_M: 7000,
  // Límite de arrastre cuando se está alejado viendo la ciudad: la zona real
  // cubierta por la descarga de assets/tiles/ciudad/, con margen de seguridad.
  LIMITE_CIUDAD: [[-18.38, -64.18], [-17.32, -62.22]],

  /* Leaflet está cargado y el panel tiene el mapa real habilitado */
  sePuedeUsar() {
    return typeof L !== 'undefined' && PANEL.config.mapaReal;
  },

  /* --- Pines ------------------------------------------------------------- */
  iconoProyecto() {
    return L.divIcon({
      className: 'pin-proyecto',
      html: '<span class="pin-halo"></span>' +
            '<svg viewBox="0 0 24 32" width="42" height="56">' +
            '<path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="#E3333E"/>' +
            '<circle cx="12" cy="12" r="4.6" fill="#fff"/></svg>',
      iconSize: [42, 56], iconAnchor: [21, 56]
    });
  },

  /* Pin discreto de los otros proyectos: visible al alejarse, con el nombre
     como etiqueta. Tocarlo abre ese proyecto directamente. */
  iconoProyectoOtro(proyecto) {
    return L.divIcon({
      className: 'pin-otro',
      html: '<span class="pin-otro-circulo"><i></i></span>' +
            `<span class="pin-otro-txt">${proyecto.nombre}</span>`,
      iconSize: [32, 32], iconAnchor: [16, 16]
    });
  },

  iconoReferencia(ref) {
    const d = (typeof ICONOS !== 'undefined' && ICONOS[ref.icono]) || '';
    return L.divIcon({
      className: 'pin-ref',
      html: '<span class="pin-ref-circulo">' +
            `<svg viewBox="0 0 28 28" width="22" height="22"><path d="${d}" fill="none" ` +
            'stroke="#E3333E" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            '</span>' +
            `<span class="pin-ref-txt">${ref.nombre}<b>${ref.distancia}</b></span>`,
      iconSize: [34, 34], iconAnchor: [17, 17]
    });
  },

  /* Ubicación de una referencia. Si INMOL entrega coordenadas reales se usan;
     si no, se deducen del ángulo y la distancia que ya están cargados. */
  posicionReferencia(proyecto, ref) {
    if (ref.coordenadas) return [ref.coordenadas.lat, ref.coordenadas.lng];
    const km = parseFloat(String(ref.distancia).replace(/[^0-9.]/g, '')) || 1;
    const rad = (ref.angulo || 0) * Math.PI / 180;
    const lat = proyecto.coordenadas.lat - (km / 111) * Math.cos(rad);
    const lng = proyecto.coordenadas.lng +
                (km / (111 * Math.cos(proyecto.coordenadas.lat * Math.PI / 180))) * Math.sin(rad);
    return [lat, lng];
  },

  /* --- Construcción ------------------------------------------------------- */
  crear(contenedor, proyecto) {
    if (!this.sePuedeUsar()) return false;

    if (!this.mapa) {
      this.mapa = L.map(contenedor, {
        zoomControl: false,
        attributionControl: true,
        minZoom: this.ZOOM_MIN_CIUDAD,
        maxZoom: this.ZOOM_MAX,
        // En una pantalla táctil de feria: se arrastra y se pellizca, pero no
        // se hace zoom sin querer con la rueda ni doble toque accidental.
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: true,
        dragging: true,
        // No se puede arrastrar más allá del área con teselas descargadas.
        // Viscosidad 1 = tope firme, no "elástico".
        maxBoundsViscosity: 1.0
      });
      L.control.zoom({ position: 'bottomright' }).addTo(this.mapa);

      // Capa de ciudad: siempre presente, cubre todo Santa Cruz en baja
      // resolución (zoom 10-13). La capa de cada proyecto (14-19) se agrega
      // encima cuando corresponde — así se puede alejar hasta ver la ciudad
      // entera y volver a acercarse a cualquiera de los tres proyectos.
      this.capaCiudad = L.tileLayer(
        'assets/tiles/ciudad/{z}/{x}/{y}.jpg',
        {
          minZoom: this.ZOOM_MIN_CIUDAD,
          maxZoom: this.ZOOM_MIN_PROYECTO - 1,
          attribution: '© Esri — Imágenes satelitales precargadas'
        }
      ).addTo(this.mapa);

      // El límite de arrastre depende del zoom: alejado, toda la ciudad;
      // acercado, sólo el área con detalle descargada del proyecto abierto.
      this.mapa.on('zoomend', () => this.actualizarLimites());
      this.actualizarLimites();
    }

    this.cargarTeselas(proyecto);
    this.dibujar(proyecto);
    this.dibujarOtrosProyectos(proyecto);
    this.disponible = true;
    return true;
  },

  /* Cada proyecto tiene su propia carpeta de teselas descargadas
     (assets/tiles/<id>/<z>/<x>/<y>.jpg). Al cambiar de proyecto se cambia
     la capa base para apuntar a la carpeta correspondiente. */
  cargarTeselas(proyecto) {
    if (this.proyectoTeselas === proyecto.id) return;
    if (this.capaBase) this.mapa.removeLayer(this.capaBase);

    this.capaBase = L.tileLayer(
      `assets/tiles/${proyecto.id}/{z}/{x}/{y}.jpg`,
      {
        minZoom: this.ZOOM_MIN_PROYECTO,
        maxZoom: this.ZOOM_MAX,
        attribution: '© Esri — Imágenes satelitales precargadas'
      }
    ).addTo(this.mapa);
    this.proyectoTeselas = proyecto.id;
    this.calcularLimiteProyecto(proyecto);
    this.actualizarLimites();
  },

  /* No dejar que el arrastre saque al usuario del área con teselas
     descargadas: más allá de eso no hay imagen (offline no hay de dónde
     traerla), así que directamente no se puede llegar ahí. */
  calcularLimiteProyecto(proyecto) {
    const { lat, lng } = proyecto.coordenadas;
    const r = this.RADIO_DESCARGADO_M;
    const dLat = r / 111320;
    const dLng = r / (111320 * Math.cos(lat * Math.PI / 180));
    this.limiteProyecto = [
      [lat - dLat, lng - dLng],
      [lat + dLat, lng + dLng]
    ];
  },

  /* En zoom de detalle (14+) el límite es el área descargada del proyecto
     abierto; alejado, el límite es la ciudad completa. */
  actualizarLimites() {
    if (!this.mapa) return;
    const detalle = this.mapa.getZoom() >= this.ZOOM_MIN_PROYECTO && this.limiteProyecto;
    this.mapa.setMaxBounds(detalle ? this.limiteProyecto : this.LIMITE_CIUDAD);
  },

  /* Pines discretos de los proyectos que no son el que está abierto, para
     poder verlos al alejarse. Tocar uno abre ese proyecto. */
  dibujarOtrosProyectos(proyectoActual) {
    this.marcadoresOtros.forEach(m => this.mapa.removeLayer(m));
    this.marcadoresOtros = [];

    (typeof PANEL !== 'undefined' ? PANEL.proyectos : [])
      .filter(p => p.id !== proyectoActual.id)
      .forEach(p => {
        const m = L.marker([p.coordenadas.lat, p.coordenadas.lng], {
          icon: this.iconoProyectoOtro(p)
        }).addTo(this.mapa);
        m.on('click', () => {
          if (typeof abrirProyecto === 'function') abrirProyecto(p.id, 'ubicacion');
        });
        this.marcadoresOtros.push(m);
      });
  },

  /* Rutas de acceso reales (calculadas con OSRM sobre calles reales, ver
     js/rutas.js) desde puntos de referencia hasta el proyecto — el mismo
     "por dónde ir" que muestran los mapas de accesos oficiales de INMOL,
     con una línea gruesa de color y un número al inicio de cada una. */
  dibujarRutas(proyecto) {
    this.rutas.forEach(l => this.mapa.removeLayer(l));
    this.rutas = [];

    const lista = (typeof RUTAS !== 'undefined' ? RUTAS[proyecto.id] : null) || [];
    lista.forEach((ruta, i) => {
      // Trazo blanco debajo, más ancho, para que la línea de color se lea
      // bien sobre cualquier zona de la foto satelital (oscura o clara).
      const casing = L.polyline(ruta.puntos, {
        color: '#FFFFFF', weight: 7, opacity: .85, lineCap: 'round', lineJoin: 'round'
      }).addTo(this.mapa);
      const linea = L.polyline(ruta.puntos, {
        color: ruta.color, weight: 4, opacity: .95, lineCap: 'round', lineJoin: 'round'
      }).addTo(this.mapa).bindPopup(`<b>${ruta.nombre}</b>`);
      this.rutas.push(casing, linea);

      const inicio = ruta.puntos[0];
      const numero = L.marker(inicio, {
        icon: L.divIcon({
          className: 'pin-ruta-num',
          html: `<span style="background:${ruta.color}">${i + 1}</span>`,
          iconSize: [26, 26], iconAnchor: [13, 13]
        }),
        zIndexOffset: 500
      }).addTo(this.mapa).bindPopup(`<b>${ruta.nombre}</b>`);
      this.rutas.push(numero);
    });
  },

  dibujar(proyecto) {
    this.proyectoActual = proyecto;
    this.marcadores.forEach(m => this.mapa.removeLayer(m));
    this.marcadores = [];
    this.dibujarRutas(proyecto);

    const centro = [proyecto.coordenadas.lat, proyecto.coordenadas.lng];

    const principal = L.marker(centro, { icon: this.iconoProyecto(), zIndexOffset: 1000 })
      .addTo(this.mapa)
      .bindPopup(`<b>${proyecto.nombre}</b><br>${proyecto.direccion}`);
    this.marcadores.push(principal);

    (proyecto.referencias || []).forEach(ref => {
      const pos = this.posicionReferencia(proyecto, ref);
      const m = L.marker(pos, { icon: this.iconoReferencia(ref) })
        .addTo(this.mapa)
        .bindPopup(`<b>${ref.nombre}</b><br>a ${ref.distancia} del proyecto`);
      this.marcadores.push(m);
      // Línea punteada del proyecto a cada referencia
      const linea = L.polyline([centro, pos], {
        color: '#E3333E', weight: 1.5, opacity: .45, dashArray: '4 7'
      }).addTo(this.mapa);
      this.marcadores.push(linea);
    });

    this.centrar();
  },

  /* Encuadra el proyecto con todas sus referencias.
     Sin animación: si se llama justo cuando el mapa recién se hace visible
     (tamaño 0 → tamaño real), una transición animada puede quedar a medias
     y el zoom queda mal calculado y pegado ahí. El "vuelo" cinematográfico
     ya lo da sobrevuelo()/acercar(); acá interesa que el encuadre sea exacto. */
  centrar() {
    if (!this.mapa || !this.marcadores.length) return;
    const puntos = this.marcadores.filter(m => m.getLatLng).map(m => m.getLatLng());
    if (puntos.length > 1) {
      this.mapa.fitBounds(L.latLngBounds(puntos), { padding: [90, 90], maxZoom: 16, animate: false });
    } else {
      this.mapa.setView(puntos[0], 16, { animate: false });
    }
  },

  /* Vuela hasta un punto de referencia y abre su etiqueta */
  irAReferencia(indice) {
    if (!this.mapa || !this.proyectoActual) return;
    const ref = (this.proyectoActual.referencias || [])[indice];
    if (!ref) return;
    const pos = this.posicionReferencia(this.proyectoActual, ref);
    this.mapa.flyTo(pos, 16, { duration: 1.6 });
    // Los marcadores se guardan como pin, línea, pin, línea… tras el principal
    const marcador = this.marcadores[1 + indice * 2];
    if (marcador && marcador.openPopup) setTimeout(() => marcador.openPopup(), 1700);
  },

  /* Vuela al proyecto, como el sobrevuelo de la vista satelital */
  acercar() {
    if (!this.mapa || !this.proyectoActual) return;
    const c = this.proyectoActual.coordenadas;
    this.mapa.flyTo([c.lat, c.lng], 17, { duration: 2.2 });
  },

  /* invalidateSize() sólo corrige el tamaño en píxeles del mapa; si el
     encuadre (fitBounds) se calculó antes de que el contenedor tuviera su
     tamaño final en pantalla, el zoom queda mal y hay que recalcularlo. */
  redimensionar() {
    if (!this.mapa) return;
    this.mapa.invalidateSize();
    this.centrar();
  },
};
