# reach-me-out

A static link-in-bio / contact page — React + Vite. Page content (profile,
theme, link list) lives in a single **`config.yaml`**. Deployment is either:

- **Cloudflare Pages** — config is baked into the bundle at build time. No
  backend, no runtime fetch. Edit `config.yaml`, push to `main`, CI rebuilds.
- **Docker** — config is mounted into the container as a volume and fetched
  at runtime by the app. The image ships with a John Doe default; your
  mounted YAML overrides it without a rebuild.

Links:

- **Live architecture:** [docs/overview.md](docs/overview.md)
- **Feature specs:** [docs/features.md](docs/features.md)
- **Release process:** [RELEASE.md](RELEASE.md)
- **Claude Code guide:** [CLAUDE.md](CLAUDE.md)

---

## 1. Prerequisites

| Tool                 | Version                                           |
| -------------------- | ------------------------------------------------- |
| Node.js              | ≥ 20 (see [.nvmrc](.nvmrc))                       |
| npm                  | ≥ 10 (bundled with Node 20)                       |
| `gh` CLI             | latest — only if cloning via `gh repo clone`      |
| `wrangler`           | invoked via `npx` — no global install needed      |
| A Cloudflare account | free tier is enough                               |

---

## 2. Clone and install

```bash
gh repo clone kartikeychoudhary/reach-me-out
cd reach-me-out
npm install
```

---

## 3. Run locally

```bash
npm run dev        # vite dev server on http://localhost:5173
```

The dev server hot-reloads edits to any source file **including
[config.yaml](config.yaml)** — save the YAML and the page updates.

Other scripts:

```bash
npm run build      # bundle to dist/ (bakes config.yaml in)
npm run preview    # serve the built dist/ locally
```

There are **no environment variables** to configure. Everything the browser
needs is inside `config.yaml` and the built bundle.

---

## 4. Edit your profile

All on-screen content lives in one file: [`config.yaml`](config.yaml).

```yaml
profile:
  name: "Alex Rivera"
  title: "Designer & Full-Stack Developer"
  bio: "Building beautiful things on the internet."
  avatar: ""                 # path under public/, e.g. "avatar.jpg"
  phone: "+1234567890"
  email: "hello@alexrivera.dev"
  website: "https://alexrivera.dev"
  location: "San Francisco, CA"

theme:
  mode: dark                 # dark | light  (initial; user can toggle)
  background: mesh           # mesh | gradient | solid | noise
  primary: "#6366f1"           # indigo
  accent:  "#a855f7"           # violet
  radius:  16
  blur:    true

links:
  - label: "Call Me"
    url:   "tel:+1234567890"
    icon:  "fa-solid fa-phone"
    color: "#22c55e"

  - label: "LinkedIn"
    url:   "https://linkedin.com/in/username"
    icon:  "fa-brands fa-linkedin-in"
    color: "#0A66C2"
    badge: "Open to work"

  - label: "YouTube"
    url:   "https://youtube.com/@username"
    icon:  "fa-brands fa-youtube"
    color: "#FF0000"
    enabled: false           # hide without deleting
```

