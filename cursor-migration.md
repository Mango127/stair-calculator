# Stair calculator — codebase overview & local setup

## What this app does

**Stairs** is an interactive tool for **straight-flight** stair geometry. It lists valid configurations and exposes a **Studio** tab for editing. Core math is in `src/lib/stairCalculations.ts`.

## Layout (main files)

| Path | Role |
|------|------|
| `src/main.tsx` | Entry, global CSS |
| `src/App.tsx` | Router, providers |
| `src/components/StairCalculator.tsx` | Configurations / Studio tabs, selection → Studio sync |
| `src/components/StairSummaryTable.tsx` | Valid grid, selection, “Valid configuration” + section/plan + 3D preview |
| `src/components/StairSectionView.tsx`, `StairTopView.tsx`, `Stair3DView.tsx` | Drawings and 3D |
| `vite.config.ts` | Dev server port **8080** |

## Lovable-specific pieces removed

- `lovable-tagger` (Vite plugin)
- `lovable-agent-playwright-config` — replaced with standard `@playwright/test` in `playwright.config.ts`
- Lovable branding in `index.html`

## Local development

```bash
npm install
npm run dev
```

Open **http://127.0.0.1:8080**

```bash
npm run build
npm test
npx playwright install chromium   # first time for e2e
npm run test:e2e
```

## Tech stack

Vite 5, React 18, TypeScript, Tailwind, Radix/shadcn UI, Three.js + React Three Fiber, Vitest, Playwright.
