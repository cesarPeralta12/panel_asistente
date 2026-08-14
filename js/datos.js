/* ============================================================================
   INMOL · PANEL INTERACTIVO DE FERIA
   datos.js — ÚNICO ARCHIVO QUE HAY QUE EDITAR PARA CARGAR CONTENIDO
   ----------------------------------------------------------------------------
   Los textos, cifras, fotografías y videos se tomaron del sitio oficial
   inmol.com.bo. Los puntos de referencia (colegios, salud, mercados, plazas)
   se investigaron en Google Maps a partir de la ubicación real de cada
   proyecto — nombre, distancia en auto y coordenadas verificadas.
   La disponibilidad de lotes (qué está vendido/reservado/disponible) sigue
   siendo generada al azar: INMOL todavía tiene que entregar esos datos.
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
    datosDeEjemplo: false,
    // Mapa satelital real con teselas precargadas (100% offline).
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

      // Ubicación exacta. Código Plus 57JR3PV3+WP2, del enlace de Maps de INMOL.
      coordenadas: { lat: -17.90523, lng: -63.29574 },
      direccion: 'Av. Doble Vía La Guardia Km 16, Santa Cruz',
      enlaceMapa: 'https://maps.app.goo.gl/i7Aw7BNJCNMzEWzn6',
      recorrido360: 'assets/tour/el-encanto/index.html',

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

      // Puntos de referencia reales, investigados en Google Maps a partir de
      // la ubicación del proyecto (distancia en auto, la que ve un comprador).
      referencias: [
        { nombre: 'Av. Doble Vía La Guardia',      distancia: '0.2 km', icono: 'via',      angulo: 20 },
        { nombre: 'U.E. Jaime Escalante',          distancia: '3.2 km', icono: 'colegio',  angulo: 102,
          coordenadas: { lat: -17.9004316, lng: -63.2720356 } },
        { nombre: 'Centro de Salud San Silvestre', distancia: '2.9 km', icono: 'salud',    angulo: 152,
          coordenadas: { lat: -17.8905435, lng: -63.2876494 } },
        { nombre: 'Mercado La Guardia',            distancia: '6.7 km', icono: 'comercio', angulo: 249,
          coordenadas: { lat: -17.8932282, lng: -63.3290516 } },
        { nombre: 'Plaza Principal de La Guardia', distancia: '6.8 km', icono: 'plaza',    angulo: 248,
          coordenadas: { lat: -17.8918621, lng: -63.3310429 } }
      ],

      servicios: [
        'Agua potable', 'Energía eléctrica', 'Áreas verdes',
        'Pavimento rígido', 'Urbanización abierta', 'Entorno natural'
      ],

      // Ficha técnica: los datos que el vendedor necesita a mano.
      fichaTecnica: [
        { campo: 'Tipología',            valor: 'Urbanización abierta' },
        { campo: 'Ubicación',            valor: 'La Guardia, Santa Cruz' },
        { campo: 'Dirección',            valor: 'Av. Doble Vía La Guardia Km 16' },
        { campo: 'Superficie de lotes',  valor: '300 m² a más de 800 m²' },
        { campo: 'Cantidad de lotes',    valor: 'Más de 1.000' },
        { campo: 'Pavimento',            valor: '1.500 m de pavimento rígido' },
        { campo: 'Servicios básicos',    valor: 'Agua potable y energía eléctrica' },
        { campo: 'Áreas verdes',         valor: 'Sí, con espacios recreativos' },
        { campo: 'Estado comercial',     valor: 'En comercialización' }
      ],

      plano: {
        etiqueta: 'Disponibilidad',
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

      // Ubicación exacta. Código Plus 57JR4R6G+VC, del enlace de Maps de INMOL.
      coordenadas: { lat: -17.88781, lng: -63.17394 },
      direccion: '8vo anillo y Av. Santos Dumont, Santa Cruz de la Sierra',
      enlaceMapa: 'https://maps.app.goo.gl/56LVGHSEHuBsimVt6',
      recorrido360: 'assets/tour/libertad/index.html',

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

      // Puntos de referencia reales, investigados en Google Maps a partir de
      // la ubicación del proyecto (distancia en auto, la que ve un comprador).
      referencias: [
        { nombre: 'Av. Santos Dumont',        distancia: '0.1 km', icono: 'via',      angulo: 45  },
        { nombre: 'Centro Educ. Luz y Verdad', distancia: '2.4 km', icono: 'colegio',  angulo: 228,
          coordenadas: { lat: -17.8762346, lng: -63.1872295 } },
        { nombre: 'Centro de Salud Cortez',   distancia: '1.4 km', icono: 'salud',    angulo: 3,
          coordenadas: { lat: -17.8936097, lng: -63.1736176 } },
        { nombre: 'Mercado Palmira',          distancia: '2.1 km', icono: 'comercio', angulo: 167,
          coordenadas: { lat: -17.8769237, lng: -63.1713592 } },
        { nombre: 'Parque Las Orquídeas',     distancia: '2.1 km', icono: 'plaza',    angulo: 79,
          coordenadas: { lat: -17.8893895, lng: -63.1651538 } }
      ],

      servicios: [
        'Estacionamiento', 'Seguridad 24 h', 'Alto flujo peatonal',
        'Rodeado de colegios', 'Cerca de mercados', 'Zona consolidada'
      ],

      fichaTecnica: [
        { campo: 'Tipología',          valor: 'Centro comercial' },
        { campo: 'Ubicación',          valor: 'Zona Sudeste, Santa Cruz de la Sierra' },
        { campo: 'Dirección',          valor: '8vo anillo y Av. Santos Dumont' },
        { campo: 'Superficie total',   valor: '8.531,93 m²' },
        { campo: 'Cantidad de locales', valor: 'Más de 300' },
        { campo: 'Entorno',            valor: 'Colegios, mercados y áreas urbanizadas' },
        { campo: 'Flujo de visitantes', valor: 'Constante, zona consolidada' },
        { campo: 'Estado comercial',   valor: 'En comercialización' }
      ],

      plano: {
        // En el centro comercial la sección se llama distinto: no se vende
        // disponibilidad de lotes sino distribución de locales.
        etiqueta: 'Planos y distribución',
        // A pedido de INMOL: acá no se muestra qué está disponible, reservado
        // o vendido — cada local tiene su propio precio, así que sólo
        // interesa la disposición física de las áreas.
        disposicion: true,
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

      // Puntos de referencia reales, investigados en Google Maps a partir de
      // la ubicación del proyecto (distancia en auto, la que ve un comprador).
      referencias: [
        { nombre: 'Av. Doble Vía La Guardia',        distancia: '0.2 km', icono: 'via',      angulo: 30 },
        { nombre: 'Colegio Escuela de Héroes',       distancia: '2.9 km', icono: 'colegio',  angulo: 68,
          coordenadas: { lat: -17.8673036, lng: -63.2350201 } },
        { nombre: 'Centro de Salud 23 de Octubre',   distancia: '4.3 km', icono: 'salud',    angulo: 80,
          coordenadas: { lat: -17.8673836, lng: -63.2197896 } },
        { nombre: 'Mercado Abasto Nuevo',            distancia: '4.1 km', icono: 'comercio', angulo: 127,
          coordenadas: { lat: -17.8505902, lng: -63.2296956 } }
      ],

      servicios: [
        'Agua potable', 'Energía eléctrica', 'Áreas verdes',
        'Vías pavimentadas', 'Espacios recreativos', 'Entorno natural'
      ],

      fichaTecnica: [
        { campo: 'Tipología',           valor: 'Urbanización abierta residencial' },
        { campo: 'Ubicación',           valor: 'La Guardia, Santa Cruz' },
        { campo: 'Dirección',           valor: 'Av. Doble Vía La Guardia Km 9' },
        { campo: 'Cantidad de terrenos', valor: '71' },
        { campo: 'Servicios básicos',   valor: 'Agua potable y energía eléctrica' },
        { campo: 'Accesos',             valor: 'Vías pavimentadas' },
        { campo: 'Áreas verdes',        valor: 'Entorno natural con espacios recreativos' },
        { campo: 'Estado comercial',    valor: '100% vendido' }
      ],

      plano: {
        // Mismo criterio que Libertad: sin estados de disponible/reservado/
        // vendido, sólo la disposición de las áreas (cada una con su precio).
        etiqueta: 'Disposición',
        disposicion: true,
        manzanas: 4, lotesPorManzana: 18, prefijo: 'VL',
        categorias: ['Estándar', 'Preferencial', 'Esquina'],
        superficieBase: 275, superficieRango: 225,
        unidad: 'lote', unidadPlural: 'lotes'
      }
    }
  ]
};
