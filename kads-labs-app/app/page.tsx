import Image from "next/image";
import { Testimonials } from "@/components/ui/unique-testimonial";
import Timeline, { type JourneyItem } from "@/components/ui/timeline";
import {
  TestimonialCarousel,
  type Testimonial,
} from "@/components/ui/profile-card-testimonial-carousel";
import { CountUp } from "@/components/motion";
import { StartProjectButton } from "@/components/start-project";
import { site } from "@/lib/site-content";
import { workProjects, type WorkProject } from "@/lib/work-data";

/* ------------------------------------------------------------------ */
/* NEXORA — data                                                    */
/* ------------------------------------------------------------------ */

/** "The owners": the people behind NEXORA. */
const owners: Testimonial[] = [
  {
    name: "Anshuman Pandey",
    title: "Founder, NEXORA",
    description:
      "Anshuman started NEXORA to build digital products that are engineered as carefully as they are designed. He leads direction and delivery on everything that leaves the studio.",
    imageUrl: "/team/saksham.jpg",
  },
  {
    name: "Raees Alam",
    title: "Co-founder, NEXORA",
    description:
      "Raees turns ideas into working features and keeps the product moving smoothly from one release to the next.",
    imageUrl: "/team/raees-alam.jpg",
  },
];

/** "How we work": the template's 9 Our Approach steps on the pinned timeline. */
const APPROACH_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
] as const;

const approachItems: JourneyItem[] = site.approach.steps.map((step, i) => ({
  id: `step-${step.n}-${step.name.toLowerCase().replace(/[^a-z]+/g, "-")}`,
  year: step.n,
  month: APPROACH_MONTHS[i],
  title: `${step.n} · ${step.name}`,
  content: step.content,
}));
const approachTop = approachItems.filter((_, i) => i % 2 === 0);
const approachBottom = approachItems.filter((_, i) => i % 2 === 1);

const clientWork = workProjects.filter((p) => p.group === "client");
const conceptWork = workProjects.filter((p) => p.group === "concept");

/* ------------------------------------------------------------------ */
/* Small building blocks (template vocabulary)                          */
/* ------------------------------------------------------------------ */

/** Section label pill — the template's .pill-label with its status dot. */
function Pill({ children }: { children: string }) {
  return (
    <p className="pill-label" data-reveal="fade">
      <i aria-hidden="true" />
      {children}
    </p>
  );
}

/** Letter-roll label (the template's .roll — chars split at runtime). */
function Roll({ text }: { text: string }) {
  return (
    <span className="roll">
      <span>{text}</span>
      <span aria-hidden="true">
        {text}
      </span>
    </span>
  );
}

