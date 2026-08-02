# Who Knows Pets?

Who Knows Pets? is a real-time multiplayer game about responsible pet care. Players join a shared game, choose pet avatars, then answer a fresh set of multiple-choice questions about a selected animal and care topic. Each game includes timed rounds, live answer tallies, and a final leaderboard.

The initial pet catalogue includes dogs, cats, birds, and fish. Care topics cover diet and nutrition, grooming and bathing, health and wellbeing, behaviour and communication, training and enrichment, homes and habitats, and safety and first aid.

The app is built on Next.js with Convex as the serverless backend, providing a real-time database and live synchronisation across all connected clients. Pet-care question generation is handled by Gemini via OpenRouter, with a curated animal catalogue and original illustrations bundled into the app.

<table>
  <tr>
    <td><img src="apps/nextjs/public/animals/dogs.webp" alt="Dogs" width="100%"></td>
    <td><img src="apps/nextjs/public/animals/cats.webp" alt="Cats" width="100%"></td>
    <td><img src="apps/nextjs/public/animals/birds.webp" alt="Birds" width="100%"></td>
    <td><img src="apps/nextjs/public/animals/fish.webp" alt="Fish" width="100%"></td>
  </tr>
</table>

## Setup

Create a [Convex](https://convex.dev) account, follow their getting-started guide, then copy `.env.example` to `.env` and set `NEXT_PUBLIC_CONVEX_URL` to your deployment URL. Create an [OpenRouter](https://openrouter.ai) account, generate an API key, and add it as `OPENROUTER_API_KEY` in your Convex dashboard environment variables.

## Usage

```bash
pnpm install    # Install dependencies
pnpm dev        # Run Next.js & Convex dev servers
pnpm build      # Build Next.js
pnpm format     # Format
pnpm lint       # Lint
pnpm typecheck  # Typecheck
pnpm test       # Test
```

## Structure

```bash
apps/
  nextjs/       # Next.js frontend
  convex/       # Convex backend & database
packages/
  ui/           # Shared shadcn/ui components
tooling/
  eslint/       # ESLint config
  prettier/     # Prettier config
  tailwind/     # Tailwind CSS config
  typescript/   # TypeScript config
```
