// Vista previa del Mundo B: lo que recibe el empleado en su PC de trabajo (Windows 11).
// Correo llega a Outlook y Teams a Teams de escritorio. Cada persona tiene su propio enlace
// único; al actuar, el evento se registra antes de mostrar el contenido (ADR 2) y el enlace
// se abre en el navegador del mismo PC.

// Código del enlace único: estable por escenario y persona (en el sistema real lo genera el backend).
function tokenDe(texto) {
  let h = 2166136261;
  for (const ch of texto) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h.toString(16).padStart(8, '0');
}
const URL_ESC = {
  phishing: t => `https://miempresa-pagos.co/c/${t}`,
  ingenieria: t => `https://migracion-miempresa.net/v/${t}`,
  archivo: t => `https://proveedor-fe.com/d/${t}`,
  pagina: t => `https://miempresa-intranet.net/login?t=${t}`
};
const TITULO_WEB = { phishing: 'Pago de prima', ingenieria: 'Portal de migración', archivo: 'Descarga de factura', pagina: 'Iniciar sesión en su cuenta' };
const TIPS_ESC = {
  phishing: 'El dominio del remitente era miempresa-pagos.co, no miempresa.co. Nómina nunca pide confirmar cuentas por correo.',
  ingenieria: 'Mesa de ayuda nunca pide códigos de verificación. El usuario aparecía como «externo».',
  archivo: 'El proveedor no estaba registrado y el correo presionaba con urgencia y mora.',
  pagina: 'La dirección era miempresa-intranet.net. La intranet real está en intranet.miempresa.co.'
};
const BENIGNOS = [
  ['Talento Humano', 'Pausas activas de noviembre', 'Les compartimos el horario de…', '8:40'],
  ['Operaciones', 'Turnos de la semana', 'Adjunto la programación de…', 'Ayer'],
  ['Comité de seguridad', 'Acta de la reunión', 'Quedan los compromisos del…', 'Ayer']
];
const svgP = p => `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const urlMarcada = (url, tok) => url.replace(tok, `<b>${tok}</b>`);
const buzonDe = empId => (empId && estado.campanas.find(c => c.destinatarios.includes(empId) && c.buzon)?.buzon) || ORG.buzon;
const SV = {
  min: '<path d="M5 12h14"/>', max: '<rect x="5" y="5" width="14" height="14" rx="1"/>', cerrar: '<path d="m6 6 12 12M18 6 6 18"/>',
  atras: '<path d="M19 12H5M11 18l-6-6 6-6"/>', adelante: '<path d="M5 12h14M13 6l6 6-6 6"/>', recargar: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
  mas: '<path d="M12 5v14M5 12h14"/>', puntos: '<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>',
  estrella: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>', descarga: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  buscar: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>', video: '<rect x="2" y="7" width="13" height="10" rx="2"/><path d="m15 12 7-4v8z"/>',
  llamar: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
  campana: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21h4"/>', chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
  equipos: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 4a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.6"/>', calendario: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
  nube: '<path d="M7 18a5 5 0 0 1-.5-10A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z"/>', clip: '<path d="m21 11-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7"/>',
  enviar: '<path d="m22 2-7 20-4-9-9-4z"/>', carita: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14a4 4 0 0 0 7 0"/>', compartir: '<path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v13"/>'
};
const ic = k => svgP(SV[k]);
const controles = () => `<span class="pc-ctl">${ic('min')}${ic('max')}<i class="pc-x">${ic('cerrar')}</i></span>`;

// ---- Mensaje en el PC ----
function mensajeHTML(esc, empId, interactivo, canal) {
  const e = ESCENARIOS[esc], persona = empId ? emp(empId) : EMPLEADOS[0];
  canal = canal || e.canales[0];
  const buzon = buzonDe(empId);
  const app = canal === 'teams' ? ventanaTeams(esc, persona, interactivo) : ventanaOutlook(esc, persona, interactivo, buzon);
  const comoReporta = canal === 'teams'
    ? `En Teams, la persona reporta con <b>⋯ › Compartir en Outlook</b> hacia <b>${buzon}</b>.`
    : `En Outlook, el botón <b>Reportar</b> de la cinta envía el mensaje a <b>${buzon}</b>.`;
  return `<div class="prev prev-${canal}">
    <div class="prev-escena">${pc(app, esc, canal, persona)}</div>
    <div class="prev-pie">
      <span class="prev-pie-txt">${ico('escudo')}<span>${comoReporta}${interactivo ? ' Haz clic en el mensaje para actuar como la persona.' : ''}</span></span>
      <span class="prev-pie-tag">${persona.correo} · PC de trabajo</span>
    </div>
  </div>`;
}

// Monitor con Windows 11: fondo, ventana de la app, notificación y barra de tareas.
function pc(app, esc, canal, persona) {
  const p = ESCENARIOS[esc].plantilla, de = p.remitente.split(' <')[0].replace(/\s*\(externo\)/i, '');
  const d = new Date(), hh = d.getHours(), mm = String(d.getMinutes()).padStart(2, '0');
  const reloj = `${hh % 12 || 12}:${mm} ${hh < 12 ? 'a. m.' : 'p. m.'}`;
  const fecha = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  const appIco = c => c === 'teams' ? '<i class="ap-teams">T</i>' : '<i class="ap-outlook">O</i>';
  return `<div class="pc">
    <div class="pc-marco"><div class="pc-pantalla">
      <div class="pc-fondo" aria-hidden="true"></div>
      <div class="pc-area" id="prev-pantalla">${app}</div>
      <div class="pc-toast" aria-hidden="true">
        <span class="pt-app">${appIco(canal)}${canal === 'teams' ? 'Microsoft Teams' : 'Outlook'}<i>${ic('puntos')}${ic('cerrar')}</i></span>
        <span class="pt-cuerpo"><b>${de}</b>${canal === 'teams' ? p.cuerpo.split('. ')[0] + '.' : p.asunto}</span>
      </div>
      <div class="pc-barra" aria-hidden="true">
        <span class="pb-centro">
          <i class="pb-win"><b></b><b></b><b></b><b></b></i>
          <span class="pb-buscar">${ic('buscar')}Buscar</span>
          <i class="pb-ap pb-carpeta"></i><i class="pb-ap pb-edge"></i>
          <i class="pb-ap ${canal === 'correo' ? 'act' : ''}">${appIco('correo')}</i>
          <i class="pb-ap ${canal === 'teams' ? 'act' : ''}">${appIco('teams')}</i>
        </span>
        <span class="pb-der"><small>ESP</small>${svgP('<path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/>')}<span class="pb-reloj">${reloj}<small>${fecha}</small></span></span>
      </div>
    </div></div>
    <div class="pc-cuello"></div><div class="pc-base"></div>
  </div>`;
}

function ventanaOutlook(esc, persona, interactivo, buzon) {
  const p = ESCENARIOS[esc].plantilla, tok = tokenDe(esc + persona.id), url = URL_ESC[esc](tok);
  const [de, correoDe = ''] = p.remitente.replace('>', '').split(' <');
  const btn = (cls, txt) => interactivo ? `<button type="button" class="${cls}" data-accion="caer">${txt}</button>` : `<span class="${cls}">${txt}</span>`;
  const accion = esc === 'archivo'
    ? `<div class="ol-adjunto"><span class="ol-pdf">PDF</span><span><b>Factura_FE-2291.pdf</b><small>Enlace de descarga · 248 KB</small></span>${btn('ol-boton ol-boton-chico', 'Descargar')}</div>`
    : btn('ol-boton', p.accion);
  const vinculo = `<span class="ol-vinculo">${urlMarcada(url, tok)}<small>Clic o pulse aquí para seguir el vínculo.</small></span>`;
  const lista = [[de, p.asunto, p.cuerpo.slice(0, 44) + '…', '9:12', true], ...BENIGNOS];
  const lectura = esc === 'phishing' ? lecturaPhishing(p, de, correoDe, persona, btn, vinculo)
    : esc === 'pagina' ? lecturaPagina(p, de, correoDe, persona, url, tok, interactivo)
    : olLectura(p.asunto, de, correoDe, 'Hoy 9:12', p.cuerpo, `<span class="prev-accion">${accion}${vinculo}</span>`, persona.nombre);
  const ol = outlook(lista, lectura,
    { yo: iniciales(persona.nombre), correo: persona.correo, reportar: interactivo ? buzon : '' });
  return `<div class="pc-ventana pc-outlook">
    <div class="pv-titulo"><span><i class="ap-outlook">O</i>Bandeja de entrada · ${persona.correo} · Outlook</span>${controles()}</div>
    <div class="pv-cuerpo">${ol}</div>
  </div>`;
}

// Phishing: la trampa está en el correo. HTML con la imagen de Nómina, valor, estado y fecha límite.
function lecturaPhishing(p, de, correoDe, persona, btn, vinculo) {
  return `<h4>${p.asunto}</h4>
    <div class="ol-remite">${olAva(de, 0)}<span><b>${de}</b> &lt;${correoDe}&gt;<small>Para: ${persona.nombre}</small></span><time>Hoy 9:12</time></div>
    <p class="ol-alerta">${svgP('<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>')}Algunas personas que recibieron este mensaje no suelen recibir correos de ${correoDe}. <u>Por qué es importante</u></p>
    <div class="mail-ph">
      <div class="mp-cab"><span class="mp-logo">$</span><span><b>Nómina · Pagos</b><small>Gestión humana</small></span><em>Prima de servicios</em></div>
      <div class="mp-cuerpo">
        <p>Hola, <b>${persona.nombre.split(' ')[0]}</b>:</p>
        <p>Tu pago de la <b>prima de diciembre</b> está listo, pero necesitamos que confirmes tu cuenta bancaria.</p>
        <table class="mp-tabla">
          <tr><td>Concepto</td><td>Prima de servicios 2026-II</td></tr>
          <tr><td>Valor a pagar</td><td class="mp-valor">$ 1.284.500</td></tr>
          <tr><td>Estado</td><td><span class="mp-estado">Pendiente de confirmación</span></td></tr>
          <tr><td>Fecha límite</td><td><b>Viernes, 5:00 p. m.</b></td></tr>
        </table>
        <p class="mp-urgente">⏱ Si no confirmas antes de la fecha límite, el pago pasa al siguiente ciclo.</p>
        <span class="prev-accion mp-cta">${btn('ol-boton', p.accion)}${vinculo}</span>
      </div>
      <p class="mp-pie">Mensaje automático de Nómina. No respondas a este correo.</p>
    </div>`;
}

// Página falsa: el correo es un aviso sencillo de texto con un enlace; la trampa es la página.
// Página falsa: el correo imita un aviso automático de Microsoft 365; la trampa es la página.
const LOGO_MS = '<span class="ms-logo"><b style="background:#F25022"></b><b style="background:#7FBA00"></b><b style="background:#00A4EF"></b><b style="background:#FFB900"></b></span>';
function lecturaPagina(p, de, correoDe, persona, url, tok, interactivo) {
  const btn = interactivo ? `<button type="button" class="ms-boton" data-accion="caer">Mantener mi contraseña actual</button>` : `<span class="ms-boton">Mantener mi contraseña actual</span>`;
  return `<h4>${p.asunto}</h4>
    <div class="ol-remite">${olAva('Microsoft', 2)}<span><b>Cuenta de Microsoft</b> &lt;account-security-noreply@miempresa-intranet.net&gt;<small>Para: ${persona.nombre}</small></span><time>Hoy 9:12</time></div>
    <p class="ol-alerta">${svgP('<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>')}El dominio del remitente no coincide con el de Microsoft. <u>Por qué es importante</u></p>
    <div class="mail-ms">
      <div class="mm-cab">${LOGO_MS}<span>Microsoft 365</span></div>
      <div class="mm-cuerpo">
        <p class="mm-tit">Solicitud de verificación de contraseña</p>
        <p>Cuenta: <b>${persona.correo}</b></p>
        <p>Detectamos que la contraseña de su cuenta corporativa <b>vence hoy</b>. Para no perder el acceso a su correo y archivos, verifique su cuenta antes de las 5:00 p. m.</p>
        <div class="mm-cta"><span class="prev-accion">${btn}<span class="ol-vinculo">${urlMarcada(url, tok)}<small>Clic o pulse aquí para seguir el vínculo.</small></span></span></div>
        <p class="mm-nota">Si no reconoce esta actividad, igual debe verificar su cuenta para protegerla.</p>
      </div>
      <p class="mm-pie">Este mensaje fue enviado desde una dirección de notificaciones. Microsoft Corporation.</p>
    </div>`;
}

// Teams de escritorio: riel de apps, lista de chats y conversación.
function ventanaTeams(esc, persona, interactivo) {
  const p = ESCENARIOS[esc].plantilla, tok = tokenDe(esc + persona.id), url = URL_ESC[esc](tok);
  const quien = p.remitente.split(' <')[0].replace(/\s*\(externo\)/i, '');
  const externo = esc === 'ingenieria';
  const ini = iniciales(quien).toUpperCase(), nombre = persona.nombre.split(' ')[0];
  const frases = p.cuerpo.split(/(?<=\.)\s+/);
  const saludo = /^Hola\b/i.test(frases[0]) ? frases[0].replace(/^Hola,?/i, `Hola ${nombre},`) : `Hola ${nombre}. ${frases[0]}`;
  const tarjeta = `<span class="tw-card-img">${esc === 'archivo' ? '<span class="ol-pdf">PDF</span>' : ico('escudo')}</span><span class="tw-card-txt"><b>${TITULO_WEB[esc]}</b><small>${url.replace('https://', '').split('/')[0]}</small><span class="tw-card-url">${urlMarcada(url, tok)}</span></span>`;
  const card = interactivo
    ? `<button type="button" class="tw-card" data-accion="${esc === 'ingenieria' ? 'abrir-enlace' : 'caer'}">${tarjeta}</button>`
    : `<span class="tw-card">${tarjeta}</span>`;
  const rail = [['campana', 'Actividad'], ['chat', 'Chat', 1], ['equipos', 'Equipos'], ['calendario', 'Calendario'], ['llamar', 'Llamadas'], ['nube', 'OneDrive']];
  const chats = [[quien, saludo.slice(0, 34) + '…', '9:41', true, externo], ['Equipo ' + persona.area, 'Camila: ¿quién lleva el informe?', '8:55'], ['Talento Humano', 'Recuerden las pausas activas', 'Ayer'], ['Mesa de Ayuda (interna)', 'Ticket #4821 cerrado', 'Lun']];
  return `<div class="pc-ventana pc-teams">
    <div class="pv-titulo tw-titulo"><span class="tw-nav">${ic('atras')}${ic('adelante')}</span><span class="tw-buscar">${ic('buscar')}Buscar</span><span class="tw-yo">${iniciales(persona.nombre)}</span>${controles()}</div>
    <div class="tw">
      <nav class="tw-rail">${rail.map(([k, t, a]) => `<span class="${a ? 'act' : ''}">${ic(k)}<small>${t}</small></span>`).join('')}</nav>
      <aside class="tw-lista">
        <p class="tw-lista-cab"><b>Chat</b>${ic('puntos')}</p>
        <p class="tw-filtro"><span class="act">Recientes</span><span>No leídos</span></p>
        ${chats.map(([n, prev, h, act, ext]) => `<div class="tw-item ${act ? 'act' : ''}"><span class="tw-av" style="--h:${tonoAva(n)}">${iniciales(n).toUpperCase()}</span><span class="tw-item-txt"><b>${n}${ext ? ' <em>(Externo)</em>' : ''}</b><small>${prev}</small></span><time>${h}</time></div>`).join('')}
      </aside>
      <section class="tw-chat">
        <div class="tw-chat-cab"><span class="tw-av grande" style="--h:${tonoAva(quien)}">${ini}<i></i></span><b>${quien}</b>${externo ? '<em class="tw-ext">Externo</em>' : ''}<span class="tw-tabs"><span class="act">Chat</span><span>Archivos</span></span><span class="tw-acc">${ic('video')}${ic('llamar')}</span></div>
        <div class="tw-hilo">
          ${externo ? `<p class="tw-aviso">${ic('escudo').replace('<svg', '<svg')}<span><b>${quien.split(' ')[0]}</b> es externo a tu organización. Ten cuidado con los enlaces y archivos.</span></p>` : ''}
          <p class="tw-dia">Hoy</p>
          <div class="tw-msg">
            <span class="tw-av" style="--h:${tonoAva(quien)}">${ini}</span>
            <div class="tw-msg-cuerpo">
              <p class="tw-meta"><b>${quien}</b> 9:41 a. m.</p>
              <div class="tw-burbuja"><p>${saludo}</p>${frases.slice(1).map(f => `<p>${f}</p>`).join('')}${card}</div>
              ${interactivo ? `<span class="tw-acciones"><i>👍</i><i>❤️</i><i>😆</i><button type="button" data-accion="reportar" title="Compartir en Outlook con seguridad">${ic('compartir')}Compartir en Outlook</button></span>` : ''}
            </div>
          </div>
        </div>
        <div class="tw-entrada"><span>Escribe un mensaje</span><span class="tw-entrada-ico">${ic('carita')}${ic('clip')}${ic('mas')}<i>${ic('enviar')}</i></span></div>
      </section>
    </div>
  </div>`;
}

// ---- Navegador (Edge) que abre el enlace único ----
function ventanaNavegador(url, titulo, contenido, extra = '') {
  const seguro = url.startsWith('https://outlook.');
  return `<div class="pc-ventana pc-edge">
    <div class="ed-tabs"><span class="ed-tab">${seguro ? '<i class="ap-outlook">O</i>' : titulo.startsWith('Iniciar sesión') ? `<i class="ed-fav-ms">${LOGO_MS}</i>` : '<i class="ed-fav"></i>'}${titulo}${ic('cerrar')}</span><span class="ed-nueva">${ic('mas')}</span>${controles()}</div>
    <div class="ed-barra">${ic('atras')}${ic('adelante')}${ic('recargar')}
      <span class="ed-url">${seguro ? '<b class="ok">🔒</b>' : '<b>⚠ No seguro</b>'}<span>${url}</span>${ic('estrella')}</span>${ic('descarga')}${ic('puntos')}</div>
    <div class="ed-pagina">${contenido}</div>${extra}
  </div>`;
}
function paginaLeccion(esc, bien = false) {
  return `<div class="nw-caja prev-leccion ${bien ? 'bien' : ''}">
    <p class="nw-marca">${svgP(ICONOS.escudo)} Seguridad de la información</p>
    <h4>${bien ? 'Gracias por reportarlo' : 'Esto fue un simulacro de seguridad'}</h4>
    <p>${bien ? 'Era un simulacro. Reportar el mensaje al buzón de seguridad es exactamente lo que había que hacer.' : TIPS_ESC[esc]}</p>
    ${bien ? '' : `<p>La próxima vez repórtalo a <b>${ORG.buzon}</b>. Tu resultado es privado y sirve para orientar tu capacitación.</p>`}
  </div>`;
}
// Clon de la intranet: igual a la real (marca, menú, noticias, pie); solo cambia el dominio.
// Login estilo Microsoft 365 (recreación con la marca de la empresa, no un clon desplegable).
// La trampa es la página; lo escrito no se lee ni se guarda y el dominio es falso.
function formularioFalso() {
  return `<div class="msl">
    <div class="msl-tarjeta">
      <form id="form-falso" class="prev-form" autocomplete="off">
        <div class="msl-marca">${LOGO_MS}<span>Microsoft</span></div>
        <p class="msl-aviso">⚠ Su sesión vence hoy. Vuelva a iniciar sesión para conservar el acceso.</p>
        <h4>Iniciar sesión</h4>
        <label class="msl-campo"><input class="nw-campo" type="text" name="u" placeholder="Correo, teléfono o Skype" value="lgomez@miempresa.co" autocomplete="off"></label>
        <label class="msl-campo"><input class="nw-campo" type="password" name="p" placeholder="Contraseña" autocomplete="off"></label>
        <p class="msl-link">¿No puede acceder a su cuenta?</p>
        <div class="msl-acciones">
          <button type="button" class="msl-sec">Atrás</button>
          <button class="msl-boton" type="submit">Iniciar sesión</button>
        </div>
        <small class="prev-aviso">Prototipo: lo que escribas no se lee ni se guarda.</small>
      </form>
      <p class="msl-pie"><span class="msl-ico">${svgP(SV.puntos)}</span> Opciones de inicio de sesión</p>
    </div>
    <p class="msl-tenant">Mi Empresa S.A.S. · miempresa.onmicrosoft.com</p>
  </div>`;
}
function paginaCodigo() {
  return `<form id="form-codigo" class="nw-caja prev-form prev-codigo" autocomplete="off">
    <p class="nw-marca">${svgP(SV.equipos)} Mesa de Ayuda · TI</p>
    <h4>Verificación de migración</h4>
    <p>Ingresa el código que recibiste por SMS para conservar tu perfil.</p>
    <label>Código de verificación<input class="nw-campo" type="text" inputmode="numeric" name="codigo" placeholder="000 000" autocomplete="off"></label>
    <button class="ol-boton nw-boton" type="submit">Validar</button>
    <small class="prev-aviso">Prototipo: el código no se lee ni se guarda.</small>
  </form>`;
}
const panelDescargas = () => `<div class="ed-descargas"><p><b>Descargas</b>${ic('puntos')}</p>
  <div class="ed-archivo"><span class="ol-pdf">PDF</span><span><b>Factura_FE-2291.pdf</b><small>248 KB · Listo</small></span></div>
  <button type="button" class="ol-boton ol-boton-chico" data-accion="abrir-pdf">Abrir archivo</button></div>`;
function dialogoReporte(buzon, teams) {
  return `<div class="prev-dialogo bien" role="status">
    <span class="pd-ico">${svgP(ICONOS.escudo)}</span>
    <div><b>${teams ? 'Mensaje compartido con seguridad' : 'Mensaje reportado'}</b><p>Se envió a ${buzon}. Era un simulacro: reportar es exactamente lo que había que hacer.</p></div>
  </div>`;
}

// ---- Actuar como la persona ----
function actuarComoEmpleado(tipo) {
  const c = camp(location.hash.split('/')[2]);
  const cont = $('#mundo-b'), id = cont.dataset.emp, esc = c.escenario;
  if (c.resultados[id]) return;
  const area = cont.querySelector('#prev-pantalla');
  const url = URL_ESC[esc](tokenDe(esc + id));
  (c.manual ||= new Set()).add(id); // la simulación automática ya no actúa por esta persona
  const primero = tipo === 'reportar' ? 'REPORTADO' : esc === 'pagina' ? 'CLIC' : ESCENARIOS[esc].eventoFallo;
  const ev = registrar(c, id, primero);
  if (!c.eventos.some(e => e.emp === id && e.tipo === 'ENVIADO')) c.eventos.unshift({ t: ev.t - 4000, emp: id, tipo: 'ENVIADO' });
  sellar(cont, ev, primero === 'CLIC' ? 'El clic se registra, pero todavía no es la decisión. La decisión es enviar o no el formulario.' : '');
  cont.querySelector('.pc-toast')?.remove();

  if (tipo === 'reportar') {
    area.insertAdjacentHTML('beforeend', dialogoReporte(buzonDe(id), c.canal === 'teams'));
    cont.querySelectorAll('[data-accion="caer"], [data-accion="reportar"], [data-accion="abrir-enlace"]').forEach(b => { b.disabled = true; });
  } else if (esc === 'pagina') {
    area.innerHTML = ventanaNavegador(url, TITULO_WEB.pagina, formularioFalso());
    area.querySelector('#form-falso').addEventListener('submit', ev2 => {
      ev2.preventDefault(); ev2.target.reset(); // no se lee ni se guarda lo escrito
      sellar(cont, registrar(c, id, 'FORMULARIO'));
      area.innerHTML = ventanaNavegador(url, TITULO_WEB.pagina, paginaLeccion(esc));
    });
  } else if (esc === 'archivo') {
    sellar(cont, ev, 'Primero se registra la descarga y después se entrega el PDF. Así la decisión queda guardada aunque nunca lo abra.');
    area.innerHTML = ventanaNavegador(url, TITULO_WEB.archivo, '<p class="ed-vacia">Descargando Factura_FE-2291.pdf…</p>', panelDescargas());
  } else {
    // phishing (clic) e ingeniería social (envió el código)
    area.innerHTML = ventanaNavegador(url, TITULO_WEB[esc], paginaLeccion(esc));
  }
}

// El enlace de ingeniería social abre la página que pide el código; abrirla no es la decisión.
function abrirEnlaceCodigo() {
  const cont = $('#mundo-b'), id = cont.dataset.emp, area = cont.querySelector('#prev-pantalla');
  cont.querySelector('.pc-toast')?.remove();
  area.innerHTML = ventanaNavegador(URL_ESC.ingenieria(tokenDe('ingenieria' + id)), TITULO_WEB.ingenieria, paginaCodigo());
  area.querySelector('#form-codigo').addEventListener('submit', e => { e.preventDefault(); e.target.reset(); actuarComoEmpleado('caer'); });
  sellar(cont, null, 'Abrir el enlace todavía no es la decisión. Cae si envía el código.');
}

function abrirPDF() {
  const c = camp(location.hash.split('/')[2]), cont = $('#mundo-b'), id = cont.dataset.emp;
  const ev = registrar(c, id, 'APERTURA');
  const area = cont.querySelector('#prev-pantalla');
  area.innerHTML = ventanaNavegador(URL_ESC.archivo(tokenDe('archivo' + id)).replace('/d/', '/f/') + '/Factura_FE-2291.pdf', 'Factura_FE-2291.pdf', visorPDF());
  area.insertAdjacentHTML('beforeend', `<div class="prev-dialogo">${paginaLeccion('archivo')}</div>`);
  sellar(cont, ev, 'La apertura es complementaria: no cambia el resultado, que ya quedó registrado en la descarga.', true);
}

function sellar(cont, ev, nota = '', suave = false) {
  const s = cont.querySelector('.prev-sello');
  if (!s) return;
  s.hidden = false;
  s.className = `prev-sello ${suave ? 'suave' : ''}`;
  s.innerHTML = `${ev ? `<b><i></i>${ev.tipo}</b> registrado a las ${hora(ev.t)}${ev.ms ? ` en ${ev.ms} ms` : ''}` : '<b class="sin"><i></i>Sin evento</b>'}${nota ? `<span>${nota}</span>` : ''}`;
}
