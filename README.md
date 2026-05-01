# QR Coder

Free desktop and web application for fast and simple QR code generation.

Lets the user generate codes from a manually entered URL/path, or in bulk from a CSV file. Results can be downloaded individually as PNG (300 dpi) or in bulk as a ZIP archive.

## Features

- **Manual generation**: type a URL, IP or intranet path and preview the QR code in real time.
- **Bulk import via CSV**: drag or select a CSV with `Link` and `Caption` columns to generate several QR codes at once.
- **Optional caption**: text rendered below the QR (with automatic line wrapping and font sizing).
- **Preview carousel**: navigate through the generated QR codes.
- **Download**: individual PNG (300 dpi) or ZIP archive containing every item in the list.
- **Internationalization**: UI in **English** and **Portuguese (pt-BR)**, with a language switcher in the header (flag + name). The initial language is detected from the browser/OS and the choice is persisted in `localStorage`.

## Stack

- [Vue 3](https://vuejs.org/) + TypeScript (`<script setup>`)
- [Vite 6](https://vite.dev/) (dev server and build)
- [Tauri 2](https://tauri.app/) (desktop packaging)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [vue-i18n 10](https://vue-i18n.intlify.dev/) (i18n)
- [PapaParse](https://www.papaparse.com/) (CSV parser) and [qrcode](https://github.com/soldair/node-qrcode) (generation)
- [Vitest 4](https://vitest.dev/) + [@vue/test-utils](https://test-utils.vuejs.org/) (tests)

## Prerequisites

- [Bun](https://bun.sh/) (package manager / runtime)
- [Rust](https://rustup.rs/) and the Tauri system dependencies ([guide](https://tauri.app/start/prerequisites/)) — required **only** to produce the desktop binary (`bun run tauri ...`)

## Installation

```bash
bun install
```

## Running

### Dev server (frontend only, in the browser)

```bash
bun run dev
```

Starts Vite at `http://localhost:1420`. Useful for iterating on the UI without the Tauri toolchain.

### Desktop application (Tauri)

```bash
bun run tauri dev
```

Starts Vite and opens the native Tauri window loading the frontend. Hot reload is preserved across both processes.

## Linting

The project uses **ESLint** with **Prettier** rules to maintain code quality.

```bash
bun run lint
```

## Tests

The suite uses **Vitest** with the `jsdom` environment and a mount helper that wires up the `vue-i18n` plugin (`src/test/mountWithI18n.ts`).

```bash
# Run the suite once
bun run test

# Watch mode
bun run test:watch

# Vitest visual UI
bun run test:ui

# Coverage report
bun run test:coverage
```

Tests live alongside the components/utilities (`*.test.ts`).

## Build

### Web frontend (output in `dist/`)

```bash
bun run build
```

Runs `vue-tsc --noEmit` (type-check) followed by `vite build`. Can be used to serve the app as an SPA, or consumed by Tauri in the next step.

### Web build preview

```bash
bun run preview
```

Starts a local server serving `dist/`.

### Desktop binary

```bash
bun run tauri build
```

Produces the installer matching the host OS (by default, `.deb` on Linux — see `src-tauri/tauri.conf.json` to customize `bundle.targets`). The frontend build runs automatically beforehand via Tauri.

## Folder structure

```
src/
├── App.vue                # page composition, top-level UI state
├── main.ts                # bootstrap (Vue + i18n)
├── components/            # AppHeader, Controls, Preview, Carousel, LoadingOverlay,
│                          # LanguageSwitcher, icons/Flag*
├── composables/useLocale.ts
├── i18n/
│   ├── index.ts           # vue-i18n instance + locale detection/persistence
│   └── locales/{en,pt-BR}.json
├── types/                 # shared types (QrItem, Csv*)
├── utils/                 # csv, qr, links, files, download
└── test/mountWithI18n.ts  # test helper
src-tauri/                 # Rust crate + Tauri config
```

## CSV format

The header is normalized (accents/case removed), so the variants below are equivalent:

```csv
Link,Caption
https://example.com,Corporate site
192.168.0.10,Internal server
\\fileserver\share,Team folder
```

Rows without a valid `Link` (URL, IP or path) are ignored and counted in the import summary.

## Internationalization

- Supported languages: `en` and `pt-BR`.
- Initial detection: `localStorage["qrcoder.locale"]` → `navigator.language` (prefix `pt` → `pt-BR`, otherwise `en`) → fallback `en`.
- To add a new language:
  1. Create `src/i18n/locales/<code>.json` mirroring the existing keys.
  2. Register the code in `SUPPORTED_LOCALES` (`src/i18n/index.ts`) and in `localeOptions` (`src/composables/useLocale.ts`) with the matching flag component.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the workflow, branch and commit conventions, code style, and PR checklist.

## License

Released under the [MIT License](./LICENSE).
