// Home page sections
const { useState, useEffect, useMemo, useRef } = React;

function Eyebrow({ children, className = "" }) {
  return (
    <div className={`hero-eyebrow ${className}`}>
      <span className="dot"></span>
      <span>{children}</span>
    </div>
  );
}

function Hero({ onOpenWorkshop, featured, onScrollTo, tweaks }) {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-eyebrow-wrap">
          <Eyebrow>Arkano-IA · Tijuana, B.C.</Eyebrow>
        </div>
        <div className="hero-grid">
          <div>
            <h1 className="hero-title">
              Programa, vende y opera <span className="grad">como un cyborg</span>.
            </h1>
            <p className="hero-sub">
              Talleres, asesorías y automatizaciones de Inteligencia Artificial para
              negocios y profesionales que prefieren resolver hoy a entender mañana.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => onScrollTo('talleres')}>
                Ver talleres abiertos
                <span style={{ fontSize: 16, lineHeight: 1 }}>→</span>
              </button>
              <button className="btn btn-ghost" onClick={() => onScrollTo('cita')}>
                Agendar diagnóstico gratis
              </button>
            </div>
          </div>

          <div className={tweaks.heroVariant === 'v2' ? 'hero-aside' : ''}>
            <FeaturedCard workshop={featured} onClick={() => onOpenWorkshop(featured.id)} />
            {tweaks.heroVariant === 'v2' && <HeroStats />}
          </div>
        </div>

        {tweaks.heroVariant !== 'v2' && (
          <div style={{ marginTop: 56 }}>
            <HeroStats />
          </div>
        )}
      </div>
    </section>
  );
}

function HeroStats() {
  return (
    <div className="hero-stats">
      <div className="hero-stat">
        <div className="num"><span className="grad">2,400+</span></div>
        <div className="lbl">Personas capacitadas en talleres y mentorías Arkano</div>
      </div>
      <div className="hero-stat">
        <div className="num">38<span style={{ fontSize: '0.7em', color: 'var(--muted)' }}> empresas</span></div>
        <div className="lbl">Operando con automatizaciones diseñadas con nosotros</div>
      </div>
      <div className="hero-stat">
        <div className="num">4.9<span style={{ fontSize: '0.7em', color: 'var(--muted)' }}>/5</span></div>
        <div className="lbl">Promedio de satisfacción · 312 reseñas verificadas</div>
      </div>
      <div className="hero-stat">
        <div className="num"><span className="grad">$0</span></div>
        <div className="lbl">Cuesta el primer diagnóstico de tu negocio</div>
      </div>
    </div>
  );
}

function FeaturedCard({ workshop, onClick }) {
  return (
    <div className="feat-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div
        className="feat-card-img"
        style={{
          backgroundImage: workshop.images[0] ? `url(${workshop.images[0]})` : 'var(--grad)',
          background: !workshop.images[0] ? 'var(--grad)' : undefined,
          backgroundSize: 'cover'
        }}
      ></div>
      <div className="feat-card-body">
        <div className="code">{workshop.code} · DESTACADO</div>
        <h3>{workshop.title}</h3>
        <div className="sub">{workshop.subtitle}</div>
        <div className="meta">
          <span><b>{workshop.fecha}</b> · {workshop.hora}</span>
          <span>{workshop.modalidad}</span>
          <span><b>${workshop.precio.toLocaleString()}</b> mxn</span>
        </div>
      </div>
    </div>
  );
}

