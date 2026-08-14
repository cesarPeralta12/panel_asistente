/* ============================================================================
   INMOL · PANEL INTERACTIVO
   mapa-real.js — Mapa satelital navegable, 100% offline
   ----------------------------------------------------------------------------
   Usa Leaflet (incluido en assets/leaflet/) sobre teselas satelitales reales
   (Esri World Imagery) descargadas de antemano en assets/tiles/<proyecto>/.
   Se puede arrastrar, hacer zoom con dos dedos y tocar cada pin. No depende
   de internet: todas las imágenes ya están en el disco del panel.

   Zoom disponible: 12 (contexto de ciudad) a 19 (detalle del predio). Fuera
   de ese rango, o si faltara alguna tesela puntual, Leaflet deja el cuadro
   en blanco — por eso el rango se limita con minZoom/maxZoom.
   ============================================================================ */

const MapaReal = {
  mapa: null,
  capaBase: null,
  proyectoTeselas: null,   // id del proyecto cuyas teselas están cargadas
  marcadores: [],
  disponible: false,
  proyectoActual: null,

  ZOOM_MIN: 12,
  ZOOM_MAX: 19,
  // Radio real cubierto por la descarga de teselas (ver herramientas de
  // descarga): un poco menor al radio descargado, de margen.
  RADIO_DESCARGADO_M: 7000,

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
        minZoom: this.ZOOM_MIN,
        maxZoom: this.ZOOM_MAX,
        // En una pantalla táctil de feria: se arrastra y se pellizca, pero no
        // se hace zoom sin querer con la rueda ni doble toque accidental.
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: true,
        dragging: true,
        // No se puede arrastrar más allá del área con teselas descargadas
        // (se define por proyecto en limitarArrastre). Viscosidad 1 = tope
        // firme, no "elástico".
        maxBoundsViscosity: 1.0
      });
      L.control.zoom({ position: 'bottomright' }).addTo(this.mapa);
    }

    this.cargarTeselas(proyecto);
    this.dibujar(proyecto);
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
        minZoom: this.ZOOM_MIN,
        maxZoom: this.ZOOM_MAX,
        attribution: '© Esri — Imágenes satelitales precargadas'
      }
    ).addTo(this.mapa);
    this.proyectoTeselas = proyecto.id;
    this.limitarArrastre(proyecto);

    // Si a un proyecto le faltara alguna tesela descargada, se avisa una vez.
    // El umbral es alto a propósito: Leaflet precarga teselas fuera del
    // encuadre visible (para que el arrastre se sienta fluido) y algunas
    // pueden caer justo en el borde de lo descargado sin que se note en
    // pantalla — eso no debería tirar todo el mapa a la vista de respaldo.
    let fallos = 0;
    this.capaBase.on('tileerror', () => {
      if (++fallos === 15 && this.alFallar) this.alFallar();
    });
  },

  /* No dejar que el arrastre saque al usuario del área con teselas
     descargadas: más allá de eso no hay imagen (offline no hay de dónde
     traerla), así que directamente no se puede llegar ahí. */
  limitarArrastre(proyecto) {
    const { lat, lng } = proyecto.coordenadas;
    const r = this.RADIO_DESCARGADO_M;
    const dLat = r / 111320;
    const dLng = r / (111320 * Math.cos(lat * Math.PI / 180));
    this.mapa.setMaxBounds([
      [lat - dLat, lng - dLng],
      [lat + dLat, lng + dLng]
    ]);
  },

  dibujar(proyecto) {
    this.proyectoActual = proyecto;
    this.marcadores.forEach(m => this.mapa.removeLayer(m));
    this.marcadores = [];

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
