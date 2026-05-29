# Tally — project context for Claude

## Stack
Full-stack TypeScript monorepo. Client: React + Vite + Tailwind v4 + shadcn/ui. Server: Express + SQLite + Drizzle ORM.

## Components pattern

All components follow this exact file structure and naming convention. The button component is the canonical reference: [web/src/components/1-atoms/button.tsx](web/src/components/1-atoms/button.tsx).

### File structure (top to bottom)

1. **Imports** — Ordered: React imports first, Radix UI imports second, `cva`/`VariantProps` third, `cn` from utils, then any other requirements.
2. **`NAME_VARIANTS_CONFIG`** — the `cva()` definition. Base classes in first arg. Variant dimensions ordered: `variant`, `color`, `size`, then any others. If compound variants exist, group them with `// ── name ──` comment dividers.
3. **Exported types and value arrays** — `NAME_VARIANTS_PROPS` (raw `VariantProps`), then one `type` and one `const` array per variant dimension.
4. **`NameProps`** — Extends the native element's `ComponentProps`, intersected with `NAME_VARIANTS_PROPS`, then any extra one-off props.
5. **Component function** — Named arrow function export. Destructure variant props and `className`; assign `Component` (for polymorphic) and `classes` as explicit variables before the return so the JSX stays clean.

### Naming

All variant definitions and their exported types/arrays use ALL_CAPS_WITH_UNDERSCORES prefixed with the component name.

| Thing | Name |
|---|---|
| cva config | `NAME_VARIANTS_CONFIG` |
| Raw VariantProps | `NAME_VARIANTS_PROPS` |
| Per-dimension type | `NAME_VARIANT`, `NAME_COLOR`, `NAME_SIZE` |
| Per-dimension array | `NAME_VARIANTS`, `NAME_COLORS`, `NAME_SIZES` |
| Props type | `NameProps` (PascalCase) |
| Component | `Name` (PascalCase arrow function) |

### Component rules

- `data-slot='{component-name}'` always present on the root element (kebab-case).
- `data-variant`, `data-color`, `data-size` set for every dimension that exists.
- Polymorphism via `polymorphic?: boolean` prop → resolve to `const Component = polymorphic ? Slot.Root : 'element'` before the return.
- Classes via `const classes = cn(NAME_VARIANTS_CONFIG({ variant, color, size }), className)` before the return — never inline in JSX.
- Color tokens: use `text-ink-*` / `bg-paper-*` design tokens — never `text-foreground` / `text-muted-foreground`.