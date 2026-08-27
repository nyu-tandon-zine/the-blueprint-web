# Custom page starter

This folder is a **copy-me template** for building a custom page for one work.

## Quick start

1. Find your work's ID — open your work on the site; the URL is `/works/<id>`. Copy the `<id>`.
2. Copy this whole folder to `public/custom/<id>/` (rename `custom-page-starter` to your work's ID).
3. Open `public/custom/<id>/index.html` and design inside the `YOUR PAGE` / `YOUR STYLES` / `YOUR SCRIPT` sections.
4. Run the site (`npm run dev`) and preview your page in the real shell at `/custom-preview/<id>`.
5. When it's ready: add your ID to `src/custom-pages/registry.ts`, then open a pull request.

## The rules (short version)

- **One self-contained `index.html`.** Inline your CSS and JS — separate `.css`/`.js` files won't load.
- **Assets:** images/audio go in your folder, as `data:` URIs, or Supabase Storage URLs.
- **Libraries:** only from unpkg, jsDelivr, or cdnjs — and pin the version.
- **No network calls.** Your page can't fetch/XHR anywhere; design it self-contained.

The full guide, the content contract, and the review checklist are in [`docs/custom-pages.md`](../docs/custom-pages.md).
