/** Pre-built templates that ship with the app */

export interface SeedTemplate {
  id: string;
  name: string;
  description: string;
  html: string;
  data_description: string;
  created_at: string;
  version: number;
}

const weatherHtml = `<style>
.weather-card {
  font-family: var(--font-sans);
  max-width: 380px;
  border-radius: var(--border-radius-xl);
  background: var(--color-background-secondary);
  border: 0.5px solid var(--color-border-tertiary);
  padding: 24px;
}
.weather-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.weather-city { font-size: 18px; font-weight: 600; color: var(--color-text-primary); }
.weather-date { font-size: 12px; color: var(--color-text-tertiary); margin-top: 2px; }
.weather-badge {
  font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 999px;
  background: var(--color-background-info); color: var(--color-text-info);
}
.weather-temp { font-size: 48px; font-weight: 700; color: var(--color-text-primary); line-height: 1; }
.weather-desc { font-size: 14px; color: var(--color-text-secondary); margin-top: 4px; }
.weather-details {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
  margin-top: 20px; padding-top: 16px;
  border-top: 0.5px solid var(--color-border-tertiary);
}
.weather-detail-label { font-size: 11px; color: var(--color-text-tertiary); }
.weather-detail-value { font-size: 14px; font-weight: 600; color: var(--color-text-primary); margin-top: 2px; }
</style>
<div class="weather-card">
  <div class="weather-header">
    <div>
      <div class="weather-city">New York, NY</div>
      <div class="weather-date">Tuesday, March 25, 2026</div>
    </div>
    <span class="weather-badge">Partly Cloudy</span>
  </div>
  <div class="weather-temp">72°F</div>
  <div class="weather-desc">Partly cloudy with a gentle breeze from the southwest</div>
  <div class="weather-details">
    <div>
      <div class="weather-detail-label">Humidity</div>
      <div class="weather-detail-value">54%</div>
    </div>
    <div>
      <div class="weather-detail-label">Wind</div>
      <div class="weather-detail-value">8 mph SW</div>
    </div>
    <div>
      <div class="weather-detail-label">UV Index</div>
      <div class="weather-detail-value">5 (Moderate)</div>
    </div>
  </div>
</div>`;

const invoiceHtml = `<style>
.invoice-card {
  font-family: var(--font-sans);
  max-width: 420px;
  border-radius: var(--border-radius-xl);
  background: var(--color-background-secondary);
  border: 0.5px solid var(--color-border-tertiary);
  padding: 24px;
}
.invoice-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.invoice-title { font-size: 18px; font-weight: 600; color: var(--color-text-primary); }
.invoice-subtitle { font-size: 12px; color: var(--color-text-tertiary); margin-top: 2px; }
.invoice-badge {
  font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 999px;
  background: var(--color-background-warning); color: var(--color-text-warning);
}
.invoice-amount { font-size: 36px; font-weight: 700; color: var(--color-text-primary); margin: 12px 0 4px; }
.invoice-for { font-size: 13px; color: var(--color-text-secondary); }
.invoice-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  margin-top: 16px; padding-top: 16px;
  border-top: 0.5px solid var(--color-border-tertiary);
}
.invoice-label { font-size: 11px; color: var(--color-text-tertiary); }
.invoice-value { font-size: 14px; font-weight: 500; color: var(--color-text-primary); margin-top: 2px; }
.invoice-actions { display: flex; gap: 8px; margin-top: 20px; }
.invoice-actions button {
  flex: none; font-size: 13px; padding: 8px 18px;
  border-radius: var(--border-radius-md);
}
</style>
<div class="invoice-card">
  <div class="invoice-header">
    <div>
      <div class="invoice-title">Monthly invoice</div>
      <div class="invoice-subtitle">Starter card for a recurring client billing cycle</div>
    </div>
    <span class="invoice-badge">Draft</span>
  </div>
  <div class="invoice-amount">$2,500</div>
  <div class="invoice-for">For product design retainer and monthly support</div>
  <div class="invoice-grid">
    <div>
      <div class="invoice-label">Client</div>
      <div class="invoice-value">Northwind Labs</div>
    </div>
    <div>
      <div class="invoice-label">Billing month</div>
      <div class="invoice-value">March 2026</div>
    </div>
    <div>
      <div class="invoice-label">Invoice number</div>
      <div class="invoice-value">INV-3201</div>
    </div>
    <div>
      <div class="invoice-label">Due date</div>
      <div class="invoice-value">Apr 5, 2026</div>
    </div>
  </div>
  <div class="invoice-actions">
    <button onclick="Websandbox.connection.remote.sendPrompt({ text: 'Send this invoice' })">Send invoice</button>
    <button onclick="Websandbox.connection.remote.sendPrompt({ text: 'Expand to full invoice' })">Expand to full invoice ↗</button>
  </div>
</div>`;

