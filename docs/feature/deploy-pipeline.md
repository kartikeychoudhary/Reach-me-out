# Deploy Pipeline (Cloudflare Pages)

**Status:** Shipped · **Date:** 2026-04-20

## Objective

On every push to `main`, build the React bundle (with `config.yaml` baked in)
and deploy `dist/` to Cloudflare Pages.

## Workflow

File: [.github/workflows/deploy.yml](../../.github/workflows/deploy.yml)

One job: `deploy-pages`.

| Step                      | Command                                                     |
| ------------------------- | ----------------------------------------------------------- |
| Checkout                  | `actions/checkout@v4`                                       |
| Node                      | `actions/setup-node@v4` (pinned via `.nvmrc`, npm cache)    |
| Install                   | `npm ci`                                                    |
| Build                     | `npm run build` → `dist/`                                   |
| Publish                   | `wrangler pages deploy dist --project-name=reach-me-out --branch=main` |

Triggers: `push` to `main` + `workflow_dispatch`. A `concurrency` group
prevents overlapping deploys on rapid-fire pushes.

## One-time setup

### 1. Create the Pages project

```bash
npx wrangler pages project create reach-me-out --production-branch=main
```

(Run once, locally, with a Cloudflare account authenticated via `wrangler
login`.)

### 2. Create a scoped API token

Cloudflare dashboard → My Profile → API Tokens → Create Token → Custom:

- **Permissions:**
  - Account → Cloudflare Pages → Edit
- **Account resources:** include your account.

Save the token — it goes into GitHub as `CLOUDFLARE_API_TOKEN`.

Grab your account ID from the Workers & Pages dashboard sidebar.

### 3. GitHub repository secrets

Repository → Settings → Secrets and variables → Actions → **Secrets**:

| Name                    | Value                       |
| ----------------------- | --------------------------- |
| `CLOUDFLARE_API_TOKEN`  | Token from step 2           |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID  |

No public variables are needed — `config.yaml` is baked in at build time and
the app does not talk to any backend.

## Operations

### Trigger a redeploy manually

GitHub → Actions → Deploy → Run workflow → pick `main`.

### Update the published content

Edit `config.yaml` on a branch, open a PR, merge to `main`. The next build
bakes the new values in.

### Rollback

Cloudflare Pages retains prior deployments. Dashboard → Pages →
`reach-me-out` → Deployments → pick a prior successful build →
"Rollback to this deployment".

## Non-functional properties

- **Concurrency:** `deploy-${{ github.ref }}` with `cancel-in-progress: false`
  serializes deploys on `main` without dropping any.
- **Idempotency:** Pages deploys are content-hashed; redeploying the same
  commit is a no-op upload.
- **Least privilege:** the API token is scoped to Pages only, not the full
  account.
- **Self-contained bundle:** no runtime secrets, no runtime config fetch — the
  static bundle is everything the browser needs.
