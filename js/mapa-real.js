/* ============================================================================
   INMOL · PANEL INTERACTIVO
   mapa-real.js — Mapa navegable con la ubicación exacta y sus referencias
   ----------------------------------------------------------------------------
   Usa Leaflet (incluido en assets/leaflet/) sobre teselas de OpenStreetMap.
   Se puede arrastrar, hacer zoom con dos dedos y tocar cada pin.

   NECESITA INTERNET para descargar las teselas. Si no hay conexión —que es lo
   previsto en el pabellón— el panel lo detecta y muestra la vista satelital
   generada, que funciona offline. Nunca queda una sección en blanco.
   ============================================================================ */

const MapaReal = {
  mapa: null,
  capaBase: null,
  marcadores: [],
  disponible: false,
  proyectoActual: null,

  /* Leaflet está cargado y el navegador tiene red */
  sePuedeUsar() {
    return typeof L !== 'undefined' && PANEL.config.mapaReal && navigator.onLine;
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
        // En una pantalla táctil de feria: se arrastra y se pellizca, pero no
        // se hace zoom sin querer con la rueda ni doble toque accidental.
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: true,
        dragging: true
      });
      L.control.zoom({ position: 'bottomright' }).addTo(this.mapa);
      this.capaBase = L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19, attribution: '© OpenStreetMap' }
      ).addTo(this.mapa);

      // Si las teselas no cargan (sin internet), se avisa una sola vez.
      let fallos = 0;
      this.capaBase.on('tileerror', () => {
        if (++fallos === 4 && this.alFallar) this.alFallar();
      });
    }

    this.dibujar(proyecto);
    this.disponible = true;
    return true;
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

  /* Encuadra el proyecto con todas sus referencias */
  centrar() {
    if (!this.mapa || !this.marcadores.length) return;
    const puntos = this.marcadores.filter(m => m.getLatLng).map(m => m.getLatLng());
    if (puntos.length > 1) {
      this.mapa.fitBounds(L.latLngBounds(puntos), { padding: [90, 90], maxZoom: 16 });
    } else {
      this.mapa.setView(puntos[0], 16);
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

  redimensionar() { if (this.mapa) this.mapa.invalidateSize(); }
};
