/* ============================================================================
   INMOL · PANEL INTERACTIVO DE FERIA
   datos.js — ÚNICO ARCHIVO QUE HAY QUE EDITAR PARA CARGAR CONTENIDO REAL
   ----------------------------------------------------------------------------
   Todo lo marcado con  // DEMO  es contenido de ejemplo y debe reemplazarse
   con la información real que entregue INMOL.
   ============================================================================ */

const PANEL = {

  /* --- Datos de la empresa ------------------------------------------------ */
  empresa: {
    nombre: 'INMOL',
    lema: 'Desarrollos Inmobiliarios con respaldo y confianza',
    web: 'www.inmol.com.bo',
    telefono: '+591 755 90031',
    // Logotipo oficial: isotipo rojo + texto blanco, para fondos oscuros.
    logo: 'assets/inmol-logo.png'
  },

  /* --- Comportamiento del kiosco ------------------------------------------ */
  config: {
    // Segundos sin que nadie toque la pantalla antes de volver al modo atracción.
    segundosInactividad: 90,
    // Segundos que dura cada slide del modo atracción.
    segundosPorSlide: 9,
    // Idioma preferido para la voz del asistente.
    idiomaVoz: 'es-BO',
    // Mostrar precios en pantalla. Definido en NO por decisión comercial.
    mostrarPrecios: false
  },

  /* --- PROYECTOS ---------------------------------------------------------- */
  proyectos: [

    /* ====================== 1. URBANIZACIÓN EL ENCANTO ==================== */
    {
      id: 'el-encanto',
      nombre: 'Urbanización El Encanto',
      subtitulo: 'La Guardia · Santa Cruz',
      tipo: 'Urbanización residencial',
      claim: 'Vivir con espacio, verde y cercanía.',
      descripcion: 'Urbanización residencial sobre la Doble Vía La Guardia, ' +
                   'con lotes de distintas superficies, áreas verdes y todos ' +
                   'los servicios básicos instalados.',
      color: '#E3333E',

      // Coordenadas reales obtenidas del enlace de Google Maps de INMOL.
      coordenadas: { lat: -17.9053, lng: -63.2958 },
      direccion: 'Doble Vía La Guardia, Santa Cruz de la Sierra',
      enlaceMapa: 'https://maps.app.goo.gl/i7Aw7BNJCNMzEWzn6',

      // Semilla del generador de vista satelital (cambiar = otro terreno).
      semilla: 20481,

      // Datos de cabecera que se muestran grandes en pantalla.
      destacados: [
        { valor: '192',   etiqueta: 'lotes totales' },
        { valor: '360 m²', etiqueta: 'superficie promedio' },
        { valor: '4',      etiqueta: 'categorías' },
        { valor: '68%',    etiqueta: 'avance de obra' }
      ],

      // Puntos de referencia cercanos.  // DEMO — reemplazar con los reales.
      referencias: [
        { nombre: 'Doble Vía La Guardia', distancia: '0.2 km', icono: 'via',      angulo: 20 },
        { nombre: 'Unidad educativa',      distancia: '1.1 km', icono: 'colegio',  angulo: 95 },
        { nombre: 'Centro de salud',       distancia: '1.8 km', icono: 'salud',    angulo: 160 },
        { nombre: 'Supermercado',          distancia: '2.4 km', icono: 'comercio', angulo: 240 },
        { nombre: 'Plaza principal',       distancia: '3.0 km', icono: 'plaza',    angulo: 300 }
      ],

      // Servicios del proyecto.  // DEMO
      servicios: [
        'Agua potable', 'Energía eléctrica', 'Alumbrado público',
        'Calles asfaltadas', 'Áreas verdes', 'Cerramiento perimetral'
      ],

      // Avance de obra por etapas.  // DEMO
      avance: [
        { etapa: 'Movimiento de tierras', porcentaje: 100 },
        { etapa: 'Apertura de calles',    porcentaje: 100 },
        { etapa: 'Redes de agua',         porcentaje: 85  },
        { etapa: 'Red eléctrica',         porcentaje: 70  },
        { etapa: 'Asfaltado',             porcentaje: 45  },
        { etapa: 'Áreas verdes',          porcentaje: 20  }
      ],

      // Configuración del plano de lotes (el generador crea las manzanas).
      plano: {
        manzanas: 8, lotesPorManzana: 24, prefijo: 'EC',
        categorias: ['Estándar', 'Preferencial', 'Comercial', 'Esquina'],
        superficieBase: 280, superficieRango: 200,
        unidad: 'lote', unidadPlural: 'lotes'
      }
    },

    /* ===================== 2. CENTRO COMERCIAL LIBERTAD =================== */
    {
      id: 'libertad',
      nombre: 'Centro Comercial Libertad',
      subtitulo: 'Santa Cruz de la Sierra',
      tipo: 'Centro comercial',
      claim: 'Su negocio, en el lugar donde pasa la gente.',
      descripcion: 'Centro comercial con locales de distintas superficies y ' +
                   'categorías, diseñado para alto flujo peatonal y ' +
                   'estacionamiento propio.',
      color: '#E3333E',

      coordenadas: { lat: -17.8879, lng: -63.1740 },
      direccion: 'Santa Cruz de la Sierra',
      enlaceMapa: 'https://maps.app.goo.gl/56LVGHSEHuBsimVt6',

      semilla: 77310,

      destacados: [
        { valor: '96',    etiqueta: 'locales' },
        { valor: '28 m²', etiqueta: 'superficie promedio' },
        { valor: '3',     etiqueta: 'categorías' },
        { valor: '82%',   etiqueta: 'avance de obra' }
      ],

      referencias: [ // DEMO
        { nombre: 'Avenida principal',  distancia: '0.1 km', icono: 'via',      angulo: 45  },
        { nombre: 'Parada de transporte', distancia: '0.3 km', icono: 'plaza',  angulo: 130 },
        { nombre: 'Zona residencial',   distancia: '0.6 km', icono: 'comercio', angulo: 210 },
        { nombre: 'Mercado',            distancia: '1.2 km', icono: 'comercio', angulo: 320 }
      ],

      servicios: [ // DEMO
        'Estacionamiento', 'Seguridad 24 h', 'Aire acondicionado',
        'Baños públicos', 'Área de comidas', 'Generador de respaldo'
      ],

      avance: [ // DEMO
        { etapa: 'Obra gruesa',        porcentaje: 100 },
        { etapa: 'Instalaciones',      porcentaje: 90  },
        { etapa: 'Acabados',           porcentaje: 75  },
        { etapa: 'Fachada',            porcentaje: 60  },
        { etapa: 'Estacionamiento',    porcentaje: 40  }
      ],

      plano: {
        manzanas: 6, lotesPorManzana: 16, prefijo: 'LB',
        categorias: ['Planta baja', 'Primer piso', 'Área de comidas', 'Esquina'],
        superficieBase: 18, superficieRango: 26,
        unidad: 'local', unidadPlural: 'locales'
      }
    },

    /* ========================= 3. TERCER PROYECTO ========================= */
    {
      id: 'proyecto-3',
      nombre: 'Tercer Proyecto',
      subtitulo: 'Por definir',
      tipo: 'Pendiente de carga',
      claim: 'Espacio reservado para el tercer desarrollo.',
      descripcion: 'Este proyecto está listo para recibir su contenido: ' +
                   'nombre, ubicación, plano de lotes, fotografías y avance ' +
                   'de obra. Toda la estructura ya está construida.',
      color: '#E3333E',
      pendiente: true,

      coordenadas: { lat: -17.8100, lng: -63.2100 },
      direccion: 'Santa Cruz de la Sierra',
      enlaceMapa: '',

      semilla: 51027,

      destacados: [
        { valor: '—', etiqueta: 'lotes totales' },
        { valor: '—', etiqueta: 'superficie promedio' },
        { valor: '—', etiqueta: 'categorías' },
        { valor: '—', etiqueta: 'avance de obra' }
      ],

      referencias: [
        { nombre: 'Referencia 1', distancia: '— km', icono: 'via',      angulo: 40  },
        { nombre: 'Referencia 2', distancia: '— km', icono: 'colegio',  angulo: 140 },
        { nombre: 'Referencia 3', distancia: '— km', icono: 'comercio', angulo: 260 }
      ],

      servicios: ['Por definir', 'Por definir', 'Por definir'],

      avance: [
        { etapa: 'Etapa 1', porcentaje: 0 },
        { etapa: 'Etapa 2', porcentaje: 0 },
        { etapa: 'Etapa 3', porcentaje: 0 }
      ],

      plano: {
        manzanas: 6, lotesPorManzana: 18, prefijo: 'P3',
        categorias: ['Categoría A', 'Categoría B', 'Esquina'],
        superficieBase: 250, superficieRango: 150,
        unidad: 'lote', unidadPlural: 'lotes'
      }
    }
  ],

  /* --- ASISTENTE TÁCTIL CON VOZ ------------------------------------------
     Cada opción es un botón que el visitante toca. El asistente responde
     con voz (motor de voz local de Windows, funciona sin internet) y a la
     vez lleva la pantalla a la sección correspondiente.
     ---------------------------------------------------------------------- */
  asistente: {
    saludo: 'Bienvenido a INMOL. ¿Cuál de nuestros proyectos desea conocer?',

    // Preguntas disponibles dentro de un proyecto.
    preguntas: [
      {
        id: 'ubicacion',
        texto: '¿Dónde está ubicado?',
        seccion: 'ubicacion',
        respuesta: p => `${p.nombre} se encuentra en ${p.direccion}. ` +
                        `En pantalla puede ver la vista satelital, desde la ` +
                        `ciudad hasta el terreno.`
      },
      {
        id: 'referencias',
        texto: '¿Qué hay cerca?',
        seccion: 'referencias',
        respuesta: p => {
          const tres = p.referencias.slice(0, 3)
            .map(r => `${r.nombre} a ${r.distancia}`).join(', ');
          return `Cerca del proyecto encontrará ${tres}.`;
        }
      },
      {
        id: 'lotes',
        texto: 'Ver disponibilidad',
        seccion: 'lotes',
        respuesta: p => `Le muestro el plano. En verde están las unidades ` +
                        `disponibles, en ámbar las reservadas y en gris las ` +
                        `vendidas. Puede tocar cualquiera para ver su código, ` +
                        `superficie y categoría.`
      },
      {
        id: 'avance',
        texto: '¿Cómo va la obra?',
        seccion: 'avance',
        respuesta: p => {
          const prom = Math.round(
            p.avance.reduce((a, e) => a + e.porcentaje, 0) / p.avance.length);
          return `El avance general de ${p.nombre} es de aproximadamente ` +
                 `${prom} por ciento. En pantalla puede ver el detalle por etapa.`;
        }
      },
      {
        id: 'servicios',
        texto: '¿Qué servicios tiene?',
        seccion: 'resumen',
        respuesta: p => `El proyecto cuenta con ${p.servicios.slice(0, 4).join(', ')}, ` +
                        `entre otros servicios.`
      },
      {
        id: 'precio',
        texto: '¿Cuál es el precio?',
        seccion: null,
        respuesta: () => `Los precios y planes de pago se elaboran de forma ` +
                         `personalizada. Un asesor de INMOL le preparará una ` +
                         `cotización a su medida en este mismo momento.`
      }
    ]
  }
};
