# Development

This repo contains a small Vite playground (`npm run dev`) plus a library build (`vite build`) that publishes the compiled `dist/` output (ESM + CJS) and generated TypeScript types.

## Prerequisites

This package uses React + MUI. Since MUI/emotion are `peerDependencies`, you must install them in the dev environment too:

```bash
npm install
npm install react react-dom @mui/material @emotion/react @emotion/styled
```

## Run playground

```bash
npm run dev
```

## Build for publishing

```bash
npm run build
```

The `dist/` folder will be created. Publishing will also run the build automatically via `prepublishOnly`.

## Typecheck

```bash
npm run typecheck
```

## Publish

After updating the version:

```bash
npm publish
```

Check:

- the `dist/` output exists
- the generated `dist/index.d.ts` looks correct

