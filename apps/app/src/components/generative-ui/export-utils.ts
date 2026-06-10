import {
  THEME_CSS,
  SVG_CLASSES_CSS,
  FORM_STYLES_WITH_STAGGER_CSS as FORM_STYLES_CSS,
  IMPORTMAP_SCRIPT_TAG,
} from "@repo/design-system";

const CHART_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#f97316",
];

// Import map matching widget-renderer's assembleShell — allows widgets that
// use bare specifiers (e.g. `import * as THREE from "three"`) to work standalone.
const IMPORT_MAP = IMPORTMAP_SCRIPT_TAG;

/**
 * Wrap a raw HTML fragment (the same string passed to WidgetRenderer)
 * in a standalone document that works when opened in a browser.
 */
export function assembleStandaloneHtml(html: string, title: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  ${IMPORT_MAP}
  <style>
    ${THEME_CSS}
    ${SVG_CLASSES_CSS}
    ${FORM_STYLES_CSS}
  </style>
</head>
<body>
  <div id="content">
    ${html}
  </div>
  <script>
    // Stub bridge functions so onclick="sendPrompt(...)" doesn't throw
    window.sendPrompt = function() {};
    window.openLink = function(url) { if (url) window.open(url, '_blank'); };
    document.addEventListener('click', function(e) {
      var a = e.target.closest('a[href]');
      if (a && a.href.startsWith('http')) {
        e.preventDefault();
        window.open(a.href, '_blank');
      }
    });
  </script>
</body>
</html>`;
}

/**
 * Generate a standalone HTML file that renders a chart using Chart.js from CDN.
 */
export function chartToStandaloneHtml(
  type: "bar" | "pie",
  data: { title: string; description: string; data: Array<{ label: string; value: number }> }
): string {
  const labels = JSON.stringify(data.data.map((d) => d.label));
  const values = JSON.stringify(data.data.map((d) => d.value));
  const colors = JSON.stringify(
    data.data.map((_, i) => CHART_COLORS[i % CHART_COLORS.length])
  );

  const chartConfig =
    type === "bar"
      ? `{
        type: 'bar',
        data: {
          labels: ${labels},
          datasets: [{
            data: ${values},
            backgroundColor: ${colors},
            borderRadius: 4,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: '#1f2937', titleColor: '#fff', bodyColor: '#fff', cornerRadius: 8, padding: 10 }
          },
          scales: {
            x: { grid: { display: false } },
            y: { grid: { color: 'rgba(0,0,0,0.06)' } }
          }
        }
      }`
      : `{
        type: 'pie',
        data: {
          labels: ${labels},
          datasets: [{
            data: ${values},
            backgroundColor: ${colors},
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } },
            tooltip: { backgroundColor: '#1f2937', titleColor: '#fff', bodyColor: '#fff', cornerRadius: 8, padding: 10 }
          }
        }
      }`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(data.title)}</title>
  <style>
    ${THEME_CSS}
    body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; max-width: 640px; margin: 0 auto; }
    h3 { font-size: 20px; font-weight: 700; margin: 0 0 4px; color: var(--color-text-primary); }
    p { font-size: 14px; color: var(--color-text-secondary); margin: 0 0 20px; }
    canvas { max-height: 360px; }
  </style>
</head>
<body>
  <h3>${escapeHtml(data.title)}</h3>
  <p>${escapeHtml(data.description)}</p>
  <canvas id="chart"></canvas>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
  <script>
    new Chart(document.getElementById('chart'), ${chartConfig});
  </script>
</body>
</html>`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function triggerDownload(htmlString: string, filename: string): void {
  const blob = new Blob([htmlString], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
