// chart.jsx — animated SVG line/area/stacked chart with crossover marker

const { useMemo, useRef, useEffect } = React;

function ComparisonChart({
  rows,
  currentYear,
  crossovers = [],
  width = 720,
  height = 320,
  style = 'line',
  metric = 'gain',
  accent,
  neutral,
  bg,
  fg,
  muted,
  grid,
  dense = false,
  yearOpened,
}) {
  const depKey = metric === 'gain' ? 'depositGain' : 'depositBalance';
  const annKey = metric === 'gain' ? 'annuityGain' : 'annuityValue';
  const pad = { t: 18, r: 24, b: 36, l: 64 };
  const W = width, H = height;
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const maxYear = rows.length - 1;
  const yMax = useMemo(() => {
    let m = 0;
    for (const r of rows) {
      if (style === 'stacked') {
        m = Math.max(m, r[depKey] + r[annKey]);
      } else {
        m = Math.max(m, r[depKey], r[annKey]);
      }
    }
    return m * 1.08 || 1;
  }, [rows, style, depKey, annKey]);

  const x = (y) => pad.l + (y / maxYear) * innerW;
  const y = (v) => pad.t + innerH - (v / yMax) * innerH;

  const visible = (key) => {
    const pts = [];
    for (const r of rows) {
      if (r.year <= Math.floor(currentYear)) {
        pts.push([r.year, r[key]]);
      }
    }
    const i = Math.floor(currentYear);
    if (i < maxYear && currentYear > i) {
      const a = rows[i][key];
      const b = rows[i + 1][key];
      const t = currentYear - i;
      pts.push([currentYear, a + (b - a) * t]);
    }
    return pts;
  };

  const depPts = visible(depKey);
  const annPts = visible(annKey);

  const toPath = (pts) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p[0]).toFixed(2)} ${y(p[1]).toFixed(2)}`).join(' ');

  const toArea = (pts) => {
    if (!pts.length) return '';
    const base = y(0);
    const first = `M ${x(pts[0][0]).toFixed(2)} ${base.toFixed(2)}`;
    const line = pts.map(p => `L ${x(p[0]).toFixed(2)} ${y(p[1]).toFixed(2)}`).join(' ');
    const last = `L ${x(pts[pts.length - 1][0]).toFixed(2)} ${base.toFixed(2)} Z`;
    return `${first} ${line} ${last}`;
  };

  const stackedDep = depPts;
  const stackedAnn = annPts.map((p, i) => {
    const d = depPts[i] ? depPts[i][1] : 0;
    return [p[0], p[1] + d];
  });

  const yTicks = useMemo(() => {
    const n = 5;
    const out = [];
    for (let i = 0; i <= n; i++) out.push((yMax / n) * i);
    return out;
  }, [yMax]);

  const xTicks = useMemo(() => {
    const step = maxYear <= 10 ? 1 : maxYear <= 20 ? 2 : maxYear <= 30 ? 5 : 10;
    const out = [];
    for (let yy = 0; yy <= maxYear; yy += step) out.push(yy);
    if (out[out.length - 1] !== maxYear) out.push(maxYear);
    return out;
  }, [maxYear]);

  const lastDep = depPts[depPts.length - 1];
  const lastAnn = annPts[annPts.length - 1];

  const visibleCrossovers = crossovers.filter(c => c.year <= Math.floor(currentYear));

  const boundaryYear = Math.max(0, Math.min(maxYear, 2026 - yearOpened));
  const zoneGreen = '#e8f5e9';
  const zoneOrange = '#fff3e0';

  const fontMain = dense ? 14 : 16;
  const fontTip = dense ? 16 : 19;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ display: 'block', overflow: 'visible' }}>
      {boundaryYear > 0 && (
        <>
          <rect x={pad.l} y={pad.t} width={x(boundaryYear) - pad.l} height={innerH} fill={zoneGreen} opacity={0.4} />
          <text x={pad.l + 6} y={pad.t + 16} fontSize={13} fill="#2e7d32" fontWeight={600} opacity={0.8}>
            Datos históricos
          </text>
        </>
      )}
      {boundaryYear < maxYear && (
        <>
          <rect x={x(boundaryYear)} y={pad.t} width={x(maxYear) - x(boundaryYear)} height={innerH} fill={zoneOrange} opacity={0.4} />
          <text x={x(boundaryYear) + 6} y={pad.t + 16} fontSize={13} fill="#e65100" fontWeight={600} opacity={0.8}>
            Simulación
          </text>
        </>
      )}
      {yTicks.map((v, i) => (
        <g key={`yg-${i}`}>
          <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke={grid} strokeWidth={1} />
          <text x={pad.l - 8} y={y(v) + 4} fontSize={fontMain} textAnchor="end" fill={muted} fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">
            {v >= 1000 ? `${Math.round(v / 1000)}k` : Math.round(v)}
          </text>
        </g>
      ))}
      {xTicks.map((yy, i) => (
        <g key={`xg-${i}`}>
          <line x1={x(yy)} x2={x(yy)} y1={H - pad.b} y2={H - pad.b + 5} stroke={muted} strokeWidth={1} />
          <text x={x(yy)} y={H - pad.b + 20} fontSize={fontMain} textAnchor="middle" fill={muted} fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">
            {yearOpened + yy}
          </text>
        </g>
      ))}

      {visibleCrossovers.map((xo, i) => (
        <g key={i}>
          <line
            x1={x(xo.year)} x2={x(xo.year)}
            y1={pad.t} y2={H - pad.b}
            stroke={xo.to === 'annuity' ? accent : neutral} strokeWidth={1} strokeDasharray="3 3" opacity={0.5}
          />
          <g transform={`translate(${x(xo.year)}, ${pad.t - 6})`}>
            <rect x={-32} y={-12} width={64} height={18} rx={9} fill={xo.to === 'annuity' ? accent : neutral} />
            <text x={0} y={0} fontSize={11} textAnchor="middle" fill="#fff" fontWeight={600}>
              {xo.to === 'annuity' ? '→ RV' : '→ DF'}
            </text>
          </g>
        </g>
      ))}

      {style === 'stacked' ? (
        <>
          <path d={toArea(stackedDep)} fill={neutral} opacity={0.22} />
          <path d={toPath(stackedDep)} fill="none" stroke={neutral} strokeWidth={2} />
          <path d={toArea(stackedAnn)} fill={accent} opacity={0.22} />
          <path d={toPath(stackedAnn)} fill="none" stroke={accent} strokeWidth={2} />
        </>
      ) : style === 'area' ? (
        <>
          <path d={toArea(depPts)} fill={neutral} opacity={0.18} />
          <path d={toArea(annPts)} fill={accent} opacity={0.22} />
          <path d={toPath(depPts)} fill="none" stroke={neutral} strokeWidth={2} />
          <path d={toPath(annPts)} fill="none" stroke={accent} strokeWidth={2.5} />
        </>
      ) : (
        <>
          <path d={toPath(depPts)} fill="none" stroke={neutral} strokeWidth={2} />
          <path d={toPath(annPts)} fill="none" stroke={accent} strokeWidth={2.5} />
        </>
      )}

      {lastDep && (
        <g>
          <circle cx={x(lastDep[0])} cy={y(lastDep[1])} r={4} fill={bg} stroke={neutral} strokeWidth={2} />
          <text x={x(lastDep[0]) + 10} y={y(lastDep[1]) + 4} fontSize={fontTip} fill={fg} fontWeight={600}>
            {fmtEur(lastDep[1])}
          </text>
        </g>
      )}
      {lastAnn && (
        <g>
          <circle cx={x(lastAnn[0])} cy={y(lastAnn[1])} r={5} fill={accent} stroke={bg} strokeWidth={2} />
          <text x={x(lastAnn[0]) + 10} y={y(lastAnn[1]) + 4} fontSize={fontTip} fill={accent} fontWeight={700}>
            {fmtEur(lastAnn[1])}
          </text>
        </g>
      )}
    </svg>
  );
}

function AnimatedNumber({ value, format = fmtEur, style = 'slot', duration = 380 }) {
  const ref = useRef(null);
  const last = useRef({ from: value, to: value, t0: 0 });
  useEffect(() => {
    if (last.current.to === value) return;
    last.current = { from: last.current.to, to: value, t0: performance.now() };
    let raf;
    const tick = () => {
      const now = performance.now();
      const t = Math.min(1, (now - last.current.t0) / duration);
      const e = 1 - Math.pow(1 - t, 3);
      const v = last.current.from + (last.current.to - last.current.from) * e;
      if (ref.current) ref.current.textContent = format(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, format, duration]);
  return <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums', display: 'inline-block' }}>{format(value)}</span>;
}

function DeltaBars({ rows, currentYear, accent, neutral, muted, fg, dense = false }) {
  const max = useMemo(() => {
    let m = 0;
    for (const r of rows) m = Math.max(m, Math.abs(r.delta));
    return m || 1;
  }, [rows]);
  const visible = rows.filter(r => r.year >= 1 && r.year <= Math.ceil(currentYear));
  const barW = dense ? 14 : 18;
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: dense ? 64 : 84, paddingTop: 4 }}>
      {visible.map(r => {
        const h = Math.abs(r.delta) / max * (dense ? 56 : 76);
        const positive = r.delta >= 0;
        return (
          <div key={r.year} title={`${r.calendarYear}: ${fmtSigned(r.delta)}`} style={{
            width: barW, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          }}>
            <div style={{
              width: '100%', height: h,
              background: positive ? accent : neutral,
              opacity: positive ? 0.95 : 0.5,
              borderRadius: 3,
              transition: 'height 220ms ease-out',
            }} />
            <div style={{ fontSize: 9, color: muted, fontFamily: 'ui-monospace, monospace' }}>{r.calendarYear}</div>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { ComparisonChart, AnimatedNumber, DeltaBars });