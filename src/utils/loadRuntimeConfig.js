import yaml from 'js-yaml';

/**
 * Tries to fetch and parse a runtime config.yaml colocated with index.html.
 * On Cloudflare Pages / GitHub Pages this 404s → resolves to null and the
 * caller keeps its baked-in fallback.
 * In Docker, nginx serves either the bundled John Doe default or a
 * volume-mounted override at /config.yaml.
 */
export async function loadRuntimeConfig() {
  try {
    const res = await fetch('./config.yaml', { cache: 'no-store' });
    if (!res.ok) return null;
    const text = await res.text();
    const parsed = yaml.load(text);
    if (parsed && typeof parsed === 'object') return parsed;
    return null;
  } catch {
    return null;
  }
}
