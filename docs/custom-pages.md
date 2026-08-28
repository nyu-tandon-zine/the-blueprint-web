# Building a custom work page

Every work on The Blueprint has a **default page** generated from its content. On top of that, a work can have a **custom page** - a page you design yourself, with your own HTML, CSS, and light interactivity. Readers can toggle between the two.

This guide is everything you need to build one. No prior work on the site's codebase is required.

---

## How it works

- Your custom page is a single self-contained folder: `public/custom/<work-id>/index.html`.
- It's displayed inside a sandboxed frame, so your code is completely isolated - you can't accidentally break the rest of the site, and nothing you write can affect other works. So be creative!
- The site hands your page the work's content (title, author, text, images) so you don't have to hard-code it.
- Your page tells the site how tall it is, so it fits with no inner scrollbar.
- Every work keeps its default page. If your custom page isn't finished, the work still ships - it just shows the default.

---

## Step by step

### 1. Open a branch

Never work on `main`. Each custom page gets its own branch, so people can work at the same time and each page is reviewed on its own. From an up-to-date `main`:

```
git checkout main
git pull
git checkout -b custom/<work-name>
```

Name it `custom/<work-name>` (e.g. `custom/the-nature-of-simulations`, or a shorter `custom/simulations`).

### 2. Find your work's ID

Open your work on the site. The URL looks like `/works/3f9c1a2b-....` — that last part is the **work ID**. Copy it.

### 3. Copy the starter

Copy the `custom-page-starter/` folder (in the repo root) to `public/custom/<work-id>/`. So if your ID is `3f9c1a2b-...`, you'll have:

```
public/custom/3f9c1a2b-.../index.html
```

### 4. Design your page

Open your `index.html` and edit the sections marked `YOUR STYLES`, `YOUR PAGE`, and `YOUR SCRIPT`. Everything between them is yours. The only part to leave alone is the **boilerplate** block at the bottom (it handles talking to the site).

### 5. Preview it in the real site

Run the site locally (`npm run dev`) and open:

```
http://localhost:3000/custom-preview/<work-id>
```

This shows your page exactly how a reader will see it. You do not need to register your page to preview it.

### 6. Submit it

When you're happy:

1. Add your work ID to `src/custom-pages/registry.ts`:
   ```ts
   export const CUSTOM_PAGES: Record<string, CustomPageConfig> = {
     '3f9c1a2b-...': { defaultView: 'custom' },
   }
   ```
2. Commit and push your branch:
   ```
   git add public/custom/<work-id>/ src/custom-pages/registry.ts
   git commit -m "Custom page: <work title>"
   git push -u origin custom/<work-slug>
   ```
3. Open a pull request on GitHub (see the checklist at the bottom). A web lead reviews it and merges.

---

## The content contract

When the page loads, the site sends your work's content. Define a callback function called `onWorkData` and it will be called with this object:

```js
window.onWorkData = function (work) {
  // work = {
  //   id:          string
  //   title:       string
  //   genre:       string | null
  //   mediaType:   'prose' | 'poetry' | 'visual-art' | 'audio' | 'film' | 'game'
  //   description: string | null
  //   content:     string | null            // full text; paragraphs split on blank lines
  //   author:      { name: string | null }
  //   images:      string[]                  // image URLs, in order
  //   audio:       { title: string, url: string }[]
  // }
}
```

Use as much or as little as you like. When you insert text, use `element.textContent = ...` (not `innerHTML`) so odd characters in a title or poem can't break your layout.

---

## The rules

1. **One self-contained `index.html`.** Inline all your CSS (in a `<style>` tag) and all your JavaScript (in `<script>` tags). Separate `.css` or `.js` files in your folder **will not load**.
2. **Assets — images, audio, fonts:** allowed from three places — a file in your own folder, a `data:` URI embedded in the HTML, or a Supabase Storage URL. (Ask a lead if you need something uploaded to storage.)
3. **Libraries:** only from these approved CDNs — **unpkg**, **jsDelivr**, or **cdnjs** — and always pin an exact version. Example:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/p5@1.9.4/lib/p5.min.js"></script>
   ```
   Approved for creative work: **p5.js, three.js, GSAP, anime.js**. Want another? Ask a lead to add its CDN host to the policy in `next.config.ts`.
4. **No network calls.** Your page cannot `fetch`, use `XMLHttpRequest`, or open a WebSocket. Everything your page needs must be inside it. (This is what keeps contributor pages safe.)

### What you can use

- **Tier 1 — HTML, CSS, vanilla JavaScript.** Covers most custom layouts, animations, and interactions. No tooling.
- **Tier 2 — the approved creative-coding libraries** above, via a pinned CDN script tag.
- **Tier 3 — a full framework (React, etc.):** allowed only as an exception. Build it as a separate project, run its build, and commit the compiled static output into your folder. Talk to a lead first.

---

## Good practices

- **Keep mobile in mind.** Readers are often on phones; test narrow widths.
- **Keep it reasonably light.** Big images should be compressed or in Supabase storage, not multi-megabyte files in the repo.
- **Degrade gracefully.** If you use a fancy effect, make sure the content is still readable without it.
- **Don't rely on fixed heights.** The frame auto-sizes to your content; just let the page flow.
- **The site provides the chrome.** The back link, logo, and view toggle come from the shell — you don't need to add navigation.

---

## Submission checklist

Copy this into your pull request description and tick each box:

```
- [ ] Work is on its own branch named custom/<work-slug> (not main)
- [ ] Folder is at public/custom/<work-id>/ with a single index.html
- [ ] All CSS and JS are inlined (no separate .css/.js files)
- [ ] Boilerplate block left unchanged
- [ ] Any libraries load from unpkg / jsDelivr / cdnjs with a pinned version
- [ ] Looks right on mobile (tested at ~375px wide)
- [ ] No console errors in the preview
- [ ] Work ID added to src/custom-pages/registry.ts
```

Reviewers will also confirm the page stays inside the sandbox before merging.
