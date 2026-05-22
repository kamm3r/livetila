# Livetila

Live result overlay for live.tuloslista API streams.

---

## Features

- Real-time competition results display
- Clean overlay interface for streaming
- Built with Next.js and modern React
- Type-safe API with tRPC
- Styled with Tailwind CSS

---

## Getting started

### Prerequisites

- Node.js (v18 or later)
- pnpm package manager

### Installation

Clone the repository and install dependencies

```bash
git clone <repository-url>
cd livetila
pnpm install
```

Create a `.env` file from the example

```bash
cp .env.example .env
```

---

## Development

Start the development server with hot reload

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## Build

Create an optimized production build

```bash
pnpm build
```

Preview the production build locally

```bash
pnpm preview
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with turbo mode |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm preview` | Build and start production server locally |
| `pnpm check` | Run Biome linter |
| `pnpm check:write` | Run Biome linter with auto-fix |
| `pnpm typecheck` | Run TypeScript type checking |

---

## Tech stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui, Base UI
- **Data fetching**: tRPC with TanStack Query
- **Animations**: Motion, Auto Animate
- **Linting**: Biome
- **Icons**: Lucide React

---

## Project structure

```
.
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── (app)/        # Main application routes
│   │   ├── (overlay)/    # Overlay-specific routes
│   │   └── api/          # API routes
│   ├── @/                # Component aliases
│   ├── server/           # Server-side utilities
│   ├── trpc/             # tRPC configuration
│   ├── types/            # TypeScript types
│   └── styles/           # Global styles
├── public/               # Static assets
└── ...config files
```

---

## License

TBD