Field reference in [CLAUDE.md → Configuration model](CLAUDE.md#configuration-model).

### Avatar

Drop your image into [`public/`](public/) (e.g. `public/avatar.jpg`) and set
`profile.avatar: "avatar.jpg"`. Leave blank to render initials from `name`.

### Icons

`icon:` takes any Font Awesome 6 class string — brands (`fa-brands fa-github`)
or solid (`fa-solid fa-envelope`). Browse at
<https://fontawesome.com/search?ic=free>. Font Awesome is loaded from its CDN
in [index.html](index.html).

### Theme

- `mode` sets the **initial** dark/light state. The button in the top-right
  corner lets visitors flip it at runtime, and the choice is remembered via
  `localStorage` under `reach-me-out:mode`.
- `primary` and `accent` control every gradient, ring, and highlight on the
  page — pick contrasting colors.
- `background` picks one of four ambient treatments (animated blobs, angular
  gradient, flat solid, SVG noise).

---

## 5. Deploy the site to Cloudflare Pages (one-time)

Create the Pages project:

```bash
npx wrangler login                                  # opens browser
npx wrangler pages project create reach-me-out \
  --production-branch=main
```

Build locally and push a first manual deploy to confirm everything works:

```bash
npm run build
npx wrangler pages deploy dist \
  --project-name=reach-me-out --branch=main
```

Visit the printed `*.pages.dev` URL — you should see your page with the
values from `config.yaml`.

---

## 6. Wire up CI/CD (GitHub Actions)

After the one-time manual deploy, every push to `main` can redeploy
automatically via [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

### Create a Cloudflare API token

Dashboard → **My Profile** → **API Tokens** → **Create Token** → **Custom**:

- **Permissions:**
  - Account → Cloudflare Pages → Edit
- **Account resources:** include your account.

Copy the token.

Grab your **Account ID** from the right sidebar of the Workers & Pages
dashboard.

### Configure GitHub secrets

Repo → **Settings** → **Secrets and variables** → **Actions** → **Secrets**:

| Name                    | Value                       |
| ----------------------- | --------------------------- |
| `CLOUDFLARE_API_TOKEN`  | Token created above.        |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID. |

No public variables are needed — `config.yaml` is baked into the bundle at
build time, and the app talks to nothing at runtime.

### Push to `main`

```bash
git init
git branch -M main
git add .
git commit -m "Initial reach-me-out site"
git remote add origin https://github.com/kartikeychoudhary/reach-me-out.git
git push -u origin main
```

The workflow runs automatically. Follow it under the **Actions** tab.

---

## 7. Custom domain (optional)

Cloudflare Pages dashboard → **reach-me-out** → **Custom domains** → **Set up
a custom domain**. If your DNS is on Cloudflare, it's one click — otherwise
add the CNAME they print at your DNS provider.

---

## 8. Run with Docker

An nginx-based image is published at **`kartikey31choudhary/reach-me-out`** on
Docker Hub. Image size ≈ 30 MB, non-privileged port 80 inside the container.

Behavior:

- The image ships with a **John Doe default config** baked in.
- On every request the app fetches `/config.yaml` from the container root.
- Mount your own `config.yaml` to **`/usr/share/nginx/html/config.yaml`** to
  override the default — no rebuild required.
- If the mount path is missing or the file can't be parsed, the bundled
  fallback is used instead (page still renders).

### 8a. Run the published image

```bash
# Default (John Doe)
docker run --rm -p 8080:80 kartikey31choudhary/reach-me-out:latest

# With your own config
docker run --rm -p 8080:80 \
  -v "$(pwd)/config.yaml:/usr/share/nginx/html/config.yaml:ro" \
  kartikey31choudhary/reach-me-out:latest

# Pin an exact version (recommended for production)
docker run --rm -p 8080:80 \
  -v "$(pwd)/config.yaml:/usr/share/nginx/html/config.yaml:ro" \
  kartikey31choudhary/reach-me-out:v1.0.0
```

Visit <http://localhost:8080>. Edit the host `config.yaml` and refresh — the
page picks up the change without a container restart (the YAML is served
with `Cache-Control: no-store`).

### 8b. docker-compose

```yaml
services:
  reach-me-out:
    image: kartikey31choudhary/reach-me-out:v1.0.0
    restart: unless-stopped
    ports:
      - "8080:80"
    volumes:
      - ./config.yaml:/usr/share/nginx/html/config.yaml:ro
```

`docker compose up -d` to start, `docker compose pull && docker compose up -d`
to upgrade.

### 8c. Build the image yourself

```bash
docker build -t reach-me-out:local .
docker run --rm -p 8080:80 \
  -v "$(pwd)/config.yaml:/usr/share/nginx/html/config.yaml:ro" \
  reach-me-out:local
```

The [Dockerfile](Dockerfile) is a two-stage build: Node 20 compiles the
React bundle, then the output plus [docker/default-config.yaml](docker/default-config.yaml)
is copied into a fresh `nginx:alpine`. See [docker/nginx.conf](docker/nginx.conf)
for the vhost (cache headers, SPA fallback, gzip, security headers).

### 8d. Cutting a new Docker release

Manual release commands live in [RELEASE.md](RELEASE.md) — multi-arch build
with `buildx`, push to Docker Hub, tag the git repo, and create the GitHub
release with the image links as notes.

---

## 9. Repo layout

```
reach-me-out/
├── .github/workflows/deploy.yml    # CI: Pages deploy on push to main
├── docs/
│   ├── overview.md                 # high-level architecture
│   ├── features.md                 # feature index
│   └── feature/
│       └── deploy-pipeline.md
├── public/                         # static assets (avatar, favicon, …)
├── src/
│   ├── main.jsx                    # React entry
│   ├── App.jsx                     # composes the page + wires state
│   ├── components/
│   │   ├── Background.jsx          # particle canvas + blobs + noise
│   │   ├── ParticleCanvas.jsx
│   │   ├── ProfileCard.jsx
│   │   ├── Avatar.jsx
│   │   ├── ActionButtons.jsx       # Save Contact / Share QR / Share
│   │   ├── LinkList.jsx
│   │   ├── LinkRow.jsx
│   │   ├── QrSheet.jsx             # iOS-style bottom sheet
│   │   ├── Toast.jsx
│   │   ├── ThemeToggle.jsx
│   │   └── Footer.jsx
│   ├── hooks/useToast.js
│   ├── utils/
│   │   ├── vcard.js                # vCard builder + download
│   │   ├── theme.js                # applies tokens to <html>/<body>
│   │   └── initials.js
│   └── styles/                     # globals.css + components.css
├── docker/
│   ├── default-config.yaml         # John Doe default baked into the image
│   └── nginx.conf                  # vhost: no-cache /config.yaml, SPA fallback
├── Dockerfile                      # multi-stage build (Node → nginx:alpine)
├── .dockerignore
├── config.yaml                     # ← the only thing you edit for content
├── CLAUDE.md                       # guide for Claude Code
├── RELEASE.md                      # manual release runbook (Docker + GitHub)
├── index.html
└── vite.config.js
```

---

## 10. Troubleshooting

**`wrangler pages deploy` fails with `Project not found`**
Create the Pages project first:
`npx wrangler pages project create reach-me-out --production-branch=main`.

**YAML edits don't show up**
The bundle is built, not fetched. Run `npm run build` again (or push to
`main` to let CI rebuild). The dev server (`npm run dev`) hot-reloads on
save.

**Font Awesome icons render as squares**
Check that [index.html](index.html) still has the CDN `<link>` to
`cdnjs.cloudflare.com/.../font-awesome/.../all.min.css`, and that the `icon:`
value in `config.yaml` uses a full class string like `fa-solid fa-phone` (not
just `phone`).

**Avatar image doesn't load**
Place the file under [`public/`](public/) and reference it without a leading
slash (e.g. `avatar: "avatar.jpg"`). The component falls back to initials if
the image 404s.

**Particle canvas lags on low-end devices**
Open [src/components/ParticleCanvas.jsx](src/components/ParticleCanvas.jsx)
and lower `COUNT` (default 48) or `MAX_DIST` (default 120). Or set
`theme.background: solid` in `config.yaml` to bypass the canvas visually.

**GitHub Actions fails on `wrangler pages deploy`**
- Confirm `CLOUDFLARE_API_TOKEN` has **Cloudflare Pages → Edit**.
- Confirm `CLOUDFLARE_ACCOUNT_ID` is set.
- Ensure the Pages project `reach-me-out` exists (step 5).

**Docker: my mounted `config.yaml` isn't showing up**
- Confirm the mount target is `/usr/share/nginx/html/config.yaml` exactly.
- Confirm the host path is absolute — `docker run -v ./cfg:/…` silently
  creates an empty directory at the target if the host path is relative or
  doesn't exist. Prefer `$(pwd)/config.yaml` or an absolute path.
- Hard-refresh the browser — browsers will respect the `Cache-Control:
  no-store` header on `/config.yaml`, but service workers / extensions can
  still interpose.

**Docker: browser shows John Doe even after mounting**
The mounted YAML is probably invalid — the app silently falls back to the
baked default when `js-yaml` can't parse it. Run `yq . config.yaml` (or
`python -c "import yaml,sys;yaml.safe_load(open('config.yaml'))"`) locally
to confirm.

---

## License

Personal project — all rights reserved. Feel free to take inspiration from
the architecture; please don't copy the content verbatim.
