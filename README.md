# Renta Vitalicia Simulator

**[Live demo](https://jibion.github.io/renta_vitalicia/)**

A browser-based tool to compare a **life annuity (renta vitalicia)** against a **fixed-term deposit (depósito a plazo fijo)** in Spain, applying the current Spanish income tax rules.

## What it does

Given an initial capital, it calculates year by year:

- Net interest from the fixed-term deposit (withholding tax applied to the full interest amount).
- Net payments from the life annuity (using the integration percentage defined by age at contract, per Spanish IRPF rules).
- The cumulative difference between both options and the crossover year.

Historical Banco de España deposit rates are used automatically for past years; a user-configured rate is applied for future years.

## Usage

No installation or server required. Just open the HTML file directly in a browser:

```
Simulador Renta Vitalicia.html
```

Adjust the parameters in the controls panel:

| Parameter | Description |
|---|---|
| Capital | Amount to invest (€) |
| Age | Age at the time of signing the annuity |
| Horizon | Number of years to simulate |
| Deposit rate | Expected APR of the fixed-term deposit |
| Annuity payout rate | Annual payout rate on the capital |
| Tax rate | Withholding rate (default 19 %) |
| Start year | Year the contract is signed |

## Tax rules applied

- **Fixed-term deposit**: withholding on 100 % of interest, taxed at the Spanish savings income brackets.
- **Life annuity**: only a fraction of each payment is taxable, based on the age at contract (art. 25.3 LIRPF) — 8 % from age 70 onwards, up to 40 % below age 40.

## Tech stack

- React 18 (loaded from CDN, no bundler)
- Babel Standalone (JSX transpiled in the browser)
- No additional dependencies — a single HTML file + JSX modules

## License

MIT — see [LICENSE](LICENSE).
