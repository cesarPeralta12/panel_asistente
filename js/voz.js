/* ============================================================================
   INMOL · PANEL INTERACTIVO
   voz.js — Asistente táctil con respuesta hablada
   ----------------------------------------------------------------------------
   FUNCIONA SIN INTERNET, EN LOS DOS MODOS.

   1. AUDIO PREGRABADO (el que se usa normalmente)
      Las respuestas del asistente son un conjunto fijo de frases, así que se
      graban una sola vez con voz neuronal boliviana y se guardan como MP3 en
      assets/voz/. El panel reproduce el archivo: suena humano, arranca al
      instante y no depende de la red.
      Se generan con:  node herramientas/generar-voces.js

   2. VOZ DEL SISTEMA (respaldo)
      Si falta el audio de una frase —por ejemplo, un proyecto nuevo cargado
      en datos.js sin regenerar los audios— se recurre a speechSynthesis, que
      en Windows habla con los motores SAPI instalados. También es local, pero
      suena más robótica.
   ============================================================================ */

const Voz = {
  vozElegida: null,
  disponible: false,     // hay motor de voz del sistema
  hablando: false,
  audio: null,
  alTerminar: null,

  iniciar() {
    /* Reproductor para los audios pregrabados */
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.addEventListener('ended', () => this.terminar());
    this.audio.addEventListener('error', () => {
      // Si el archivo no se puede leer, se responde con la voz del sistema.
      if (!this.hablando) return;
      const t = this._textoPendiente;
      this._textoPendiente = null;
      if (t) this.sintetizar(t); else this.terminar();
    });

    /* Motor de voz del sistema, como respaldo */
    if (!('speechSynthesis' in window)) {
      console.warn('[Voz] Este navegador no soporta síntesis de voz.');
    } else {
      this.disponible = true;
      this.elegirVoz();
      speechSynthesis.addEventListener('voiceschanged', () => this.elegirVoz());
    }

    this.precargar();
  },

  /* Deja los audios listos en memoria: al tocar, suenan sin ningún retardo. */
  precargar() {
    if (typeof VOCES === 'undefined') return;
    Object.values(VOCES).forEach(ruta => {
      const a = new Audio();
      a.preload = 'auto';
      a.src = ruta;
    });
  },

  elegirVoz() {
    const voces = speechSynthesis.getVoices();
    if (!voces.length) return;

    const preferido = (PANEL.config.idiomaVoz || 'es-BO').toLowerCase();
    const idioma = preferido.split('-')[0];

    const prioridad = [
      v => v.lang.toLowerCase() === preferido,
      v => /^es-(bo|pe|mx|ar|cl|co|us)/i.test(v.lang),
      v => v.lang.toLowerCase().startsWith(idioma)
    ];
    for (const test of prioridad) {
      const encontrada = voces.find(test);
      if (encontrada) { this.vozElegida = encontrada; break; }
    }
    if (!this.vozElegida) this.vozElegida = voces[0] || null;
  },

  /* --- Punto de entrada -------------------------------------------------
     clave: identificador del audio pregrabado (ver assets/voz/indice.js).
     Si no hay audio para esa clave, habla el motor del sistema.            */
  hablar(texto, onFin, clave) {
    this.callar();
    if (!texto) { if (onFin) onFin(); return; }

    this.alTerminar = onFin || null;
    this.hablando = true;

    const pista = (typeof VOCES !== 'undefined' && clave) ? VOCES[clave] : null;
    if (pista) {
      this._textoPendiente = texto;      // por si el archivo falla
      this.audio.src = pista;
      const p = this.audio.play();
      if (p && p.catch) p.catch(() => this.sintetizar(texto));
    } else {
      this.sintetizar(texto);
    }
  },

  sintetizar(texto) {
    this._textoPendiente = null;
    if (!this.disponible) { this.terminar(); return; }

    const u = new SpeechSynthesisUtterance(texto);
    if (this.vozElegida) u.voice = this.vozElegida;
    u.lang = this.vozElegida ? this.vozElegida.lang : (PANEL.config.idiomaVoz || 'es-ES');
    u.rate = 0.98;   // ligeramente pausada: se entiende mejor con ruido
    u.pitch = 1.0;
    u.volume = 1.0;
    u.onend = u.onerror = () => this.terminar();
    speechSynthesis.speak(u);
  },

  terminar() {
    if (!this.hablando) return;
    this.hablando = false;
    this._textoPendiente = null;
    const f = this.alTerminar;
    this.alTerminar = null;
    if (f) f();
  },

  callar() {
    this.hablando = false;
    this._textoPendiente = null;
    this.alTerminar = null;
    if (this.audio) { try { this.audio.pause(); this.audio.currentTime = 0; } catch (e) {} }
    if (this.disponible) { try { speechSynthesis.cancel(); } catch (e) {} }
  },

  /* ¿Hay audio o voz sonando ahora? Lo usa la presentación automática para
     saber si el navegador bloqueó la reproducción. */
  sonando() {
    const audio = this.audio && !this.audio.paused && !this.audio.ended;
    const sintesis = this.disponible && speechSynthesis.speaking;
    return !!(audio || sintesis);
  },

  /* Diagnóstico: se muestra en el panel técnico (tecla D). */
  estado() {
    const grabadas = (typeof VOCES !== 'undefined') ? Object.keys(VOCES).length : 0;
    if (grabadas) return `${grabadas} frases grabadas (voz neuronal)`;
    if (!('speechSynthesis' in window)) return 'Sin audio: navegador no soportado';
    const voces = speechSynthesis.getVoices();
    const es = voces.filter(v => v.lang.toLowerCase().startsWith('es'));
    if (!voces.length) return 'Sin audios · voces del sistema aún no cargadas';
    if (!es.length) return `Sin audios · sin voz en español (${voces.length} del sistema)`;
    return `Sin audios · voz del sistema: ${this.vozElegida ? this.vozElegida.name : '—'}`;
  }
};
