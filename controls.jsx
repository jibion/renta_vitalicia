// controls.jsx — input panel + transport controls (play/pause/reset/speed)

const { useEffect: useEffectC, useState: useStateC } = React;

function Field({ label, hint, children, dense }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: dense ? 4 : 6, minWidth: 0 }}>
      <span style={{
        fontSize: 10, letterSpacing: 0.4, textTransform: 'uppercase',
        fontWeight: 600, color: 'var(--muted)',
      }}>{label}</span>
      {children}
      {hint && <span style={{ fontSize: 10, color: 'var(--muted)' }}>{hint}</span>}
    </label>
  );
}

function NumberInput({ value, onChange, min, max, step = 1, suffix = '', width }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
      <input
        type="number"
        value={value}
        min={min} max={max} step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        style={{
          flex: 1, minWidth: 0,
          padding: '6px 8px',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--fg)',
          borderRadius: 6,
          fontSize: 12,
          fontFamily: 'ui-sans-serif, system-ui',
          fontVariantNumeric: 'tabular-nums',
          outline: 'none',
        }}
      />
      {suffix && <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'ui-monospace, monospace', whiteSpace: 'nowrap' }}>{suffix}</span>}
    </div>
  );
}

function Slider({ value, onChange, min, max, step }) {
  return (
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', accentColor: 'var(--accent)', margin: 0 }}
    />
  );
}

function Segmented({ value, onChange, options }) {
  return (
    <div style={{
      display: 'inline-flex', padding: 3, gap: 2,
      background: 'var(--surfaceAlt)', borderRadius: 9, border: '1px solid var(--border)',
    }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            border: 'none', background: opt.value === value ? 'var(--accent)' : 'transparent',
            color: opt.value === value ? '#fff' : 'var(--fg)',
            padding: '4px 10px', borderRadius: 6, fontSize: 10, cursor: 'pointer',
            fontFamily: 'ui-sans-serif, system-ui', fontWeight: 500,
            transition: 'background 120ms',
          }}
        >{opt.label}</button>
      ))}
    </div>
  );
}

function Toggle({ value, onChange, label }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
      fontFamily: 'ui-sans-serif, system-ui',
    }}>
      <span style={{
        position: 'relative', width: 34, height: 20, borderRadius: 999,
        background: value ? 'var(--accent)' : 'var(--border)', transition: 'background 160ms',
      }}>
        <span style={{
          position: 'absolute', top: 2, left: value ? 16 : 2,
          width: 16, height: 16, borderRadius: '50%', background: '#fff',
          transition: 'left 160ms', boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }} />
      </span>
      <span style={{ fontSize: 13, color: 'var(--fg)' }}>{label}</span>
    </button>
  );
}