const dashboardHtml = `<style>
.dash {
  font-family: var(--font-sans);
  max-width: 480px;
  border-radius: var(--border-radius-xl);
  background: var(--color-background-secondary);
  border: 0.5px solid var(--color-border-tertiary);
  padding: 24px;
}
.dash-title { font-size: 18px; font-weight: 600; color: var(--color-text-primary); margin-bottom: 4px; }
.dash-subtitle { font-size: 12px; color: var(--color-text-tertiary); margin-bottom: 20px; }
.dash-kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
.dash-kpi {
  padding: 12px; border-radius: var(--border-radius-md);
  background: var(--color-background-primary);
  border: 0.5px solid var(--color-border-tertiary);
}
.dash-kpi-label { font-size: 11px; color: var(--color-text-tertiary); }
.dash-kpi-value { font-size: 22px; font-weight: 700; color: var(--color-text-primary); margin-top: 2px; }
.dash-kpi-change { font-size: 11px; margin-top: 2px; }
.dash-kpi-change.up { color: var(--color-text-success); }
.dash-kpi-change.down { color: var(--color-text-danger); }
.dash-chart { margin-bottom: 16px; }
.dash-chart-title { font-size: 13px; font-weight: 600; color: var(--color-text-primary); margin-bottom: 8px; }
.dash-bars { display: flex; align-items: flex-end; gap: 6px; height: 100px; }
.dash-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.dash-bar {
  width: 100%; border-radius: 4px 4px 0 0;
  background: linear-gradient(180deg, rgba(99,102,241,0.7), rgba(16,185,129,0.5));
  transition: height 0.3s ease;
}
.dash-bar-label { font-size: 10px; color: var(--color-text-tertiary); }
.dash-legend { display: flex; gap: 16px; padding-top: 12px; border-top: 0.5px solid var(--color-border-tertiary); }
.dash-legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--color-text-secondary); }
.dash-legend-dot { width: 8px; height: 8px; border-radius: 50%; }
</style>
<div class="dash">
  <div class="dash-title">Q1 2026 Performance</div>
  <div class="dash-subtitle">Revenue, users, and conversion metrics — Jan to Mar 2026</div>
  <div class="dash-kpis">
    <div class="dash-kpi">
      <div class="dash-kpi-label">Revenue</div>
      <div class="dash-kpi-value">$284k</div>
      <div class="dash-kpi-change up">+12.3% vs Q4</div>
    </div>
    <div class="dash-kpi">
      <div class="dash-kpi-label">Active Users</div>
      <div class="dash-kpi-value">18.2k</div>
      <div class="dash-kpi-change up">+8.1% vs Q4</div>
    </div>
    <div class="dash-kpi">
      <div class="dash-kpi-label">Conversion</div>
      <div class="dash-kpi-value">3.4%</div>
      <div class="dash-kpi-change down">-0.2% vs Q4</div>
    </div>
  </div>
  <div class="dash-chart">
    <div class="dash-chart-title">Monthly Revenue</div>
    <div class="dash-bars">
      <div class="dash-bar-col"><div class="dash-bar" style="height:65%"></div><div class="dash-bar-label">Jan</div></div>
      <div class="dash-bar-col"><div class="dash-bar" style="height:78%"></div><div class="dash-bar-label">Feb</div></div>
      <div class="dash-bar-col"><div class="dash-bar" style="height:100%"></div><div class="dash-bar-label">Mar</div></div>
    </div>
  </div>
  <div class="dash-legend">
    <div class="dash-legend-item"><div class="dash-legend-dot" style="background: var(--color-text-success)"></div>Above target</div>
    <div class="dash-legend-item"><div class="dash-legend-dot" style="background: var(--color-text-danger)"></div>Below target</div>
    <div class="dash-legend-item"><div class="dash-legend-dot" style="background: var(--color-text-tertiary)"></div>No change</div>
  </div>
</div>`;

export const SEED_IDS = new Set(["seed-weather-001", "seed-invoice-001", "seed-dashboard-001"]);

export const SEED_TEMPLATES: SeedTemplate[] = [
  {
    id: "seed-weather-001",
    name: "Weather",
    description: "Current weather conditions card with temperature, humidity, wind, and UV index",
    html: weatherHtml,
    data_description: "City name, date, temperature, condition, humidity, wind speed/direction, UV index",
    created_at: "2026-01-01T00:00:00.000Z",
    version: 1,
  },
  {
    id: "seed-invoice-001",
    name: "Invoice Card",
    description: "Compact invoice card with amount, client info, and action buttons",
    html: invoiceHtml,
    data_description: "Title, amount, description, client name, billing month, invoice number, due date",
    created_at: "2026-01-01T00:00:01.000Z",
    version: 1,
  },
  {
    id: "seed-dashboard-001",
    name: "Dashboard",
    description: "KPI dashboard with metrics cards and bar chart for quarterly performance",
    html: dashboardHtml,
    data_description: "Title, subtitle, KPI labels/values/changes, monthly bar chart data, legend items",
    created_at: "2026-01-01T00:00:02.000Z",
    version: 1,
  },
];
