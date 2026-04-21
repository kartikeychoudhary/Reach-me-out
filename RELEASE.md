# Release Runbook

Manual steps for cutting a new **reach-me-out** release. Three artifacts are
published per release:

1. A multi-arch Docker image on Docker Hub (`:vX.Y.Z` and `:latest`).
2. A signed `git` tag on the repository.
3. A GitHub release linking to the image and with changelog notes.

> **Pre-req:** publisher must be logged into both Docker Hub and GitHub:
> ```bash
> docker login                    # pushes to docker.io/<username>/reach-me-out
> gh auth status                  # must be authenticated
> ```
> Replace `<username>` below with your Docker Hub username. This repo's
> canonical image is `kartikey31choudhary/reach-me-out`.

---

## 1. Decide the version

Follow [semver](https://semver.org) — `MAJOR.MINOR.PATCH`.

```bash
export VERSION=1.0.0
export IMAGE=kartikey31choudhary/reach-me-out
```

---

## 2. Pre-flight

From a clean `main`:

```bash
git checkout main
git pull --ff-only
git status            # must be clean
npm ci
npm run build         # should succeed without warnings
```

If the working tree is dirty or `build` fails, stop and fix.

---

## 3. Build the multi-arch Docker image

`buildx` builds `linux/amd64` and `linux/arm64` in one shot and pushes
straight to Docker Hub. The `--push` flag is what actually publishes; omit
it for a local-only dry run with `--load`.

```bash
# One-time per machine
docker buildx create --name xbuilder --use --bootstrap 2>/dev/null \
  || docker buildx use xbuilder

# Build + push the two tags together
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag  "$IMAGE:v$VERSION" \
  --tag  "$IMAGE:latest" \
  --push \
  .
```

Verify the manifest lists both architectures:

```bash
docker buildx imagetools inspect "$IMAGE:v$VERSION"
```

### Smoke-test locally

Pull a single-arch copy and run it:

```bash
docker run --rm -p 8080:80 "$IMAGE:v$VERSION"
# → http://localhost:8080 should render the John Doe page

# And with an override
docker run --rm -p 8080:80 \
  -v "$(pwd)/config.yaml:/usr/share/nginx/html/config.yaml:ro" \
  "$IMAGE:v$VERSION"
```

---

## 4. Tag the git repo

```bash
git tag -a "v$VERSION" -m "Release v$VERSION"
git push origin "v$VERSION"
```

---

## 5. Create the GitHub release

Generate notes and create the release in one step:

```bash
gh release create "v$VERSION" \
  --title "v$VERSION" \
  --notes-file <(cat <<EOF
## Docker

- \`docker pull ${IMAGE}:v${VERSION}\`
- \`docker pull ${IMAGE}:latest\`
- Platforms: \`linux/amd64\`, \`linux/arm64\`

### Quick start

\`\`\`bash
docker run --rm -p 8080:80 \\
  -v "\$(pwd)/config.yaml:/usr/share/nginx/html/config.yaml:ro" \\
  ${IMAGE}:v${VERSION}
\`\`\`

See [README.md § 8](https://github.com/kartikeychoudhary/Reach-me-out#8-run-with-docker) for compose file and override details.

## Changes

$(git log --pretty=format:'- %s' $(git describe --tags --abbrev=0 HEAD^ 2>/dev/null)..HEAD 2>/dev/null || git log --pretty=format:'- %s')
EOF
)
```

Open the release in the browser to double-check formatting:

```bash
gh release view "v$VERSION" --web
```

---

## 6. Post-release

- Bump `version` in [package.json](package.json) to the **next** planned
  version (e.g. `1.1.0-dev`) on `main` so the in-tree version never matches
  a published release.
- Close any milestone / project items scoped to this release.
- If something's wrong, you can delete/re-push:
  ```bash
  gh release delete "v$VERSION" --cleanup-tag --yes
  docker buildx imagetools create --tag "$IMAGE:latest" "$IMAGE:<prev-version>"
  ```

---

## Appendix — non-buildx fallback

If `buildx` isn't available, you can publish `amd64` only:

```bash
docker build -t "$IMAGE:v$VERSION" -t "$IMAGE:latest" .
docker push "$IMAGE:v$VERSION"
docker push "$IMAGE:latest"
```

Users on Apple Silicon / ARM servers will pay an emulation penalty at
runtime. Prefer the `buildx` path.

---

## Appendix — rotating Docker Hub credentials

1. Dashboard → Docker Hub → Account Settings → Security → **New access
   token** (scope: **Read, Write, Delete**).
2. On the publishing machine:
   ```bash
   docker logout
   docker login -u <username>
   # paste token as the password
   ```
3. Revoke the prior token in the Docker Hub dashboard.