function Marquee() {
  const items = ['Programa con IA', 'Vende con IA', 'Opera con IA', 'Diseña con IA', 'Decide con IA'];
  const loop = [...items, ...items, ...items];
  return (
    <div className="marquee">
      <div className="marquee-track">
        {loop.map((it, i) => (
          <React.Fragment key={i}>
            <span className={i % 2 === 0 ? 'grad' : ''}>{it}</span>
            <span className="dot">✦</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function WorkshopGrid({ onOpen }) {
  const [filter, setFilter] = useState('Todos');
  const [workshops, setWorkshops] = useState(WORKSHOPS);
  const cats = ['Todos', 'Desarrollo', 'Negocios', 'Fundamentos', 'Creativo', 'Profesional'];

  useEffect(() => {
    loadData().then(() => setWorkshops([...WORKSHOPS]));
  }, []);

  const filtered = filter === 'Todos' ? workshops : workshops.filter(w => w.category === filter);

  return (
    <section className="section" id="talleres">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>// Talleres abiertos</div>
            <h2 className="section-title">Aprende lo que tu equipo va a usar el lunes.</h2>
          </div>
          <div style={{ color: 'var(--muted)', fontSize: 14, maxWidth: '32ch' }}>
            Cohortes pequeñas, proyectos reales, y un grupo privado donde se sigue resolviendo después del taller.
          </div>
        </div>

        <div className="filter-bar">
          {cats.map(c => (
            <button
              key={c}
              className={`filter-pill ${filter === c ? 'active' : ''}`}
              onClick={() => setFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="ws-grid">
          {filtered.map(w => <WorkshopCard key={w.id} w={w} onOpen={onOpen} />)}
        </div>
      </div>
    </section>
  );
}

function WorkshopCard({ w, onOpen }) {
  const pct = Math.round((w.cupoTomado / w.cupo) * 100);
  return (
    <div className={`ws-card accent-${w.accent}`} onClick={() => onOpen(w.id)}>
      <div className="ws-card-head">
        <div>
          <span className={`ws-tag accent${w.accent === 'magenta' ? '-magenta' : ''}`}>{w.category}</span>
          <span className="ws-tag" style={{ marginLeft: 6 }}>{w.level}</span>
        </div>
        <div className="ws-code">{w.code}</div>
      </div>

      <h3>{w.title}</h3>
      <div className="ws-sub">{w.descripcionCorta}</div>

      <div className="cupo-bar"><div className="cupo-bar-fill" style={{ width: `${pct}%` }}></div></div>
      <div className="cupo-text">
        <span>{w.cupoTomado}/{w.cupo} inscritos</span>
        <span>{w.estado}</span>
      </div>

      <div className="ws-card-foot">
        <div>
          <div className="ws-meta"><b>{w.fecha}</b> · {w.hora}</div>
          <div className="ws-meta">{w.modalidad}</div>
          <div className="ws-price" style={{ marginTop: 8 }}>
            <span className="currency">$</span>{w.precio.toLocaleString()}
            <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}> mxn</span>
          </div>
        </div>
        <div className="ws-arrow">→</div>
      </div>
    </div>
  );
}

function ServicesGrid({ onScrollTo }) {
  return (
    <section className="section" id="servicios">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>// Servicios</div>
            <h2 className="section-title">Talleres son el principio. Lo demás también lo hacemos.</h2>
          </div>
          <button className="btn btn-ghost" onClick={() => onScrollTo('cita')}>Cotizar proyecto →</button>
        </div>

        <div className="svc-grid">
          {SERVICES.map(s => (
            <div key={s.id} className="svc">
              <div className="code">{s.code}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <div className="svc-foot">
                <span>{s.duracion}</span>
                <b>{s.precio ? `$${s.precio.toLocaleString()} mxn` : 'A cotizar'}</b>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CasesSection() {
  const [cases, setCases] = useState(CASES);

  useEffect(() => {
    loadData().then(() => setCases([...CASES]));
  }, []);

  return (
    <section className="section" id="casos">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>// Casos de éxito</div>
            <h2 className="section-title">Lo que pasa cuando dejas de copiar y pegar.</h2>
          </div>
        </div>

        <div className="cases-grid">
          {cases.map(c => (
            <div key={c.id} className="case-card">
              <div>
                <div className="case-metric">{c.metric}</div>
                <div className="case-metric-lbl">{c.metric_label || c.metricLabel}</div>
              </div>
              <div>
                <div className="case-sector">{c.client_sector || c.sector}</div>
                <h3>{c.title}</h3>
                <p><b>Problema —</b> {c.problem || c.problema}</p>
                <p><b>Solución —</b> {c.solution || c.solucion}</p>
                <p><b>Resultado —</b> {c.result || c.resultado}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CitaSection() {
  const tipos = [
    { id: 'asesoria_ia', code: 'C-01', title: 'Asesoría IA' },
    { id: 'diagnostico', code: 'C-02', title: 'Diagnóstico de negocio' },
    { id: 'automatizacion', code: 'C-03', title: 'Automatización' },
    { id: 'desarrollo', code: 'C-04', title: 'Desarrollo de software' },
    { id: 'capacitacion', code: 'C-05', title: 'Capacitación empresarial' },
    { id: 'mentoria', code: 'C-06', title: 'Mentoría personalizada' }
  ];
  const [tipo, setTipo] = useState('diagnostico');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ nombre: '', email: '', tel: '', empresa: '', notas: '' });

  if (submitted) {
    return (
      <section className="section" id="cita">
        <div className="container">
          <div className="cta-band" style={{ textAlign: 'center' }}>
            <div className="success-icon">✓</div>
            <h2>Tu solicitud entró al sistema.</h2>
            <p style={{ margin: '18px auto 0' }}>
              Te contactamos en menos de 24 hrs hábiles para confirmar día y hora.
              Si es urgente, escríbenos directo a WhatsApp <b style={{ color: 'var(--text)' }}>(664) 123-7972</b>.
            </p>
            <button className="btn btn-ghost" style={{ marginTop: 28 }} onClick={() => { setSubmitted(false); setError(''); setForm({ nombre: '', email: '', tel: '', empresa: '', notas: '' }); }}>
              Agendar otra cita
            </button>
          </div>
        </div>
      </section>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await API.bookAppointment({
        nombre: form.nombre,
        email: form.email,
        tel: form.tel,
        empresa: form.empresa,
        notas: form.notas,
        appointment_type: tipo,
        source: 'web',
      });
      setSubmitted(true);
    } catch (err) {
      const msg = err.data ? Object.values(err.data).flat().join(' · ') : 'Error al enviar. Intenta de nuevo.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section" id="cita">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>// Agenda una cita</div>
            <h2 className="section-title">El primer diagnóstico siempre es gratis.</h2>
          </div>
        </div>

        <div className="cita-grid">
          <div>
            <div className="mono" style={{ marginBottom: 12 }}>// Tipo de cita</div>
            <div className="cita-types">
              {tipos.map(t => (
                <button
                  key={t.id}
                  className={`cita-type ${tipo === t.id ? 'active' : ''}`}
                  onClick={() => setTipo(t.id)}
                >
                  <div className="ct-code">{t.code}</div>
                  <div className="ct-title">{t.title}</div>
                </button>
              ))}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.6, marginTop: 18 }}>
              Te llamamos por video o presencial en Tijuana, Zona Río. Si prefieres WhatsApp escribe a
              <b style={{ color: 'var(--text)' }}> (664) 123-7972</b>.
            </div>
          </div>

          <form className="reg-card" onSubmit={submit} style={{ position: 'static' }}>
            <div className="field-row">
              <div className="field">
                <label>Nombre</label>
                <input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Tu nombre" />
              </div>
              <div className="field">
                <label>Teléfono</label>
                <input required value={form.tel} onChange={e => setForm({ ...form, tel: e.target.value })} placeholder="(664) 123 4567" />
              </div>
            </div>
            <div className="field">
              <label>Email</label>
              <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="tu@correo.com" />
            </div>
            <div className="field">
              <label>Empresa o proyecto</label>
              <input value={form.empresa} onChange={e => setForm({ ...form, empresa: e.target.value })} placeholder="Opcional" />
            </div>
            <div className="field">
              <label>¿Qué quieres lograr?</label>
              <textarea value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} placeholder="Cuéntanos en 2 frases qué te trae aquí." />
            </div>
            {error && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 8 }}>{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Enviando...' : 'Solicitar cita →'}
            </button>
            <div className="mono" style={{ textAlign: 'center', marginTop: 14, fontSize: 9.5 }}>
              Respuesta &lt; 24 hrs · Sin spam · Sin compromiso
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function ContactBand({ onScrollTo }) {
  return (
    <section className="section" id="contacto" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="cta-band">
          <div className="eyebrow" style={{ marginBottom: 18 }}>// ¿No sabes por dónde empezar?</div>
          <h2>Tomamos un café (virtual) y te decimos qué taller te sirve.</h2>
          <p>15 minutos. Sin guion. Sin venderte nada que no necesites. Sólo te decimos por dónde sí, y por dónde mejor no.</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => onScrollTo('cita')}>Agendar 15 min →</button>
            <a className="btn btn-ghost" href="https://wa.me/5216641237972" target="_blank" rel="noreferrer">WhatsApp directo</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ onNav }) {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="brand-logo"></div>
            <div>
              <div className="brand-name">Arkano-IA</div>
              <div className="brand-tag">CODE LIKE A CYBORG</div>
            </div>
          </div>
          <p>Plataforma comercial de Inteligencia Artificial para profesionales y negocios en México.</p>
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
            <li><a href="#">Comunidad privada</a></li>
            <li><a href="#">Biblioteca de prompts</a></li>
            <li><a href="#">Plantillas</a></li>
          </ul>
        </div>

        <div>
          <h4>Contacto</h4>
          <ul>
            <li>(664) 123-7972</li>
            <li>hola@arkano-ia.mx</li>
            <li>Tijuana · Zona Río</li>
            <li><a href="#">Facebook · Instagram</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Arkano-IA · Todos los derechos reservados</span>
        <span style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span>v0.1.0 · MVP</span>
          <a href="admin.html" style={{ color: 'var(--muted)', fontSize: 11, fontFamily: 'var(--mono)' }}>admin →</a>
        </span>
      </div>
    </footer>
  );
}

Object.assign(window, { Hero, Marquee, WorkshopGrid, ServicesGrid, CasesSection, CitaSection, ContactBand, Footer });
