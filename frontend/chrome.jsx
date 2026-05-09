// Chrome: Nav, Footer, Marquee
const { useState } = React;

function Nav({ view, onNav, onCTA }) {
  const links = [
    { id: 'home', label: 'Inicio' },
    { id: 'talleres', label: 'Talleres' },
    { id: 'servicios', label: 'Servicios' },
    { id: 'casos', label: 'Casos' },
    { id: 'cita', label: 'Agenda cita' },
    { id: 'contacto', label: 'Contacto' }
  ];
  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="brand" onClick={() => onNav('home')}>
          <div className="brand-logo" />
          <div>
            <div className="brand-name">Arkano-IA</div>
            <div className="brand-tag">Code · Automate · Win</div>
          </div>
        </div>
        <div className="nav-links">
          {links.map(l => (
            <button
              key={l.id}
              className={'nav-link' + (view === l.id ? ' active' : '')}
              onClick={() => onNav(l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>
        <button className="nav-cta" onClick={onCTA}>Inscríbete →</button>
      </div>
    </nav>
  );
}

function Footer({ onNav }) {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="brand">
            <div className="brand-logo" />
            <div>
              <div className="brand-name">Arkano-IA</div>
              <div className="brand-tag">Tijuana · MX</div>
            </div>
          </div>
          <p>Talleres, consultoría y desarrollo asistido por IA. Para negocios que prefieren ganar a esperar.</p>
        </div>
        <div>
          <h4>Plataforma</h4>
          <ul>
            <li><button onClick={() => onNav('talleres')}>Talleres</button></li>
            <li><button onClick={() => onNav('servicios')}>Servicios</button></li>
            <li><button onClick={() => onNav('casos')}>Casos de éxito</button></li>
            <li><button onClick={() => onNav('cita')}>Agendar cita</button></li>
          </ul>
        </div>
        <div>
          <h4>Recursos</h4>
          <ul>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Plantillas de prompts</a></li>
            <li><a href="#">Guías gratuitas</a></li>
            <li><a href="#">Comunidad</a></li>
          </ul>
        </div>
        <div>
          <h4>Contacto</h4>
          <ul>
            <li>(664) 123-7972</li>
            <li>hola@arkano-ia.mx</li>
            <li>WhatsApp directo</li>
            <li>@arkano.ia</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Arkano-IA · Hecho en Tijuana</span>
        <span>v0.4 — beta pública</span>
      </div>
    </footer>
  );
}

function Marquee() {
  const items = ['Code Like a Cyborg', '·', 'Automatiza lo aburrido', '·', 'Vende lo demás', '·', 'IA aplicada', '·', 'Tijuana 2026'];
  const row = items.concat(items, items);
  return (
    <div className="marquee">
      <div className="marquee-track">
        {row.map((t, i) => (
          t === '·'
            ? <span key={i} className="dot">●</span>
            : <span key={i} className={i % 6 === 1 ? 'grad' : ''}>{t}</span>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Nav, Footer, Marquee });
