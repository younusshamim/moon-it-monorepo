# @moonit/ui

The monorepo design system: shadcn/ui components, design tokens, and the shared
Tailwind v4 theme. Just-in-Time package — it exports **source**, no build step; the
bundled Next.js app transpiles it (see `INFRASTRUCTURE.md` §2).

## Consuming from an app

```ts
// 1. Import the theme + components once, in the app's root CSS:
//    @import "@moonit/ui/globals.css";

// 2. Re-export the shared PostCSS config (postcss.config.mjs):
export { default } from "@moonit/ui/postcss.config";
```

```tsx
// 3. Import components by subpath (no barrel — keeps bundles analyzable):
import { Button } from "@moonit/ui/components/button";
import { cn } from "@moonit/ui/lib/utils";
```

## Adding / updating components

Use the shadcn CLI from this package — it reads `components.json` and writes into
`src/components`:

```bash
pnpm --filter @moonit/ui ui:add button card input
```

## Layout

```
src/
├── styles/globals.css   # design tokens + Tailwind theme (the "preset")
├── lib/utils.ts         # cn()
├── components/          # shadcn/ui components (PascalCase export, kebab-case file)
└── hooks/               # shared hooks
```

## Conventions

- Semantic tokens only (`bg-primary`, `text-muted-foreground`) — never raw colors or `dark:` overrides.
- `className` is for layout; change appearance via variants, tokens, or CSS variables.
- Compose with `cn()`; no `space-*` (use `gap-*`), `size-*` over `w-*/h-*` when equal.
