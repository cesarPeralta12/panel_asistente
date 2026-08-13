# INMOL · Panel interactivo de feria

Panel táctil para pantalla grande que reemplaza la maqueta física.
**Funciona 100 % sin conexión a internet.**

---

## Cómo abrirlo

Hay tres formas, de la más simple a la más completa:

**1. Doble clic en `index.html`** — se abre en el navegador predeterminado, en una
ventana normal. Sirve para revisar y para editar contenido.

**2. Doble clic en `INICIAR PANEL.bat`** — modo feria: pantalla completa, sin barra
de direcciones ni pestañas. Es como se va a ver en el stand.
Para salir: `Alt + F4`.

**3. Servidor local** (opcional, sólo si algún navegador bloquea archivos locales):

```
cd "C:\Users\cesar\OneDrive\Desktop\panel interactivo"
python -m http.server 5173
```

Y abrir `http://localhost:5173` en el navegador. Sigue sin usar internet: el servidor
corre en la misma laptop.

> No hace falta instalar nada ni ejecutar `npm install`. El panel es HTML, CSS y
> JavaScript puro. La carpeta se copia a un pendrive y funciona en cualquier Windows
> con Chrome.

### Si cambiaste algo y no ves el cambio

El navegador guarda en caché los estilos y los datos. Recargá **forzando la caché**:

`Ctrl + Shift + R`   (o `Ctrl + F5`)

Con una recarga normal (`F5`) puede seguir mostrando la versión anterior.

---

## Orientación de la pantalla

El panel se adapta solo a **tótem vertical (9:16)** y a **pantalla horizontal (16:9)**.
No hay que configurar nada: detecta la proporción y reacomoda todo, incluido el
plano de lotes, que en vertical apila las manzanas para que salgan más grandes.

Verificado con clics reales en 1920×1080 y en 1080×1920:

```
node herramientas/probar-clics.js "" 1080 1920
```

## Regenerar la propuesta comercial

```
.\herramientas\capturar.ps1
npm install pptxgenjs
node herramientas/generar-presentacion.js
```

Deja el PowerPoint actualizado en `presentacion/`.

## Recomendaciones de hardware para el tótem

| Punto | Recomendación |
|---|---|
| **Sistema operativo** | **Mini PC con Windows**, no Android. El arranque en kiosco es un `.bat`, y actualizar la disponibilidad de lotes durante la feria es meter un pendrive y reemplazar un archivo. En un tótem Android eso no es directo: vienen con un launcher de cartelería cerrado. |
| **Tamaño** | 43" es el mínimo razonable; **55" es notablemente mejor** para el plano de lotes. En vertical, un 43" da 53 cm de ancho útil; un 55" da 68 cm. |
| **Resolución** | Full HD alcanza y sobra. El panel escala solo si es 4K, pero no vale pagar la diferencia. |
| **Táctil** | **PCAP (capacitiva)**, no infrarroja. La infrarroja usa un marco de LEDs que se dispara con polvo, mangas e insectos: en diez días de feria da toques fantasma. |
| **Brillo** | 450–500 cd/m² sirve con luz controlada. Si hay opción de **700 cd/m² o vidrio antirreflejo**, vale la pena: los pabellones suelen tener techo translúcido. |
| **Ranura 4G** | No hace falta. El panel funciona sin conexión. |
| **Acceso trasero** | Pedir **puerta trasera con llave** y acceso al USB del Mini PC sin desarmar el tótem. |

## Cómo funciona en el stand

Al encender la pantalla, el panel arranca solo en **modo atracción**: una
presentación que rota entre los tres proyectos, pensada para verse desde el
pasillo. No hace falta que nadie toque nada.

Cuando alguien toca la pantalla, entra al menú de proyectos. Si pasan
**90 segundos sin que nadie la use**, vuelve solo al modo atracción.

### Atajos para el operador
| Tecla | Acción |
|---|---|
| `D` | Panel técnico: resolución, estado de la voz, conexión |
| `A` | Ir al modo atracción |
| `M` | Ir al menú de proyectos |
| `Esc` | Cerrar el asistente y volver al menú |

---

## Aviso «Datos de ejemplo»

Mientras el panel muestre contenido de demostración, aparece un cartelito
discreto abajo a la derecha. Es a propósito: evita que alguien confunda los
192 lotes de ejemplo con disponibilidad real.

**Cuando esté cargado el contenido definitivo de INMOL**, apagarlo en
`js/datos.js`:

```js
datosDeEjemplo: false
```

## Cargar el contenido real

Todo el contenido editable está en **un solo archivo**: `js/datos.js`.
Lo que está marcado con `// DEMO` es contenido de ejemplo que hay que reemplazar.

Ahí se cambian:

- Nombre, subtítulo y descripción de cada proyecto
- Dirección y coordenadas
- Puntos de referencia cercanos y sus distancias
- Servicios del proyecto
- Etapas de obra y su porcentaje de avance
- Cantidad de manzanas, lotes por manzana, categorías y superficies
- Segundos de inactividad y duración de cada slide
- Texto y respuestas del asistente

No hace falta compilar nada: se guarda el archivo y se recarga la página (`F5`).

---

## La vista satelital sin internet

