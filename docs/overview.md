# Overview

**reach-me-out** is a static, single-page React app — a link-in-bio / contact
page. Everything on screen (name, avatar, bio, theme, link list) is sourced
from one `config.yaml` at the repo root, imported at build time and frozen
into the JS bundle. There is no backend, no runtime config fetch, no CMS.

## Architecture

```
┌────────────────────────┐   build (vite)    ┌────────────────────────┐
│  config.yaml (root)    │ ────────────────▶ │  dist/ (static bundle) │
│  profile · theme · links│  baked via       │  JS + CSS + index.html │
└────────────────────────┘  @rollup/plugin-yaml└───────────┬────────────┘
                                                           │ wrangler pages deploy
                                                           ▼
                                                ┌────────────────────────┐
                                                │  Cloudflare Pages      │
                                                │  (static edge host)    │
                                                └────────────────────────┘
```

At runtime the page is pure client JS: it renders the frozen config, runs a
particle-canvas animation over a blob/gradient/solid/noise background, and
hosts three interactive affordances (vCard download, QR share, native Web
Share).

## Stack

| Layer        | Choice                                           |
| ------------ | ------------------------------------------------ |
| UI framework | React 18                                         |
| Build tool   | Vite 5 (`@vitejs/plugin-react`)                  |
| Config       | `@rollup/plugin-yaml` — imports `config.yaml` as JS |
| Styling      | Plain CSS (`src/styles/globals.css` + `components.css`) |
| Icons        | Font Awesome 6 (CDN)                             |
| QR           | `qrcode-generator` (SVG, client-side)            |
| Hosting      | Cloudflare Pages (static `dist/`)                |
| CI/CD        | GitHub Actions + `cloudflare/wrangler-action`    |

## Configuration

Single source of truth: [`config.yaml`](../config.yaml) at the repo root. The
shape is:

```yaml
profile: { name, title, bio, avatar, phone, email, website, location }
theme:   { mode, background, primary, accent, radius, blur }
links:   [ { label, url, icon, color, badge?, enabled? } ]
```

Because the file is imported (not fetched), **any edit requires a rebuild**.
This is intentional — it keeps the production bundle fully self-contained and
cacheable, and it means there is zero attack surface for mutable config.

See [CLAUDE.md](../CLAUDE.md#configuration-model) for the per-field reference.

## Rendering flow

1. `index.html` loads Font Awesome CSS (CDN) and boots `src/main.jsx`.
2. `src/App.jsx` imports the baked `config.yaml` and runs `applyThemeToDocument`
   once on mount to set `--primary` / `--accent` / `--radius-btn` / `--blur`,
   the body `bg-*` class, and the initial `light`/`dark` class.
3. Initial mode comes from `localStorage['reach-me-out:mode']` if set,
   otherwise from `theme.mode` in the YAML. The `ThemeToggle` button flips
   the class and writes back to `localStorage`.
4. `ProfileCard` renders `Avatar` (image or initials fallback) plus
   `ActionButtons` (Save Contact / Share QR / Share).
5. `LinkList` renders every `links[]` entry where `enabled !== false`.
6. `QrSheet` is always mounted but hidden (`.qr-backdrop`); opening it lazily
   generates the SVG QR via `qrcode-generator` and slides the sheet up.

## Features

See [features.md](features.md) for the feature index.

## Deployment

GitHub Actions on `push: main` runs one job: `npm ci` → `npm run build` →
`wrangler pages deploy dist`. Full pipeline details and one-time Cloudflare
setup live in [feature/deploy-pipeline.md](feature/deploy-pipeline.md).
