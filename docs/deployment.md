# Deployment

## Overview

Deployments are fully automated via GitHub Actions. Vercel auto-deploy from git is disabled — Vercel is only ever triggered by the deploy hook called from CI.

One workflow handles everything:

- **`ci.yml`** — runs lint, format, and typecheck on every push. If all pass and the branch is `main`, deploys Convex then triggers Vercel.

Convex always deploys before Vercel. If Convex fails, Vercel is never triggered. Convex deploys are idempotent, so deploying on any change is safe.

## Required secrets

| Secret                   | How to get it                                                                 |
| ------------------------ | ----------------------------------------------------------------------------- |
| `CONVEX_DEPLOY_KEY`      | Convex dashboard → Settings → URL & Deploy Key → Create Production Deploy Key |
| `VERCEL_DEPLOY_HOOK_URL` | Vercel → Project Settings → Git → Deploy Hooks → create a hook for `main`     |

## Disabling Vercel auto-deploy

Git-triggered deployments are disabled via `vercel.json` at the repo root:

```json
{
  "git": {
    "deploymentEnabled": false
  }
}
```

This prevents Vercel from deploying on every git push. Deploy hooks (called from GitHub Actions) are unaffected and continue to work normally.

---

## Backward-compatibility rule

The pipeline only works safely if every Convex change is backward-compatible with the currently-deployed frontend. A Vercel build failure is only safe if the old frontend can still function on the new backend.

**Always safe to deploy:**

- New functions
- New optional fields
- Internal logic changes
- Index changes

**Requires expand-contract (two separate PRs):**

- Removing a function
- Renaming a function
- Removing a required field from the schema
- Making an optional field required

### Expand-contract process

1. **PR 1**: Add the new function or field alongside the old one. Deploy. Old frontend works, new code is ready. For field changes (e.g. renaming a field), the writer must write to both the old and new fields simultaneously during this phase — writing only to the new field will leave the old field stale, which can cause data loss.
2. **PR 2**: Update the frontend to use the new function or field. Deploy.
3. **PR 3**: Remove the old function or field. Deploy.

Never remove a function in the same commit as the frontend that stops calling it.

---

## Migrations

Migrations are run manually, not in CI. They're high-stakes and benefit from human attention. Convex has no database rollback — data written during a bad migration cannot be automatically undone.

### Sequence

1. **PR 1**: Deploy backward-compatible Convex changes (new optional field, new function alongside the old one). CI auto-deploys Convex and Vercel. Old frontend continues to work.
2. **Run the migration manually**: `npx convex run migrations:run --prod` (or whatever function path you've registered). Monitor progress in the Convex dashboard. Verify the data looks correct before proceeding.
3. **PR 2**: Deploy the frontend that depends on the new data shape, plus any Convex cleanup (remove old functions or fields). CI auto-deploys both.

---

## Rollback

### Vercel

Instant rollback via the Vercel dashboard. Promote any previous deployment to production in one click.

### Convex

No UI rollback button. To revert: check out the previous commit and run `pnpm convex deploy --prod` with a valid `CONVEX_DEPLOY_KEY`. This takes a few minutes and requires credentials.

**Data written during a bad deploy is not rolled back.** Treat Convex rollbacks as high-stakes operations. The backward-compatibility rule and expand-contract process are the primary safety mechanisms — they ensure a partial deployment is always survivable without a rollback.
