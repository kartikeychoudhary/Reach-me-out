# reach-me-out

A static link-in-bio page. One profile card, a list of tappable links, a few
action buttons (save-as-vCard, QR share, Web Share). Content is driven from a
single **YAML file at the repo root** that is **baked into the bundle at build
time** — there is no runtime config fetch, no backend.

## Stack

- **Frontend:** React 18, Vite 5, plain CSS
- **Config:** `config.yaml` → imported via `@rollup/plugin-yaml` at build
- **Icons:** Font Awesome 6 (via CDN)
- **QR:** `qrcode-generator` (client-side SVG)
- **Hosting:** Cloudflare Pages (static `dist/`)
- **CI/CD:** GitHub Actions → `wrangler pages deploy` (see [docs/feature/deploy-pipeline.md](docs/feature/deploy-pipeline.md))

## Scripts

```bash
npm run dev        # vite dev server
npm run build      # bundle to dist/ (bakes config.yaml in)
npm run preview    # preview built dist/
```

## Directory tree

```
reach-me-out/
├── CLAUDE.md
├── README.md
├── index.html
├── package.json
├── vite.config.js
├── config.yaml                     # ← the only thing users edit
├── .github/workflows/
│   └── deploy.yml                  # Pages deploy on push to main
├── docs/
│   ├── overview.md
│   ├── features.md
│   └── feature/
│       └── deploy-pipeline.md
├── public/                         # static assets (avatar images, etc.)
└── src/
    ├── main.jsx                    # React entry
    ├── App.jsx                     # composes the page + wires state
    ├── components/
    │   ├── Background.jsx          # particle canvas + blobs + noise
    │   ├── ParticleCanvas.jsx
    │   ├── ProfileCard.jsx
    │   ├── Avatar.jsx
    │   ├── ActionButtons.jsx       # Save Contact / Share QR / Share
    │   ├── LinkList.jsx
    │   ├── LinkRow.jsx
    │   ├── QrSheet.jsx             # iOS-style bottom sheet
    │   ├── Toast.jsx
    │   ├── ThemeToggle.jsx         # runtime dark/light toggle
    │   └── Footer.jsx
    ├── hooks/
    │   └── useToast.js
    ├── utils/
    │   ├── vcard.js                # vCard builder + download
    │   ├── theme.js                # applies theme tokens to <html>/<body>
    │   └── initials.js
    └── styles/
        ├── globals.css             # reset, tokens, keyframes
        └── components.css          # all component styles
```

## Configuration model

One file: **`config.yaml`** at the repo root. It has three sections —
`profile`, `theme`, and `links`. Vite imports it as a JS object via
`@rollup/plugin-yaml`, so the values are **frozen into the bundle** at
build time; there is no runtime fetch.

To change anything visible on the page — name, avatar, links, theme colors —
edit `config.yaml` and run `npm run build`.

### `profile`

| Key        | Purpose                                                      |
| ---------- | ------------------------------------------------------------ |
| `name`     | Shown large; also seeds avatar initials if `avatar` is blank |
| `title`    | Small uppercase label below the name                         |
| `bio`      | Paragraph under the title                                    |
| `avatar`   | Path under `public/` (e.g. `"avatar.jpg"`) — blank for initials |
| `phone`    | Used in the generated vCard                                  |
| `email`    | Used in the generated vCard                                  |
| `website`  | Default target for the Share / QR buttons                    |
| `location` | Used in the generated vCard                                  |

### `theme`

| Key          | Values                                     | Effect                                         |
| ------------ | ------------------------------------------ | ---------------------------------------------- |
| `mode`       | `dark` \| `light`                          | Initial mode (user can toggle at runtime)      |
| `background` | `mesh` \| `gradient` \| `solid` \| `noise` | Sets body `bg-*` class                         |
| `primary`    | any CSS color                              | `--primary` token (buttons, rings, highlights) |
| `accent`     | any CSS color                              | `--accent` token (second gradient stop)        |
| `radius`     | number (px)                                | `--radius-btn` for link rows                   |
| `blur`       | boolean                                    | `false` disables glass backdrop-filter         |

The runtime theme toggle flips `body.light` ↔ `body.dark` and persists to
`localStorage` under `reach-me-out:mode`.

### `links[]`

Each entry: `label` (required), `url`, `icon` (any FA6 class string),
`color` (optional — defaults to `--primary`), `badge` (optional pill),
`enabled: false` to hide without deleting.

## What gets baked in vs. what's runtime

| Thing                                      | When                                                  |
| ------------------------------------------ | ----------------------------------------------------- |
| Profile / links / theme from `config.yaml` | **Build time** (frozen in `dist/assets/*.js`)         |
| Dark/light mode                            | **Runtime** — user toggle, `localStorage` persist     |
| Particle canvas colors                     | **Runtime** — reads `--primary` / `--accent` CSS vars |
| QR code                                    | **Runtime** — generated on first open of the sheet    |
| vCard                                      | **Runtime** — built on Save Contact click             |

## Deployment

Push to `main` → GitHub Actions runs `npm ci && npm run build` and deploys
`dist/` to Cloudflare Pages. See
[docs/feature/deploy-pipeline.md](docs/feature/deploy-pipeline.md) for the
one-time Cloudflare setup (Pages project, API token, GitHub secrets).

# Important
- Don't use co-authored lines in git messages.

# userEmail
The user's email address is kartikey31choudhary@gmail.com.

# currentDate
Today's date is 2026-04-20.
