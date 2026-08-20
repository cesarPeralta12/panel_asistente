/* ============================================================================
   INMOL · PANEL INTERACTIVO DE FERIA
   datos.js — ÚNICO ARCHIVO QUE HAY QUE EDITAR PARA CARGAR CONTENIDO
   ----------------------------------------------------------------------------
   Los textos, cifras, fotografías y videos se tomaron del sitio oficial
   inmol.com.bo y del documento "DATOS PARA ELABORACION SISTEMA EXPOCRUZ"
   que entregó INMOL. Los puntos de referencia se investigaron en Google
   Maps a partir de la ubicación real de cada proyecto (o de los mapas de
   referencia oficiales de INMOL cuando estaban disponibles) — nombre,
   distancia en auto y coordenadas verificadas.

   La disponibilidad de lotes/locales (disponible/vendido/reservado/
   bloqueado) es un snapshot real descargado del sistema de INMOL
   (inmol.sistemas-orange.com.bo), cargado en los archivos
   js/disponibilidad-<proyecto>.js. Para actualizarla antes de la próxima
   feria, hay que volver a correr la herramienta de descarga.
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
    // Idioma para la voz del sistema (respaldo si falta un audio).
    idiomaVoz: 'es-BO',
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
      descripcion: 'Estratégicamente ubicada a la altura del Km 16 de la Doble ' +
                   'Vía La Guardia, a tan solo 3 minutos de la carretera, en una ' +
                   'zona consolidada con vías de acceso pavimentadas, colegios, ' +
                   'centros de salud y mercados. El Municipio de La Guardia ' +
                   'combina el crecimiento urbano, el acceso a servicios básicos, ' +
                   'un clima agradable y un entorno natural atractivo.',

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
        { valor: '1.101',        etiqueta: 'terrenos' },
        { valor: '300 – 600 m²', etiqueta: 'superficie de terrenos' },
        { valor: '64,58 ha',     etiqueta: 'superficie total' },
        { valor: 'Km 16',        etiqueta: 'Doble Vía La Guardia' }
      ],

      // Puntos de referencia del mapa oficial de INMOL para este proyecto
      // ("VÍAS DE ACCESO" + puntos de interés de La Guardia), ubicados en
      // Google Maps para tener distancia real y coordenadas exactas.
      referencias: [
        { nombre: 'Av. Doble Vía La Guardia',      distancia: '0.2 km', icono: 'via',      angulo: 20 },
        { nombre: 'U.E. Victoria',                 distancia: '2.8 km', icono: 'colegio',  angulo: 250,
          coordenadas: { lat: -17.8966432, lng: -63.3204914 } },
        { nombre: 'Centro de Salud San Silvestre', distancia: '2.9 km', icono: 'salud',    angulo: 152,
          coordenadas: { lat: -17.8905435, lng: -63.2876494 } },
        { nombre: 'Mercado Campesino La Guardia',  distancia: '2.9 km', icono: 'comercio', angulo: 238,
          coordenadas: { lat: -17.8914751, lng: -63.3186963 } },
        { nombre: 'Plaza Principal de La Guardia', distancia: '6.8 km', icono: 'plaza',    angulo: 248,
          coordenadas: { lat: -17.8918621, lng: -63.3310429 } }
      ],

      servicios: [
        '1.500 m de pavimento dentro de la urbanización', 'Educación cercana: colegios a fácil acceso',
        'Salud a pocos minutos', 'Mercados y transporte público',
        'Luz y agua potable, con pozo propio', 'Gas e internet de fácil acceso',
        'Áreas verdes y de recreación', 'Área de equipamiento amplio',
        'Drenaje pluvial y protección contra inundaciones'
      ],

      // Ficha técnica: los datos que el vendedor necesita a mano.
      fichaTecnica: [
        { campo: 'Tipología',            valor: 'Urbanización abierta' },
        { campo: 'Ubicación',            valor: 'La Guardia, Km 16 · a 3 min de la carretera' },
        { campo: 'Superficie total',     valor: '64,58 hectáreas' },
        { campo: 'Cantidad de terrenos', valor: '1.101' },
        { campo: 'Superficie de terrenos', valor: '300 m² a 600 m²' },
        { campo: 'Pavimento',            valor: '1.500 m dentro de la urbanización' },
        { campo: 'Servicios básicos',    valor: 'Luz, agua potable (pozo propio), gas e internet' },
        { campo: 'Áreas verdes',         valor: 'Sí, con espacios recreativos y equipamiento' },
        { campo: 'Estado comercial',     valor: 'En comercialización' }
      ],

      plano: {
        etiqueta: 'Disponibilidad',
        prefijo: 'EC',
        // Snapshot real descargado del sistema de INMOL — ver cabecera del
        // archivo. Reemplaza a la disponibilidad de ejemplo.
        disponibilidadReal: DISP_EL_ENCANTO,
        // Plano oficial real (con logo y colores de INMOL), descargado del
        // mismo sistema. imagenAncho/imagenAlto son las dimensiones del
        // plano original; escalaImagen es la escala a la que se descargó
        // assets/planos/el-encanto.jpg (más liviana que el original).
        imagenReal: 'assets/planos/el-encanto.jpg',
        imagenAncho: 7070, imagenAlto: 10000, escalaImagen: 0.5,
        unidad: 'terreno', unidadPlural: 'terrenos'
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
      descripcion: 'Ubicado en la zona Sud Este de Santa Cruz de la Sierra, a ' +
                   'sólo 20 minutos del centro, continuando por la Av. Santos ' +
                   'Dumont, prolongación 8vo anillo, zona Plan 4000. Alta ' +
                   'accesibilidad gracias a su conexión directa con avenidas ' +
                   'principales y transporte público (micros #21 y #109). ' +
                   'Rodeado de colegios y áreas urbanizadas, en una de las ' +
                   'zonas de mayor crecimiento comercial y residencial.',

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
        { valor: '326',         etiqueta: 'locales comerciales' },
        { valor: '9.584,34 m²', etiqueta: 'superficie de terreno' },
        { valor: 'Zona Sur',    etiqueta: 'Santa Cruz' },
        { valor: '8vo anillo',  etiqueta: 'y Av. Santos Dumont' }
      ],

      // Puntos de referencia reales. Los dos primeros son los "Ingresos" del
      // mapa de accesos oficial de INMOL; el resto se investigó en Google
      // Maps a partir de la ubicación del proyecto (distancia en auto).
      referencias: [
        { nombre: 'Ingreso: Av. Santos Dumont Final',           distancia: '0.1 km', icono: 'via', angulo: 45  },
        { nombre: 'Ingreso: Doble Vía a La Guardia (8vo anillo)', distancia: '0.2 km', icono: 'via', angulo: 200 },
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
        'Proyecto terminado, listo para entrega', 'Transporte público: micros #21 y #109',
        'Prevención de incendios aprobada por Alcaldía y Bomberos', 'Sistema de alarma e hidrantes',
        'Proyecto eléctrico aprobado por la CRE', 'Certificado HABITESE',
        'Documentación individualizada y en regla', 'Rodeado de colegios y áreas urbanizadas'
      ],

      fichaTecnica: [
        { campo: 'Tipología',           valor: 'Centro comercial' },
        { campo: 'Ubicación',           valor: 'Zona Sudeste, 8vo anillo y Av. Santos Dumont' },
        { campo: 'Ingresos',            valor: 'Av. Santos Dumont Final (≈30 min del centro) · Doble Vía a La Guardia, 8vo anillo (≈32 min)' },
        { campo: 'Terreno',             valor: '9.584,34 m²' },
        { campo: 'Construcción',        valor: '8.531,93 m²' },
        { campo: 'Cubierta',            valor: '6.057,94 m² (326 locales comerciales)' },
        { campo: 'Contra incendios',    valor: 'Alarma, extintores, hidrantes y tanque propio' },
        { campo: 'Certificaciones',     valor: 'HABITESE · proyecto eléctrico aprobado por la CRE' },
        { campo: 'Estado comercial',    valor: 'En comercialización, proyecto terminado' }
      ],

      plano: {
        // En el centro comercial la sección se llama distinto: no se vende
        // disponibilidad de lotes sino distribución de locales.
        etiqueta: 'Planos y distribución',
        // A pedido de INMOL: acá no se muestra qué está disponible, reservado
        // o vendido — cada local tiene su propio precio, así que sólo
        // interesa la disposición física de las áreas.
        disposicion: true,
        prefijo: 'LB',
        // Numeración real de locales (snapshot del sistema de INMOL), sin
        // mostrar el estado comercial — ver "disposicion" arriba.
        disponibilidadReal: DISP_LIBERTAD,
        imagenReal: 'assets/planos/libertad.jpg',
        imagenAncho: 5500, imagenAlto: 3760, escalaImagen: 0.5,
        unidad: 'local', unidadPlural: 'locales'
      }
    },

    /* ================ 3. URBANIZACIÓN EL ENCANTO 2 (La Guardia) =========== */
    {
      id: 'el-encanto-2',
      nombre: 'Urbanización El Encanto 2',
      subtitulo: 'La Guardia · Santa Cruz',
      tipo: 'Urbanización residencial',
      estadoComercial: 'En comercialización',
      // Todavía faltan fotos, video y la ubicación exacta confirmada por
      // INMOL — se avisa en la tarjeta del menú para no generar expectativas.
      pendiente: true,
      claim: 'La segunda etapa de El Encanto, sobre la carretera a Camiri.',
      descripcion: 'Estratégicamente ubicada a la altura del Km 13 de la Doble ' +
                   'Vía La Guardia, ingresando tan solo 5 km sobre la carretera ' +
                   'a Camiri, en zona consolidada con vías de acceso pavimentadas, ' +
                   'colegios, centros de salud y mercados en sus alrededores.',

      // NOTA: INMOL todavía no entregó el pin exacto de Google Maps (el
      // propio documento de datos lo marca "en proceso de habilitar").
      // Esta coordenada es una estimación a partir de los puntos de
      // referencia de su mapa oficial (Módulo Educativo José Villarroel
      // Robles y Centro Médico Salud ADvenir, los más cercanos al predio) —
      // hay que reemplazarla apenas INMOL confirme la ubicación registrada.
      coordenadas: { lat: -17.9050, lng: -63.2601 },
      direccion: 'Km 13 Doble Vía La Guardia, sobre carretera a Camiri, Santa Cruz',
      enlaceMapa: '',
      recorrido360: '',

      semilla: 63204,

      // Todavía no hay fotos ni video propios de este proyecto; el panel
      // cae automáticamente a la vista satelital generada.
      fotos: [],
      video: '',

      destacados: [
        { valor: '249',                  etiqueta: 'terrenos' },
        { valor: '300 – 29.128 m²',      etiqueta: 'superficie de terrenos' },
        { valor: '25 ha',                etiqueta: 'superficie total' },
        { valor: 'Km 13',                etiqueta: 'Doble Vía La Guardia' }
      ],

      // Puntos de referencia del mapa oficial de INMOL para este proyecto,
      // ubicados en Google Maps (distancia en auto).
      referencias: [
        { nombre: 'Cruce Km 13 Doble Vía La Guardia', distancia: '4.3 km', icono: 'via', angulo: 197,
          coordenadas: { lat: -17.8680828, lng: -63.2721053 } },
        { nombre: 'Módulo Educ. José Villarroel Robles', distancia: '0.3 km', icono: 'colegio', angulo: 249,
          coordenadas: { lat: -17.9040467, lng: -63.2627157 } },
        { nombre: 'Centro Médico Salud ADvenir', distancia: '1.0 km', icono: 'salud', angulo: 16,
          coordenadas: { lat: -17.9139666, lng: -63.2574233 } },
        { nombre: 'Hipermaxi Mi Barrio', distancia: '4.3 km', icono: 'comercio', angulo: 197,
          coordenadas: { lat: -17.8680828, lng: -63.2721053 } }
      ],

      servicios: [
        'Ingreso principal pavimentado, directo desde la carretera a Camiri',
        'Educación cercana: acceso fácil a colegios', 'Salud a pocos minutos',
        'Mercados y transporte público', 'Luz, agua, gas e internet de fácil acceso',
        'Áreas verdes bien ubicadas', 'Área de equipamiento amplio'
      ],

      fichaTecnica: [
        { campo: 'Tipología',            valor: 'Urbanización abierta' },
        { campo: 'Ubicación',            valor: 'La Guardia, Km 13 · 5 km sobre carretera a Camiri' },
        { campo: 'Superficie total',     valor: '25 hectáreas' },
        { campo: 'Cantidad de terrenos', valor: '249' },
        { campo: 'Superficie de terrenos', valor: '300 m² a 29.128 m²' },
        { campo: 'Ingreso',              valor: 'Pavimentado, directo desde la carretera a Camiri' },
        { campo: 'Servicios básicos',    valor: 'Luz, agua, gas e internet' },
        { campo: 'Estado comercial',     valor: 'En comercialización' }
      ],

      plano: {
        etiqueta: 'Disponibilidad',
        prefijo: 'EC2',
        disponibilidadReal: DISP_EL_ENCANTO_2,
        imagenReal: 'assets/planos/el-encanto-2.jpg',
        imagenAncho: 5000, imagenAlto: 7411, escalaImagen: 0.5,
        unidad: 'terreno', unidadPlural: 'terrenos'
      }
    }
  ],

  /* --- ASISTENTE DE VOZ ---------------------------------------------------
     Tarjeta fija a la derecha, siempre visible. No hay botón: al entrar al
     panel se presenta solo y cuenta qué proyectos hay. Cada pregunta es un
     botón que responde hablando y lleva la pantalla a la sección adecuada.
     Al cambiar cualquier texto de aquí hay que regenerar los audios:
       node herramientas/generar-voces.js
     ---------------------------------------------------------------------- */
  asistente: {
    saludo: 'Bienvenido a INMOL, desarrollos inmobiliarios con respaldo y ' +
            'confianza. Le presento nuestros proyectos: Urbanización El ' +
            'Encanto y El Encanto 2, en La Guardia; y Centro Comercial ' +
            'Libertad, en la zona sur de Santa Cruz. Toque el proyecto que ' +
            'desea conocer, o elija una de las preguntas de esta lista.',

    preguntas: [
      {
        id: 'ubicacion',
        texto: '¿Dónde está y qué hay cerca?',
        seccion: 'ubicacion',
        respuesta: p => {
          const tres = (p.referencias || []).slice(0, 3)
            .map(r => `${r.nombre} a ${r.distancia}`).join(', ');
          return `${p.nombre} se encuentra en ${p.direccion}. ` +
                 `En el mapa puede ver su ubicación exacta. Cerca encontrará ${tres}.`;
        }
      },
      {
        id: 'disponibilidad',
        texto: 'Ver disponibilidad',
        seccion: 'lotes',
        respuesta: p => `Le muestro el plano de ${p.nombre}. En verde están las ` +
                        `unidades disponibles, en ámbar las reservadas y en gris ` +
                        `las vendidas. Puede tocar cualquiera para ver su código, ` +
                        `superficie y categoría.`
      },
      {
        id: 'ficha',
        texto: 'Ficha técnica',
        seccion: 'ficha',
        respuesta: p => {
          const f = (p.fichaTecnica || []).slice(0, 4)
            .map(x => `${x.campo}: ${x.valor}`).join('. ');
          return `Ficha técnica de ${p.nombre}. ${f}.`;
        }
      },
      {
        id: 'servicios',
        texto: '¿Qué servicios tiene?',
        seccion: 'resumen',
        respuesta: p => `El proyecto cuenta con ${(p.servicios || []).slice(0, 4).join(', ')}, ` +
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
