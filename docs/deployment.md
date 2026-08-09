# Deployment

## Overview

Deployments are automated by `.github/workflows/ci.yml` on pushes to `main`.
Vercel's Git-triggered deployments are disabled, so GitHub Actions is the only
production deployment path.

The workflow:

1. Runs linting, formatting, type checking, and tests.
2. Builds the frontend with Vercel's production settings into `.vercel/output`.
3. Deploys the Convex backend.
4. Uploads the already-built frontend as a staged production deployment.
5. Smoke-tests the staged deployment URL.
6. Promotes the staged frontend to the production domain.

The old frontend remains live if the frontend build, Convex deployment, staged
deployment, or smoke test fails. Production workflows are serialized so two
deployments cannot overlap.

## Required GitHub configuration

Create a GitHub environment named `Production`, then configure these values for
it or for the repository.

### Secrets

| Secret                            | How to get it                                                                             |
| --------------------------------- | ----------------------------------------------------------------------------------------- |
| `CONVEX_DEPLOY_KEY`               | Convex dashboard → Settings → Deploy Keys. Grant only the `deployment:deploy` permission. |
| `VERCEL_TOKEN`                    | Vercel account settings → Tokens. Create a Full Account token with No Expiration.         |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | Vercel project → Settings → Deployment Protection → Protection Bypass for Automation.     |

### Variables

| Variable            | How to get it                                                                       |
| ------------------- | ----------------------------------------------------------------------------------- |
| `VERCEL_ORG_ID`     | Run `vercel link`, then read `orgId` from the generated `.vercel/project.json`.     |
| `VERCEL_PROJECT_ID` | Run `vercel link`, then read `projectId` from the generated `.vercel/project.json`. |

The `.vercel` directory is ignored by Git and must not be committed.

## Vercel configuration

Git-triggered deployments are disabled by `vercel.json` at the repository root:

```json
{
  "git": {
    "deploymentEnabled": false
  }
}
```

The Vercel production environment must define `NEXT_PUBLIC_CONVEX_URL` with the
production Convex deployment URL. The workflow pulls the production project
settings before building, then deploys the exact output from that build rather
than rebuilding after the backend changes.

The smoke test sends the project's automation bypass secret so it can reach a
staged deployment protected by Vercel Authentication.

## Backward compatibility

Every Convex deployment must remain compatible with the currently deployed
frontend. The old frontend continues serving traffic while the new backend is
deployed and while the staged frontend is tested. It also remains live if any
later deployment step fails.

Always safe to deploy:

- New functions.
- New optional fields.
- Internal logic changes that preserve existing behavior.
- Index changes.

Requires three separate deployments:

- Removing or renaming a function.
- Removing a field from the schema.
- Making an optional field required.
- Changing an existing function argument incompatibly.

### Expand-contract process

1. Add the new function or field alongside the old one, then deploy. During a
   field rename, writers must write both fields so the old value does not become
   stale.
2. Update the frontend to use the new function or field, then deploy.
3. Remove the old function or field in a later commit and deploy again.

Never remove a function in the same deployment that updates the frontend to
stop calling it.

## Migrations

Migrations run manually rather than in CI. Convex has no automatic database
rollback, so data written by an incorrect migration cannot be restored by
redeploying old code.

1. Deploy the backward-compatible Convex additions.
2. Run `pnpm convex run migrations:run --prod` from `apps/convex`. Monitor the
   migration and verify the resulting data in the Convex dashboard.
3. Deploy the frontend that uses the new data shape.
4. Remove old functions or fields only in a later cleanup deployment.

## Rollback

### Vercel

Use Instant Rollback in the Vercel dashboard to point the production domain to
the previous frontend deployment.

### Convex

Convex has no instant rollback. To restore earlier backend code, check out the
known-good commit, set its production `CONVEX_DEPLOY_KEY`, change to
`apps/convex`, and run:

```bash
pnpm typecheck
pnpm convex deploy --typecheck disable
```

The separate type check matches CI. Convex's built-in check is disabled because
this project uses a custom functions directory. The deployment restores code and
schema; it does not restore data. It can also fail if production data no longer
conforms to the earlier schema. Prefer a forward fix and use backward-compatible,
expand-contract changes to keep partial deployments safe.