function WorkCard({ project }: { project: WorkProject }) {
  return (
    <article
      className="group overflow-hidden rounded-[24px] bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_0_0_1px_var(--line-2)] transition-[box-shadow,transform] duration-500 hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_0_1px_var(--line-3),0_24px_48px_-24px_rgba(0,0,0,0.9)]"
      data-reveal
      data-cursor="View"
    >
      <div className="reveal-image aspect-[16/10]">
        <Image
          src={project.image}
          alt={`${project.title} — website screen`}
          width={640}
          height={400}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span
            className={
              project.group === "client"
                ? "rounded-full px-2.5 py-0.5 text-[11px] font-medium text-accent-dot shadow-[inset_0_0_0_1px_rgba(251,38,41,0.35)]"
                : "rounded-full px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground shadow-[inset_0_0_0_1px_var(--line)]"
            }
          >
            {project.label}
          </span>
          <span className="text-xs text-[color:var(--muted-strong)]">
            {project.year}
          </span>
        </div>
        <h3 className="mt-3 text-lg font-semibold tracking-[-0.02em]">
          {project.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{project.industry}</p>
        <p className="mt-3 text-[11px] uppercase tracking-[0.08em] text-[color:var(--muted)]">
          {project.services}
        </p>
      </div>
    </article>
  );
}

/** Footer service chips open the form with the matching need pre-selected. */
const FOOTER_SERVICE_NEED: Record<string, string> = {
  "Web Design": "Website",
  Development: "Website",
  "E-commerce": "E-commerce",
  Interactive: "Interactive & 3D",
  Branding: "Branding",
  Product: "Product / SaaS",
  AI: "AI & Automation",
};

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <main className="relative z-10 text-foreground">
      {/* Header (transparent over the hero — .is-scrolled added on scroll) */}
      <header className="site-header fixed inset-x-0 top-0 z-50" data-header>
        <div className="mx-auto flex max-w-[1344px] items-center justify-between gap-4 px-6 py-4 lg:px-12">
          <a href="#top" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/nexora-logo.jpg"
              alt="NEXORA logo"
              className="h-9 w-9 rounded-full object-cover shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]"
            />
            <span className="text-sm font-semibold tracking-[0.22em]">
              NEXORA
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-[13px] font-medium text-muted-foreground md:flex">
            <a className="transition-colors hover:text-foreground" href="#create">
              <Roll text="What we create" />
            </a>
            <a className="transition-colors hover:text-foreground" href="#journey">
              <Roll text="How we work" />
            </a>
            <a className="transition-colors hover:text-foreground" href="#work">
              <Roll text="The work" />
            </a>
            <a className="transition-colors hover:text-foreground" href="#faq">
              <Roll text="FAQ" />
            </a>
            <a className="transition-colors hover:text-foreground" href="#team">
              <Roll text="The owners" />
            </a>
          </nav>
          <StartProjectButton className="btn btn--dark btn--sm">
            <span className="btn__label">
              <Roll text={site.hero.ctaPrimary} />
            </span>
          </StartProjectButton>
        </div>
      </header>

      {/* Hero */}
      <section
        id="top"
        className="flex min-h-screen flex-col items-center justify-center gap-7 px-6 pt-32 pb-10 text-center"
      >
        <Pill>{site.hero.kicker}</Pill>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/nexora-logo.jpg"
          alt="NEXORA"
          className="h-24 w-24 rounded-[24px] object-cover shadow-[0_0_0_1px_var(--line-2),0_30px_60px_-30px_rgba(0,0,0,0.9)]"
          data-reveal="scale"
          style={{ "--d": "80ms" } as React.CSSProperties}
        />
        <h1
          className="max-w-[16ch] text-[clamp(46px,7.4vw,92px)] font-semibold leading-[1.02] tracking-[var(--track-tight)]"
          data-split
        >
          {site.hero.title}
        </h1>
        <p
          className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          data-reveal
          style={{ "--d": "160ms" } as React.CSSProperties}
        >
          {site.hero.lead}
        </p>
        <p
          className="max-w-xl text-sm leading-relaxed text-[color:var(--muted-strong)]"
          data-reveal
          style={{ "--d": "240ms" } as React.CSSProperties}
        >
          {site.hero.body}
        </p>
        <div
          className="mt-2 flex flex-wrap items-center justify-center gap-3"
          data-reveal
          style={{ "--d": "320ms" } as React.CSSProperties}
        >
          <StartProjectButton className="btn btn--dark">
            <span className="btn__label">
              <Roll text={site.hero.ctaPrimary} />
            </span>
          </StartProjectButton>
          <a href="#work" className="btn btn--outline">
            <span className="btn__label">
              <Roll text={site.hero.ctaSecondary} />
            </span>
          </a>
        </div>

        <p
          className="text-xs text-[color:var(--muted)]"
          data-reveal="fade"
          style={{ "--d": "400ms" } as React.CSSProperties}
        >
          The background is live — move your cursor, click anywhere.
        </p>

        {/* Services marquee (template hero ticker) */}
        <div
          className="mt-10 w-full max-w-[1344px]"
          aria-hidden="true"
          data-reveal="fade"
          style={{ "--d": "420ms" } as React.CSSProperties}
        >
          <div className="marquee-track h-12" data-ticker data-speed="25">
            <ul className="marquee-list" data-ticker-list>
              {site.services.items.map((service) => (
                <li key={service.n} className="marquee-item">
                  <span className="marquee-word">{service.name}</span>
                  <svg
                    className="marquee-mark"
                    viewBox="0 0 12 12"
                    fill="currentColor"
                  >
                    <path d="M6 0l1.7 4.3L12 6 7.7 7.7 6 12 4.3 7.7 0 6l4.3-1.7z" />
                  </svg>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Work strip (the template's hero gallery, as a looping ticker) */}
        <div className="w-full" aria-hidden="true">
          <div className="marquee-track" data-ticker data-speed="70">
            <ul className="marquee-list" data-ticker-list>
              {workProjects.map((project) => (
                <li key={project.slug} className="work-strip__item">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={project.image} alt="" loading="lazy" draggable={false} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* The Idea */}
      <section id="idea" className="border-t border-[color:var(--line-2)]">
        <div className="mx-auto grid max-w-[1344px] gap-10 px-6 py-24 md:grid-cols-2 md:gap-16 lg:px-12">
          <div>
            <Pill>{site.idea.label}</Pill>
            <h2
              className="mt-6 text-[clamp(32px,4.6vw,56px)] font-semibold leading-[1.08] tracking-[var(--track-head)]"
              data-split
            >
              {site.idea.title[0]}
              <br />
              <span className="text-[color:var(--muted)]">
                {site.idea.title[1]}
              </span>
            </h2>
          </div>
          <div data-stagger="90">
            <ul className="space-y-3">
              {site.idea.lines.map((line, i) => (
                <li
                  key={i}
                  className={
                    i === site.idea.lines.length - 1
                      ? "text-xl font-medium sm:text-2xl"
                      : "text-lg text-muted-foreground line-through decoration-white/25 sm:text-xl"
                  }
                  data-reveal
                >
                  {line}
                </li>
              ))}
            </ul>
            <p
              className="mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground"
              data-reveal
            >
              {site.idea.body}
            </p>
            <div className="mt-6 flex flex-wrap gap-2" data-reveal>
              {site.idea.disciplines.map((d) => (
                <span key={d} className="chip">
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What We Create */}
      <section id="create" className="border-t border-[color:var(--line-2)]">
        <div className="mx-auto max-w-[1344px] px-6 py-24 lg:px-12">
          <Pill>{site.services.label}</Pill>
          <h2
            className="mt-6 max-w-3xl text-[clamp(32px,4.6vw,56px)] font-semibold leading-[1.08] tracking-[var(--track-head)]"
            data-split
          >
            {site.services.title}
          </h2>
          <p
            className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base"
            data-reveal
            style={{ "--d": "120ms" } as React.CSSProperties}
          >
            {site.services.intro.join(" ")}
          </p>
          <div className="mt-12 grid gap-4 md:grid-cols-2" data-stagger="80">
            {site.services.items.map((service) => (
              <article key={service.n} className="card p-6 sm:p-8" data-reveal>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-lg font-semibold tracking-[-0.02em]">
                    {service.name}
                  </h3>
                  <span className="text-sm font-medium text-accent">
                    {service.n}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium">{service.title}</p>
                {service.body && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {service.body}
                  </p>
                )}
                <div className="mt-5 flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <span key={tag} className="chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <div
            className="card mt-10 p-8 text-center"
            data-reveal
          >
            <p className="text-lg font-semibold">{site.services.ctaTitle}</p>
            {site.services.ctaLines.map((line) => (
              <p key={line} className="mt-1 text-sm text-muted-foreground">
                {line}
              </p>
            ))}
            <StartProjectButton
              className="mt-6 inline-flex h-12 items-center rounded-full px-6 text-sm font-medium shadow-[inset_0_0_0_1.5px_currentColor] transition-colors hover:bg-foreground hover:text-black"
              ariaLabel="Let's talk — start a project"
            >
              <Roll text="Let's Talk" />
            </StartProjectButton>
          </div>
        </div>
      </section>

      {/* How we work — lead-in, then the pinned horizontal GSAP timeline. */}
      <section className="border-t border-[color:var(--line-2)]">
        <div className="mx-auto max-w-[1344px] px-6 pt-24 text-center lg:px-12">
          <Pill>{site.approach.label}</Pill>
          <h2
            className="mx-auto mt-6 max-w-2xl text-[clamp(32px,4.6vw,56px)] font-semibold leading-[1.08] tracking-[var(--track-head)]"
            data-split
          >
            {site.approach.title}
          </h2>
          <p
            className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground"
            data-reveal
            style={{ "--d": "120ms" } as React.CSSProperties}
          >
            Great work doesn&apos;t happen in one step. Keep scrolling — the next
            section pins and each step draws itself as it reaches centre.
          </p>
        </div>
      </section>
      <Timeline
        title={site.approach.label}
        periodLabel={site.approach.periodLabel}
        backgroundColor="transparent"
        textColor="var(--color-foreground, #f4f4f2)"
        mutedTextColor="var(--color-muted-foreground, rgba(244,244,242,.74))"
        activeColor="#fb2629"
        imageUrl="/brand/nexora-logo.jpg"
        imageAlt="NEXORA"
        duration={1.4}
        topItems={approachTop}
        bottomItems={approachBottom}
      />

      {/* The Work */}
      <section id="work" className="border-t border-[color:var(--line-2)]">
        <div className="mx-auto max-w-[1344px] px-6 py-24 lg:px-12">
          <Pill>{site.work.label}</Pill>
          <h2
            className="mt-6 max-w-3xl text-[clamp(32px,4.6vw,56px)] font-semibold leading-[1.08] tracking-[var(--track-head)]"
            data-split
          >
            {site.work.title[0]}
            <br />
            <span className="text-[color:var(--muted)]">
              {site.work.title[1]}
            </span>
          </h2>
          <p
            className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base"
            data-reveal
            style={{ "--d": "120ms" } as React.CSSProperties}
          >
            {site.work.intro}
          </p>

          <h3
            className="mt-16 text-xs font-medium uppercase tracking-[0.28em] text-[color:var(--muted-strong)]"
            data-reveal="fade"
          >
            {site.work.clientGroupTitle}
          </h3>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-stagger="80">
            {clientWork.map((project) => (
              <WorkCard key={project.slug} project={project} />
            ))}
          </div>

          <h3
            className="mt-16 text-xs font-medium uppercase tracking-[0.28em] text-[color:var(--muted-strong)]"
            data-reveal="fade"
          >
            {site.work.conceptGroupTitle}
          </h3>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-stagger="80">
            {conceptWork.map((project) => (
              <WorkCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* What We Believe + Our Numbers */}
      <section id="believe" className="border-t border-[color:var(--line-2)]">
        <div className="mx-auto max-w-[1344px] px-6 py-24 lg:px-12">
          <Pill>{site.believe.label}</Pill>
          <h2
            className="mt-6 max-w-3xl text-[clamp(32px,4.6vw,56px)] font-semibold leading-[1.08] tracking-[var(--track-head)]"
            data-split
          >
            {site.believe.title}
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3" data-stagger="90">
            {site.believe.body.map((paragraph, i) => (
              <p
                key={i}
                className="card p-6 text-sm leading-relaxed text-muted-foreground"
                data-reveal
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-24">
            <Pill>{site.numbers.label}</Pill>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4" data-stagger="90">
              {site.numbers.items.map((stat) => (
                <div key={stat.label} className="card p-6" data-reveal>
                  <p className="text-3xl font-semibold tracking-[-0.03em] text-accent sm:text-4xl">
                    {stat.value === "20K+" ? (
                      <CountUp to={20} suffix="K+" />
                    ) : stat.value === "2M+" ? (
                      <CountUp to={2} suffix="M+" />
                    ) : (
                      stat.value
                    )}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            <p
              className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground"
              data-reveal
            >
              {site.numbers.body}
            </p>
          </div>
        </div>
      </section>

      {/* A Different Kind of Agency */}
      <section id="agency" className="border-t border-[color:var(--line-2)]">
        <div className="mx-auto grid max-w-[1344px] gap-10 px-6 py-24 md:grid-cols-2 md:gap-16 lg:px-12">
          <div>
            <Pill>{site.agency.label}</Pill>
            <h2
              className="mt-6 text-[clamp(32px,4.6vw,56px)] font-semibold leading-[1.08] tracking-[var(--track-head)]"
              data-split
            >
              {site.agency.title}
            </h2>
            <p
              className="mt-4 font-medium text-accent"
              data-reveal
              style={{ "--d": "120ms" } as React.CSSProperties}
            >
              {site.agency.kicker}
            </p>
          </div>
          <div data-stagger="90">
            <p className="text-base leading-relaxed sm:text-lg" data-reveal>
              {site.agency.body}
            </p>
            <ul className="mt-6 space-y-2">
              {site.agency.nots.map((not) => (
                <li
                  key={not}
                  className="text-muted-foreground line-through decoration-white/30"
                  data-reveal
                >
                  {not}
                </li>
              ))}
            </ul>
            <p className="mt-6 font-medium" data-reveal>
              {site.agency.closing}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-[color:var(--line-2)]">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <Pill>{site.faq.label}</Pill>
          <div className="card mt-8 divide-y divide-[color:var(--line-2)] px-6" data-reveal>
            {site.faq.items.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold sm:text-base [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-lg font-normal text-accent transition-transform duration-300 [transition-timing-function:var(--ease)] group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* The owners — profile-card carousel. */}
      <section
        id="team"
        className="flex min-h-screen flex-col items-center justify-center gap-10 px-6 py-24"
      >
        <div className="text-center">
          <Pill>Who&apos;s behind it</Pill>
          <h2
            className="mt-6 text-[clamp(32px,4.6vw,56px)] font-semibold leading-[1.08] tracking-[var(--track-head)]"
            data-split
          >
            The owners
          </h2>
        </div>
        <div data-reveal style={{ "--d": "160ms" } as React.CSSProperties}>
          <TestimonialCarousel testimonials={owners} />
        </div>
      </section>

      {/* Client Stories */}
      <section id="stories" className="border-t border-[color:var(--line-2)]">
        <div className="mx-auto max-w-[1344px] px-6 py-24 lg:px-12">
          <div className="flex flex-wrap items-center gap-3">
            <Pill>{site.stories.label}</Pill>
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] text-muted-foreground shadow-[inset_0_0_0_1px_var(--line)]"
              data-reveal="fade"
            >
              {site.stories.sampleTag}
            </span>
          </div>
          <h2
            className="mt-6 text-[clamp(32px,4.6vw,56px)] font-semibold leading-[1.08] tracking-[var(--track-head)]"
            data-split
          >
            {site.stories.title}
          </h2>
          <Testimonials
            testimonials={site.stories.items.map((story, index) => ({
              id: story.project,
              quote: story.quote,
              author: story.project,
              role: story.industry,
              avatar: site.stories.avatars[index % site.stories.avatars.length],
            }))}
          />
          <p className="text-center text-xs text-muted-foreground">
            Sample reviews with illustrative stock portraits.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section id="cta" className="border-t border-[color:var(--line-2)]">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-28 text-center">
          <Pill>{site.cta.label}</Pill>
          <h2
            className="mt-6 text-[clamp(40px,6vw,80px)] font-semibold leading-[1.02] tracking-[var(--track-tight)]"
            data-split
          >
            {site.cta.title}
          </h2>
          <div className="mt-6 space-y-1 text-sm text-muted-foreground sm:text-base" data-reveal>
            {[...site.cta.lines, ...site.cta.lines2].map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <span data-reveal style={{ "--d": "160ms" } as React.CSSProperties}>
            <StartProjectButton className="btn btn--dark">
              <span className="btn__label">
                <Roll text={site.cta.cta} />
              </span>
            </StartProjectButton>
          </span>
          <a
            href={`https://wa.me/${site.contact.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 text-xs text-muted-foreground underline decoration-white/25 underline-offset-4 transition-colors hover:text-foreground"
            data-reveal="fade"
            style={{ "--d": "240ms" } as React.CSSProperties}
          >
            or message us directly on WhatsApp — {site.contact.whatsappDisplay}
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[color:var(--line-2)] px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground" data-reveal="fade">
          {site.footer.line}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs uppercase tracking-[0.14em] text-[color:var(--muted-strong)]">
          {site.footer.services.map((service) => (
            <StartProjectButton
              key={service}
              preset={FOOTER_SERVICE_NEED[service] ?? service}
              className="cursor-pointer transition-colors hover:text-foreground"
              ariaLabel={`Start a ${service} project`}
            >
              {service}
            </StartProjectButton>
          ))}
        </div>
        <p className="mt-8 text-xs font-semibold tracking-[0.25em]">
          {site.footer.motto}
        </p>
        <p className="mt-6 text-xs text-[color:var(--muted)]">
          {site.footer.copyright}
        </p>
      </footer>
    </main>
  );
}
