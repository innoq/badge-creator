# Conference Badge Creator

A small, static, no-build-step web app for designing a two-sided conference
name badge (front/back, multiple languages) and printing it either as a
single DIN A4 sheet (fold in half to get a DIN A6 badge) or as two separate
DIN A6 pages.

Open `index.html` in a browser. All content (name, colors, logo, languages,
topics, icons) is edited live in the sidebar and stored in the browser's
`localStorage`; use the export/import buttons to save or share a
configuration as a JSON file. `config.js` only supplies the initial
defaults (and what "Reset to defaults" restores).

## Where the icons come from

All topic/greeting icons are [Fluent Emoji](https://github.com/microsoft/fluentui-emoji)
by Microsoft, © Microsoft Corporation, licensed under the
[MIT License](https://github.com/microsoft/fluentui-emoji/blob/main/LICENSE).

- The actual image files are bundled locally under `icons/fluent/` (one flat
  folder per style: `color/`, `flat/`, `high_contrast/`) so the app works
  fully offline and doesn't depend on a CDN at runtime. These files are
  tracked with [Git LFS](https://git-lfs.com/) — you need `git-lfs` installed
  to pull down the actual SVG content instead of pointer files.
- `fluent-emoji-index.js` is a generated search index (name, keywords,
  category per icon) extracted from the same source repository. It powers
  the searchable icon picker in the sidebar form.
- `emoji-search.js` adds a small hand-written German synonym dictionary on
  top of Fluent's (English-only) keywords, so common German search terms
  (e.g. "Rakete", "Idee", "Sicherheit") also find the right icon. It's not an
  exhaustive German translation of all ~1,285 icons — English search terms
  always work as a fallback.
- Fluent Emoji does not include country flag emoji, so the DE/EN flags shown
  on every badge are separate, custom SVGs (`icons/flag-de.svg`,
  `icons/flag-en.svg`), not from Fluent.

## Where the logo comes from

The INNOQ wordmark is loaded from the [INNOQ style guide](https://innoq.style/docs/basics/logos.html)
and bundled locally under `icons/logos/`. Only the two color variants that
work on a white badge background are offered in the logo picker.

## Regenerating the icon set

The contents of `icons/fluent/` and `fluent-emoji-index.js` were generated
once from a specific commit of
[microsoft/fluentui-emoji](https://github.com/microsoft/fluentui-emoji) by
downloading each non-skin-toned emoji's `metadata.json` (for name/keywords/
category) and its `Color`/`Flat`/`High Contrast` SVGs. There's no build
script checked into this repo for that step; regenerating it means repeating
that extraction against a newer commit of the source repository.
