# Features

Index of features. Each entry links to its own spec in [feature/](feature/)
when it's large enough to warrant one.

| Feature                              | Status  | Spec / Location                                     |
| ------------------------------------ | ------- | --------------------------------------------------- |
| YAML-driven build-time config        | Shipped | [CLAUDE.md → Configuration model](../CLAUDE.md#configuration-model) |
| Profile card + avatar (with initials fallback) | Shipped | [src/components/ProfileCard.jsx](../src/components/ProfileCard.jsx) |
| Link list (FA icons + optional badge) | Shipped | [src/components/LinkList.jsx](../src/components/LinkList.jsx) |
| Save Contact → vCard download        | Shipped | [src/utils/vcard.js](../src/utils/vcard.js)         |
| Share QR (bottom sheet)              | Shipped | [src/components/QrSheet.jsx](../src/components/QrSheet.jsx) |
| Share button (Web Share + clipboard fallback) | Shipped | [src/components/ActionButtons.jsx](../src/components/ActionButtons.jsx) |
| Animated particle-canvas background  | Shipped | [src/components/ParticleCanvas.jsx](../src/components/ParticleCanvas.jsx) |
| Runtime dark/light toggle (persisted) | Shipped | [src/components/ThemeToggle.jsx](../src/components/ThemeToggle.jsx) |
| Deploy pipeline (Pages)              | Shipped | [feature/deploy-pipeline.md](feature/deploy-pipeline.md) |

## Adding a feature

1. Add a row above.
2. If the feature has non-trivial ops / setup / API, create
   `feature/<kebab-name>.md` with: objective, architecture, config keys (if
   any), runbook.
3. If the feature adds config keys, document them in
   [../CLAUDE.md](../CLAUDE.md#configuration-model).
