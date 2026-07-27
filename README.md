# Frontend Learning Platform

A statically-generated MDX content site for frontend interview preparation.

- Architecture: [`frontend-learning-platform-architecture.md`](./frontend-learning-platform-architecture.md)
- Implementation roadmap: [`implementation-roadmap.md`](./implementation-roadmap.md)

## Development

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

## Deployment

Hosted on Vercel, Git-integrated:

- **Production:** every push to `main` deploys automatically to production.
- **Preview:** every pull request gets its own preview URL — this preview _is_
  the human review step (read the rendered pages, not just the diff).
- **No environment variables or secrets:** the site is fully static; there is
  nothing to configure.

### Rollback procedure

Deploys are immutable, so rollback is always "redeploy a previous build," never
a code revert:

1. Open the project on [vercel.com](https://vercel.com) → **Deployments**.
2. Find the last known-good production deployment (each entry shows its commit
   message and git SHA).
3. Click the **`...`** menu on that deployment → **Promote to Production**.
4. Vercel repoints production traffic at that build immediately — no rebuild,
   no downtime.
