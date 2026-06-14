# No Zero

No Zero is a private, local-first semester challenge tracker. Phase 1 provides
daily activity CRUD, no-zero streaks, weekly points and project targets,
project configuration, generic artifacts, weekly reviews, monthly missions,
calendar history, full JSON backup, and an installable offline PWA.

## Requirements

- Bun 1.3 or newer
- A modern browser with IndexedDB and service-worker support
- Playwright Chromium for browser tests

## Development

```bash
bun install
bun run dev
```

Useful checks:

```bash
bun run lint
bun run typecheck
bun run test
bun run build
bun run test:e2e
```

Install the Playwright browser once when needed:

```bash
bunx playwright install chromium
```

## Architecture

- `src/domain`: durable entity contracts, validation, dates, and selectors
- `src/db`: Dexie schema, initialization, repositories, and transactions
- `src/features`: workflow-owned UI and application services
- `src/app`: bootstrap, routing, providers, and responsive shell
- `src/pwa`: offline state, worker updates, and dirty-form protection
- `src/seed`: versioned canonical project tracks

UI components do not access Dexie directly. Feature query hooks use repository
interfaces and Dexie live queries. Streaks, scores, and targets are derived from
stored activities rather than persisted as authoritative records.

## Local Data

IndexedDB database `no-zero` is the source of truth. Records do not leave the
browser unless the user downloads a JSON backup from Settings. Clearing browser
site data removes the local dataset, so regular backup exports are recommended.

## Production

```bash
bun run build
bun run preview
```

The generated `dist/` directory is a static PWA bundle. Set `BASE_PATH` when
building for a host subdirectory:

```bash
BASE_PATH=/no-zero/ bun run build
```

The host must serve `index.html` as the fallback for application routes.
