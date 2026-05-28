// variations.jsx — Variation C: Cara a Cara with sidebar controls

const { useState: useSt, useEffect: useEf, useMemo: useMm, useRef: useRf } = React;

function usePlayhead(horizon) {
  const [current, setCurrent] = useSt(0);
  const [playing, setPlaying] = useSt(false);
  const [speed, setSpeed] = useSt(1);
  const acc = useRf(0);

  useEf(() => {
    if (!playing) return;
    let raf;
    const tick = (t) => {
      acc.current += speed / 60;
      if (acc.current >= 1) {
        const steps = Math.floor(acc.current);
        acc.current -= steps;
        setCurrent((c) => {
          const next = Math.min(c + steps, horizon);
          if (next >= horizon) setPlaying(false);
          return next;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, horizon]);

  const setInt = useSt()[1];
  const syncSet = (v) => { acc.current = 0; setCurrent(typeof v === 'function' ? v : Math.round(v)); };

  return {
    current, setCurrent: syncSet,
    playing,
    play: () => { acc.current = 0; setPlaying(true); },
    pause: () => setPlaying(false),
    reset: () => { acc.current = 0; setPlaying(false); setCurrent(0); },
    step: () => { acc.current = 0; setCurrent(c => Math.min(horizon, Math.floor(c) + 1)); },
    speed, setSpeed,
  };
}

function YearChip({ current, accent, yearOpened }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 999,
      background: 'var(--accentSoft)', color: 'var(--accent)',
      fontSize: 16, fontWeight: 600,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent }} />
      {yearOpened + Math.floor(current)}
    </div>
  );
}

function VariationC({ params, setParam, tweaks, hideControls, setHideControls, hideTable, setHideTable }) {
  const ph = usePlayhead(params.horizon);
  const sim = useMm(() => runSimulation(params), [params]);
  const ci = Math.min(params.horizon, ph.current);
  const row = sim.rows[ci];
  const showControls = !hideControls;
  const showTable = !hideTable;
  const yearWinner = row.delta === 0 ? null : row.delta > 0 ? 'annuity' : 'deposit';

  const cols = showControls ? '300px' : '48px';
  const tableCol = showTable ? '340px' : '';
  const gridCols = tableCol ? `${cols} 1fr ${tableCol}` : `${cols} 1fr`;

  return (
    <div style={{
      width: '100%', height: '100%', display: 'grid',
      gridTemplateColumns: gridCols,
      background: 'var(--bg)', color: 'var(--fg)',
      fontFamily: 'ui-sans-serif, system-ui',
      minHeight: 0,
    }}>
      {showControls ? (
        <aside style={{
          padding: 22, borderRight: '1px solid var(--border)',
          background: 'var(--surface)', display: 'flex', flexDirection: 'column', minHeight: 0,
          overflowX: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11 }}>RV</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>Simulador RV vs DF</div>
            </div>
          </div>
          <div style={{ overflowY: 'auto', overflowX: 'hidden', flex: 1, minHeight: 0 }}>
            <ControlsPanel p={params} set={setParam} dense={false} layout="stack" />
            <div style={{
              marginTop: 14, padding: 10,
              background: 'var(--accentSoft)', borderRadius: 8,
              fontSize: 10, color: 'var(--accent)', lineHeight: 1.4,
            }}>
              A los <b>{params.age} años</b>, sólo el <b>{Math.round(sim.taxablePct * 100)} %</b> de cada renta tributa.
              Tipo efectivo: <b>{fmtPct(sim.taxOnAnnuity / sim.grossAnnuityPayment || 0)}</b>.
            </div>
          </div>
          <div style={{
            marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '6px 0', borderTop: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 500 }}>Controles</span>
            <div onClick={() => setHideControls(v => !v)} style={{
              position: 'relative', width: 36, height: 20, borderRadius: 10,
              background: hideControls ? 'var(--border)' : 'var(--accent)',
              cursor: 'pointer', transition: 'background 150ms', flexShrink: 0,
            }}>
              <div style={{
                position: 'absolute', top: 2, left: hideControls ? 2 : 18,
                width: 16, height: 16, borderRadius: '50%',
                background: '#fff', transition: 'left 150ms',
                boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
              }} />
            </div>
          </div>
        </aside>
      ) : (
        <div style={{
          width: 48, borderRight: '1px solid var(--border)',
          background: 'var(--surface)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '14px 0', gap: 12,
        }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>RV</div>
          <div style={{ flex: 1, width: 1, background: 'var(--border)' }} />
          <button onClick={() => setHideControls(false)} title="Mostrar controles" style={{
            width: 32, height: 32, borderRadius: 8, border: 'none',
            background: 'transparent', color: 'var(--muted)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, transition: 'background 120ms',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accentSoft)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 3l4 3-4 3"/></svg>
          </button>
        </div>
      )}

      <main style={{
        padding: 28, display: 'flex', flexDirection: 'column',
        gap: 22, minWidth: 0, minHeight: 0, overflowY: 'auto', overflowX: 'hidden',
      }}>
        <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 600 }}>Comparativa</div>
            <h1 style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 700, letterSpacing: -0.4 }}>
              Renta Vitalicia <span style={{ color: 'var(--muted)', fontWeight: 400 }}>vs</span> Depósito Fijo
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <YearChip current={ph.current} accent={tweaks.accent} yearOpened={params.yearOpened} />
            <button onClick={() => setHideTable(v => !v)} style={{
              fontSize: 14, fontWeight: 600, letterSpacing: 0.3,
              color: showTable ? 'var(--accent)' : 'var(--muted)',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '4px 8px', borderRadius: 6,
              transition: 'color 120ms',
            }}>
              Tabla {showTable ? '▸' : '◂'}
            </button>
          </div>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
          gap: 20,
        }}>
          <ProductCard
            kind="annuity"
            params={params}
            sim={sim}
            row={row}
            winner={yearWinner === 'annuity'}
            tweaks={tweaks}
          />
          <ProductCard
            kind="deposit"
            params={params}
            sim={sim}
            row={row}
            winner={yearWinner === 'deposit'}
            tweaks={tweaks}
          />
        </div>

        <div style={{
          flex: 1, minHeight: 200, padding: 18,
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 16, fontSize: 14, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>
                Rendimiento neto acumulado
              </span>
              <Legend swatch={tweaks.accent} label="Renta Vitalicia" weight={700} />
              <Legend swatch="var(--neutral)" label="Depósito Fijo" />
              {sim.crossovers.length > 0 && (
                <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>
                  · cruces: {sim.crossovers.map(xo => `${xo.calendarYear} → ${xo.to === 'annuity' ? 'RV' : 'DF'}`).join(', ')}
                </span>
              )}
            </div>
            <span style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'ui-monospace, monospace' }}>
              € sobre capital
            </span>
          </div>
          <div style={{ flex: 1, minHeight: 180 }}>
            <ComparisonChart
              rows={sim.rows} currentYear={ph.current} crossovers={sim.crossovers}
              width={1200} height={260} style={tweaks.chartStyle}
              metric="gain"
              accent={tweaks.accent} neutral="var(--neutral)"
              bg="var(--surface)" fg="var(--fg)" muted="var(--muted)" grid="var(--grid)"
              yearOpened={params.yearOpened}
            />
          </div>
        </div>

        <div style={{ padding: '14px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
          <Transport
            playing={ph.playing} onPlay={ph.play} onPause={ph.pause} onReset={ph.reset} onStep={ph.step}
            speed={ph.speed} onSpeed={ph.setSpeed}
            currentYear={ph.current} horizon={params.horizon} onScrub={ph.setCurrent}
            accent={tweaks.accent} yearOpened={params.yearOpened}
          />
        </div>

      </main>

      {showTable && (
        <aside style={{
          borderLeft: '1px solid var(--border)',
          background: 'var(--surface)',
          display: 'flex', flexDirection: 'column',
          minHeight: 0,
        }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Comparativa anual</div>
            <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
              <Legend swatch="var(--accentSoft)" label="Gana RV" />
              <Legend swatch="var(--surfaceAlt)" label="Gana Depósito" />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
            <ComparisonTable rows={sim.rows} />
          </div>
          <div style={{
            padding: '10px 16px', borderTop: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>Tabla</span>
            <div onClick={() => setHideTable(v => !v)} style={{
              position: 'relative', width: 36, height: 20, borderRadius: 10,
              background: hideTable ? 'var(--border)' : 'var(--accent)',
              cursor: 'pointer', transition: 'background 150ms', flexShrink: 0,
            }}>
              <div style={{
                position: 'absolute', top: 2, left: hideTable ? 2 : 18,
                width: 16, height: 16, borderRadius: '50%',
                background: '#fff', transition: 'left 150ms',
                boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
              }} />
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

function Legend({ swatch, label, weight = 500 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--fg)', fontWeight: weight, fontSize: 14 }}>
      <span style={{ width: 14, height: 14, background: swatch, borderRadius: 3 }} />
      {label}
    </span>
  );
}

function ProductCard({ kind, params, sim, row, winner, tweaks, dense }) {
  const isAnnuity = kind === 'annuity';
  const title = isAnnuity ? 'Renta Vitalicia' : 'Depósito Fijo';
  const depositRateDisplay = row.depositEffectiveRate != null ? row.depositEffectiveRate : params.depositRate;
  const subtitle = isAnnuity
    ? `${fmtPct(params.annuityPayoutRate)} TAE · sólo ${Math.round(sim.taxablePct * 100)} % tributa · capital garantizado a herederos`
    : `${fmtPct(depositRateDisplay)} TAE · intereses tributan al 100 %`;
  const gain = isAnnuity ? row.annuityGain : row.depositGain;
  const fg = isAnnuity ? 'var(--accent)' : 'var(--fg)';

  const rows = isAnnuity
    ? [
        ['Bruto Año', fmtEur(row.annuityGross)],
        ['Base Imp.', fmtEur(row.annuityTaxableBase)],
        ['IRPF', fmtEur(row.annuityTax)],
        ['Neto Año', fmtEur(row.annuityNet)],
        ['Σ Neto', fmtEur(row.annuityCumulativeNet)],
      ]
    : [
        ['Bruto Año', fmtEur(row.depositGrossInterest)],
        ['Base Imp.', fmtEur(row.depositTaxableBase)],
        ['IRPF', fmtEur(row.depositTax)],
        ['Neto Año', fmtEur(row.depositNetInterest)],
        ['Σ Neto', fmtEur(row.depositCumulativeNet)],
      ];

  return (
    <div style={{
      padding: dense ? 16 : 20, borderRadius: 14,
      background: winner ? 'var(--accentSoft)' : 'var(--surface)',
      border: `1.5px solid ${winner ? 'var(--accent)' : 'var(--border)'}`,
      display: 'flex', flexDirection: 'column', gap: dense ? 10 : 14,
      position: 'relative',
      transition: 'border-color 200ms',
      minWidth: 0,
    }}>
      {winner && (
        <div style={{
          position: 'absolute', top: -10, right: 18,
          padding: '2px 10px', borderRadius: 999,
          background: 'var(--accent)', color: '#fff', fontSize: 12, fontWeight: 700,
          letterSpacing: 0.8, textTransform: 'uppercase',
        }}>Va por delante</div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: dense ? 24 : 28, fontWeight: 700, marginTop: 2, color: fg, lineHeight: 1.15 }}>{title}</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>{subtitle}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 600 }}>Rendimiento neto</div>
          <div style={{
            fontSize: dense ? 28 : 36, fontWeight: 800, letterSpacing: -0.4,
            color: gain > 0 ? fg : 'var(--muted)',
            fontVariantNumeric: 'tabular-nums', lineHeight: 1.1, marginTop: 2,
          }}>
            {tweaks.numberAnim
              ? <AnimatedNumber value={gain} format={fmtSigned} />
              : fmtSigned(gain)}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, minWidth: 0 }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{
            padding: '10px 6px', background: winner ? 'var(--bg)' : 'var(--surfaceAlt)',
            borderRadius: 6, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0,
            textAlign: 'center',
          }}>
            <span style={{
              fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase',
              letterSpacing: 0.3, fontWeight: 600, lineHeight: 1.2,
            }}>{k}</span>
            <span style={{
              fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              color: 'var(--fg)',
            }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonTable({ rows }) {
  return (
    <table style={{
      width: '100%', fontSize: 11, borderCollapse: 'collapse',
      fontVariantNumeric: 'tabular-nums', tableLayout: 'fixed',
    }}>
      <thead>
        <tr style={{ background: 'var(--surfaceAlt)', position: 'sticky', top: 0 }}>
          {['Año', 'RV neto', 'Σ RV', 'Dep. neto', 'Σ Dep.', 'Δ'].map(h => (
            <th key={h} style={{
              padding: '6px 4px', textAlign: 'right', fontWeight: 600,
              color: 'var(--muted)', fontSize: 10, textTransform: 'uppercase',
              letterSpacing: 0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(r => {
          return (
            <tr key={r.year} style={{
              borderTop: '1px solid var(--border)',
              background: r.delta > 0 ? 'var(--accentSoft)' : r.delta < 0 ? 'var(--surfaceAlt)' : 'transparent',
            }}>
              <td style={{ padding: '5px 4px', textAlign: 'right', color: 'var(--muted)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.calendarYear}</td>
              <td style={{ padding: '5px 4px', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fmtEur(r.annuityNet, 0)}</td>
              <td style={{ padding: '5px 4px', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fmtEur(r.annuityCumulativeNet, 0)}</td>
              <td style={{ padding: '5px 4px', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fmtEur(r.depositNetInterest, 0)}</td>
              <td style={{ padding: '5px 4px', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fmtEur(r.depositCumulativeNet, 0)}</td>
              <td style={{
                padding: '5px 4px', textAlign: 'right', fontWeight: 700,
                color: r.delta > 0 ? 'var(--accent)' : r.delta < 0 ? 'var(--neutral)' : 'var(--muted)',
                overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{fmtSigned(r.delta)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

Object.assign(window, { VariationC });