function Transport({ playing, onPlay, onPause, onReset, onStep, speed, onSpeed, currentYear, horizon, onScrub, accent, compact, yearOpened }) {
  const speeds = [
    { value: 0.5, label: '0.5×' },
    { value: 1, label: '1×' },
    { value: 2, label: '2×' },
  ];
  const Btn = ({ children, onClick, primary, title }) => (
    <button onClick={onClick} title={title} style={{
      width: 30, height: 30, borderRadius: 999,
      border: primary ? 'none' : '1px solid var(--border)',
      background: primary ? 'var(--accent)' : 'var(--surface)',
      color: primary ? '#fff' : 'var(--fg)',
      cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11,
      transition: 'transform 80ms',
    }}
    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.94)'}
    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >{children}</button>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <div style={{ display: 'inline-flex', gap: 4 }}>
        {playing
          ? <Btn onClick={onPause} primary title="Pausar"><svg width="12" height="12" viewBox="0 0 14 14"><rect x="3" y="2" width="3" height="10" fill="#fff"/><rect x="8" y="2" width="3" height="10" fill="#fff"/></svg></Btn>
          : <Btn onClick={onPlay}  primary title="Reproducir"><svg width="12" height="12" viewBox="0 0 14 14"><polygon points="3,2 12,7 3,12" fill="#fff"/></svg></Btn>}
        <Btn onClick={onReset} title="Reiniciar"><svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7a5 5 0 1 0 1.5-3.5"/><path d="M2 2v3h3"/></svg></Btn>
        <Btn onClick={onStep} title="Avanzar 1 año"><svg width="12" height="12" viewBox="0 0 14 14"><polygon points="3,2 9,7 3,12" fill="currentColor"/><rect x="10" y="2" width="2" height="10" fill="currentColor"/></svg></Btn>
      </div>
      {!compact && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 600 }}>Velocidad</span>
          <Segmented value={speed} onChange={onSpeed} options={speeds} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 150, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10, fontFamily: 'ui-monospace, monospace', color: 'var(--muted)', minWidth: 36, textAlign: 'right' }}>
          {yearOpened}
        </span>
        <input
          type="range" min={0} max={horizon} step={1} value={currentYear}
          onChange={(e) => onScrub(parseInt(e.target.value, 10))}
          style={{ flex: 1, accentColor: 'var(--accent)' }}
        />
        <span style={{ fontSize: 10, fontFamily: 'ui-monospace, monospace', color: 'var(--muted)', minWidth: 36 }}>
          {yearOpened + horizon}
        </span>
      </div>
    </div>
  );
}

function ControlsPanel({ p, set, dense, layout = 'stack' }) {
  const cols = layout === 'grid'
    ? 'repeat(auto-fit, minmax(170px, 1fr))'
    : '1fr';
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: cols,
      gap: dense ? 12 : 16,
    }}>
      <Field label="Capital inicial" dense={dense}>
        <NumberInput value={p.capital} onChange={v => set({ capital: v })} min={1000} max={2000000} step={1000} suffix="€" />
        <Slider value={p.capital} onChange={v => set({ capital: v })} min={10000} max={500000} step={1000} />
      </Field>
      <Field label="Edad al contratar" dense={dense}>
        <NumberInput value={p.age} onChange={v => set({ age: Math.round(v) })} min={30} max={100} step={1} suffix="años" />
      </Field>
      <Field label="Año de contratación" hint="Define los datos históricos del Depósito Fijo" dense={dense}>
        <select
          value={p.yearOpened}
          onChange={(e) => set({ yearOpened: parseInt(e.target.value, 10) })}
          style={{
            width: '100%', padding: '8px 10px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--fg)',
            borderRadius: 8, fontSize: 14,
            fontFamily: 'ui-sans-serif, system-ui',
            outline: 'none', cursor: 'pointer',
          }}
        >
          {Array.from({ length: 27 }, (_, i) => 2000 + i).reverse().map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </Field>
      <Field label="Horizonte" hint="Esperanza de vida estimada" dense={dense}>
        <NumberInput value={p.horizon} onChange={v => set({ horizon: Math.round(v) })} min={3} max={40} step={1} suffix="años" />
      </Field>
      <Field label="Interés Depósito Fijo" dense={dense}>
        <NumberInput value={+(p.depositRate * 100).toFixed(2)} onChange={v => set({ depositRate: v / 100 })} min={0} max={10} step={0.05} suffix="%" />
      </Field>
      <Field label="Renta Vitalicia · TAE" hint="Tipo anual garantizado de la renta" dense={dense}>
        <NumberInput value={+(p.annuityPayoutRate * 100).toFixed(2)} onChange={v => set({ annuityPayoutRate: v / 100 })} min={0.5} max={10} step={0.05} suffix="%" />
      </Field>
      <Field label="IRPF ahorro" hint="Tipo plano aplicado a ambos productos" dense={dense}>
        <NumberInput value={+(p.taxRate * 100).toFixed(2)} onChange={v => set({ taxRate: v / 100 })} min={0} max={50} step={0.5} suffix="%" />
      </Field>

    </div>
  );
}

Object.assign(window, { ControlsPanel, Transport, Field, NumberInput, Slider, Segmented, Toggle });