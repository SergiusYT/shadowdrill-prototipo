# Prototipo ShadowDrill

Prototipo navegable del flujo principal. HTML, CSS y JS vanilla. Sin backend: todo corre en el navegador y los datos son ficticios.

## Abrir

```
firefox prototipo/v1/index.html
```

Las campañas que crees se guardan en `localStorage` del navegador y sobreviven a la recarga. Para volver a los datos de demo usa «Reiniciar datos de demo» en el menú lateral.

La capa `api` de `v1/js/app.js` es una API falsa: misma forma que la real, con latencia simulada (`setTimeout`). Al cambiar de pantalla se ve un estado de carga y al lanzar una campaña un estado de envío.

La portada (`#/inicio`) usa GSAP, ScrollTrigger, Draggable y Lenis desde CDN (jsdelivr) para el efecto parallax y el carrusel. Sin conexión, la portada queda estática y el panel funciona igual.

## Contenido

| Ruta | Qué es |
|---|---|
| `mockup/wireframes.html` | Wireframes de baja fidelidad de las pantallas |
| `v1/` | Prototipo navegable (rediseño oscuro con portada parallax y panel estilo consola) |
| `../entrega/PRUEBA_USUARIOS.md` | Protocolo, encuesta SUS e informe de la prueba |
| `../entrega/USO_DE_IA.md` | Prompt, skills y agentes usados |

> `prototipo/v2/` (versión ajustada tras la prueba con usuarios) aún no se ha creado: se hará con lo observado en las sesiones de prueba.

## Pantallas y estados de v1

0. Portada con historia al hacer scroll: un portátil (Outlook) y un celular (bloqueado, recibe la notificación de Teams, se abre el chat: el atacante escribe, la persona contesta, llega el enlace único y ahí escribe el código) reciben las 4 amenazas (correo de nómina, chat de falso soporte, factura PDF, intranet falsa). Cada escena muestra el mecanismo de registro de la propuesta: enlace único por empleado y campaña, y en el archivo sospechoso un enlace intermediario (`/api/descarga/{token}`) que registra DESCARGA antes de entregar el PDF (ADR 2); al abrir el PDF, la baliza de 1×1 px (`/api/beacon/{token}`) registra APERTURA como dato complementario. Al fondo, el plano de la sede de la empresa con sus áreas, que el radar barre, y personas que rotan. En cada una se ve el clic y el sello del evento registrado, y al final el perfil agregado. La historia cierra con «Cuatro formas de caer. Cuatro formas de aprender.». Después sigue un recorrido de 7 capítulos numerados; cada uno termina con una pregunta que lleva al siguiente: el problema (estudio [1] mostrado como una terminal de Ubuntu que se escribe sola), el cambio (dos tarjetas lado a lado, Antes y Después; al pasar el cursor, o tocar en móvil, una franja inclinada revela el detalle), cómo funciona (carrusel automático de 8 pasos que siempre arranca en el 1 al entrar en pantalla, se detiene con el cursor, se arrastra y tiene flechas y puntos), por qué el dato es real (parallax propio con dos esferas: Mundo B, una esfera de cristal que deja ver la bandeja, el chat de Teams y el celular del empleado, con sus canales en órbita; Mundo A, un domo con escudo hexagonal y perímetro de acceso que guarda el panel de perfil agregado, con sus roles en órbita; al final el puente de entrega y registro entre los dos), para quién (tarjetas que giran: al frente el ícono y el actor, al dorso su papel y lo que gana), por qué ShadowDrill (matriz comparativa con la columna de ShadowDrill destacada y medidores de cobertura; en móvil, una tarjeta por capacidad) y ética (el «0 contraseñas capturadas» con un campo tachado y el registro que queda, más 6 garantías en tarjetas). Cierra con la elección de rol. En escritorio, un riel a la derecha marca el capítulo actual. Sin GSAP, el carrusel se muestra como rejilla. Sin GSAP o con movimiento reducido, la historia se muestra estática.
1. Panel de indicadores (gráficas: tasa de fallo, evolución por campaña con filtro por canal, resultados por escenario, distribución, mapa de calor): mapa de calor área por amenaza, datos agregados y campañas en curso. Usa todo el ancho de la pantalla y tiene el mismo estilo de la portada. Al entrar, las líneas se dibujan, las barras crecen, la dona se llena por segmentos y las cifras cuentan desde cero. Las tablas de campañas, empleados e historial muestran cada fila como tarjeta, con chips de escenario y canal, avatares y medidores de fallo.
2. Nueva campaña en 4 pasos: escenario, destinatarios, canal y ventana, revisar y lanzar.
3. Campaña en curso: contadores, destinatarios y registro de eventos con hora al milisegundo.
4. Vista del empleado (modal): el correo o Teams que recibe, con acciones para caer o reportar.
5. Campaña cerrada: se aplican las reglas y se actualizan los perfiles.
6. Perfil del empleado: competencias en radar y barras, siguiente simulación sugerida (R-SEL-1) e historial con la regla aplicada.
7. Rol responsable: solo datos agregados. Las secciones individuales quedan bloqueadas.

## Reglas simuladas

- Fallo (clic, descarga, entregar el dato, enviar el formulario falso): 0 puntos.
- Sin decisión al cerrar la ventana: 60 puntos.
- Reportar a seguridad: 100 puntos.
- Competencia por escenario = promedio de puntos.
- Siguiente simulación = escenario con menor puntaje. Empate: el que lleva más tiempo sin aplicarse.

## Archivos de v1

- `v1/js/datos.js`: organización, 16 empleados, 4 escenarios, reglas y 8 campañas históricas.
- `v1/js/app.js`: enrutador por hash, vistas, reglas de evaluación y simulación de eventos.
- `v1/js/portada.js`: portada (historia con escena fija, línea de tiempo de GSAP atada al scroll y capas de fondo con profundidad) e íconos.
- `v1/js/graficas.js`: gráficas SVG del panel con estética de consola (línea con brillo, barras LED, dial de marcas, medidor VU, sparkline). Colores de series validados para modo oscuro con la skill `dataviz`.
- `v1/js/grafo.js`: mapa de relaciones del panel (grafo de fuerzas en SVG) entre canales, campañas, amenazas, áreas y resultados; la capa de personas solo la ve el administrador.
- `v1/js/vista-previa.js`: vista del Mundo B. Monta el PC de escritorio (Windows 11) con Outlook y Teams, el navegador que abre el enlace único, y el flujo al actuar como la persona (caer, reportar, abrir el PDF).
- `v1/js/cargador.js`: pantalla de carga de arranque y de los cambios principales (entrar a la consola, cambiar de sección o de rol). El contenido se renderiza al levantarse, para que las animaciones de entrada corran al revelarse.
- `v1/js/carpetas.js`: carpetas de vidrio por escenario en Campañas (adaptación vanilla del componente GlassFolder).
- `v1/css/estilos.css`: estilos. Paleta cian/índigo sobre fondo oscuro; ámbar solo para advertencias. Rojo reservado para «cayó».
