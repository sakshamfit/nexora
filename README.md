# NEXORA

Repository for the **NEXORA** studio site.

Copied from [`sakshamfit/kads-labs`](https://github.com/sakshamfit/kads-labs)
(commit `14dfc5c067d354545489e96d84a1b64bb9e53b76`). The live app keeps the
original design, functionality and portfolio, with
Nexora branding and the first owner's portrait replaced by Saksham's image from
[Plus One's About page](https://www.plusoneco.in/about). The portrait is stored
locally at `kads-labs-app/public/team/saksham.jpg` (sourced from the linked
Plus One repository, `sakshamfit/BROSKIE`, `app/web/assets/images/team-saksham.jpg`).
The original reference/template folders are unchanged.

Validation: the production build passes. The inherited lint issues remain in
`components/motion.tsx` (`react-hooks/set-state-in-effect`) and
`components/ui/kinetic-grid.tsx` (`react-hooks/immutability`), plus four warnings.

## Layout

| Path | What it is |
|---|---|
| **`kads-labs-app/`** | **The website** — Next.js + TypeScript + Tailwind CSS v4, shadcn structure. Home page has the pinned GSAP "How we work" timeline, the owners carousel (founder + co-founder), a live interactive canvas background (KineticGrid: red glow follows the cursor, click ripples), and a Start-a-Project brief form that opens WhatsApp with the brief pre-written (+91 86046 83669). See its [README](kads-labs-app/README.md). |
| `kads-labs-website/` | The original static-site template this project started from (Python build, vanilla CSS/JS), kept as reference. Its heavy portfolio media was pruned to keep the repo lean — the full template lives at [gireeshkumarreddy/Teseract-creative-studious](https://github.com/gireeshkumarreddy/Teseract-creative-studious). |
| `public/brand`, `public/team` (in the app) | Brand assets: `nexora-logo.jpg`, and the displayed portraits `saksham.jpg` and `raees-alam.jpg`. |
| `_ref/`, `_tools/`, `SITE-ISSUES.md` | Reference specs and QA tooling inherited from the template. |

## Quick start

```sh
cd kads-labs-app
npm install
npm run dev        # http://localhost:3000
npm run build      # static export -> kads-labs-app/out/
```

Deploying: the site builds to a static `kads-labs-app/out/` (`npm run build`).
For GitHub Pages, copy `kads-labs-app/deploy/pages.yml` to
`.github/workflows/pages.yml`, push to `main` from your account, and enable
**Settings → Pages → Source: GitHub Actions**.

## Updated review UI and contact

Client Stories now uses the animated quote/avatar selector in
`kads-labs-app/components/ui/unique-testimonial.tsx`, keeping the original six
sample reviews. WhatsApp project enquiries go to **+91 8604683669**.

Browser regression checks: install the existing `_tools` dependencies and a
Playwright Chromium browser, start the built preview on port 3000, then run
`node _tools/nexora-check.cjs`. Set `TEST_URL` for another preview URL or
`CHROMIUM_EXECUTABLE_PATH` for an existing browser. The test intentionally blocks
stock image requests to verify initials fallback.

## Team update

Raees Alam is the sole co-founder shown in the owners carousel, replacing
Shivam Gupta. Sudhir's profile has been removed. Raees's portrait is saved at
`kads-labs-app/public/team/raees-alam.jpg`, sourced from the Plus One About
page's `team-raees.jpg` asset in `sakshamfit/BROSKIE`. The founder is Anshuman Pandey, with the previously selected Saksham portrait.
