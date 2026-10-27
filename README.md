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

## Automatic GitHub sync and deployment

Nexora's [GitHub repository](https://github.com/sakshamfit/nexora) is already
linked to the **Nexora** Vercel project. Vercel builds `kads-labs-app/` and
publishes [the live site](https://nexora-near-connect.vercel.app/) when a change
reaches its production branch, `main`. Other branches receive preview
deployments; they do **not** change the live site. The TESERACT repository is
only a reference — this sync does not copy from or push to it.

To sync changes from a local Nexora checkout, install Git, Node.js (22 or
newer) and npm, and authenticate Git to GitHub using your normal credential
helper or SSH key. In a terminal (Git Bash on Windows):

```sh
# From the repository root. Inspect the branch, destination and site changes:
bash _tools/sync-github.sh --dry-run

# Sync once, or leave the loop running to sync every 20 minutes:
bash _tools/sync-github.sh
bash _tools/sync-github.sh --loop 20
```

The loop runs **only while that process and machine/workspace are running**;
closing the terminal or ending a cloud workspace stops it. To start it after
reboot, use your system's scheduler to run the one-shot command every 20
minutes, with Git and npm available on its PATH. Do not run it simultaneously
from multiple schedulers. Ctrl+C stops the foreground loop. The first sync is
immediate; the interval begins after each attempt finishes.

The sync script:

- Checks that `origin` has exactly one push URL for `sakshamfit/nexora`, then
  commits and pushes **the currently checked-out branch**. It never switches
  branches, merges, force-pushes, or pushes tags. Any existing unpushed commits
  on that branch are also sent. Merge a non-`main` branch into `main` through
  your usual review process to publish it to production.
- Auto-stages only non-ignored changes in `kads-labs-app/`, not the rest of the
  repository. Environment files and common private-key files (`.env*`,
  `*.pem`, `*.key`, `*.p12`, `*.pfx`) are excluded even if already tracked.
  This is not a complete secrets scanner: review your files and existing
  commits before enabling unattended sync to this public repository.
- Builds an isolated snapshot with `npm ci` and `npm run build` before making
  an automatic commit; it does not disrupt the local `node_modules` or dev
  server. Untracked/ignored `.env` files are not copied into the build. Supply
  any required build-time environment variables through the process
  environment instead. A failed build or a file edited during the build is not
  committed or pushed; the loop reports the error and tries again later.
- Stops if anything is already staged, so it never mixes a manual commit with
  its own. It does not automatically pull/rebase if the remote is ahead. On a
  failed push the new commit remains local; inspect the error, reconcile the
  branches safely, then retry. If staging itself races with another Git
  operation, inspect the index (`git diff --cached`) before retrying.

If a Git hook changes the commit after validation, sync stops and writes a
`.git/nexora-auto-sync.needs-review` marker. Review the commit and its build,
then remove that marker to resume. A stale `.git/nexora-auto-sync.lock` can be
removed **only after verifying no sync process is still running**. For script
regression tests, run `python3 -m unittest discover -s _tools/tests -v`.

The site also builds to static `kads-labs-app/out/`. The inherited GitHub Pages
template in `kads-labs-app/deploy/pages.yml` is inactive; the existing live
Vercel deployment above does not depend on GitHub Pages.

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
