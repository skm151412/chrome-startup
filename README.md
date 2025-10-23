# SK Dark Dashboard Enhancements

This is a visually refreshed version of your single‑page dark dashboard that preserves all existing features, markup, IDs, classes, and fonts (Pacifico + Noto Sans) while improving visuals, accessibility, and micro‑interactions.

## What’s included
- Animated gradient background (GPU‑friendly, background-size 400% 400%).
- Neon glow welcome text with gentle flicker (Pacifico font preserved).
- Glassmorphism for main cards (search, shortcuts, profile): backdrop‑filter blur, subtle borders and shadows.
- Micro‑interactions: hover lift, glow shadows, smooth transitions, keyboard focus styles.
- Profile card float + glowing ring on hover.
- Search input with expandable focus and a suggestions dropdown (static suggestions, keyboard navigation with ARIA).
- Day/Night theme toggle (sun/moon). Preference persisted in localStorage.
- Particles/orbs canvas background (desktop only). On‑screen toggle to disable.
- Live clock and time‑based greeting in the existing welcome element (no DOM replacements).
- Prefers‑reduced‑motion respected; responsive across breakpoints.

## Files
- `index.html`: minimal, non‑breaking additions (theme/particles toggles, suggestions panel, orbs canvas, script tags).
- `style.css`: appended `Enhancements` section with CSS variables, gradient, glassmorphism, interactions, accessibility styles.
- `scripts/ux.js`: theme toggle, greeting + live clock, search suggestions UI + keyboard support, particles init, and performance guards.

## How to preview
- Simply open `index.html` in your browser.
- For live reload, you can use a local server (optional). On Windows PowerShell:

```pwsh
# optional if you have Python installed
python -m http.server 8000
# then open http://localhost:8000/index.html
```

## Notes
- Fonts are unchanged: Pacifico (for the welcome text) and Noto Sans everywhere else.
- Particles initialize only on screens wider than 700px and can be toggled off to save resources.
- All features from the original page remain functional (search, links, social buttons, atom animation, editable text).
