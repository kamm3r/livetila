# Livetila

Live athletics results and streaming overlays (e.g. for OBS Studio) powered by the public Tuloslista API.

## Features

- Search competitions and events, including qualifying and final rounds. Results appear in batches as you scroll, with a keyboard-accessible “Show more” control. Filtering searches the complete fetched list.
- View entrants, start lists, heat results, and overall results. Results show six attempt slots for horizontal jumps and throws (three for combined events); high jump and pole vault align attempts by height.
- Refresh results and event status every 30 seconds while viewing a competition, regardless of its reported status.
- Copy an overlay URL for use as a browser source in OBS or other streaming software for the selected round and heat. Overlays refresh every 30 seconds, including in the background. Attempt details collapse after 15 seconds without a result change and reopen when a new or corrected attempt arrives.
- Responsive layouts, light/dark/system themes, and haptic feedback on supported devices.
- Open SFIM points and results from the navbar beside the theme switcher.
- Three-dot indicators identify the API-selected active athlete and attempt in live results and overlays. Reduced-motion preferences keep the dots static.
- Athlete club logos from Tilastopaja and country flags for foreign athletes in entrants, start lists, results and overlays. Unavailable images are hidden.

## Development

Use Node.js 22.12+ (Node.js 24 is used in CI) and pnpm 10.25.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open <http://localhost:5173>. Follow the API key setup below to authenticate live requests.

## Scripts

| Command             | Description                                             |
| ------------------- | ------------------------------------------------------- |
| `pnpm dev`          | Start the Vite development server                       |
| `pnpm build`        | Build the application and Vercel functions              |
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

The regression tests use API fixtures so they do not depend on live competitions or network availability. They cover selection rules through their module interface, plus browser search, navigation, motion and live-refresh behavior.

## Routes and overlays

- `/`: competition and event search.
- `/competition/[competitionId]-[eventId]`: competition viewer; `?round=Qualify` or `?round=Final` selects a round.
- `/overlay/[competitionId]-[eventId]`: transparent streaming overlay.

Overlay parameters use one-based positions in the API's round and heat arrays:

```text
/overlay/123-456?round=2&heat=1
```

This shows the first heat of the second round. Omit `heat` for the round's overall results; omit `round` to use the first round. The Grafiikka button in the viewer copies the current round and heat selection.

`style` picks the overlay: `broadcast-trail-plain` (Lista, the default), `ticker` (Tikkeri), `broadcast-results` (Lopputulokset) or `timetable` (Aikataulu). Unknown values fall back to Lista. `gap=0` hides gaps and `accent=5ed6cb` changes the accent colour.

Live result fetching is independent of event status. The competition viewer polls while visible; the overlay also polls in the background. Shared query identities retain cached data across navigation, and abandoned requests are cancelled. Requests respect upstream HTTP caching; the browser can revalidate unchanged results without downloading the full payload. Upstream caching and network latency still affect freshness. See [CONTEXT.md](CONTEXT.md) for selection and refresh conventions.

## Deployment

The app runs as a client-rendered SPA with a SvelteKit server endpoint for Tuloslista requests. The Vercel adapter packages the frontend and server endpoint together. Set `TULOSLISTA_API_KEY` in the Vercel project environment before deploying.

### Tuloslista API key

Register Livetila once using your own organization and contact details. Replace the example values and use the deployed client version.

```sh
curl --url 'https://live.tuloslista.com/api/v1/auth' \
  --data-raw '{
    "client": {"name": "Livetila", "version": "0.1.0"},
    "organization": {"name": "YOUR ORGANIZATION"},
    "contact": {"name": "YOUR NAME", "email": "YOUR EMAIL"}
  }'
```

For local development, copy `.env.example` to `.env` (or update your existing `.env`) and set `TULOSLISTA_API_KEY` to the returned key. Restart Vite after updating the file. The server sends the key in the `X-Tuloslista-Live-Auth` header when it fetches live data.

With the key unset, live data works for as long as Tuloslista accepts unauthenticated requests.

Club logos load from Tilastopaja's `https://www.tilastopaja.info/fi/db/pics/png/` directory. The lookup in `src/lib/club-logos.ts` resolves club names and abbreviations against 295 verified filenames from [Tilastopaja's Seuraliiga 2026 directory](https://www.tilastopaja.fi/seurakilpailut/seuraliiga/2026/kaikki), stored in `src/lib/data/club-logos.json`. This handles differences such as `IFÅsar` → `IFÅsarna`, `KUNPIR` → `KuntoP`, and capitalization mismatches. Clubs absent from the snapshot fall back to the API's abbreviation (`Organization.NameShort`). To add a club or update its filename, edit the JSON mapping; abbreviation aliases belong in `club-logos.ts`.

Country flags load from Flagcdn using normalized nationality codes; Finnish athletes use their club logo, and mixed-nationality relay teams keep their club identity. Both image sources are external, and missing images do not prevent viewing results.

## Stack and structure

SvelteKit 2, Svelte 5 runes, TypeScript, TanStack Svelte Query, Tailwind CSS 4, shadcn-svelte/Bits UI, Lucide Svelte, mode-watcher, and Svelte transitions. Formatting and linting use Prettier and ESLint.

```text
src/
├── lib/
│   ├── api.ts              # Public API client
│   ├── competition-selection.ts # Selection rules and competition/overlay links
│   ├── competition-data.svelte.ts # Query identity, validation and polling
│   ├── search-workflow.svelte.ts  # Search state, reveal limits and history
│   ├── events.ts           # Event normalization
│   ├── results.ts          # Result parsing and sorting
│   └── components/         # App components and shadcn-svelte UI
├── routes/
│   ├── (app)/              # Search and competition viewer
│   └── (overlay)/overlay/  # Streaming overlay
└── types/comp.ts           # API types
static/                     # Static assets
tests/                     # Browser regression tests
```

## Motion and dependency maintenance

Motion uses Svelte and CSS. Pointer-operated tabs have a 180 ms selection indicator; popovers enter in 180 ms and leave in 100 ms; copy feedback takes 120 ms; button presses take 160 ms and releases take 100 ms. The home search suggestions overlay the page without shifting surrounding content, with immediate opening and dismissal; individual search results, filtering, and tab content appear immediately. Keyboard actions skip decorative transitions, and reduced-motion preferences disable CSS motion and overlay row movement. Live overlays only animate rows when their positions change.

The motion rules live in `src/app.css`. Keep controls responsive during transitions and avoid replaying entrance animations during data refreshes.

TypeScript stays on 6.0.3 because the current Svelte check and ESLint toolchain do not support TypeScript 7 as a drop-in replacement. Other direct dependencies were updated to their latest registry releases during the animation pass; the unused React-era `motion` dependency was removed.

## License

TBD
