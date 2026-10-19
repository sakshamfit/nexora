# NEXORA — website (Next.js)

The NEXORA site: a dark, motion-led one-pager built with **Next.js (App
Router) + TypeScript + Tailwind CSS v4** in a **shadcn/ui project structure**.

```sh
npm install
npm run dev     # http://localhost:3000
npm run build   # static export -> out/  (serve anywhere: npx serve out)
npm run lint
```

## What's on the page

| Section | Source of the content | Notes |
|---|---|---|
| Hero | `lib/site-content.ts` | "We don't build ordinary websites." + CTAs, NEXORA logo. |
| The Idea | `lib/site-content.ts` | The template's idea statement + disciplines. |
| What We Create | `lib/site-content.ts` | 8 services with tags (Website Design → Digital Strategy). |
| **How we work** | `lib/site-content.ts` → `components/ui/timeline.tsx` | GSAP ScrollTrigger + SplitText timeline. The section pins, the track slides sideways, and each of the 9 steps (Understand → Evolve, the template's Our Approach) draws its stem and reveals its copy as it reaches centre. Respects `prefers-reduced-motion`. |
| The Work | `lib/work-data.ts` + `public/work/` | 26 projects (12 client, 14 concepts) from the template's portfolio, each with a still. |
| What We Believe + Our Numbers | `lib/site-content.ts` | Believe statements + 4 stats. |
| A Different Kind of Agency | `lib/site-content.ts` | The "no unnecessary layers" block. |
| FAQ | `lib/site-content.ts` | 7 questions, native `<details>` accordion. |
| **The owners** | `app/page.tsx` → `components/ui/profile-card-testimonial-carousel.tsx` | framer-motion profile-card carousel showing the founder and co-founder Raees Alam (photos in `public/team/`). Social icons render only when a URL is provided. |
| Client Stories | `lib/site-content.ts` | Sample quotes carried over from the template (tagged "Sample stories") — replace with real client feedback before launch. |
| Final CTA + footer | `lib/site-content.ts` | "Have an idea?" + services + motto. |

All copy lives in **`lib/site-content.ts`** (rebranded from the original site
template's `content.py`) and the portfolio in **`lib/work-data.ts`** (generated
from the template's `portfolio.json`) — edit those two files to change any text
on the site.

## The background — KineticGrid

The whole site sits on a live, interactive canvas: **`components/ui/kinetic-grid.tsx`**,
mounted once in `app/layout.tsx` as `<KineticGrid globalColor="red" />`. It renders
a fixed, click-through, viewport-sized `<canvas>` (z-0, `pointer-events: none`)
behind the content: a blue-black (`#07070c`) warping dot-grid whose lines glow
brand-red near a smoothly-lerped cursor, with a red ripple on every click.
Because it is canvas-only (no wrapper `div`), the timeline's `position: sticky`
pinning keeps working right on top of it. Under `prefers-reduced-motion` it
draws one static frame and attaches no listeners; it also renders on mobile
(sized via `visualViewport`). Sections use transparent backgrounds so the grid
stays visible down the whole page.

## Start a Project — the brief form → WhatsApp

Every "Start a Project" button (header, hero, CTA) and every footer service
chip opens a modal brief form instead of a mailto. It's built in
**`components/start-project.tsx`**:

- `StartProjectProvider` (mounted in `app/layout.tsx`) exposes
  `useStartProject().open(preset?)`; `<StartProjectButton>` wraps any element
  (including the template's letter-roll `.btn` markup).
- The form: **what do you need** chips (Website, E-commerce, Branding,
  Interactive & 3D, Product / SaaS, AI & Automation, Digital Strategy,
  Something else — multi-select), **name** (required), business, budget range
  and free-text details. Submit stays disabled until at least one need + a
  name are given.
- Submit is a `wa.me` deep link: it opens **WhatsApp on +91 86046 83669**
  (`site.contact.whatsapp` in `lib/site-content.ts`) with the brief
  pre-written — greeting, Name, Business, "Need: …" (chips joined), Budget and
  details.
- Footer chips pre-select the matching need (Web Design/Development → Website,
  E-commerce → E-commerce, Branding → Branding, Interactive → Interactive & 3D,
  Product → Product / SaaS, AI → AI & Automation).
- While open: body scroll locks and `window.__lenis` (if present) stops;
  Escape or clicking the backdrop closes and resumes. The CTA section also has
  a direct WhatsApp line for people who'd rather skip the form.

## Design & motion — ported from the site template

The app uses the original site template's design system and motion language
(`kads-labs-website/src/css/00-tokens.css`, `02-components.css`, `03-motion.css`
and the core runtime `02-core.js`), adapted to React:

| Template feature | Here |
|---|---|
| Black theme tokens (true black, near-black surfaces, `--ink` soft white, hairlines, brand red `#fb2629`) | `app/globals.css` `:root` + Tailwind `@theme` (`bg-background`, `text-muted-foreground`, `text-accent`, …) |
| Lenis smooth scroll (1s, desktop/tablet only, never on phones/coarse pointers) | `components/motion.tsx` `MotionRoot` (`lenis` npm package, synced with GSAP `ScrollTrigger.update`) |
| Scroll reveals — `[data-reveal]` opacity/y spring, `[data-split]` word rise, `.reveal-image` scale 1.1→1, `[data-stagger]` groups | same attributes, same semantics; runtime in `MotionRoot` (IntersectionObserver, focus + page-end fallbacks) |
| Motion is opt-in via `html.motion` (set pre-paint by an inline script, never under `prefers-reduced-motion`; without JS nothing is ever hidden) | inline script in `app/layout.tsx` |
| Tickers — WAAPI translate loops, clones, pause off-screen, hover slow-down | `[data-ticker]` on the hero services marquee and the work strip |
| Letter rolls on buttons/nav (per-char 12ms stagger) | `.roll` markup + runtime split |
| Section label pill, buttons (white high-emphasis, outlined pill), chips, cards | `.pill-label`, `.btn--dark/--outline/--light/--sm`, `.chip`, `.card` in `globals.css` |
| Count-up numbers | `CountUp` component (`components/motion.tsx`) |
| "View" cursor pill over project tiles | `CursorPill` + `data-cursor="View"` on work cards |
| Header tone (transparent over the hero, frosted black when scrolled) | `.site-header` + `.is-scrolled` |

The palette was retuned for the kinetic background: the base is now a
blue-black (`--background` `#07070c`, near-black navy surfaces `#0d0f18` /
`#151829` / `#1d2136`) instead of flat `#000`, so the canvas's red glow reads
against it. Brand red stays `#fb2629`; the KineticGrid's `red` theme uses the
same family (`251,38,41`).

## Project structure (shadcn conventions)

```
app/                  routes (App Router): layout.tsx, page.tsx, globals.css
components/ui/        reusable UI primitives (timeline.tsx, kinetic-grid.tsx, profile-card-…)
components/start-project.tsx  brief modal + WhatsApp deep-link flow (provider, button)
components/motion.tsx the template's motion runtime (Lenis, reveals, tickers, letter rolls) + CountUp + CursorPill
lib/utils.ts          the shadcn `cn()` helper (clsx + tailwind-merge)
lib/site-content.ts   ALL site copy (rebranded from the template's content.py)
lib/work-data.ts      portfolio data (generated from the template's portfolio.json)
public/               brand/ (logo), team/ (founder & co-founder), work/ (project stills)
app/fonts/            self-hosted Inter Tight (SIL OFL) — zero font CDN calls
```

Why `/components/ui`: the shadcn CLI (`npx shadcn@latest add <component>`)
installs every component into `components/ui` with the `@/lib/utils` import
alias, so dropping these two files there keeps the project compatible with
the rest of the shadcn ecosystem. The structure (plus `cn()`, the CSS design
tokens in `globals.css` and the `@/*` alias) was set up manually because the
shadcn registry is not reachable from this environment — run
`npx shadcn@latest init` in your own terminal if you want the full CLI flow;
it will pick this structure up.

## Dependencies

| Package | Why | Version note |
|---|---|---|
| `gsap` | Timeline: ScrollTrigger (pin + scrub) + SplitText (line-mask reveals) | 3.15 — all plugins free since 3.13 |
| `framer-motion` | Carousel enter/exit transitions | |
| `lucide-react` | Icons (chevrons, social glyphs) | **pinned to 0.544.0** — v1 removed brand icons (`Github`, `Twitter`, `Youtube`, `Linkedin`) that the carousel imports |
| `clsx` + `tailwind-merge` | the `cn()` helper | |
| `lenis` | Smooth scroll (template runtime), desktop only | synced with ScrollTrigger |

## Design tokens

Dark-first theme in `app/globals.css` (`--background` `#07070c`,
`--foreground` `#f4f4f2`, `--muted-foreground`, `--card`, `--border`) exposed
to Tailwind via `@theme inline`. Class-based dark mode (`<html class="dark">`)
is on permanently — the studio site is dark, with a blue-black base tuned to
the kinetic canvas behind it.

## Deploying

`next.config.ts` uses `output: "export"`, so `npm run build` produces a fully
static `out/` folder.

A ready-made GitHub Actions workflow lives at
[`deploy/pages.yml`](deploy/pages.yml) (this repo's automation token cannot
create files under `.github/workflows/`, so it is stored here). To enable
GitHub Pages deploys:

1. `cp kads-labs-app/deploy/pages.yml .github/workflows/pages.yml`
2. Commit & push to `main` from your account
3. Repo **Settings → Pages → Source: GitHub Actions**

If the site is served from a project path such as
`https://<user>.github.io/nexora/`, add `basePath: "/nexora"` to
`next.config.ts` so asset URLs resolve.

## Nexora review selector

- Reusable component: `components/ui/unique-testimonial.tsx`.
- Standalone example: `components/ui/unique-testimonial-demo.tsx` (not a separate route).
- Live placement: `app/page.tsx`, Client Stories (`#stories`). Existing sample
  reviews remain in `lib/site-content.ts`; each maps to `{ id, quote, author,
  role, avatar }`. No backend or new context provider is needed.
- Tailwind styles/tokens: `app/globals.css`; aliases and `cn` already exist.
  `components.json` records these paths for shadcn CLI. No Tailwind/TypeScript
  reinstall is necessary. No new runtime dependencies were added.
- Unsplash avatars are illustrative stock photos, with initials when unavailable.
  Reviews retain their sample label; replace them with approved client feedback
  before publishing as real testimonials.
- Avatar selection works with mouse, touch, and keyboard. The quote fades/blurs
  between selections, reduced motion skips animation, mobile controls wrap,
  and pending animation timers are cleaned up on unmount.
- All project buttons retain the brief form and now continue to WhatsApp at
  **+91 8604683669**. Direct-message links use the same central contact setting.
