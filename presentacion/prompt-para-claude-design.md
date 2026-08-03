# Prompt para regenerar el diseño en Claude (Artifacts / Design)

Copiá y pegá todo lo que está debajo de la línea.

---

Diseñá una interfaz de kiosco táctil para pantalla grande (1920×1080, horizontal) de una inmobiliaria boliviana llamada **INMOL**, para usar en un stand de feria. Entregala como un único archivo HTML autocontenido, sin librerías externas ni recursos de red: tiene que funcionar 100 % sin internet.

## Identidad visual

- Fondo negro profundo `#08080A`. Superficies elevadas `#15161D` y `#1E1F29`.
- Acento único carmesí `#E3333E`. Usalo con moderación: bordes activos, números, un botón principal por pantalla. Nunca como fondo de bloques grandes.
- Texto blanco `#FFFFFF`, secundario `#C9C9D2`, terciario `#8B8B97`.
- Líneas divisorias de 1 px en `rgba(255,255,255,0.09)`. Nada de sombras marcadas ni bordes gruesos.
- Estados: disponible `#35B36B`, reservado `#E0A33A`, vendido `#55565F`.
- Tipografía: **Inter Tight** (o una sans geométrica equivalente). Títulos en peso 600 con tracking negativo (`-0.03em`); etiquetas en mayúsculas, 600, tracking `+0.2em`, tamaño pequeño y color terciario.
- Sensación buscada: **elegante, oscuro, silencioso y caro**. Mucho aire, poco texto, jerarquía tipográfica marcada. Referencia mental: la web de una desarrolladora inmobiliaria premium, no un dashboard.

## Restricción de diseño que manda sobre todo

Se ve **a 6–8 metros de distancia** y se toca con el dedo. Por lo tanto:

- El texto más chico de la interfaz no baja de 14 px reales a 1920 px de ancho.
- Ningún objeto tocable mide menos de 44 px.
- Todo escala con el ancho de la pantalla: `html { font-size: clamp(13px, 0.86vw, 26px); }` y el resto en `rem`.
- Nada de scroll horizontal. Nada de hover como única señal: todo tiene estado táctil.

## Pantallas

**1. Modo atracción (arranque)**
Ocupa toda la pantalla y corre sola en bucle entre tres proyectos. Imagen de fondo a sangre con efecto Ken Burns lento (16 s) y un velo oscuro en degradado desde la izquierda para que el texto se lea. Sobre el velo, alineado a la izquierda: etiqueta roja pequeña «PROYECTO 1 DE 3», el nombre del proyecto a ~86 px, una frase corta, y una fila de tres cifras grandes con su etiqueta debajo. Abajo: un punto rojo pulsante con «TOQUE LA PANTALLA PARA EXPLORAR» y tres barritas de progreso que se llenan mientras dura cada slide.

**2. Menú de proyectos**
Barra superior con logo y lema. Título «Nuestros proyectos» a ~64 px. Debajo, tres tarjetas verticales de igual ancho, cada una con una imagen de fondo oscurecida por un degradado hacia abajo, una píldora roja con el tipo de proyecto, el nombre, la ubicación, dos cifras, y un botón circular con flecha en la esquina inferior derecha. Al presionar, la tarjeta se marca con borde rojo y la imagen hace un leve zoom.

**3. Pantalla de proyecto**
Barra superior con botón «‹ Proyectos» a la izquierda, nombre del proyecto centrado y logo a la derecha. Debajo, una fila de pestañas en forma de píldora: Resumen · Ubicación · Qué hay cerca · Disponibilidad · Avance de obra. La pestaña activa lleva fondo rojo translúcido (`rgba(227,51,62,0.12)`) y borde rojo tenue. Las secciones cambian con un fundido y un desplazamiento vertical corto.

- **Resumen:** dos columnas. Izquierda: frase grande, descripción y lista de servicios en dos columnas con viñeta roja. Derecha: galería de tres imágenes (una ancha arriba, dos abajo). Debajo, una fila de cuatro cifras destacadas separada por una línea fina.
- **Ubicación:** escenario grande a la izquierda con la vista satelital, y una columna estrecha a la derecha con cuatro niveles de altura seleccionables (Región · Ciudad · Zona · Predio) y un botón rojo «Sobrevuelo automático». Sobre el mapa: un recuadro rojo que marca el terreno, un pin flotante, una etiqueta con el nivel actual arriba a la izquierda y las coordenadas abajo. Al cambiar de nivel, la imagen saliente escala hacia afuera mientras la entrante escala desde adentro: se percibe como un zoom continuo.
- **Qué hay cerca:** diagrama radial sobre fondo oscuro. El proyecto en el centro dentro de un círculo rojo con un halo que late; anillos punteados a 1, 2 y 3 km; cada punto de referencia en su ángulo y distancia, con un ícono lineal rojo dentro de un círculo oscuro, su nombre y la distancia. Al costado, la lista de referencias.
- **Disponibilidad:** el plano de lotes. Manzanas en cuadrícula separadas por calles, cada lote es un rectángulo redondeado y tocable, coloreado por estado, con su número dentro. Arriba: leyenda con los tres estados y su cantidad, y filtros en píldora. A la derecha, una ficha que empieza en estado vacío («Toque una unidad en el plano») y al seleccionar muestra la etiqueta de estado, el código en grande, y las filas manzana / superficie / categoría. **Nunca se muestra el precio**: en su lugar, una nota que remite al asesor.
- **Avance de obra:** a la izquierda un anillo de progreso rojo con el porcentaje general en el centro, animado al entrar. A la derecha, una barra por etapa; las etapas al 100 % se ponen verdes.

**4. Asistente táctil con voz**
Botón flotante rojo abajo a la derecha con ondas concéntricas que se expanden. Al tocarlo se abre un panel lateral derecho de ~32 rem con fondo translúcido y desenfoque. Dentro: avatar circular con un ecualizador de cinco barras que se anima mientras habla, una burbuja con la respuesta escrita, y una lista de preguntas tocables agrupadas en «Elija un proyecto» y «Preguntas frecuentes». Al tocar una pregunta, el panel la responde con voz usando `speechSynthesis` (voz local del sistema, sin red) y a la vez lleva la pantalla a la sección correspondiente.

## Comportamiento

- Arranca siempre en modo atracción, sin que nadie toque nada.
- Cualquier toque entra al menú.
- Tras 90 segundos de inactividad vuelve solo al modo atracción.
- Sin audio en el modo atracción: tiene que funcionar en un pabellón ruidoso.

## Datos de ejemplo

Tres proyectos: **Urbanización El Encanto** (La Guardia, residencial, 192 lotes), **Centro Comercial Libertad** (Santa Cruz de la Sierra, 96 locales) y un tercero marcado como «contenido pendiente». Todos los datos en un único objeto al principio del archivo, fácil de editar.

## Lo que NO quiero

- Barras de acento decorativas ni líneas bajo los títulos.
- Bordes de un solo lado en las tarjetas.
- Degradados de color saturados.
- Texto centrado en párrafos (sólo en títulos).
- Iconografía tipo emoji: los íconos van en SVG lineal, trazo 1.8, esquinas redondeadas.
