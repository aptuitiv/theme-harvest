# Plan: Harvest block and accessibility fixes

Created: 2026-09-12

Found while comparing the Skeleton theme with Carmine and Harvest. Carmine is the reference for block templates unless an item says otherwise.

**Useful commands**

```bash
# Compare a Harvest file with Carmine (run from the Themes folder)
diff -w -B Harvest/src/<path> Carmine/src/<path>

# Show a Carmine commit referenced below
git -C Carmine show <hash>
```

## Theme-specific fixes

- [x] **`full-width.twig`** — `<main>` has no `id="main"`, so the skip link has no target on this layout. Add it. Every layout now has exactly one `#main` (404 extends `narrow`).
- [x] **`blocks/image-grid.twig`** — `{% set width = 800 %}` and the `width:` values in `count2`–`count6` overwrite the block's Width field, so the Width setting never takes effect. Remove them (Carmine commit `1745710`; Carmine's file can be copied).
- [x] **`blocks/image-row.twig`** — `href="{image.url}"` uses single braces, so the link is broken. Change to `href="{{ image.url }}"`, and drop `target="_blank"` or add a visually hidden "(opens in a new window)". Kept `target="_blank"`, added `rel="noopener"` and the visually hidden label (same as Skeleton).
- [x] **Margin/width support** — add `macros.blockMargin(margin)`/`macros.blockWidth(width, true)` to grid-2…6-columns, heading, and html-code (Carmine commits `265e272`, `81c6c37`), and to columned-content (Carmine commit `660fa93`). Confirm the CMS block definitions have Margin and Width fields.
    - Added `{% import 'macros/macros' as macros %}` to the grid files and columned-content (Carmine's files are missing it).
    - The block definitions aren't in this repo, so the Margin and Width fields still need confirming in the CMS.
    - columned-content still has `{% set width = countN.width %}`, the same problem image-grid had: it overwrites the Width field for 2–6 columns. Carmine and Skeleton have it too, so it's left as-is for now. Needs a decision.
- [x] **`blocks/google-ratings-bar.twig`** — each star is its own labelled image, so screen readers repeat "Star rating". The visible text already states the rating, so wrap the stars and number in `aria-hidden="true"` and use `iconAriaHidden` instead of `iconImg` (see Skeleton's `blocks/google-ratings-bar.twig`).
- [x] **Reviews link setting** — there are two "URL to view reviews" fields. Use the Settings one and remove the Styles one (Skeleton has this change):
    - [x] `blocks/google-ratings-bar.twig` — change `_core.theme.settings.googleRatingsBarReviewsLink` to `_core.theme.settings.customerRatingsBarReviewsLink` (3 places)
    - [x] `config/theme-styles.json` — in the "Blocks - Google Ratings Bar" group, remove the `googleRatingsBarReviewsLink` field and its "Review link" subgroup (the first one, which holds only that field). Keep the second "Review link" subgroup (the link typography).
    - Existing sites that set the link under Styles will need it re-entered under Settings → Customer Reviews & Ratings.
- [x] **`js/sticky-header.js`** — `hide()` moves the header offscreen even when keyboard focus is inside it (WCAG 2.4.11). Skip hiding when `header.contains(document.activeElement)`. Also added a `focusin` listener on the header that calls `show()`.
- [x] **Main `<nav>`** — has no `aria-label`. Add `aria-label="Main"`.
- [x] **Menu button** — visible "Menu" text differs from `aria-label="Navigation menu"`. Make the accessible name include the visible text. Removed the `aria-label`, so the visible "Menu" text is the name.

## Accessibility fixes shared by all themes

Carmine isn't a good reference for these — each needs a new fix.

- [x] **Accordion isn't keyboard-operable** — the heading is `<div class="Accordion-heading js-accordionHeading">` with only a click listener. Use a `<button>` with `aria-expanded` and `aria-controls` (`blocks/accordion.twig`, `js/accordion.js`). *High* Also `width: 100%` on the heading and `visibility: hidden` on closed content (`css/components/accordion/accordion.css`).
- [x] **Mobile submenus hidden from screen readers** — submenu `<ul>` elements render with `aria-hidden="true"` and `aria-expanded="false"` (`navigation/main.twig`). The small-screen tap handler only toggles classes (`js/navigation/small-screen.js`), so an opened submenu stays hidden. Move `aria-expanded` to the toggle. *High*
- [x] **Mobile menu** — no Escape to close, no focus trap, no focus return (`js/navigation/small-screen.js`). Escape closes the menu and returns focus to the menu button. No focus trap: it isn't needed for the current disclosure-style menu (same as Skeleton).
    - [ ] Rewriting the menu from `role="menubar"`/`menuitem` to a disclosure pattern — Skipped — same as Skeleton.
- [x] **Modals** — the close button `<button class="Modal-close" data-micromodal-close></button>` has no accessible name; the dialog has no `aria-labelledby`; the popup uses `disableFocus: true` so focus doesn't move into it; the notification icon has no `aria-hidden` (`widgets/collections/popups.twig`, `notifications.twig`). Also removed `disableFocus` from `MicroModal.init()` in `js/main.js`.
- [x] **Pagination** — wrap in `<nav aria-label="Pagination">`, add `aria-current="page"` to the current page, and change the chevron icons from `role="img"` to `aria-hidden="true"` (`snippets/pagination.twig`).
- [x] **`iconImg` macro** outputs `<svg role="img" alt="…">` — `alt` isn't valid on `<svg>`. Use `aria-label` or a `<title>` (`macros/macros.twig`). Removed `alt`; the `<title>` + `aria-labelledby` already name it.
- [x] **`rel="noopenner"` typo** — should be `noopener`. Fixed on the header top bar and footer social links; added `rel="noopener"` to the footer credit link.
- [x] **`title` as the only label** on social and logo links; social links open in a new window with no warning. The header and footer social links and the footer credit link have a visually hidden "(opens in a new window)". Logo links get their name from the logo's alt text (already defaults to the company name).
- [x] **Form errors** — `formErrorContainer` has no `role="alert"`/`aria-live`; `form.js` never sets `aria-invalid` or `aria-describedby` (`macros/form-macros.twig`, `js/form.js`).
- [x] **Required marker** — add `aria-hidden="true"` to the `*` in labels (the `required` attribute already conveys it).
- [x] **Upload previews** use `alt="Image"` (`macros/form-macros.twig`). Now "Preview of the uploaded image".
- [x] **No `prefers-reduced-motion` CSS** — accordion transitions, Splide fade/autoplay, and `Modal-slide` ignore it; the image-gallery slider can autoplay with no pause control. Added the reduced-motion block to `css/base/base.css`.
    - [ ] Slider pause/play control — Skipped — same as Skeleton.
- [ ] **Video/audio** — no `<track>` captions or transcript option (`blocks/video.twig`, `blocks/audio.twig`). Skipped — same as Skeleton.
- [x] **Landmark labels** — footer navs and sidebar `<aside>` elements have no `aria-label`. The footer nav `<ul>` is wrapped in `<nav aria-label="Footer">` in `navigation/footer.twig`; sidebars use "Section navigation" and "Sidebar".
- [ ] **`lang="en"` is hardcoded** in `snippets/header.twig`. Skipped — same as Skeleton.

## Verification

- [ ] `npm run build` completes and `npm run stylelint` shows no new warnings. Stylelint passes and jslint has no new errors; the build wasn't run.
- [ ] Every changed block renders in the CMS, including the Margin and Width options
- [ ] Keyboard check: the skip link works on the full-width layout; focus inside the sticky header keeps it visible; accordion headings open with Enter/Space
