# Takura design tokens

The public application imports `src/_tokens.scss` once from its global stylesheet. The file exposes
CSS custom properties so SSR output, hydrated Angular views and future shared components use the
same values without a runtime dependency.

## Token groups

- `--color-*`: warm mineral surfaces, charcoal text and restrained timber accents.
- `--font-*`: local system font stacks. No third-party font request, consent dependency or layout
  shift is introduced.
- `--text-*`: fluid but bounded type sizes.
- `--space-*`: a four-pixel-based spacing scale.
- `--content-*`: wide and readable content measures.
- `--shadow-*`, `--radius-*`, `--transition-*`: restrained interaction and elevation primitives.

Use semantic tokens instead of raw values in application styles. New public components should use
the existing `.page`, `.eyebrow`, `.lead`, `.cards`, `.card`, `.action`, `.filters` and form-control
primitives before adding component-specific rules. Maintain the visible focus treatment and honour
the reduced-motion and forced-colours fallbacks.
