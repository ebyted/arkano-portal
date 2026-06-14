// agents.jsx — TRINI · Agente de Ventas IA · Arkano-IA

const TRINI_PROMPT = `Eres TRINI, el agente de ventas y consultor de Arkano-IA, la empresa de desarrollo de software e inteligencia artificial de Edgar Jiménez en Tijuana, B.C., México.

Tu misión es doble:
1. Vender proyectos de software e IA a prospectos (dueños de negocio, startups, empresas, agencias).
2. Asesorar a los vendedores del equipo que te consulten — dándoles guiones, planes de seguimiento, respuestas a objeciones y estrategia.

Eres un vendedor moderno: empático, consultivo, directo y sin presión. No vendes tecnología — vendes resultados, tiempo y dinero. Siempre conectas el servicio con el dolor del cliente.

VOZ Y PERSONALIDAD:
- Hablas en español mexicano natural, sin tecnicismos innecesarios
- Eres confiado pero nunca arrogante
- Haces preguntas inteligentes antes de proponer soluciones
- Nunca mencionas precios — siempre diriges a agendar una reunión con Edgar
- Usas analogías simples para explicar conceptos técnicos complejos
- Muestras urgencia solo cuando es real (fecha límite del cliente, oportunidad de mercado)
- Celebras las victorias del cliente, no las tuyas
- Mantén respuestas cortas (máx 3 párrafos) para el chat web

SERVICIOS QUE OFRECES:
- Aplicaciones Web: CRMs, portales de clientes, dashboards, sistemas de gestión, marketplaces, SaaS
- Apps Móviles: iOS y Android, nativas o híbridas, desde MVPs hasta producción
- Bases de Datos: diseño, optimización y administración, relacionales y NoSQL
- APIs e Integraciones: conectar sistemas que no se hablan, ERP, CRM, pagos, ecommerce
- Migraciones de Datos: de sistemas viejos a nuevos sin perder información ni parar el negocio
- Actualización de Sistemas Legacy: modernizar, mejorar rendimiento, rescatar proyectos abandonados
- Chatbots Inteligentes con IA: WhatsApp, web, Instagram — responden 24/7 y califican leads
- Agentes Inteligentes de IA: automatización de procesos, análisis de datos, documentos, decisiones
- Páginas Web y Landing Pages: diseño moderno, conversión, SEO

PROCESO DE VENTA CONSULTIVA:
Paso 1 — Diagnóstico: Antes de proponer nada, entiende el problema.
Paso 2 — Conexión dolor→solución: Usa el lenguaje del cliente, nunca digas "tengo este servicio", di "basado en lo que me cuentas, lo que necesitas es..."
Paso 3 — Confianza: Usa casos de éxito relevantes
Paso 4 — Objeciones: Siempre valida antes de responder
Paso 5 — Cierre: "¿Agendamos 30 minutos con Edgar para un diagnóstico sin costo?"

MANEJO DE OBJECIONES CLAVE:
- "Es muy caro" → "¿Cuánto te está costando hoy el problema? En muchos casos el proyecto se paga solo en meses."
- "Lo hago con mi equipo" → "¿Cuánto tiempo tardarían? Nosotros lo tenemos en producción en 8 semanas."
- "Necesito pensarlo" → "¿Qué información te falta? Una sesión corta con Edgar puede despejar esas dudas."
- "Mala experiencia antes" → "¿Qué pasó? Trabajamos con entregables parciales y contratos claros para evitar eso."
- "La IA no es para mi negocio" → "No hablamos de robots — hablamos de automatizar lo que hoy hace tu equipo manualmente."

CASOS DE ÉXITO:
- Constructora (18 personas): cotizaciones de 14hrs → 40min, +38% cotizaciones enviadas el primer mes
- Restaurante (2 sucursales): bot WhatsApp nocturno, +22% en ticket promedio nocturno
- Estudio fotográfico: 4,000 fotos editadas en una tarde (antes 3 semanas)
- Despacho legal (6 abogados): minutas automáticas, 1 día/semana liberado por abogado

REGLAS ABSOLUTAS:
- NUNCA menciones precios específicos
- Siempre termina dirigiendo al diagnóstico gratis de 30 min con Edgar
- Contacto Edgar: hola@arkano-ia.mx | arkano-ia.com | WhatsApp (664) 123-7972`;

