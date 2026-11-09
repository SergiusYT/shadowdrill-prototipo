# ShadowDrill — Prototipo

> **Este repositorio es el PROTOTIPO del proyecto de grado ShadowDrill, no el producto final.**
> Es una simulación navegable del flujo principal, sin backend ni despliegue real, hecha para
> validar el diseño con usuarios. La especificación completa está en
> `Propuesta_ShadowDrill_FORMATO_OFICIAL.pdf`.

ShadowDrill es una plataforma de capacitación en ciberseguridad mediante simulaciones. Trabajo de
grado, Ingeniería de Sistemas, Universidad El Bosque. Este repositorio reúne el prototipo
navegable, los wireframes y los entregables de la prueba con usuarios.

> **Ajusta los enlaces:** reemplaza `SergiusYT/shadowdrill-prototipo` por tu usuario/repositorio
> reales si son distintos. El link de GitHub Pages solo funciona con el repositorio **público** y
> Pages activado (ver más abajo).

## Enlaces (GitHub Pages)

- **Inicio:** https://sergiusyt.github.io/shadowdrill-prototipo/
- **Prototipo:** https://sergiusyt.github.io/shadowdrill-prototipo/prototipo/v1/
- **Wireframes:** https://sergiusyt.github.io/shadowdrill-prototipo/prototipo/mockup/wireframes.html
- **Encuesta de usabilidad:** https://sergiusyt.github.io/shadowdrill-prototipo/entrega/encuesta.html

## Contenido

| Ruta | Qué es |
|---|---|
| `index.html` | Página de inicio con enlaces a todo |
| `prototipo/v1/` | Prototipo navegable (HTML/CSS/JS vanilla, sin backend) |
| `prototipo/mockup/wireframes.html` | Wireframes de baja fidelidad |
| `prototipo/README.md` | Documentación del prototipo |
| `entrega/encuesta.html` | Encuesta de usabilidad para 3 usuarios, con gráficas |
| `entrega/respuestas/` | Archivos `respuestas.json` persistidos (prueba con usuarios) |
| `entrega/PRUEBA_USUARIOS.md` | Protocolo, encuesta SUS e informe |
| `entrega/USO_DE_IA.md` | Prompt, skills y agentes usados |
| `Propuesta_ShadowDrill_FORMATO_OFICIAL.pdf` | Propuesta de trabajo de grado (la especificación del proyecto) |
| `CLAUDE.md` | Guía para el asistente de IA (contexto del repositorio) |

### Archivos de contexto

- **`Propuesta_ShadowDrill_FORMATO_OFICIAL.pdf`** — Es la propuesta formal del trabajo de grado y la
  **especificación** del proyecto: objetivos, alcance, los 4 escenarios obligatorios, la arquitectura
  (Mundo A / Mundo B, puente de entrega, API de tracking, monolito Django + PostgreSQL), las
  decisiones de diseño (ADR) y las metas de calidad (cobertura ≥ 75 %, SUS ≥ 70, registro < 1 s). El
  prototipo y los wireframes se construyeron a partir de este documento.
- **`CLAUDE.md`** — Archivo de contexto para Claude Code (el asistente de IA). Resume qué es
  ShadowDrill, la arquitectura planeada, las decisiones de diseño a respetar y las restricciones
  éticas y de alcance, para que la IA trabaje alineada con la propuesta. No es parte del producto;
  es documentación de apoyo (detalle del uso de IA en `entrega/USO_DE_IA.md`).

> Nota: `graphify-out/` (un grafo del código generado como apoyo) queda fuera del repositorio por
> `.gitignore`, porque es regenerable y no es un entregable.

## Abrir en local

No necesita servidor. Doble clic en `index.html`, o:

```
firefox index.html
```

## Persistencia de las respuestas

El sitio es estático (GitHub Pages): no hay backend que escriba archivos. La encuesta guarda en
`localStorage` del navegador mientras se llena. Para dejar las respuestas **en el repositorio**:

1. Llenar los 3 participantes en `entrega/encuesta.html`.
2. Botón **Descargar (.json)** → guardar el archivo en `entrega/respuestas/`.
3. `git add entrega/respuestas/ && git commit -m "resultados de la prueba" && git push`.
4. Para ver de nuevo las gráficas: abrir la encuesta y usar **Cargar (.json)**.

## Publicar en GitHub (repositorio público + Pages)

`gh` no está instalado en este entorno; crea el repositorio en github.com y luego:

```bash
# en la carpeta del proyecto
git remote add origin https://github.com/SergiusYT/shadowdrill-prototipo.git
git push -u origin main
```

Activar Pages: en GitHub → **Settings → Pages → Build and deployment → Source: Deploy from a
branch → Branch: `main` / `/root`** → Save. En uno o dos minutos queda el link de arriba.

## Licencia

**Todos los derechos reservados.** © 2026 Sergio Lozano, Juan Gonzalez y David Bejarano. Este
repositorio se publica solo con fines académicos y de demostración. No se concede permiso para
copiar, usar, modificar ni distribuir la obra sin autorización escrita de los autores. Ver
[`LICENSE`](LICENSE).
