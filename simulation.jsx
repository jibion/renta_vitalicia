// simulation.jsx — Renta Vitalicia vs Depósito Fijo simulation engine

const HISTORICAL_DEPOSIT_RATES = {
  2000: 3.611, 2001: 3.716, 2002: 2.936, 2003: 2.107,
  2004: 1.905, 2005: 1.972, 2006: 2.668, 2007: 3.793,
  2008: 4.341, 2009: 2.010, 2010: 2.105, 2011: 2.598,
  2012: 2.756, 2013: 1.967, 2014: 1.325, 2015: 0.789,
  2016: 0.539, 2017: 0.385, 2018: 0.331, 2019: 0.280,
  2020: 0.223, 2021: 0.170, 2022: 0.488, 2023: 2.676,
  2024: 2.972, 2025: 1.887, 2026: 1.797,
};

const SAVINGS_BRACKETS = [
  { upTo: 6000,   rate: 0.19 },
  { upTo: 50000,  rate: 0.21 },
  { upTo: 200000, rate: 0.23 },
  { upTo: 300000, rate: 0.27 },
  { upTo: Infinity, rate: 0.28 },
];

function spanishSavingsTax(taxableIncome) {
  if (taxableIncome <= 0) return 0;
  let tax = 0;
  let prev = 0;
  for (const { upTo, rate } of SAVINGS_BRACKETS) {
    if (taxableIncome <= upTo) {
      tax += (taxableIncome - prev) * rate;
      return tax;
    }
    tax += (upTo - prev) * rate;
    prev = upTo;
  }
  return tax;
}

function annuityTaxablePct(ageAtContract) {
  if (ageAtContract < 40) return 0.40;
  if (ageAtContract < 50) return 0.35;
  if (ageAtContract < 60) return 0.28;
  if (ageAtContract < 66) return 0.24;
  if (ageAtContract < 70) return 0.20;
  return 0.08;
}

function runSimulation(params) {
  const {
    capital,
    age,
    horizon,
    depositRate,
    annuityPayoutRate,
    taxRate,
    yearOpened,
  } = params;

  const taxablePct = annuityTaxablePct(age);
  const grossAnnuityPayment = capital * annuityPayoutRate;
  const annuityTaxableBase = grossAnnuityPayment * taxablePct;
  const taxOnAnnuity = annuityTaxableBase * taxRate;
  const netAnnuityPayment = grossAnnuityPayment - taxOnAnnuity;

  const rows = [];
  let depositCumulativeNet = 0;
  let annuityCumulativeNet = 0;

  for (let y = 0; y <= horizon; y++) {
    const calendarYear = yearOpened + y;
    const effectiveRate = calendarYear < 2026 && HISTORICAL_DEPOSIT_RATES[calendarYear] != null ? HISTORICAL_DEPOSIT_RATES[calendarYear] / 100 : depositRate;
    const grossInterest = capital * effectiveRate;
    const depositEffectiveRate = effectiveRate;
    const depositTaxBase = grossInterest;
    const taxOnInterest = depositTaxBase * taxRate;
    const netInterest = grossInterest - taxOnInterest;
    depositCumulativeNet += netInterest;

    annuityCumulativeNet += netAnnuityPayment;

    rows.push({
      year: y, ageNow: age + y, calendarYear,
      depositGrossInterest: grossInterest,
      depositTaxableBase: depositTaxBase,
      depositTax: taxOnInterest,
      depositNetInterest: netInterest,
      depositCumulativeNet,
      depositBalance: capital,
      depositGain: depositCumulativeNet,
      depositEffectiveRate,
      annuityGross: grossAnnuityPayment,
      annuityTaxableBase: annuityTaxableBase,
      annuityTax: taxOnAnnuity,
      annuityNet: netAnnuityPayment,
      annuityCumulativeNet,
      annuityValue: capital,
      annuityGain: annuityCumulativeNet,
      delta: annuityCumulativeNet - depositCumulativeNet,
    });
  }

  const crossovers = [];
  for (let i = 1; i < rows.length; i++) {
    const prev = rows[i - 1].delta;
    const cur = rows[i].delta;
    if ((prev < 0 && cur >= 0) || (prev > 0 && cur <= 0)) {
      crossovers.push({
        year: i,
        calendarYear: yearOpened + i,
        from: prev < 0 ? 'deposit' : 'annuity',
        to: cur > 0 ? 'annuity' : 'deposit',
      });
    }
  }

  return {
    rows,
    crossovers,
    taxablePct,
    grossAnnuityPayment,
    annuityTaxableBase,
    netAnnuityPayment,
    taxOnAnnuity,
    taxRate,
    capital,
  };
}

const EUR0 = new Intl.NumberFormat('es-ES', {
  style: 'currency', currency: 'EUR', maximumFractionDigits: 0, useGrouping: 'always'
});
const EUR2 = new Intl.NumberFormat('es-ES', {
  style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: 'always'
});
const PCT1 = new Intl.NumberFormat('es-ES', {
  style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 2
});
const NUM = new Intl.NumberFormat('es-ES');

function fmtEur(n, decimals = 0) {
  if (!Number.isFinite(n)) return '—';
  return (decimals ? EUR2 : EUR0).format(n);
}
function fmtPct(n) { return PCT1.format(n); }
function fmtSigned(n) {
  const s = fmtEur(n);
  return n >= 0 ? `+${s}` : s;
}

Object.assign(window, {
  runSimulation,
  spanishSavingsTax,
  annuityTaxablePct,
  fmtEur, fmtPct, fmtSigned,
  EUR0, EUR2, PCT1, NUM,
});