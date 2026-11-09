# ShadowDrill

Plataforma de capacitación en ciberseguridad mediante simulaciones. Trabajo de grado, Ingeniería
de Sistemas, Universidad El Bosque. Este repositorio contiene el prototipo navegable, los
wireframes y los entregables de la prueba con usuarios.

> **Ajusta los enlaces:** reemplaza `SergiusYT/ShadowDrill` por tu usuario/repositorio reales si
> son distintos. El link de GitHub Pages solo funciona con el repositorio **público** y Pages
> activado (ver más abajo).

## Enlaces (GitHub Pages)

- **Inicio:** https://sergiusyt.github.io/ShadowDrill/
- **Prototipo:** https://sergiusyt.github.io/ShadowDrill/prototipo/v1/
- **Wireframes:** https://sergiusyt.github.io/ShadowDrill/prototipo/mockup/wireframes.html
- **Encuesta de usabilidad:** https://sergiusyt.github.io/ShadowDrill/entrega/encuesta.html

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
| `Propuesta_ShadowDrill_FORMATO_OFICIAL.pdf` | Propuesta de trabajo de grado (especificación) |

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
git remote add origin https://github.com/SergiusYT/ShadowDrill.git
git push -u origin main
```

Activar Pages: en GitHub → **Settings → Pages → Build and deployment → Source: Deploy from a
branch → Branch: `main` / `/root`** → Save. En uno o dos minutos queda el link de arriba.
