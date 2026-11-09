# Prueba del prototipo ShadowDrill con usuarios

Protocolo, guion de tareas, encuesta e informe. Aplicar a mínimo 3 personas. Cada sesión toma unos 15 minutos.

## 1. Preparación

- Abrir `prototipo/v1/index.html` en Firefox o Chrome. No necesita internet ni servidor.
- Recargar la página antes de cada participante. Así el estado vuelve al inicio.
- El facilitador no ayuda durante la tarea. Si la persona pregunta, responder: «¿Qué harías si yo no estuviera?». Anotar la duda.
- Pedir que piense en voz alta.
- Cronometrar desde que lee la tarea hasta que dice la respuesta final.

Texto de consentimiento para leer:

> Vamos a probar un prototipo, no a ti. No hay respuestas incorrectas. Los datos y personas que verás son ficticios. Anotaré dónde dudas para mejorar el diseño. No grabaré tu nombre en el informe.

## 2. Contexto que se le lee al participante

> Eres el administrador de seguridad de la Empresa de demostración. Usas ShadowDrill para enviar simulacros de amenazas a los empleados sin avisarles, y así saber cómo reaccionan de verdad.

## 3. Tarea principal

> En el área de Contabilidad sospechan que la gente descarga facturas sin revisarlas. Lanza una campaña de **archivo sospechoso por correo** para **toda el área de Contabilidad**, envíala ahora para la demostración, espera a que lleguen algunas decisiones y **cierra la campaña**. Después dime **qué simulación se le sugiere ahora a Laura Gómez Rincón**.

Criterio de éxito: la persona dice el escenario que aparece en «Siguiente simulación sugerida» del perfil de Laura, sin ayuda.

Ruta esperada (no se le muestra al participante):

1. Panel → «Nueva campaña».
2. Paso 1: elegir «Archivo sospechoso» → Continuar.
3. Paso 2: marcar «Contabilidad» → Continuar.
4. Paso 3: elegir «Correo corporativo», dejar marcado «Enviar ahora» → Continuar.
5. Paso 4: marcar la confirmación → «Lanzar campaña».
6. Esperar eventos → «Cerrar campaña y evaluar».
7. Clic en «Laura Gómez Rincón» → leer «Siguiente simulación sugerida».

## 4. Tareas secundarias (opcionales)

- T2. Usa «Ver lo que recibe el empleado» y actúa como un empleado que reporta el mensaje. ¿Qué cambió en la campaña?
- T3. Cambia a «Responsable» en «Entrar como». ¿Qué información ves y cuál ya no ves?

## 5. Hoja de observación (una por participante)

| Campo | Participante 1 | Participante 2 | Participante 3 |
|---|---|---|---|
| Perfil (carrera, semestre o cargo) | | | |
| ¿Completó la tarea principal sin ayuda? (sí/no) | | | |
| Tiempo (min:s) | | | |
| Respuesta dada | | | |
| Paso donde dudó (número de la ruta) | | | |
| Qué dijo o hizo al dudar | | | |
| Errores (clic equivocado, volvió atrás) | | | |
| T2 completada (sí/no) | | | |
| T3 completada (sí/no) | | | |

## 6. Encuesta SUS (System Usability Scale)

Escala: 1 = totalmente en desacuerdo, 5 = totalmente de acuerdo.

| # | Afirmación | P1 | P2 | P3 |
|---|---|---|---|---|
| 1 | Creo que me gustaría usar este sistema con frecuencia. | | | |
| 2 | Encontré el sistema innecesariamente complejo. | | | |
| 3 | Pensé que el sistema era fácil de usar. | | | |
| 4 | Creo que necesitaría ayuda de una persona técnica para usarlo. | | | |
| 5 | Las funciones del sistema estaban bien integradas. | | | |
| 6 | Había demasiada inconsistencia en el sistema. | | | |
| 7 | Imagino que la mayoría aprendería a usarlo muy rápido. | | | |
| 8 | Encontré el sistema muy engorroso de usar. | | | |
| 9 | Me sentí muy seguro usando el sistema. | | | |
| 10 | Necesité aprender muchas cosas antes de poder usarlo. | | | |
| | **Puntaje SUS** | | | |

Cálculo por participante:

- Ítems impares (1, 3, 5, 7, 9): respuesta − 1.
- Ítems pares (2, 4, 6, 8, 10): 5 − respuesta.
- Sumar los 10 valores y multiplicar por 2,5. Resultado de 0 a 100.
- Meta del proyecto: promedio ≥ 70. La propuesta exige 5 participantes para la validación final. Esta prueba de clase usa 3.

## 7. Preguntas abiertas

1. ¿En qué momento no supiste qué hacer?
2. ¿Qué nombre o botón te confundió?
3. ¿Qué información esperabas ver y no estaba?
4. ¿Qué cambiarías primero?
5. ¿Te quedó claro que el empleado recibe el mensaje en su correo real y no entra a ShadowDrill?

## 8. Informe de resultados

Llenar después de las 3 sesiones.

### 8.1 Resumen

| Métrica | Valor |
|---|---|
| Participantes | 3 |
| Completaron la tarea sin ayuda | _ de 3 |
| Tiempo promedio | |
| SUS promedio | |

### 8.2 Dónde dudaron

| Paso | Cuántos dudaron | Qué pasó | Evidencia (cita textual) |
|---|---|---|---|
| | | | |

### 8.3 Qué cambiarían

| Cambio propuesto | Lo pidieron | Prioridad (alta, media, baja) | ¿Entra en v2? |
|---|---|---|---|
| | | | |

### 8.4 Iteración: cambios aplicados en v2

| Problema observado | Cambio en `prototipo/v2` | Pantalla |
|---|---|---|
| | | |
