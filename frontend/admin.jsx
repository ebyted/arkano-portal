// Arkano-IA Admin Panel
const { useState: useA, useEffect: useE, useCallback: useCB } = React;

// ── helpers ──────────────────────────────────────────────────────────────────
function fmt(val) { return val == null ? '—' : val; }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('es-MX') : '—'; }
function fmtMoney(v) { return v ? `$${parseFloat(v).toLocaleString()} mxn` : '—'; }

// Admin-specific button styles (avoid conflicts with site CSS)
const btnPrimary = {
  background: 'linear-gradient(135deg,#06b6d4,#a855f7)',
  color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px',
  fontFamily: 'var(--body)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 6,
};
const btnGhost = {
  background: 'transparent', color: 'var(--text)',
  border: '1px solid var(--border-soft)', borderRadius: 8, padding: '6px 14px',
  fontFamily: 'var(--body)', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
};
const btnDanger = { ...btnGhost, color: '#f87171', borderColor: 'rgba(248,113,113,.3)' };

function FilterBar({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
      {options.map(([v, l]) => (
        <button key={v} onClick={() => onChange(v)} style={{
          padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
          fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.06em',
          background: value === v ? 'var(--cyan)' : 'var(--surface-2)',
          color: value === v ? '#000' : 'var(--muted)',
          transition: 'all 0.15s',
        }}>{l}</button>
      ))}
    </div>
  );
}

function Badge({ text, color }) {
  const colors = {
    green: { bg: 'rgba(34,197,94,.15)', color: '#4ade80' },
    yellow: { bg: 'rgba(234,179,8,.15)', color: '#facc15' },
    red: { bg: 'rgba(239,68,68,.15)', color: '#f87171' },
    cyan: { bg: 'rgba(6,182,212,.15)', color: 'var(--cyan)' },
    gray: { bg: 'rgba(156,163,175,.15)', color: '#9ca3af' },
  };
  const s = colors[color] || colors.gray;
  return (
    <span style={{
      background: s.bg, color: s.color, padding: '2px 10px',
      borderRadius: 20, fontSize: 11, fontFamily: 'var(--mono)',
      letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap'
    }}>{text}</span>
  );
}

function Spinner() {
  return <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Cargando...</div>;
}

function ErrorBox({ msg }) {
  return <div style={{ color: '#f87171', padding: '12px 16px', background: 'rgba(239,68,68,.1)', borderRadius: 8, marginBottom: 16 }}>{msg}</div>;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
function LoginPanel({ onLogin }) {
  const [user, setUser] = useA('arkano');
  const [pass, setPass] = useA('');
  const [err, setErr] = useA('');
  const [loading, setLoading] = useA(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      const res = await API.login(user, pass);
      localStorage.setItem('arkano_token', res.access);
      localStorage.setItem('arkano_refresh', res.refresh);
      onLogin();
    } catch {
      setErr('Usuario o contraseña incorrectos.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={submit} style={{ width: 360, background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 16, padding: 40 }}>
        <div style={{ fontFamily: 'var(--display)', fontSize: 22, marginBottom: 6 }}>Arkano-IA</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--cyan)', marginBottom: 28 }}>// Panel administrativo</div>
        {err && <ErrorBox msg={err} />}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Usuario</label>
          <input value={user} onChange={e => setUser(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Contraseña</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading} style={{ ...btnPrimary, width: '100%', justifyContent: 'center', marginTop: 8 }}>
          {loading ? 'Entrando...' : 'Entrar →'}
        </button>
      </form>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = 'cyan' }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: '20px 24px' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--display)', fontSize: 32, color: `var(--${color})` }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard() {
  const [stats, setStats] = useA(null);
  const [regs, setRegs] = useA([]);
  const [appts, setAppts] = useA([]);

  useE(() => {
    Promise.all([
      API.adminWorkshops(),
      API.adminRegistrations(),
      API.adminAppointments(),
    ]).then(([ws, r, a]) => {
      const wsArr = ws.results || ws;
      const regArr = r.results || r;
      const apptArr = a.results || a;
      setStats({
        talleres: wsArr.length,
        inscritos: regArr.length,
        pagados: regArr.filter(x => x.payment_status === 'paid').length,
        citas: apptArr.filter(x => x.status === 'requested').length,
      });
      setRegs(regArr.slice(0, 8));
      setAppts(apptArr.filter(x => x.status === 'requested').slice(0, 5));
    }).catch(() => {});
  }, []);

  if (!stats) return <Spinner />;

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--display)', marginBottom: 24 }}>Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Talleres activos" value={stats.talleres} color="cyan" />
        <StatCard label="Inscritos total" value={stats.inscritos} color="magenta" />
        <StatCard label="Pagos confirmados" value={stats.pagados} color="cyan" />
        <StatCard label="Citas pendientes" value={stats.citas} sub="sin confirmar" color="magenta" />
      </div>

      <h3 style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>// Últimas inscripciones</h3>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, overflow: 'hidden', marginBottom: 32 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
              {['Folio','Asistente','Taller','Pago','Asistió'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {regs.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                <td style={{ padding: '10px 16px', fontFamily: 'var(--mono)', fontSize: 11 }}>{r.folio}</td>
                <td style={{ padding: '10px 16px' }}>{r.attendee_nombre}</td>
                <td style={{ padding: '10px 16px', color: 'var(--muted)' }}>{r.workshop_code}</td>
                <td style={{ padding: '10px 16px' }}>
                  <Badge text={r.payment_status} color={r.payment_status === 'paid' ? 'green' : r.payment_status === 'pending' ? 'yellow' : 'red'} />
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <Badge text={r.attended ? 'Sí' : 'No'} color={r.attended ? 'green' : 'gray'} />
                </td>
              </tr>
            ))}
            {regs.length === 0 && <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>Sin inscripciones</td></tr>}
          </tbody>
        </table>
      </div>

      <h3 style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>// Citas pendientes</h3>
      <div style={{ display: 'grid', gap: 10 }}>
        {appts.map(a => (
          <div key={a.id} style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{a.nombre}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{a.appointment_type_display} · {a.email}</div>
            </div>
            <Badge text={a.status_display || a.status} color="yellow" />
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{fmtDate(a.created_at)}</div>
          </div>
        ))}
        {appts.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13 }}>Sin citas pendientes.</div>}
      </div>
    </div>
  );
}