El panel muestra la ubicación con una **torre de cuatro niveles**
(Región → Ciudad → Zona → Predio). Al cambiar de nivel hace un zoom animado
que se percibe como Google Earth, pero **sin pedir nada a la red**.

Hoy esos cuatro niveles se dibujan por software para que el panel funcione y
se pueda demostrar. **Para la feria hay que reemplazarlos por capturas reales.**

### Cómo obtener las capturas reales

1. Instalar **Google Earth Pro para escritorio** (es gratuito).
2. Ir a cada proyecto por sus coordenadas:
   - Urbanización El Encanto: `-17.9053, -63.2958`
   - Centro Comercial Libertad: `-17.8879, -63.1740`
3. Encuadrar cada uno de los cuatro niveles y usar **Archivo → Guardar → Guardar imagen**,
   en la resolución máxima, **dejando visible la atribución de Google**.
4. Guardar los archivos en `assets/proyectos/<id-del-proyecto>/` como
   `n0.jpg`, `n1.jpg`, `n2.jpg`, `n3.jpg`.
5. En `js/datos.js`, agregar dentro del proyecto:
   ```js
   satelital: [
     'assets/proyectos/el-encanto/n0.jpg',
     'assets/proyectos/el-encanto/n1.jpg',
     'assets/proyectos/el-encanto/n2.jpg',
     'assets/proyectos/el-encanto/n3.jpg'
   ],
   ```

> **Importante:** los términos de servicio de Google **prohíben descargar y
> almacenar los tiles del mapa** para uso offline. Guardar imágenes desde
> Google Earth Pro con su atribución visible sí está previsto para
> presentaciones, y es el camino correcto. Si se necesita un mapa navegable
> de verdad sin conexión, hay que licenciar **Mapbox** o **MapTiler**, que sí
> permiten paquetes offline.

---

## El asistente con voz (retirado)

El asistente táctil con voz se quitó del panel por decisión del cliente.

Todo su código y los 22 audios grabados con voz neuronal boliviana quedaron
guardados en **`_retirado/asistente/`**. Si más adelante lo quieren de vuelta,
está completo y probado: no hay que rehacerlo.

Esa carpeta no la carga el panel. Se puede borrar sin ningún efecto.

---

## Preparar el equipo del stand

Esto es lo que separa una demo de una instalación que aguanta diez días:

- [ ] Desactivar **actualizaciones automáticas** de Windows
- [ ] Desactivar **suspensión**, **salvapantallas** y **apagado de pantalla**
- [ ] Desactivar **notificaciones** (Modo concentración / No molestar)
- [ ] Poner `INICIAR PANEL.bat` en la carpeta de **Inicio** de Windows
      (`Win + R` → `shell:startup`) para que arranque solo al encender
- [ ] Configurar la BIOS/UEFI para que el equipo **encienda solo al volver la luz**
- [ ] Verificar la voz en español (tecla `D`)
- [ ] Probar en la **pantalla real**, no en el monitor de desarrollo:
      el texto que se ve bien en un monitor de escritorio suele quedar
      **demasiado chico** a 6 metros
- [ ] Dejar un **equipo de respaldo** con la misma carpeta copiada
- [ ] Dejar un **pendrive** con la carpeta completa

---

## Estructura de archivos

```
panel interactivo/
├── INICIAR PANEL.bat        Arranca el panel en modo kiosco
├── index.html               Estructura de la aplicación
├── css/
│   ├── estilos.css          Diseño (colores de marca INMOL)
│   └── fuentes.css          Inter Tight embebida (funciona sin internet)
├── js/
│   ├── datos.js             ← EL ÚNICO ARCHIVO QUE SE EDITA
│   ├── mapas.js             Vista satelital, plano de lotes, referencias
│   ├── voz.js               Asistente hablado (voz local de Windows)
│   └── app.js               Navegación, modo atracción, secciones
├── assets/
│   ├── inmol-logo.png       Logotipo oficial (isotipo rojo + texto blanco)
│   ├── fonts/               Tipografía de marca
│   └── proyectos/           ← Aquí van las capturas satelitales reales
├── _retirado/               Asistente con voz — quitado, guardado por si vuelve
├── herramientas/            (sólo desarrollo — el kiosco no las necesita)
│   ├── capturar.ps1         Capturas del panel, horizontal y vertical
│   ├── generar-presentacion.js  Arma la propuesta comercial en PowerPoint
│   └── probar-clics.js      Verifica con clics reales que toda la pantalla responda
└── presentacion/
    └── capturas/            Capturas para la propuesta comercial
```

---

## Enlaces directos (para pruebas)

Sirven para abrir una vista concreta sin navegar:

```
index.html#/menu
index.html#/proyecto/el-encanto/lotes
index.html#/proyecto/el-encanto/ubicacion/nivel-3
index.html#/proyecto/libertad/avance
```

Agregando `?quieto=1` antes del `#` se congelan las animaciones y el retorno
automático, que es lo que usa el script de capturas.

---

## Tecnología

HTML, CSS y JavaScript sin dependencias ni compilación.

Se eligió así a propósito: en una feria sin internet, con un equipo que se
apaga y se enciende, **cada dependencia externa es un punto de falla**. Este
panel es una carpeta que se copia a un pendrive y funciona en cualquier
Windows con Chrome, sin instalar nada.
