# Uso de IA en el prototipo

## Herramienta

- Claude Code (CLI) en la carpeta del proyecto, a lo largo de varias sesiones.
- Modelos usados: Claude Opus 5.5 (versión inicial) y Claude Opus 4.8 (rediseño y mejoras posteriores).
- Fuente de contexto: `Propuesta_ShadowDrill_FORMATO_OFICIAL.pdf` y `CLAUDE.md` del repositorio.

## Skills usadas

- `frontend-design`: guía de diseño visual (dirección estética, tipografía, jerarquía).
- `dataviz`: diseño y validación de las gráficas del panel. Se usó su validador de paleta para comprobar que las series (cayó/reportó/ignoró) pasan contraste y daltonismo en modo oscuro.
- `graphify`: generó un grafo de conocimiento del propio código (`graphify-out/`), como apoyo para navegar el proyecto. No forma parte del prototipo.

## Agentes

- No se usaron subagentes. Todo el trabajo lo hizo la sesión principal.

## Verificación automática

- Chromium sin interfaz (`chromium --headless=new`) para abrir el prototipo, recorrer la tarea principal, revisar la vista del responsable y tomar capturas en escritorio y móvil (390 px). Es solo apoyo de revisión; no forma parte del entregable.

## Prompt final

Pegado por el estudiante (enunciado de la actividad):

```
Actividad: su primer prototipo
Construyan el prototipo del flujo principal de su proyecto a partir del mockup de la sesión anterior.
Criterios de aceptación:
- Un usuario completa la tarea principal sin ayuda
- Al menos tres pantallas o estados conectados
- Datos simulados del dominio de su proyecto, no «Lorem ipsum»
- Sin backend ni despliegue en nube: se abre en el navegador
- Si usaron IA, entregan también el prompt final, skills, agentes utilizados.
- Entregar informe de encuesta donde se aplique la evaluación del prototipo al menos a 3 personas.
Entregable: archivo o repositorio, HTML vanilla o proyecto con framework, prueba con 3 usuarios,
dónde dudaron y qué cambiarían, una iteración: versión ajustada con lo observado.
```

Respuestas del estudiante a las preguntas de la IA:

```
- Mockup: "tenemos que crearlo, aún no lo tengo".
- Tarea principal: "no tengo nada como tal, hay que crear la idea y crearlo en sí".
```

Prompt consolidado equivalente, para reproducir el resultado:

```
Lee Propuesta_ShadowDrill_FORMATO_OFICIAL.pdf y CLAUDE.md. Crea un prototipo navegable en HTML,
CSS y JS vanilla, sin backend, del flujo principal del administrador de seguridad de ShadowDrill:
panel de indicadores agregados, crear campaña en 4 pasos (escenario, destinatarios, canal y
ventana no anunciada, revisar y lanzar con confirmación ética), seguimiento en vivo con registro
de eventos con hora exacta, cierre de campaña que aplique reglas explícitas de puntuación, y
perfil del empleado con competencias por escenario y siguiente simulación sugerida por regla.
Incluye los 4 escenarios (phishing, ingeniería social, archivo sospechoso, página falsa), una
vista previa de lo que recibe el empleado en su correo o Teams, y un rol de responsable
organizacional que solo vea datos agregados. Usa datos simulados de una cooperativa colombiana
ficticia. Respeta: registrar la descarga antes de entregar el PDF, no capturar contraseñas,
sin IA en las reglas. Crea también wireframes de baja fidelidad y un protocolo de prueba con
3 usuarios con encuesta SUS.
```

A partir de ese prompt base, en sesiones siguientes se pidieron mejoras concretas, entre ellas:
el rediseño del panel con estética de consola (LED, dial, medidor VU, mapa de puntos); un mapa de
relaciones (grafo de fuerzas en SVG) que une canales, campañas, amenazas, áreas y resultados, con
la capa de personas solo para el administrador; la vista previa del Mundo B dentro de un PC de
escritorio con Windows 11, Outlook y Teams de escritorio, y un navegador que abre el enlace único;
diferenciar phishing (correo HTML de Nómina) de página falsa (correo estilo Microsoft 365 y login
estilo Microsoft 365, sin capturar datos); una pantalla de carga de arranque y en los cambios
principales; y el refinado del menú lateral y de los 4 formularios de campaña con estilo terminal.

## Qué hizo el estudiante y qué hizo la IA

Completar con honestidad antes de entregar:

- IA: código del prototipo (v1 y mejoras posteriores), wireframes, protocolo de prueba y plantilla de encuesta SUS.
- Estudiante: definición del proyecto (propuesta), dirección y revisión del prototipo, aplicación de la prueba a 3 personas, análisis de resultados y decisiones de la iteración.

> Pendientes de la entrega (dependen del estudiante, no de la IA): aplicar la encuesta a 3+ personas y llenar el informe en `PRUEBA_USUARIOS.md`; crear `prototipo/v2` con al menos un ajuste de lo observado.
