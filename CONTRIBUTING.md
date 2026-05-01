# Contributing

Thanks for your interest in improving QR Coder. This document covers the workflow and expectations for changes.

## Getting started

1. Fork the repository and clone your fork.
2. Install dependencies with `bun install` (see [README.md](./README.md#prerequisites) for prerequisites).
3. Run the dev server with `bun run dev`, lint the code with `bun run lint`, and run the test suite with `bun run test`.

## Branching

- `main` is the deployable branch. Pushes to it trigger a production deploy to `qrcoder.nighttware.com`.
- Create a feature branch off `main` for every change: `feat/<short-name>`, `fix/<short-name>`, `chore/<short-name>`.
- Keep branches focused — one logical change per PR.

## Commits

- Use [Conventional Commits](https://www.conventionalcommits.org/) prefixes: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- Write the subject in the imperative mood ("add carousel preview", not "added carousel preview").
- Reference the issue number when applicable: `fix: handle empty CSV rows (#42)`.

## Pull requests

1. Make sure `bun run lint`, `bun run build`, and `bun run test` pass locally.
2. Open the PR against `main`.
3. CI runs automatically on every push to the PR (lint, type-check, build, tests). The PR cannot be merged with a red pipeline.
4. Fill the PR description with **what** changed and **why**. Add screenshots/GIFs for UI-visible changes.
5. Squash and merge once approved — the squash message should follow the same Conventional Commits format.

## Code style

- TypeScript strict mode is on. New code must be fully typed; avoid `any`.
- Vue components use `<script setup>` and the Composition API.
- Styling is Tailwind utility classes — avoid scoped CSS unless strictly necessary.
- Keep components small. Extract logic into `src/composables/` and pure helpers into `src/utils/`.
- File and component names follow the existing convention (PascalCase for components, camelCase for utils).

## Tests

- Add tests for new behavior in components (`*.test.ts`) and utilities.
- Use the `mountWithI18n` helper (`src/test/mountWithI18n.ts`) to mount components that depend on i18n.
- Prefer testing user-visible behavior over internal implementation details.

## Internationalization

Any user-facing string must go through `vue-i18n`. Add the key to **both** `src/i18n/locales/en.json` and `src/i18n/locales/pt-BR.json` — never let one locale fall back silently.

## Reporting bugs

Open an issue with:

- Steps to reproduce.
- Expected vs. actual behavior.
- Browser/OS (and Tauri version, if running the desktop build).
- A minimal CSV sample if the bug involves bulk import.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
