@AGENTS.md

# Houston: notes for Claude

Houston is a tiny Next.js game used in a design pilot. Designers leave comments
with the Vercel toolbar, and you turn each comment into a small change. The
people you work with here are designers, not engineers.

## Explain every change in plain words

- Say what changed on screen first, then where it lives, then how to see it
  ("Critical satellites now glow twice as wide. Pick Solar storm and wait about
  10 seconds for one to turn red.").
- No jargon without a short explanation. Name the file, but don't lead with it.
- If a comment is ambiguous, pick the most likely meaning, say what you assumed,
  and offer the other option.
- One comment, one small change, one commit with a clear message.

## Use tokens instead of hard-coded values

- Every color, size and timing is a CSS variable in `app/globals.css`
  (`--planet`, `--status-critical`, `--glow-strength`, `--debris-count-min`…).
  The canvas reads them too, through `game/tokens.ts`.
- Prefer changing a token over changing code. Many comments are a one-line change.
- Never hard-code a color, size or timing in a component or game file. Need a new
  value? Add a token to `globals.css`. If the canvas or game logic needs it, also
  add one line to `game/tokens.ts`. Tailwind classes can use tokens via the
  `@theme` block (`bg-ok`, `text-muted`, `border-line`).
- Token sizes are px on a 600px-wide sky (the canvas scales them). Times are
  seconds, written like `6s`.

## Where things live (one job per file)

| File | Job |
| --- | --- |
| `app/globals.css` | Design tokens |
| `app/page.tsx` | Page layout, counters, loading / empty / error states, keyboard |
| `app/layout.tsx` | HTML shell, fonts, Vercel toolbar in development |
| `components/GameCanvas.tsx` | Everything drawn in the sky, and clicks on satellites |
| `components/ScenarioPanel.tsx` | Scenario, speed and "Show orbits" controls |
| `components/BaseCard.tsx` | A launch base card, and its phone version in the bottom bar |
| `components/SatelliteList.tsx` | The satellite list with Check buttons |
| `game/store.ts` | Game state, the game loop, every action (launch, check, reset…) |
| `game/satellite.ts` | Satellite moods, names, movement along the orbit |
| `game/bases.ts` | Base states, fuel, where the bases sit |
| `game/particles.ts` | Puffs, sparkles, confetti, exhaust |
| `game/scenarios.ts` | Calm / Busy Tuesday / Solar storm / Empty sky, speeds |
| `game/tokens.ts` | Reads the tokens for the canvas and game |
| `game/world.ts` | Physics: falling satellites, impacts, debris |
| `scripts/vercel-git-check.mjs` | Setup check: does the Vercel project deploy from this fork? |
| `scripts/vercel-link-check.mjs` | Setup check: is this folder linked to a project in the Vercel team picked on the setup card? |
| `scripts/vercel-git-connect.mjs` | Setup step: connect the Vercel project to the fork in `origin` (works in every shell) |

Keep one job per file so several changes can run in parallel without touching
the same file. The app is about 1,000 lines; keep it small and readable. Don't
add dependencies without asking.

## Leave `game/world.ts` alone unless asked

It's the hand-written physics, and it breaks in ways that only show up after a
few minutes of play. Tune the feel with tokens instead (`--fall-keep-speed`,
`--fall-drag`, `--debris-bounce`, `--orbit-speed`). Only edit it when a comment
asks for a physics change (like craters), and say that you did.

## Vercel

- Each designer has their own copy: `origin` is their GitHub fork, `upstream` is
  mystico53/houston, and the Vercel project lives in their own team. Pull requests
  stay in the fork: GitHub CLI's default repo is `origin`, so `gh pr create` opens
  them there. Use `upstream` only to pull in updates. Read the team
  and project from `.vercel/project.json` (`orgId`, `projectId`); never assume
  someone else's.
- The Vercel CLI is a dev dependency: run it as `npx vercel …` (no global install).
- The Vercel MCP server is set up in `.mcp.json`. It works once the designer has
  signed in with `/mcp`. Use it to find preview links, deployments and build logs.
- Signing in with `/mcp` doesn't give access to the designer's team yet. If a Vercel
  MCP call returns 403, call `authorize_team_access` with the `orgId` from
  `.vercel/project.json`. Show the designer the link (it works once, for 10 minutes)
  and ask them to approve, then retry. Don't ask them to reconnect.
- Never deploy to production or change project settings unless asked.

## The loop

**"Fix my comments"**

1. Read the open toolbar threads for this project with the Vercel MCP
   (`list_toolbar_threads`, then `get_toolbar_thread` for the details).
2. Start a branch if you're on `main` (see Share). Make one small change per
   comment and one commit per change, and check your work (below).
3. Share.
4. Reply on each thread with what changed on screen plus the preview link, then
   resolve it. If you had to guess or couldn't do it, say so and leave it open.

**Share**

1. Always work and push from a branch, never `main`: pushing `main` deploys to
   production. On `main`? Run `git switch -c <short-name>` first.
2. Push the branch to `origin` (the designer's fork): `git push -u origin <branch>`.
3. Find the preview with `list_deployments`, filtered by branch or commit. Wait
   until it is ready, then give the designer the link. If the build failed, read
   the build log (`list_deployment_events`) and say what went wrong in plain words.
4. If the designer wants a pull request, open it with `gh pr create`.

**Get the latest**

1. `git fetch upstream`, then `git merge upstream/main`.
2. If there is a conflict, stop. Explain in plain words what clashes with what
   and ask which to keep. Never resolve it silently.

## Check your work before sharing

- `npm run dev`, then open http://localhost:3000.
- Preview the special screens with `?demo=loading` and `?demo=error`. The
  "Empty sky" scenario shows the empty state; "Solar storm" makes things happen fast.
- In development the live game state is on `window.houston` in the browser console.
- Run `npm run lint` and fix what it reports. For bigger changes, also run `npm run build`.
- Keep it smooth: 60 fps with 30 satellites and 300 particles. React must never
  re-render on every frame; the canvas reads `game` from the store directly.
