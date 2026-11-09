# Respuestas de la encuesta

Aquí van los archivos `respuestas.json` que exporta `entrega/encuesta.html` con el botón
**Descargar (.json)**. Cada archivo guarda los 3 participantes (datos, SUS y preguntas abiertas).

Así se persisten las respuestas en el repositorio (no hay backend; la página solo guarda en el
navegador). Flujo:

1. Llenar los 3 participantes en `encuesta.html`.
2. **Descargar (.json)** → mover el archivo a esta carpeta (p. ej. `respuestas-2026-11.json`).
3. `git add entrega/respuestas/ && git commit -m "resultados de la prueba con usuarios"`.
4. Para volver a ver las gráficas, abrir `encuesta.html` y usar **Cargar (.json)**.
