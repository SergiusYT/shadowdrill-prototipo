# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado del repositorio

La fuente es `Propuesta_ShadowDrill_FORMATO_OFICIAL.pdf`, la propuesta de trabajo de grado (Ingeniería de Sistemas, U. El Bosque). Ese documento es la especificación. Cuando exista código Django, agrega aquí los comandos reales de build, lint y test. No los inventes antes.

Existe un prototipo de clase en `prototipo/` (HTML/CSS/JS vanilla, sin backend, se abre con `firefox prototipo/v1/index.html`). Entregables de la actividad en `entrega/`. Ver `prototipo/README.md`.

## Qué es ShadowDrill

Plataforma de capacitación en ciberseguridad. Un administrador de seguridad envía simulaciones de amenazas sin aviso a los empleados por sus canales corporativos reales. La plataforma registra la decisión del empleado en el momento exacto y construye un perfil de comportamiento por empleado.

Escenarios (los 4 son obligatorios): phishing, ingeniería social, archivo sospechoso y página falsa.

## Arquitectura planeada

- **Mundo A:** panel web interno. Solo entran dos roles: el administrador de seguridad y el responsable organizacional.
- **Mundo B:** el entorno real del empleado (correo Exchange/M365, Teams, teléfono). El empleado nunca inicia sesión ni ve la plataforma.
- **Puente de entrega:** SMTP transaccional + conector de Teams. Se dispara cuando se activa una campaña.
- **API de tracking (DRF):** endpoints con token único por empleado y campaña, por ejemplo `/api/descarga/{token}` y `/api/beacon/{token}`. Cada interacción se registra con marca de tiempo.
- **Monolito modular:** un servicio Django y una base PostgreSQL. Componentes separados por interfaces:
  - Gestión de campañas
  - Puente de envío (`IEnvio`)
  - Registro de eventos (`ITracking`, `IEventos`)
  - Evaluación por reglas (`IEvaluacion`)
  - Perfil de competencias (`IPerfil`)
  - Repositorio (`IDatos`)
  - Panel de indicadores
- **Despliegue:** Docker Compose con los contenedores `app` (Django), `mail-worker` (puente de envío) y `db` (PostgreSQL). La base de datos no se expone a Internet.

Flujo crítico del escenario de archivo sospechoso:
1. El clic en «descargar» llega al servidor.
2. Se registra el evento DESCARGA. Esta es la señal de decisión.
3. Después se entrega un PDF generado con una baliza de 1×1 px.
4. La apertura del PDF registra APERTURA, que es solo complementaria.

## Decisiones de diseño (respetar)

- ADR 1: entrega por canal real, nunca una bandeja simulada dentro de la plataforma.
- ADR 2: registrar el evento antes de entregar el contenido.
- ADR 3: solo reglas explícitas y auditables. Nada de IA/ML en el MVP.
- ADR 4: monolito modular, sin microservicios.
- Panel en HTML/CSS/JS sobre plantillas Django. Sin React/Vue.

## Restricciones éticas y de alcance

- Nunca ejecutar código malicioso real, capturar contraseñas reales ni generar archivos con macros o `.exe`.
- Los resultados individuales nunca se muestran públicamente. Solo se exponen de forma agregada.
- Fuera del MVP: Active Directory/SSO, app móvil nativa, gamificación con puntajes públicos.

## Metas de calidad

- Cobertura de pruebas unitarias ≥ 75 % sobre las reglas de evaluación y de selección.
- Pruebas de integración sobre el flujo escenario → evento → evaluación → perfil.
- Registro del evento de decisión en menos de 1 s.
- Usabilidad del panel: SUS ≥ 70.

## Forma de trabajo

- Scrum con 8 sprints de 2 semanas.
- Ramas `feature/*` que se integran a `main` por pull request, revisado por alguien distinto al autor.
- Backlog en GitHub Issues. Integración continua con GitHub Actions.
