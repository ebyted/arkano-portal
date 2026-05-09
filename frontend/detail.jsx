// Workshop detail view
const { useState: useStateD, useEffect: useEffectD } = React;

function WorkshopDetail({ workshop, onBack }) {
  const [imgIdx, setImgIdx] = useStateD(0);
  const [step, setStep] = useStateD(1);
  const [form, setForm] = useStateD({
    nombre: '', email: '', tel: '', ocupacion: '', empresa: '', ciudad: '',
    pago: 'transferencia', fuente: 'web'
  });
  const [registered, setRegistered] = useStateD(false);
  const [folio, setFolio] = useStateD('');
  const [loading, setLoading] = useStateD(false);
  const [regError, setRegError] = useStateD('');

  useEffectD(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [workshop.id]);

  // Build 5 image slots — fill from data, rest as placeholders
  const slots = Array(5).fill(null).map((_, i) => workshop.images[i] || null);
  const pct = Math.round((workshop.cupoTomado / workshop.cupo) * 100);

  const next = async () => {
    if (step < 3) { setStep(step + 1); return; }
    setLoading(true);
    setRegError('');
    try {
      const res = await API.register({
        nombre: form.nombre,
        email: form.email,
        tel: form.tel,
        ocupacion: form.ocupacion,
        empresa: form.empresa,
        ciudad: form.ciudad,
        fuente: form.fuente,
        payment_method: form.pago,
        workshop_id: workshop.id,
      });
      setFolio(res.folio || `ARK-${workshop.code}-${Math.floor(Math.random()*9000+1000)}`);
      setRegistered(true);
    } catch (err) {
      const d = err.data || {};
      const msg = Object.values(d).flat().join(' · ') || 'Error al inscribirse. Intenta de nuevo.';
      setRegError(msg);
    } finally {
      setLoading(false);
    }
  };
  const prev = () => step > 1 && setStep(step - 1);

  return (
    <div className="detail">
      <div className="container">
        <button className="back-btn" onClick={onBack}>← Volver a talleres</button>

        <div className="detail-grid">
          <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className={`ws-tag accent${workshop.accent === 'magenta' ? '-magenta' : ''}`}>{workshop.category}</span>
              <span className="ws-tag">{workshop.level}</span>
              <span className="ws-tag">{workshop.modalidad}</span>
              <span className="ws-code" style={{ marginLeft: 'auto' }}>{workshop.code}</span>
            </div>

            <h1>
              {workshop.title}
              {workshop.subtitle && <><br /><span className="grad" style={{
                background: 'var(--grad)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                fontStyle: 'italic', fontWeight: 500, fontSize: '0.62em'
              }}>{workshop.subtitle}</span></>}
            </h1>
            <p className="detail-sub">{workshop.descripcionCorta}</p>

            <div className="detail-meta">
              <div className="detail-meta-item"><b>{workshop.fechaLarga}</b></div>
              <div className="detail-meta-item">{workshop.hora}</div>
              <div className="detail-meta-item">{workshop.duracion}</div>
              <div className="detail-meta-item">{workshop.lugar}</div>
              <div className="detail-meta-item">Instructor: <b>{workshop.instructor}</b></div>
            </div>

            {/* Carousel */}
            <div className="carousel">
              <div className="carousel-main">
                {slots.map((src, i) => (
                  <div
                    key={i}
                    className={`carousel-slide ${!src ? 'placeholder' : ''}`}
                    style={{
                      opacity: i === imgIdx ? 1 : 0,
                      backgroundImage: src ? `url(${src})` : 'none',
                      transform: `translateX(${(i - imgIdx) * 8}px)`
                    }}
                  >
                    {!src && <span>{`[ Imagen ${i + 1}/5 · drop here ]`}</span>}
                  </div>
                ))}
              </div>
              <div className="carousel-nav">
                {slots.map((src, i) => (
                  <div
                    key={i}
                    className={`carousel-thumb ${!src ? 'placeholder' : ''} ${i === imgIdx ? 'active' : ''}`}
                    style={{ backgroundImage: src ? `url(${src})` : 'none' }}
                    onClick={() => setImgIdx(i)}
                  ></div>
                ))}
                <span className="carousel-counter">{imgIdx + 1} / 5</span>
              </div>
            </div>

            <div className="d-block">
              <h3>De qué trata</h3>
              <p style={{ color: 'var(--muted)', fontSize: 16, lineHeight: 1.65, margin: 0 }}>{workshop.descripcion}</p>
            </div>

            <div className="d-block">
              <h3>Te llevas</h3>
              <ul className="d-list">
                {workshop.beneficios.map((b, i) => (
                  <li key={i}><span className="num">{String(i + 1).padStart(2, '0')}</span>{b}</li>
                ))}
              </ul>
            </div>

            <div className="d-block">
              <h3>Temario</h3>
              <ul className="d-list">
                {workshop.temario.map((t, i) => (
                  <li key={i}><span className="num">S{String(i + 1).padStart(2, '0')}</span>{t}</li>
                ))}
              </ul>
            </div>

            <div className="d-block">
              <h3>Requisitos · público objetivo</h3>
              <ul className="d-list">
                {workshop.requisitos.map((r, i) => (
                  <li key={i}><span className="num">REQ</span>{r}</li>
                ))}
                <li><span className="num">P/T</span><b>{workshop.publico}</b></li>
              </ul>
            </div>
          </div>

          {/* Sidebar registration */}
          <aside className="reg-card">
            {registered ? (
              <div className="success-state">
                <div className="success-icon">✓</div>
                <h3 style={{ fontFamily: 'var(--display)', fontSize: 24, margin: '0 0 8px' }}>Bienvenidx al taller.</h3>
                <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>
                  Te enviamos los datos de pago a <b style={{ color: 'var(--text)' }}>{form.email || 'tu correo'}</b> y un mensaje a tu WhatsApp.
                </p>
                <div style={{ marginTop: 24, padding: '14px 16px', background: 'var(--surface-2)', borderRadius: 10, fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.12em', color: 'var(--cyan)', textTransform: 'uppercase' }}>
                  Folio · {folio || `ARK-${workshop.code}-****`}
                </div>
                <button className="btn btn-ghost" style={{ marginTop: 22, width: '100%', justifyContent: 'center' }} onClick={onBack}>
                  Ver más talleres
                </button>
              </div>
            ) : (
              <>
                <div className="reg-status">{workshop.estado}</div>
                <div className="reg-price-row">
                  <div className="reg-price"><span className="currency">$</span>{workshop.precio.toLocaleString()}</div>
                  <div className="reg-cur">mxn · pago único</div>
                </div>

                <div className="cupo-bar"><div className="cupo-bar-fill" style={{ width: `${pct}%` }}></div></div>
                <div className="cupo-text">
                  <span>{workshop.cupoTomado}/{workshop.cupo} inscritos</span>
                  <span>{workshop.cupo - workshop.cupoTomado} lugares</span>
                </div>

                <div className="reg-spec">
                  <div className="reg-spec-item"><div className="lbl">Inicio</div><div className="val">{workshop.fechaLarga}</div></div>
                  <div className="reg-spec-item"><div className="lbl">Horario</div><div className="val">{workshop.hora}</div></div>
                  <div className="reg-spec-item"><div className="lbl">Duración</div><div className="val">{workshop.duracion}</div></div>
                  <div className="reg-spec-item"><div className="lbl">Modalidad</div><div className="val">{workshop.modalidad}</div></div>
                </div>

                <div className="reg-stepper">
                  <div className="reg-step-head">
                    <div className={`reg-step-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}></div>
                    <div className={`reg-step-dot ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}></div>
                    <div className={`reg-step-dot ${step >= 3 ? 'active' : ''}`}></div>
                  </div>

                  <div className="mono" style={{ marginBottom: 14 }}>
                    Paso {step} / 3 · {step === 1 ? 'Datos personales' : step === 2 ? 'Perfil profesional' : 'Pago y confirmación'}
                  </div>

                  {step === 1 && (
                    <>
                      <div className="field">
                        <label>Nombre completo</label>
                        <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Como en tu identificación" />
                      </div>
                      <div className="field">
                        <label>Email</label>
                        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="tu@correo.com" />
                      </div>
                      <div className="field">
                        <label>WhatsApp</label>
                        <input value={form.tel} onChange={e => setForm({ ...form, tel: e.target.value })} placeholder="(664) 123 4567" />
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div className="field">
                        <label>Ocupación</label>
                        <input value={form.ocupacion} onChange={e => setForm({ ...form, ocupacion: e.target.value })} placeholder="ej. Diseñadora freelance" />
                      </div>
                      <div className="field">
                        <label>Empresa</label>
                        <input value={form.empresa} onChange={e => setForm({ ...form, empresa: e.target.value })} placeholder="Opcional" />
                      </div>
                      <div className="field-row">
                        <div className="field">
                          <label>Ciudad</label>
                          <input value={form.ciudad} onChange={e => setForm({ ...form, ciudad: e.target.value })} placeholder="Tijuana" />
                        </div>
                        <div className="field">
                          <label>¿Cómo nos conociste?</label>
                          <select value={form.fuente} onChange={e => setForm({ ...form, fuente: e.target.value })}>
                            <option value="web">Sitio web</option>
                            <option value="ig">Instagram</option>
                            <option value="fb">Facebook</option>
                            <option value="wa">WhatsApp</option>
                            <option value="ref">Referido</option>
                            <option value="evento">Evento</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {step === 3 && (
                    <>
                      <div className="field">
                        <label>Método de pago</label>
                        <select value={form.pago} onChange={e => setForm({ ...form, pago: e.target.value })}>
                          <option value="transferencia">Transferencia SPEI</option>
                          <option value="tarjeta">Tarjeta crédito/débito</option>
                          <option value="oxxo">OXXO Pay</option>
                          <option value="paypal">PayPal</option>
                        </select>
                      </div>

                      <div style={{
                        background: 'var(--surface-2)', borderRadius: 10, padding: 16,
                        fontSize: 13, color: 'var(--muted)', lineHeight: 1.55, marginBottom: 14
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span>Taller</span>
                          <b style={{ color: 'var(--text)' }}>{workshop.title}</b>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span>Inicio</span>
                          <b style={{ color: 'var(--text)' }}>{workshop.fechaLarga}</b>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px dashed var(--border-soft)' }}>
                          <span>Total</span>
                          <b style={{ color: 'var(--text)', fontFamily: 'var(--display)', fontSize: 16 }}>${workshop.precio.toLocaleString()} mxn</b>
                        </div>
                      </div>
                    </>
                  )}

                  {regError && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 8 }}>{regError}</div>}
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    {step > 1 && (
                      <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={prev} disabled={loading}>← Atrás</button>
                    )}
                    <button type="button" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center', opacity: loading ? 0.7 : 1 }} onClick={next} disabled={loading}>
                      {loading ? 'Enviando...' : step === 3 ? 'Confirmar inscripción' : 'Continuar →'}
                    </button>
                  </div>
                </div>

                <div className="mono" style={{ textAlign: 'center', marginTop: 16, fontSize: 9.5 }}>
                  Pago seguro · Garantía 7 días · Cancelación libre
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

window.WorkshopDetail = WorkshopDetail;
