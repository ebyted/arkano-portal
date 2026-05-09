// Main app + router
const { useState: useStateA, useEffect: useEffectA, useMemo: useMemoA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "cyber",
  "heroVariant": "v1",
  "density": "comfortable",
  "accent": "duo"
}/*EDITMODE-END*/;

function Nav({ view, onNav, onHome }) {
  const links = [
    { id: 'talleres', label: 'Talleres' },
    { id: 'servicios', label: 'Servicios' },
    { id: 'casos', label: 'Casos' },
    { id: 'cita', label: 'Citas' },
    { id: 'contacto', label: 'Contacto' }
  ];
  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="brand" onClick={onHome}>
          <div className="brand-logo"></div>
          <div>
            <div className="brand-name">Arkano-IA</div>
            <div className="brand-tag">// CODE LIKE A CYBORG</div>
          </div>
        </div>
        <div className="nav-links">
          {links.map(l => (
            <button key={l.id} className="nav-link" onClick={() => onNav(l.id)}>{l.label}</button>
          ))}
          <button className="nav-cta" onClick={() => onNav('cita')}>Agendar cita</button>
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [view, setView] = useStateA('home');
  const [workshopId, setWorkshopId] = useStateA(null);

  // Apply tweaks as body classes
  useEffectA(() => {
    document.body.className = `palette-${tweaks.palette} hero-${tweaks.heroVariant} density-${tweaks.density}`;
    if (tweaks.palette === 'light') document.body.classList.add('theme-light');
  }, [tweaks]);

  const openWorkshop = (id) => {
    setWorkshopId(id);
    setView('detail');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const goHome = () => { setView('home'); setWorkshopId(null); };
  const scrollTo = (id) => {
    if (view !== 'home') {
      setView('home');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const featured = WORKSHOPS[0];
  const workshop = WORKSHOPS.find(w => w.id === workshopId);

  return (
    <>
      <div className="bg-atmosphere"></div>
      <div className="bg-noise"></div>
      <div className="float-mark"></div>

      <div className="app">
        <Nav view={view} onNav={scrollTo} onHome={goHome} />

        {view === 'home' && (
          <>
            <Hero onOpenWorkshop={openWorkshop} featured={featured} onScrollTo={scrollTo} tweaks={tweaks} />
            <Marquee />
            <WorkshopGrid onOpen={openWorkshop} />
            <ServicesGrid onScrollTo={scrollTo} />
            <CasesSection />
            <CitaSection />
            <ContactBand onScrollTo={scrollTo} />
          </>
        )}

        {view === 'detail' && workshop && (
          <WorkshopDetail workshop={workshop} onBack={goHome} />
        )}

        <Footer onNav={scrollTo} />
      </div>

      <TweaksPanel title="Tweaks · Arkano-IA">
        <TweakSection label="Paleta">
          <TweakRadio
            label="Modo"
            value={tweaks.palette}
            options={[
              { value: 'cyber', label: 'Cyber' },
              { value: 'light', label: 'Editorial' }
            ]}
            onChange={v => setTweak('palette', v)}
          />
        </TweakSection>

        <TweakSection label="Hero">
          <TweakRadio
            label="Layout"
            value={tweaks.heroVariant}
            options={[
              { value: 'v1', label: 'Split' },
              { value: 'v2', label: 'Stack' },
              { value: 'v3', label: 'Center' }
            ]}
            onChange={v => setTweak('heroVariant', v)}
          />
        </TweakSection>

        <TweakSection label="Densidad">
          <TweakRadio
            label="Espaciado"
            value={tweaks.density}
            options={[
              { value: 'comfortable', label: 'Cómoda' },
              { value: 'compact', label: 'Compacta' }
            ]}
            onChange={v => setTweak('density', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
