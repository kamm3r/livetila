# Livetila

Live athletics results and OBS streaming overlays powered by the public Tuloslista API.

## Features

- Search competitions and events, including qualifying and final rounds. Results appear in batches as you scroll, with a keyboard-accessible “Show more” control. Filtering searches the complete fetched list.
- View entrants, start lists, heat results, and overall results.
- Refresh results every second while an event is in progress; refresh event status every 30 seconds.
- Copy an OBS browser-source URL for the selected round and heat. Overlays refresh every 30 seconds, including in the background.
- Responsive layouts, light/dark/system themes, and haptic feedback on supported devices.

## Development

Use Node.js 22.12+ (Node.js 24 is used in CI) and pnpm 10.25.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open <http://localhost:5173>. No environment variables or API keys are required.

## Scripts

| Command             | Description                                             |
| ------------------- | ------------------------------------------------------- |
| `pnpm dev`          | Start the Vite development server                       |
| `pnpm build`        | Generate the static application in `build/`             |
| `pnpm preview`      | Preview the existing production build on port 4173      |
| `pnpm typecheck`    | Run Svelte and TypeScript diagnostics                   |
| `pnpm lint`         | Check Prettier formatting and ESLint                    |
| `pnpm check`        | Run typecheck and lint                                  |
| `pnpm format`       | Apply Prettier formatting                               |
| `pnpm format:check` | Check formatting only                                   |
| `pnpm test`         | Run Chromium browser regression tests against the build |

To run browser tests locally:

```sh
pnpm exec playwright install chromium
pnpm build
pnpm test
```

The regression tests use API fixtures so they do not depend on live competitions or network availability.

## Routes and overlays

- `/`: competition and event search.
- `/competition/[competitionId]-[eventId]`: competition viewer; `?round=Qualify` or `?round=Final` selects a round.
- `/obs/[competitionId]-[eventId]`: transparent OBS overlay.

Overlay parameters use one-based positions in the API's round and heat arrays:

```text
/obs/123-456?round=2&heat=1
```

This shows the first heat of the second round. Omit `heat` for the round's overall results; omit `round` to use the first round. The OBS button in the viewer copies the current round and heat selection.

## Deployment

The app uses SvelteKit's static adapter in client-rendered SPA mode. Run `pnpm build` and serve `build/` from a static host. Configure the host to serve `index.html` for routes that do not match a file, including `/competition/*` and `/obs/*`, so direct links and browser reloads work. Assets should be served normally.

For example, an nginx location can use `try_files $uri $uri/ /index.html;`. This fallback is required by the chosen [SvelteKit SPA deployment configuration](https://svelte.dev/docs/kit/single-page-apps).

On Vercel, the committed `vercel.json` overrides the old Next.js preset with `Other`, runs `pnpm build`, serves `build/`, and supplies the SPA fallback. Existing static assets take precedence over the fallback. No dashboard framework change is required for this branch. Use Node.js 24 in the Vercel project settings. If retrying a deployment manually, deploy the latest migration commit rather than an older Next.js-configured commit.

API requests run directly in the browser against `https://cached-public-api.tuloslista.com/live/v1`, so the upstream service must be reachable and permit cross-origin requests. There is no application server or tRPC layer.

## Stack and structure

SvelteKit 2, Svelte 5 runes, TypeScript, TanStack Svelte Query, Tailwind CSS 4, shadcn-svelte/Bits UI, Lucide Svelte, mode-watcher, and Svelte transitions. Formatting and linting use Prettier and ESLint.

```text
src/
├── lib/
│   ├── api.ts              # Public API client
│   ├── events.ts           # Event normalization
│   ├── results.ts          # Result parsing and sorting
│   └── components/         # App components and shadcn-svelte UI
├── routes/
│   ├── (app)/              # Search and competition viewer
│   └── (overlay)/obs/      # OBS overlay
└── types/comp.ts           # API types
static/                     # Static assets
tests/                     # Browser regression tests
```

## Motion and dependency maintenance

Motion uses Svelte and CSS. Pointer-operated tabs have a 180 ms selection indicator; popovers enter in 180 ms and leave in 100 ms; copy feedback takes 120 ms; button presses take 160 ms and releases take 100 ms. The home search suggestions overlay the page without shifting surrounding content, with immediate opening and dismissal; individual search results, filtering, and tab content appear immediately. Keyboard actions skip decorative transitions, and reduced-motion preferences disable CSS motion and OBS row movement. Live overlays only animate rows when their positions change.

The motion rules live in `src/app.css`. Keep controls responsive during transitions and avoid replaying entrance animations during data refreshes.

TypeScript stays on 6.0.3 because the current Svelte check and ESLint toolchain do not support TypeScript 7 as a drop-in replacement. Other direct dependencies were updated to their latest registry releases during the animation pass; the unused React-era `motion` dependency was removed.

## License

TBD