function AgentesSection() {
  const [messages, setMessages] = React.useState([
    {
      role: 'assistant',
      text: '¡Hola! Soy TRINI, el agente de ventas de Arkano-IA 🤖\n\n¿Cuál es el proceso en tu negocio que más tiempo o dinero te está costando hoy?'
    }
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [apiKey, setApiKey] = React.useState('');
  const [showConfig, setShowConfig] = React.useState(false);
  const [keyInput, setKeyInput] = React.useState('');
  const bottomRef = React.useRef(null);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    // Solo hacer scroll dentro del chat si el usuario ya interactuó
    // (más de 1 mensaje = el saludo inicial + algo del usuario)
    if (messages.length > 1) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const SUGGESTIONS = [
    'Quiero automatizar mis cotizaciones',
    'Necesito una app para mi negocio',
    'Tenemos procesos muy manuales',
    '¿Qué hace Arkano-IA?'
  ];

  const saveKey = () => {
    setApiKey(keyInput.trim());
    setShowConfig(false);
  };

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const history = [...messages, { role: 'user', text: msg }];
    setMessages(history);
    setLoading(true);

    if (!apiKey) {
      setTimeout(() => {
        setMessages([...history, {
          role: 'assistant',
          text: 'Para activar la IA real, haz clic en "Activar IA" y pega tu API key de Claude. En modo demo no puedo responderte de verdad 😄\n\nMientras tanto, escríbeme a WhatsApp (664) 123-7972 o a hola@arkano-ia.mx y con gusto te ayuda el equipo.'
        }]);
        setLoading(false);
      }, 700);
      return;
    }

    try {
      const apiMessages = history.map(m => ({ role: m.role, content: m.text }));
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-allow-browser': 'true'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 450,
          system: TRINI_PROMPT,
          messages: apiMessages
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const reply = data.content?.[0]?.text || 'Algo salió mal. Intenta de nuevo.';
      setMessages([...history, { role: 'assistant', text: reply }]);
    } catch (err) {
      setMessages([...history, {
        role: 'assistant',
        text: 'Error de conexión. Verifica tu API key e intenta de nuevo.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const isFirstMessage = messages.length === 1;

  const renderText = (text) => {
    return text.split('\n').map((line, i) => (
      line ? <span key={i}>{line}<br /></span> : <br key={i} />
    ));
  };

  return (
    <section className="section" id="agentes">
      <div className="container">

        {/* ── Banner promocional ── */}
        <div className="agent-banner-wrap">
          <img
            src="assets/agentes-banner.svg"
            alt="Agentes Inteligentes de IA — Arkano-IA"
            className="agent-banner-img"
          />
        </div>

        <div className="section-head">
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>// Agente IA</div>
            <h2 className="section-title">Habla con TRINI ahora.</h2>
          </div>
          <div style={{ color: 'var(--muted)', fontSize: 14, maxWidth: '34ch', lineHeight: 1.6 }}>
            Nuestro agente de ventas IA conoce todos los servicios y puede asesorarte en segundos — 24/7, sin esperar.
          </div>
        </div>

        <div className="agent-layout">

          {/* ── Columna izquierda: tarjeta del agente ── */}
          <div className="agent-card">
            <div className="agent-avatar-wrap">
              <div className="agent-avatar">T</div>
              <div className="agent-online">
                <span className="agent-dot"></span>
                <span>en línea</span>
              </div>
            </div>

            <h3 className="agent-name">TRINI</h3>
            <div className="mono" style={{ color: 'var(--cyan)', marginBottom: 12 }}>
              Agente de Ventas IA · Arkano-IA
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.65, margin: 0 }}>
              Especialista en proyectos de software e IA. Identifica tu necesidad y te conecta con Edgar para un diagnóstico sin costo.
            </p>

            <div className="agent-tags">
              {['Apps Web', 'IA Aplicada', 'Chatbots', 'Agentes', 'Automatización'].map(tag => (
                <span key={tag} className="agent-tag">{tag}</span>
              ))}
            </div>

            <div className="agent-cases">
              <div className="mono" style={{ marginBottom: 10 }}>// Casos recientes</div>
              {[
                { metric: '14hrs → 40min', label: 'Cotizaciones · Constructora' },
                { metric: '+22%', label: 'Ticket nocturno · Restaurante' },
                { metric: '1 día/sem', label: 'Liberado · Despacho legal' },
              ].map((c, i) => (
                <div key={i} className="agent-case-row">
                  <div className="agent-case-metric">{c.metric}</div>
                  <div className="agent-case-label">{c.label}</div>
                </div>
              ))}
            </div>

            <button
              className="btn btn-ghost agent-config-btn"
              onClick={() => setShowConfig(!showConfig)}
            >
              <span>{apiKey ? '✓' : '⚙'}</span>
              {apiKey ? 'IA activa · Claude' : 'Activar IA real'}
            </button>

            {showConfig && (
              <div className="agent-config">
                <div className="mono" style={{ marginBottom: 8 }}>// Claude API Key</div>
                <input
                  className="agent-config-input"
                  type="password"
                  placeholder="sk-ant-api03-..."
                  value={keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveKey()}
                />
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '10px 0' }}
                  onClick={saveKey}
                >
                  Guardar
                </button>
                <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, lineHeight: 1.5 }}>
                  La key se guarda solo en tu sesión. Para producción usa un backend seguro.
                </p>
              </div>
            )}
          </div>

          {/* ── Columna derecha: chat ── */}
          <div className="chat-container">
            <div className="chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="chat-avatar">T</div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>TRINI</div>
                  <div style={{ fontSize: 11, color: 'var(--cyan)', fontFamily: 'var(--mono)' }}>
                    {apiKey ? '● IA activa' : '● Modo demo'}
                  </div>
                </div>
              </div>
              <div className="mono" style={{ fontSize: 10 }}>arkano-ia.com</div>
            </div>

            <div className="chat-messages">
              {messages.map((m, i) => (
                <div key={i} className={`chat-msg chat-msg-${m.role}`}>
                  {m.role === 'assistant' && (
                    <div className="chat-msg-avatar">T</div>
                  )}
                  <div className="chat-bubble">
                    {renderText(m.text)}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="chat-msg chat-msg-assistant">
                  <div className="chat-msg-avatar">T</div>
                  <div className="chat-bubble chat-typing">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {isFirstMessage && !loading && (
              <div className="chat-suggestions">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} className="chat-suggestion" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="chat-input-row">
              <input
                ref={inputRef}
                className="chat-input"
                type="text"
                placeholder="Escribe tu pregunta..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKey}
                disabled={loading}
              />
              <button
                className="chat-send"
                onClick={() => send()}
                disabled={loading || !input.trim()}
                aria-label="Enviar"
              >
                →
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

Object.assign(window, { AgentesSection });
