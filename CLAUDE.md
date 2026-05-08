# Tally — project context for Claude

## Stack
Full-stack TypeScript monorepo. Client: React + Vite + Tailwind v4 + shadcn/ui. Server: Express + SQLite + Drizzle ORM.

## Design system (DS)

### Two token registries — never mixed
| Registry | Prefix | Owned by | Location |
|---|---|---|---|
| shadcn | `--background`, `--primary`, … | shadcn CLI | `client/src/index.css` `:root`/`.dark` shadcn block |
| Tally DS | `--ds-*` | us | `client/src/index.css` DS block + `@theme inline` |

**Never assign a `--ds-*` var as the value of a shadcn token, and never edit the shadcn block directly.**

### DS token groups
- **Surfaces** — `--ds-background`, `--ds-surface-elevated`, `--ds-surface-sunken`
- **Rank medals** — `--ds-rank-gold/silver/bronze`
- **Player status** — `--ds-status-own/friend/rented`
- **Feedback** — `--ds-success/warning/info/destructive`
- **Base aliases** — `--ds-primary`, `--ds-secondary`, `--ds-foreground`, `--ds-muted`, `--ds-muted-foreground`, `--ds-border`, `--ds-ring` (start as aliases of shadcn equivalents, free to diverge)

All DS tokens are registered in `@theme inline` as `--color-ds-*`, generating Tailwind utilities (`bg-ds-surface-elevated`, `text-ds-rank-gold`, etc.).

### Typography utilities (defined in `@layer components`)
| Class | Font | Use |
|---|---|---|
| `.eyebrow` | JetBrains Mono, xs, 600, uppercase, 0.12em tracking | Table headers, section labels |
| `.num` | JetBrains Mono, tabular-nums, 700 | Scores, ranks, counts |
| `.hand` | Kalam, xl, 700, −2° rotation | Accent text, sparingly |

### Component folders
- `client/src/shadcn/` — vendor, untouched. Drinks from shadcn tokens (`--primary`, `--border`, …).
- `client/src/components/` — ours. Drinks exclusively from `--ds-*` tokens.

Promoted components import from `../lib/utils`, not `@/shadcn/lib/utils`.

### Promoted components (so far)
- `components/badge.tsx` — two-axis CVA: `variant` (default/outline/ghost) × `color` (medal/status/feedback/primary)
- `components/checkbox.tsx`
- `components/sonner.tsx` — Toaster wrapper; maps sonner's `--normal-*` vars to `--ds-surface-elevated`, `--ds-foreground`, `--ds-border`

## Slash commands
- `/promote` — step-by-step checklist for graduating a shadcn component into `components/`
