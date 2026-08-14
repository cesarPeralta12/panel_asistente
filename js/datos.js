/* ============================================================================
   INMOL · PANEL INTERACTIVO DE FERIA
   datos.js — ÚNICO ARCHIVO QUE HAY QUE EDITAR PARA CARGAR CONTENIDO
   ----------------------------------------------------------------------------
   Los textos, cifras, fotografías y videos se tomaron del sitio oficial
   inmol.com.bo. Lo que sigue marcado con  // DEMO  es contenido de ejemplo
   que INMOL todavía tiene que entregar (referencias con distancias reales,
   etapas de obra y disponibilidad de lotes).
   ============================================================================ */

const PANEL = {

  /* --- Datos de la empresa ------------------------------------------------ */
  empresa: {
    nombre: 'INMOL',
    lema: 'Desarrollos Inmobiliarios con respaldo y confianza',
    web: 'www.inmol.com.bo',
    telefono: '+591 755 90031',
    oficina: 'Edificio Trébol, Piso 1, Of. 1A · Fortín Corrales 141, Santa Cruz',
    logo: 'assets/inmol-logo.png',
    // Video institucional que se usa en el modo atracción.
    video: 'assets/medios/video/inmol-home.mp4'
  },

  /* --- Comportamiento del kiosco ------------------------------------------ */
  config: {
    // Segundos sin que nadie toque la pantalla antes de volver al modo atracción.
    segundosInactividad: 90,
    // Segundos que dura cada slide del modo atracción.
    segundosPorSlide: 11,
    // Mostrar precios en pantalla. Definido en NO por decisión comercial.
    mostrarPrecios: false,
    // Aviso discreto de contenido de demostración. Apagar al cargar lo definitivo.
    datosDeEjemplo: true,
    // Mapa real (OpenStreetMap). Si no hay internet, cae solo a la vista
    // satelital generada, que sí funciona sin conexión.
    mapaReal: true
  },

  /* --- PROYECTOS ---------------------------------------------------------- */
  proyectos: [

    /* ====================== 1. URBANIZACIÓN EL ENCANTO ==================== */
    {
      id: 'el-encanto',
      nombre: 'Urbanización El Encanto',
      subtitulo: 'La Guardia · Santa Cruz',
      tipo: 'Urbanización residencial',
      estadoComercial: 'En comercialización',
      claim: 'Vivir la naturaleza con todas las comodidades.',
      descripcion: 'Terrenos en venta sobre la Av. Doble Vía La Guardia Km 16. ' +
                   'Servicios básicos, áreas verdes y 1.500 metros de pavimento ' +
                   'rígido, en una zona de fuerte crecimiento con clima agradable ' +
                   'y entorno natural atractivo.',

      coordenadas: { lat: -17.9053, lng: -63.2958 },
      direccion: 'Av. Doble Vía La Guardia Km 16, Santa Cruz',
      enlaceMapa: 'https://maps.app.goo.gl/i7Aw7BNJCNMzEWzn6',
      recorrido360: 'https://elencanto.inmol.com.bo/',

      // Semilla del generador de vista satelital de respaldo (sin internet).
      semilla: 20481,

      // Fotografías reales del proyecto (dron y cámara).
      fotos: [
        'assets/medios/el-encanto/el-encanto-01.jpg',
        'assets/medios/el-encanto/el-encanto-02.jpg',
        'assets/medios/el-encanto/el-encanto-03.jpg',
        'assets/medios/el-encanto/el-encanto-04.jpg',
        'assets/medios/el-encanto/el-encanto-05.jpg',
        'assets/medios/el-encanto/el-encanto-06.jpg',
        'assets/medios/el-encanto/el-encanto-07.jpg',
        'assets/medios/el-encanto/el-encanto-08.jpg',
        'assets/medios/el-encanto/el-encanto-09.jpg',
        'assets/medios/el-encanto/el-encanto-10.jpg'
      ],
      video: 'assets/medios/video/el-encanto.mp4',

      destacados: [
        { valor: '+1.000',        etiqueta: 'lotes' },
        { valor: '300 – 800 m²',  etiqueta: 'superficie de lotes' },
        { valor: '1.500 m',       etiqueta: 'de pavimento rígido' },
        { valor: 'La Guardia',    etiqueta: 'Santa Cruz' }
      ],

      // Puntos de referencia. // DEMO — faltan los reales de INMOL.
      // Si se conocen las coordenadas, agregar  coordenadas: { lat, lng }
      // y el pin se ubica exacto; si no, se deduce del ángulo y la distancia.
      referencias: [
        { nombre: 'Av. Doble Vía La Guardia', distancia: '0.2 km', icono: 'via',      angulo: 20 },
        { nombre: 'Unidad educativa',         distancia: '1.1 km', icono: 'colegio',  angulo: 95 },
        { nombre: 'Centro de salud',          distancia: '1.8 km', icono: 'salud',    angulo: 160 },
        { nombre: 'Supermercado',             distancia: '2.4 km', icono: 'comercio', angulo: 240 },
        { nombre: 'Plaza principal',          distancia: '3.0 km', icono: 'plaza',    angulo: 300 }
      ],

      servicios: [
        'Agua potable', 'Energía eléctrica', 'Áreas verdes',
        'Pavimento rígido', 'Urbanización abierta', 'Entorno natural'
      ],

      avance: [ // DEMO — los porcentajes reales los define INMOL
        { etapa: 'Movimiento de tierras', porcentaje: 100 },
        { etapa: 'Apertura de calles',    porcentaje: 100 },
        { etapa: 'Redes de agua',         porcentaje: 85  },
        { etapa: 'Red eléctrica',         porcentaje: 70  },
        { etapa: 'Pavimento rígido',      porcentaje: 45  },
        { etapa: 'Áreas verdes',          porcentaje: 20  }
      ],

      plano: {
        manzanas: 8, lotesPorManzana: 24, prefijo: 'EC',
        categorias: ['Estándar', 'Preferencial', 'Comercial', 'Esquina'],
        superficieBase: 300, superficieRango: 500,
        unidad: 'lote', unidadPlural: 'lotes'
      }
    },

    /* ===================== 2. CENTRO COMERCIAL LIBERTAD =================== */
    {
      id: 'libertad',
      nombre: 'Centro Comercial Libertad',
      subtitulo: 'Zona Sur · Santa Cruz',
      tipo: 'Centro comercial',
      estadoComercial: 'En comercialización',
      claim: 'Su negocio, en la zona de mayor crecimiento de Santa Cruz.',
      descripcion: 'Locales comerciales en la Zona Sudeste de Santa Cruz de la ' +
                   'Sierra. Un centro comercial diseñado para su negocio, rodeado ' +
                   'de colegios, mercados y áreas urbanizadas, lo que garantiza un ' +
                   'flujo constante de visitantes.',

      coordenadas: { lat: -17.8879, lng: -63.1740 },
      direccion: '8vo anillo y Av. Santos Dumont, Santa Cruz de la Sierra',
      enlaceMapa: 'https://maps.app.goo.gl/56LVGHSEHuBsimVt6',
      recorrido360: 'https://centrocomerciallibertad.inmol.com.bo/',

      semilla: 77310,

      fotos: [
        'assets/medios/libertad/libertad-01.jpg',
        'assets/medios/libertad/libertad-02.jpg',
        'assets/medios/libertad/libertad-03.jpg',
        'assets/medios/libertad/libertad-04.jpg',
        'assets/medios/libertad/libertad-05.jpg'
      ],
      video: 'assets/medios/video/libertad.mp4',

      destacados: [
        { valor: '+300',        etiqueta: 'locales' },
        { valor: '8.531,93 m²', etiqueta: 'superficie total' },
        { valor: 'Zona Sur',    etiqueta: 'Santa Cruz' },
        { valor: '8vo anillo',  etiqueta: 'y Av. Santos Dumont' }
      ],

      referencias: [ // DEMO
        { nombre: 'Av. Santos Dumont', distancia: '0.1 km', icono: 'via',      angulo: 45  },
        { nombre: 'Colegios',          distancia: '0.4 km', icono: 'colegio',  angulo: 130 },
        { nombre: 'Mercado',           distancia: '0.8 km', icono: 'comercio', angulo: 210 },
        { nombre: 'Zona residencial',  distancia: '0.6 km', icono: 'plaza',    angulo: 320 }
      ],

      servicios: [
        'Estacionamiento', 'Seguridad 24 h', 'Alto flujo peatonal',
        'Rodeado de colegios', 'Cerca de mercados', 'Zona consolidada'
      ],

      avance: [ // DEMO
        { etapa: 'Obra gruesa',     porcentaje: 100 },
        { etapa: 'Instalaciones',   porcentaje: 90  },
        { etapa: 'Acabados',        porcentaje: 75  },
        { etapa: 'Fachada',         porcentaje: 60  },
        { etapa: 'Estacionamiento', porcentaje: 40  }
      ],

      plano: {
        manzanas: 6, lotesPorManzana: 16, prefijo: 'LB',
        categorias: ['Planta baja', 'Primer piso', 'Área de comidas', 'Esquina'],
        superficieBase: 18, superficieRango: 26,
        unidad: 'local', unidadPlural: 'locales'
      }
    },

    /* ================= 3. URBANIZACIÓN VISTA LINDA (vendido) ============== */
    {
      id: 'vista-linda',
      nombre: 'Urbanización Vista Linda',
      subtitulo: 'La Guardia Km 9 · Santa Cruz',
      tipo: 'Urbanización residencial',
      estadoComercial: '100% vendido',
      vendido: true,
      claim: 'Tu hogar soñado en un entorno tranquilo.',
      descripcion: 'Proyecto residencial abierto con 71 terrenos sobre la Av. ' +
                   'Doble Vía La Guardia Km 9, hoy 100% vendidos. Un desarrollo ' +
                   'consolidado, seguro y de gran crecimiento poblacional, que ' +
                   'cumplió el sueño de muchas familias en Santa Cruz.',

      coordenadas: { lat: -17.8628, lng: -63.2470 },
      direccion: 'Av. Doble Vía La Guardia Km 9, Santa Cruz',
      enlaceMapa: '',

      semilla: 51027,

      fotos: ['assets/medios/marca/vista-linda-normal.png'],
      video: '',

      destacados: [
        { valor: '71',        etiqueta: 'terrenos' },
        { valor: '100%',      etiqueta: 'vendido' },
        { valor: 'Km 9',      etiqueta: 'Doble Vía La Guardia' },
        { valor: 'Entregado', etiqueta: 'proyecto consolidado' }
      ],

      referencias: [ // DEMO
        { nombre: 'Av. Doble Vía La Guardia', distancia: '0.2 km', icono: 'via',      angulo: 30  },
        { nombre: 'Áreas recreativas',        distancia: '0.5 km', icono: 'plaza',    angulo: 150 },
        { nombre: 'Zona consolidada',         distancia: '1.0 km', icono: 'comercio', angulo: 260 }
      ],

      servicios: [
        'Agua potable', 'Energía eléctrica', 'Áreas verdes',
        'Vías pavimentadas', 'Espacios recreativos', 'Entorno natural'
      ],

      avance: [
        { etapa: 'Urbanización',    porcentaje: 100 },
        { etapa: 'Servicios',       porcentaje: 100 },
        { etapa: 'Vías',            porcentaje: 100 },
        { etapa: 'Comercialización', porcentaje: 100 }
      ],

      plano: {
        manzanas: 4, lotesPorManzana: 18, prefijo: 'VL',
        categorias: ['Estándar', 'Preferencial', 'Esquina'],
        superficieBase: 275, superficieRango: 225,
        unidad: 'lote', unidadPlural: 'lotes'
      }
    }
  ]
};