// ── Workshops list ────────────────────────────────────────────────────────────
function WorkshopsAdmin() {
  const [items, setItems] = useA([]);
  const [loading, setLoading] = useA(true);

  const load = () => API.adminWorkshops().then(r => setItems(r.results || r)).catch(() => {}).finally(() => setLoading(false));
  useE(() => { load(); }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--display)' }}>Talleres</h2>
        <a href="http://localhost:8000/admin/workshops/workshop/add/" target="_blank" style={btnPrimary}>+ Nuevo taller</a>
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
              {['Código','Título','Fecha','Precio','Inscritos','Estado',''].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(w => (
              <tr key={w.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                <td style={{ padding: '10px 16px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--cyan)' }}>{w.code}</td>
                <td style={{ padding: '10px 16px', fontWeight: 500 }}>{w.title}</td>
                <td style={{ padding: '10px 16px', color: 'var(--muted)' }}>{fmtDate(w.date)}</td>
                <td style={{ padding: '10px 16px' }}>{fmtMoney(w.price)}</td>
                <td style={{ padding: '10px 16px' }}>
                  <span style={{ color: w.available_spots === 0 ? '#f87171' : 'inherit' }}>
                    {w.registered_count}/{w.max_capacity}
                  </span>
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <Badge text={w.status} color={w.status === 'published' ? 'green' : w.status === 'draft' ? 'yellow' : 'gray'} />
                </td>
                <td style={{ padding: '10px 16px' }}>
                  <a href={`http://localhost:8000/admin/workshops/workshop/${w.id}/change/`} target="_blank" style={{ color: 'var(--cyan)', fontSize: 11 }}>Editar</a>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>Sin talleres</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Registrations ─────────────────────────────────────────────────────────────
function RegistrationsAdmin() {
  const [items, setItems] = useA([]);
  const [loading, setLoading] = useA(true);
  const [folio, setFolio] = useA('');
  const [checkMsg, setCheckMsg] = useA('');
  const [filter, setFilter] = useA('all');

  const load = () => API.adminRegistrations().then(r => setItems(r.results || r)).catch(() => {}).finally(() => setLoading(false));
  useE(() => { load(); }, []);

  const doCheckin = async () => {
    if (!folio.trim()) return;
    try {
      const res = await API.checkInFolio(folio.trim());
      setCheckMsg(`✓ ${res.nombre} — ${res.workshop}`);
      setFolio('');
      load();
    } catch (err) {
      setCheckMsg(err.data?.detail || 'Folio no encontrado');
    }
  };

  const updatePayment = async (id, status) => {
    await API.updateStatus('registrations', id, { payment_status: status });
    load();
  };

  const filtered = filter === 'all' ? items : items.filter(i =>
    filter === 'paid' ? i.payment_status === 'paid' :
    filter === 'pending' ? i.payment_status === 'pending' :
    filter === 'attended' ? i.attended : true
  );

  if (loading) return <Spinner />;

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--display)', marginBottom: 24 }}>Inscripciones</h2>

      {/* Check-in por folio */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--cyan)', marginBottom: 12 }}>// Check-in manual por folio</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            value={folio}
            onChange={e => setFolio(e.target.value.toUpperCase())}
            placeholder="ARK-AI-001-1234"
            style={{ flex: 1, minWidth: 0 }}
            onKeyDown={e => e.key === 'Enter' && doCheckin()}
          />
          <button onClick={doCheckin} style={btnPrimary}>Check-in →</button>
        </div>
        {checkMsg && <div style={{ marginTop: 10, fontSize: 13, color: checkMsg.startsWith('✓') ? '#4ade80' : '#f87171' }}>{checkMsg}</div>}
      </div>

      <FilterBar
        options={[['all','Todos'],['pending','Pendiente pago'],['paid','Pagados'],['attended','Asistieron']]}
        value={filter}
        onChange={setFilter}
      />

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-soft)' }}>
              {['Folio','Nombre','Email','Taller','Pago','Método','Asistió','Acción'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                <td style={{ padding: '10px 14px', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--cyan)' }}>{r.folio}</td>
                <td style={{ padding: '10px 14px' }}>{r.attendee_nombre}</td>
                <td style={{ padding: '10px 14px', color: 'var(--muted)', fontSize: 12 }}>{r.attendee_email}</td>
                <td style={{ padding: '10px 14px', fontFamily: 'var(--mono)', fontSize: 10 }}>{r.workshop_code}</td>
                <td style={{ padding: '10px 14px' }}>
                  <Badge text={r.payment_status} color={r.payment_status === 'paid' ? 'green' : r.payment_status === 'pending' ? 'yellow' : 'red'} />
                </td>
                <td style={{ padding: '10px 14px', color: 'var(--muted)', fontSize: 11 }}>{r.payment_method}</td>
                <td style={{ padding: '10px 14px' }}>
                  <Badge text={r.attended ? 'Sí' : 'No'} color={r.attended ? 'green' : 'gray'} />
                </td>
                <td style={{ padding: '10px 14px' }}>
                  {r.payment_status !== 'paid' && (
                    <button onClick={() => updatePayment(r.id, 'paid')} style={{ ...btnGhost, fontSize: 11, color: '#4ade80', borderColor: 'rgba(74,222,128,.3)', padding: '3px 10px' }}>
                      ✓ Pagado
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>Sin registros</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Appointments ──────────────────────────────────────────────────────────────
function AppointmentsAdmin() {
  const [items, setItems] = useA([]);
  const [loading, setLoading] = useA(true);

  const load = () => API.adminAppointments().then(r => setItems(r.results || r)).catch(() => {}).finally(() => setLoading(false));
  useE(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await API.updateStatus('appointments', id, { status });
    load();
  };

  const statusColor = s => ({ requested: 'yellow', confirmed: 'cyan', completed: 'green', cancelled: 'red' }[s] || 'gray');

  if (loading) return <Spinner />;

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--display)', marginBottom: 24 }}>Citas</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        {items.map(a => (
          <div key={a.id} style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{a.nombre}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{a.appointment_type_display} · {a.email} · {a.tel}</div>
                {a.empresa && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{a.empresa}</div>}
                {a.notas && <div style={{ fontSize: 13, marginTop: 8, color: 'var(--text)' }}>{a.notas}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Badge text={a.status_display || a.status} color={statusColor(a.status)} />
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{fmtDate(a.created_at)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {a.status === 'requested' && <button style={{ ...btnPrimary, fontSize: 11, padding: '4px 12px' }} onClick={() => updateStatus(a.id, 'confirmed')}>Confirmar</button>}
              {a.status !== 'completed' && a.status !== 'cancelled' && <button style={{ ...btnGhost, fontSize: 11, padding: '4px 12px' }} onClick={() => updateStatus(a.id, 'completed')}>Realizada</button>}
              {a.status !== 'cancelled' && <button style={{ ...btnDanger, fontSize: 11, padding: '4px 12px' }} onClick={() => updateStatus(a.id, 'cancelled')}>Cancelar</button>}
            </div>
          </div>
        ))}
        {items.length === 0 && <div style={{ color: 'var(--muted)', padding: 24, textAlign: 'center' }}>Sin citas.</div>}
      </div>
    </div>
  );
}

// ── CRM Contacts ──────────────────────────────────────────────────────────────
function ContactsAdmin() {
  const [items, setItems] = useA([]);
  const [loading, setLoading] = useA(true);
  const [filter, setFilter] = useA('all');
  const [search, setSearch] = useA('');
  const [selected, setSelected] = useA(null);
  const [note, setNote] = useA('');

  const load = () => API.adminContacts().then(r => setItems(r.results || r)).catch(() => {}).finally(() => setLoading(false));
  useE(() => { load(); }, []);

  const statusColor = s => ({
    new: 'cyan', interested: 'yellow', contacted: 'yellow',
    registered: 'green', client: 'green', recurring: 'green',
    potential_biz: 'cyan', discarded: 'red'
  }[s] || 'gray');

  const statusLabel = s => ({
    new: 'Nuevo', interested: 'Interesado', contacted: 'Contactado',
    registered: 'Inscrito', client: 'Cliente', recurring: 'Recurrente',
    potential_biz: 'Empresa', discarded: 'Descartado'
  }[s] || s);

  const addNote = async () => {
    if (!note.trim() || !selected) return;
    await apiFetch(`/contacts/${selected.id}/add_interaction/`, { method: 'POST', body: JSON.stringify({ note }) })
      .catch(() => {});
    setNote('');
    load();
  };

  const updateStatus = async (id, status) => {
    await API.updateStatus('contacts', id, { status });
    load();
  };

  const filtered = items.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (search && !`${c.nombre}${c.email}${c.empresa}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <Spinner />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: 20 }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <h2 style={{ fontFamily: 'var(--display)' }}>CRM · Contactos</h2>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." style={{ width: 220 }} />
        </div>

        <div className="filter-bar" style={{ marginBottom: 16 }}>
          {[['all','Todos'],['new','Nuevos'],['interested','Interesados'],['client','Clientes'],['discarded','Descartados']].map(([v,l]) => (
            <button key={v} className={`filter-pill ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {filtered.map(c => (
            <div
              key={c.id}
              onClick={() => setSelected(c)}
              style={{
                background: selected?.id === c.id ? 'rgba(6,182,212,.08)' : 'var(--surface)',
                border: `1px solid ${selected?.id === c.id ? 'var(--cyan)' : 'var(--border-soft)'}`,
                borderRadius: 10, padding: '14px 18px', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap'
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{c.nombre}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{c.empresa || c.email || c.tel}</div>
                {c.interes && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{c.interes}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Badge text={statusLabel(c.status)} color={statusColor(c.status)} />
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{fmtDate(c.created_at)}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ color: 'var(--muted)', padding: 24, textAlign: 'center' }}>Sin contactos.</div>}
        </div>
      </div>

      {selected && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 14, padding: 22, position: 'sticky', top: 20, alignSelf: 'start' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--display)', fontSize: 17 }}>{selected.nombre}</div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
          </div>

          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
            {selected.email && <div>{selected.email}</div>}
            {selected.tel && <div>{selected.tel}</div>}
            {selected.empresa && <div>{selected.empresa}</div>}
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>CAMBIAR ESTADO</div>
            <select
              value={selected.status}
              onChange={e => { updateStatus(selected.id, e.target.value); setSelected({ ...selected, status: e.target.value }); }}
              style={{ width: '100%' }}
            >
              {[['new','Nuevo'],['interested','Interesado'],['contacted','Contactado'],['registered','Inscrito'],['client','Cliente'],['recurring','Recurrente'],['potential_biz','Empresa'],['discarded','Descartado']].map(([v,l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>HISTORIAL</div>
            <div style={{ maxHeight: 180, overflowY: 'auto', display: 'grid', gap: 8 }}>
              {(selected.interactions || []).map(i => (
                <div key={i.id} style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                  <div>{i.note}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 10, marginTop: 4 }}>{fmtDate(i.created_at)}</div>
                </div>
              ))}
              {(!selected.interactions || selected.interactions.length === 0) && <div style={{ color: 'var(--muted)', fontSize: 12 }}>Sin interacciones.</div>}
            </div>
          </div>

          <div className="field">
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Agregar nota..." rows={2} />
          </div>
          <button onClick={addNote} style={{ ...btnPrimary, width: '100%', justifyContent: 'center' }}>Agregar nota</button>
        </div>
      )}
    </div>
  );
}

// ── Cases Admin ───────────────────────────────────────────────────────────────
function CasesAdmin() {
  const [items, setItems] = useA([]);
  const [loading, setLoading] = useA(true);

  const load = () => API.adminCases().then(r => setItems(r.results || r)).catch(() => {}).finally(() => setLoading(false));
  useE(() => { load(); }, []);

  const toggle = async (id, published) => {
    await API.updateStatus('cases', id, { published: !published });
    load();
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--display)' }}>Casos de éxito</h2>
        <a href="http://localhost:8000/admin/cases/successcase/add/" target="_blank" style={btnPrimary}>+ Nuevo caso</a>
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        {items.map(c => (
          <div key={c.id} style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{c.title}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{c.client_sector} · {c.category_display}</div>
              {c.metric && <div style={{ fontFamily: 'var(--display)', fontSize: 20, color: 'var(--cyan)', marginTop: 4 }}>{c.metric} <span style={{ fontSize: 12, color: 'var(--muted)' }}>{c.metric_label}</span></div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Badge text={c.published ? 'Publicado' : 'Oculto'} color={c.published ? 'green' : 'gray'} />
              <button style={{ ...btnGhost, fontSize: 11, padding: '4px 12px' }} onClick={() => toggle(c.id, c.published)}>
                {c.published ? 'Ocultar' : 'Publicar'}
              </button>
              <a href={`http://localhost:8000/admin/cases/successcase/${c.id}/change/`} target="_blank" style={{ ...btnGhost, fontSize: 11, padding: '4px 12px', color: 'var(--cyan)' }}>Editar</a>
            </div>
          </div>
        ))}
        {items.length === 0 && <div style={{ color: 'var(--muted)', padding: 24, textAlign: 'center' }}>Sin casos.</div>}
      </div>
    </div>
  );
}

// ── Sidebar Nav ───────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'workshops', label: 'Talleres', icon: '◈' },
  { id: 'registrations', label: 'Inscripciones', icon: '◎' },
  { id: 'appointments', label: 'Citas', icon: '◷' },
  { id: 'contacts', label: 'CRM', icon: '◉' },
  { id: 'cases', label: 'Casos de éxito', icon: '◆' },
];

function AdminApp() {
  const [authed, setAuthed] = useA(!!localStorage.getItem('arkano_token'));
  const [section, setSection] = useA('dashboard');

  const logout = () => { localStorage.removeItem('arkano_token'); localStorage.removeItem('arkano_refresh'); setAuthed(false); };

  if (!authed) return <LoginPanel onLogin={() => setAuthed(true)} />;

  const views = { dashboard: Dashboard, workshops: WorkshopsAdmin, registrations: RegistrationsAdmin, appointments: AppointmentsAdmin, contacts: ContactsAdmin, cases: CasesAdmin };
  const View = views[section] || Dashboard;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ background: 'var(--surface)', borderRight: '1px solid var(--border-soft)', padding: '24px 0', position: 'fixed', width: 220, height: '100vh', overflowY: 'auto', zIndex: 10 }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border-soft)' }}>
          <div style={{ fontFamily: 'var(--display)', fontSize: 16 }}>Arkano-IA</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--cyan)', marginTop: 2 }}>// Admin</div>
        </div>
        <nav style={{ padding: '16px 12px' }}>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                background: section === s.id ? 'rgba(6,182,212,.1)' : 'none',
                border: 'none', borderRadius: 8, cursor: 'pointer',
                color: section === s.id ? 'var(--cyan)' : 'var(--text)',
                fontSize: 13, textAlign: 'left', marginBottom: 2,
              }}
            >
              <span style={{ fontSize: 16, opacity: 0.7 }}>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </nav>
        <div style={{ position: 'absolute', bottom: 20, left: 12, right: 12 }}>
          <button onClick={logout} style={{ ...btnGhost, width: '100%', fontSize: 12 }}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Content */}
      <main style={{ marginLeft: 220, padding: 32, minHeight: '100vh' }}>
        <View />
      </main>
    </div>
  );
}

// Expose apiFetch for notes
const apiFetch = window.API ? ((path, opts) => {
  const token = localStorage.getItem('arkano_token');
  const headers = { 'Content-Type': 'application/json', ...(opts?.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(`http://localhost:8000/api${path}`, { ...opts, headers }).then(r => r.json());
}) : async () => {};

ReactDOM.createRoot(document.getElementById('admin-root')).render(<AdminApp />);
