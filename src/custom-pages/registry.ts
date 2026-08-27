// ----------------------------------------------------------------
// Custom-page registry
//
// This is the single source of truth for which works have a custom
// page. A custom page is a self-contained folder at:
//
//     public/custom/<workId>/index.html
//
// To turn your custom page on, add one entry below with the work's ID.
// (You can find a work's ID in the admin dashboard — it's the last part
// of the /works/<id> URL when you open the work.)
//
//   'a1b2c3d4-...': {},                    // default view stays default;
//                                          // readers can toggle to custom
//   'a1b2c3d4-...': { defaultView: 'custom' }, // custom shows first
//
// Removing an entry (or never adding one) means the work just shows its
// normal default view — nothing breaks. While you're still building, you
// don't need to be in this registry at all: preview your page at
// /custom-preview/<workId> instead.
// ----------------------------------------------------------------

export type CustomPageConfig = {
  /** Which view a reader sees first. Defaults to 'default'. */
  defaultView?: 'default' | 'custom'
}

export const CUSTOM_PAGES: Record<string, CustomPageConfig> = {
  // Add your work IDs here. Example (not a real work — the reference
  // page lives at /custom/_example/ and is intentionally NOT registered):
  // '00000000-0000-0000-0000-000000000000': { defaultView: 'custom' },
}

/** True if this work has a registered, live custom page. */
export function hasCustomPage(workId: string): boolean {
  return Object.prototype.hasOwnProperty.call(CUSTOM_PAGES, workId)
}

/** Which view to show first for a work (falls back to 'default'). */
export function customPageDefaultView(workId: string): 'default' | 'custom' {
  return CUSTOM_PAGES[workId]?.defaultView ?? 'default'
}

/** Public path to a work's custom page folder. */
export function customPagePath(workId: string): string {
  return `/custom/${workId}/index.html`
}
