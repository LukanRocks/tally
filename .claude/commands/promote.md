Promote a shadcn component into `client/src/components/` following the Tally DS rules.

If the user named the component, use that. Otherwise ask which component to promote before starting.

## Steps

1. **Read** the source file from `client/src/shadcn/components/ui/<name>.tsx`.

2. **Check for existing usages** — grep `client/src` for imports of the shadcn path. Note any files that will need their import updated.

3. **Swap every token** in the class strings:
   - `bg-primary` → `bg-ds-primary`
   - `text-primary` → `text-ds-primary`
   - `text-primary-foreground` → `text-ds-primary-foreground`
   - `bg-secondary` → `bg-ds-secondary`
   - `text-secondary-foreground` → `text-ds-secondary-foreground`
   - `bg-muted` → `bg-ds-muted`
   - `text-muted-foreground` → `text-ds-muted-foreground`
   - `bg-input` → `bg-ds-border` (input is the same value as border)
   - `border-border` → `border-ds-border`
   - `border-ring` / `ring-ring` → `border-ds-ring` / `ring-ds-ring`
   - `border-destructive` / `ring-destructive` / `text-destructive` → `*-ds-destructive`
   - `bg-destructive` → `bg-ds-destructive`
   - `text-foreground` → `text-ds-foreground`
   - `bg-background` → `bg-ds-background`
   - `bg-accent` → `bg-ds-muted` (accent is the hover surface, maps to muted)
   - `text-accent-foreground` → `text-ds-muted-foreground`
   - Any other `*-<shadcn-token>` → check if a `--ds-*` alias exists; if not, add it first.

4. **Fix the import** — change `@/shadcn/lib/utils` → `../lib/utils`. Remove any `* as React` imports not used; use named imports instead.

5. **Write** the promoted file to `client/src/components/<name>.tsx`.

6. **Update usages** — for every file found in step 2, update its import to `../components/<name>` (adjust relative path as needed).

7. **Add a section** to `client/src/pages/DesignSystem.tsx` showing the component in its key states (default, disabled, any variants).

8. **Update CLAUDE.md** — add the component to the "Promoted components" list.

## Rules
- Never edit the original file in `shadcn/`.
- Never add `dark:` prefixed classes that duplicate the non-dark version — only keep them if the dark value differs.
- If the component needs a new `--ds-*` token that doesn't exist yet, add it to both `:root` and `.dark` DS blocks in `index.css` AND register it in `@theme inline` before writing the component.
