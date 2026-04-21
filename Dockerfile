# syntax=docker/dockerfile:1.7
# -----------------------------------------------------------------------------
#  reach-me-out — production image
#  Multi-stage: Node 20 builder → nginx:alpine static server (~30 MB).
#  The John Doe default config is baked in; mount your own at runtime via:
#    -v $(pwd)/config.yaml:/usr/share/nginx/html/config.yaml:ro
# -----------------------------------------------------------------------------

# ───── Stage 1: build the static bundle ──────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps first (cached layer as long as package*.json is unchanged).
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source. config.yaml is overwritten with the John Doe default so the
# baked-in bundle always falls back to a neutral identity if the runtime
# fetch of /config.yaml ever fails.
COPY . .
COPY docker/default-config.yaml ./config.yaml

RUN npm run build

# ───── Stage 2: runtime image (nginx serving dist/) ──────────────────────────
FROM nginx:1.27-alpine AS runtime

# nginx vhost with no-cache on /config.yaml, immutable cache on /assets/,
# SPA fallback, gzip, and basic security headers.
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Built static bundle.
COPY --from=builder /app/dist /usr/share/nginx/html

# Default config served at /config.yaml. Users override with a bind mount.
COPY docker/default-config.yaml /usr/share/nginx/html/config.yaml

EXPOSE 80

# Lightweight readiness check.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

# nginx:alpine's default entrypoint + CMD already runs nginx in the foreground.
