import {
  THEME_CSS,
  SVG_CLASSES_CSS,
  FORM_STYLES_WITH_STAGGER_CSS,
  IMPORTMAP_SCRIPT_TAG,
} from "@repo/design-system";

export const RESIZE_MESSAGE_TYPE = "__ogui_resize";

export const PREVIEW_FRAME_CONTENT = "<head></head><body></body>";

const DESIGN_SYSTEM_CSS = `${THEME_CSS}\n${SVG_CLASSES_CSS}\n${FORM_STYLES_WITH_STAGGER_CSS}`;
const DESIGN_SYSTEM_STYLE_TAG = `<style>${DESIGN_SYSTEM_CSS}</style>`;
const OVERFLOW_HIDDEN_STYLE_TAG =
  "<style>html, body { overflow: hidden !important; }</style>";

export function ensureHead(html: string): string {
  if (/<head[\s>]/i.test(html)) return html;
  return `<head></head>${html}`;
}

/**
 * Final sandbox document: importmap first (must precede any scripts so module
 * resolution works), then design-system styles, then the generated css, then
 * the generated html. Head content is injected right after the opening <head>
 * tag so it precedes anything the generated document put in its own head.
 */
export function buildFinalFrameContent(html: string, css?: string): string {
  const headContent =
    IMPORTMAP_SCRIPT_TAG +
    DESIGN_SYSTEM_STYLE_TAG +
    (css ? `<style>${css}</style>` : "");
  const withHead = ensureHead(html);
  const openTag = withHead.match(/<head[^>]*>/i);
  if (!openTag || openTag.index === undefined) {
    return `<head>${headContent}</head>${withHead}`;
  }
  const insertAt = openTag.index + openTag[0].length;
  return withHead.slice(0, insertAt) + headContent + withHead.slice(insertAt);
}

/**
 * Preview sandbox head: design-system styles, the generated css param, and any
 * complete <style> tags already extracted from the partial html.
 */
export function buildPreviewHeadContent(
  css?: string,
  previewStyles?: string
): string {
  const parts = [OVERFLOW_HIDDEN_STYLE_TAG, DESIGN_SYSTEM_STYLE_TAG];
  if (css) parts.push(`<style>${css}</style>`);
  if (previewStyles) parts.push(previewStyles);
  return parts.join("");
}

/**
 * Preview body update: morph via Idiomorph (preserves existing nodes, no
 * flicker), falling back to a plain innerHTML assignment if Idiomorph is
 * unavailable or throws.
 */
export function buildPreviewBodyMorph(body: string): string {
  return `(function() {
  var html = ${JSON.stringify(body)};
  if (typeof Idiomorph !== "undefined" && Idiomorph && Idiomorph.morph) {
    try {
      Idiomorph.morph(document.body, html, { morphStyle: 'innerHTML' });
    } catch (err) {
      document.body.innerHTML = html;
    }
  } else {
    document.body.innerHTML = html;
  }
})();`;
}

/**
 * Continuous autosize, forked from the legacy widget-renderer bridge: a
 * ResizeObserver on document.body plus a window resize listener report the
 * content height to the parent on every change. Body height is forced to auto
 * so the reading can shrink below the current iframe viewport.
 */
export const MEASUREMENT_JS = `
(function() {
  if (window.__oguiResizeInstalled) return;
  window.__oguiResizeInstalled = true;
  var style = document.createElement('style');
  style.textContent = 'html, body { overflow: hidden !important; height: auto !important; min-height: 0 !important; }';
  document.head.appendChild(style);
  function reportHeight() {
    var h = document.body.scrollHeight;
    var cs = getComputedStyle(document.body);
    h += parseFloat(cs.marginTop) || 0;
    h += parseFloat(cs.marginBottom) || 0;
    parent.postMessage({ type: '${RESIZE_MESSAGE_TYPE}', height: Math.ceil(h) }, '*');
  }
  var ro = new ResizeObserver(reportHeight);
  ro.observe(document.body);
  window.addEventListener('resize', reportHeight);
  window.addEventListener('load', reportHeight);
  var interval = setInterval(reportHeight, 200);
  setTimeout(function() { clearInterval(interval); }, 3000);
  reportHeight();
})();
`;
