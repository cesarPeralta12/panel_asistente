/* ============================================================================
   INMOL · PANEL INTERACTIVO
   voz.js — Asistente táctil con respuesta hablada
   ----------------------------------------------------------------------------
   FUNCIONA SIN INTERNET.
   Usa la API de síntesis de voz del navegador (speechSynthesis), que en Windows
   habla con los motores de voz instalados en el sistema (SAPI). Esas voces son
   locales: no hacen ninguna petición de red.

   Para verificar / instalar voces en español en el equipo del stand:
   Configuración → Hora e idioma → Voz → Administrar voces → Agregar voces →
   Español (Bolivia / México / España).
   ============================================================================ */

const Voz = {
  vozElegida: null,
  disponible: false,
  hablando: false,
  alTerminar: null,

  iniciar() {
    if (!('speechSynthesis' in window)) {
      console.warn('[Voz] Este navegador no soporta síntesis de voz.');
      this.disponible = false;
      return;
    }
    this.disponible = true;
    this.elegirVoz();
    // Chrome carga las voces de forma asíncrona.
    speechSynthesis.addEventListener('voiceschanged', () => this.elegirVoz());
  },

  elegirVoz() {
    const voces = speechSynthesis.getVoices();
    if (!voces.length) return;

    const preferido = (PANEL.config.idiomaVoz || 'es-BO').toLowerCase();
    const idioma = preferido.split('-')[0];

    // Orden de preferencia: idioma exacto → cualquier español latino → cualquier español
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

  /* Habla un texto. onFin se llama al terminar (o de inmediato si no hay voz). */
  hablar(texto, onFin) {
    this.callar();
    if (!this.disponible || !texto) { if (onFin) onFin(); return; }

    const u = new SpeechSynthesisUtterance(texto);
    if (this.vozElegida) u.voice = this.vozElegida;
    u.lang = this.vozElegida ? this.vozElegida.lang : (PANEL.config.idiomaVoz || 'es-ES');
    u.rate = 0.98;   // ligeramente pausado: se entiende mejor en ambiente ruidoso
    u.pitch = 1.0;
    u.volume = 1.0;

    this.hablando = true;
    u.onend = u.onerror = () => {
      this.hablando = false;
      if (onFin) onFin();
    };
    speechSynthesis.speak(u);
  },

  callar() {
    if (!this.disponible) return;
    this.hablando = false;
    try { speechSynthesis.cancel(); } catch (e) { /* sin efecto */ }
  },

  /* Diagnóstico: se muestra en el panel técnico (tecla D). */
  estado() {
    if (!('speechSynthesis' in window)) return 'No soportado por el navegador';
    const voces = speechSynthesis.getVoices();
    const es = voces.filter(v => v.lang.toLowerCase().startsWith('es'));
    if (!voces.length) return 'Voces aún no cargadas';
    if (!es.length) return `Sin voz en español (${voces.length} voces del sistema)`;
    return `${this.vozElegida ? this.vozElegida.name : '—'} · ${es.length} voz/voces en español`;
  }
};
