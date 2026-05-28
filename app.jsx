// app.jsx — root component. Manages param state, CSS vars.

const { useState: useStateApp, useEffect: useEffectApp } = React;

const ACCENT = { c: '#1E40AF', soft: '#dbe5ff', soft2: '#c4d3ff' };

const THEME = {
  bg: '#f6f7fb', surface: '#ffffff', surfaceAlt: '#f1f4fa',
  fg: '#0f172a', muted: '#64748b', border: '#e2e8f0', grid: '#eef1f6',
  neutral: '#94a3b8',
};

const TWEAKS = {
  accent: '#1E40AF',
  accentSoft: '#dbe5ff',
  chartStyle: 'line',
  density: 'comfortable',
  numberAnim: true,
};

const DEFAULT_PARAMS = {
  capital: 100000,
  age: 89,
  horizon: 12,
  depositRate: 0.025,
  annuityPayoutRate: 0.023,
  taxRate: 0.19,
  yearOpened: 2026,
};

function App() {
  const [params, setParams] = useStateApp(DEFAULT_PARAMS);
  const [hideControls, setHideControls] = useStateApp(false);
  const [hideTable, setHideTable] = useStateApp(true);
  const setParam = (patch) => setParams((p) => ({ ...p, ...patch }));

  useEffectApp(() => {
    const r = document.documentElement;
    const setv = (k, v) => r.style.setProperty(k, v);
    setv('--bg', THEME.bg);
    setv('--surface', THEME.surface);
    setv('--surfaceAlt', THEME.surfaceAlt);
    setv('--fg', THEME.fg);
    setv('--muted', THEME.muted);
    setv('--border', THEME.border);
    setv('--grid', THEME.grid);
    setv('--neutral', THEME.neutral);
    setv('--accent', ACCENT.c);
    setv('--accentSoft', ACCENT.soft);
    setv('--accentSoft2', ACCENT.soft2);
    document.body.style.background = THEME.bg;
    document.body.style.color = THEME.fg;
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: THEME.bg }}>
      <VariationC
        params={params}
        setParam={setParam}
        tweaks={TWEAKS}
        hideControls={hideControls}
        setHideControls={setHideControls}
        hideTable={hideTable}
        setHideTable={setHideTable}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);