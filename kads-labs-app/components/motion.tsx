"use client";

/* NEXORA motion runtime — ported from the site template's core runtime
   (kads-labs-website/src/js/02-core.js): Lenis smooth scroll (desktop/tablet
   only), scroll reveals ([data-reveal] / [data-split] / .reveal-image with the
   template's stagger groups), letter rolls on buttons and links, WAAPI tickers
   ([data-ticker]) and smooth in-page anchors. Everything is opt-in through
   html.motion (set by the inline script in app/layout.tsx only when the
   visitor has not asked for reduced motion), so content is never hidden
   without JS. */

import { useLayoutEffect, useRef, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const motion = () =>
  typeof document !== "undefined" &&
  document.documentElement.classList.contains("motion") &&
  !reduced();

/* ---------- Split a heading's text nodes into word spans ([data-split]) ---------- */
function split(el: HTMLElement) {
  if (el.dataset.splitDone) return;
  el.dataset.splitDone = "1";
  let i = 0;
  const walk = (node: HTMLElement) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const parts = (child.textContent || "").split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
            return;
          }
          const w = document.createElement("span");
          w.className = "w";
          const inner = document.createElement("span");
          inner.className = "w__i";
          inner.style.setProperty("--i", String(i++));
          inner.textContent = part;
          w.appendChild(inner);
          frag.appendChild(w);
        });
        child.replaceWith(frag);
      } else if (
        child.nodeType === 1 &&
        (child as HTMLElement).tagName !== "BR" &&
        !(child as HTMLElement).matches("svg,img")
      ) {
        walk(child as HTMLElement);
      }
    });
  };
  walk(el);
}

/* ---------- The runtime ---------- */
export function MotionRoot() {
  useLayoutEffect(() => {
    const root = document.documentElement;

    /* Smooth scroll — Lenis, duration 1s, desktop + tablet only (the template
       leaves phones and coarse pointers on native scroll). */
    let lenis: Lenis | null = null;
    if (!reduced() && window.innerWidth >= 800 && !window.matchMedia("(pointer: coarse)").matches) {
      lenis = new Lenis({
        duration: 1.0,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      lenis.on("scroll", ScrollTrigger.update);
      let raf = 0;
      const loop = (time: number) => {
        lenis?.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    }

    const scrollTo = (target: Element | number, offset = -96) => {
      if (lenis) lenis.scrollTo(target as never, { offset, duration: 1.2 });
      else {
        const y =
          typeof target === "number"
            ? target
            : target.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({ top: y, behavior: reduced() ? "auto" : "smooth" });
      }
    };

    /* In-page anchors use the smooth scroller. */
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href*="#"]') as HTMLAnchorElement | null;
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash || url.hash === "#") return;
      const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!el) return;
      e.preventDefault();
      scrollTo(el);
      history.pushState(null, "", url.hash);
    };
    document.addEventListener("click", onClick);

    /* Letter rolls — split .roll lines into per-character spans. */
    if (motion()) {
      document.querySelectorAll(".roll").forEach((roll) => {
        if (roll.classList.contains("has-chars")) return;
        roll.classList.add("has-chars");
        [...roll.children].forEach((line) => {
          const text = line.textContent || "";
          line.replaceChildren(
            ...[...text].map((ch, i) => {
              const s = document.createElement("span");
              s.className = "char";
              s.style.setProperty("--i", String(i));
              s.textContent = ch === " " ? "\u00A0" : ch;
              return s;
            })
          );
        });
      });
    }

    /* Reveals — [data-stagger] groups set each child's --d; the observer adds
       .is-in once an element enters the last 94% of the viewport. */
    document.querySelectorAll<HTMLElement>("[data-stagger]").forEach((group) => {
      const step = parseFloat(group.dataset.stagger || "") || 80;
      const base = parseFloat(group.dataset.staggerBase || "") || 0;
      group.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el, i) => {
        if (!el.style.getPropertyValue("--d"))
          el.style.setProperty("--d", `${base + i * step}ms`);
      });
    });

    const els = [
      ...document.querySelectorAll<HTMLElement>(
        "[data-reveal], [data-split], .reveal-image"
      ),
    ];
    if (motion()) document.querySelectorAll<HTMLElement>("[data-split]").forEach(split);

    if (!motion() || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
    } else {
      const pending = new Set<HTMLElement>(els);
      const io = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target as HTMLElement;
            const img =
              el.matches(".reveal-image") && el.querySelector("img");
            let done = false;
            const go = () => {
              if (!done) {
                done = true;
                el.classList.add("is-in");
              }
            };
            if (img && !(img as HTMLImageElement).complete && (img as HTMLImageElement).decode) {
              (img as HTMLImageElement).decode().then(go, go);
              setTimeout(go, 1200); // never wait forever on a slow image
            } else go();
            io.unobserve(el);
            pending.delete(el);
          }),
        { rootMargin: "0px 0px -6% 0px", threshold: 0.04 }
      );
      els.forEach((el) => io.observe(el));

      /* Keyboard users can tab into a section before it scrolls into reveal
         range: reveal the focused element's ancestors at once. */
      const onFocusIn = (e: FocusEvent) => {
        let n = e.target as HTMLElement | null;
        while (n && n !== document.body) {
          if (n.matches?.("[data-reveal]:not(.is-in), [data-split]:not(.is-in), .reveal-image:not(.is-in)")) {
            n.style.setProperty("--d", "0ms");
            n.classList.add("is-in");
            io.unobserve(n);
            pending.delete(n);
          }
          n = n.parentElement;
        }
      };
      document.addEventListener("focusin", onFocusIn);

      /* Elements in the last few % of the page can never cross the shrunken
         root margin: once the page reaches its end, reveal what is on screen. */
      let ticking = false;
      const atEnd = () => {
        ticking = false;
        if (window.scrollY + window.innerHeight < document.documentElement.scrollHeight - 4)
          return;
        pending.forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) {
            el.classList.add("is-in");
            io.unobserve(el);
            pending.delete(el);
          }
        });
      };
      const onScroll = () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(atEnd);
        }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("load", atEnd);
      setTimeout(atEnd, 300);
    }

    /* Tickers — WAAPI translate loop, clones fill the viewport, pause
       off-screen, hover slows down (template: 02-core.js tickers()).
       <div data-ticker data-direction="left|right" data-speed="25" data-hover="0.8">
         <ul data-ticker-list> <li>…</li> </ul> </div> */
    document.querySelectorAll<HTMLElement>("[data-ticker]").forEach((t) => {
      const list = t.querySelector<HTMLElement>("[data-ticker-list]");
      if (!list) return;
      const dir = t.dataset.direction || "left";
      const forward = dir === "right";
      const speed = parseFloat(t.dataset.speed || "") || 25;
      const hoverRate = parseFloat(t.dataset.hover || "") || 1;
      const items = [...list.children] as HTMLElement[];
      let anim: Animation | null = null;
      let visible = false;
      let hovering = false;
      let lastSize = 0;

      const build = () => {
        list.querySelectorAll("[data-clone]").forEach((c) => c.remove());
        if (!t.offsetParent || !t.clientWidth) {
          anim?.cancel();
          anim = null;
          return;
        }
        const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
        const first = items[0];
        const last = items[items.length - 1];
        if (!first || !last) return;
        const start = first.offsetLeft;
        const end = last.offsetLeft + last.offsetWidth;
        const setLen = end - start + gap;
        if (setLen <= gap) return;
        const copies = Math.max(1, Math.ceil(t.clientWidth / setLen) + 1);
        for (let c = 0; c < copies; c++)
          items.forEach((it) => {
            const cl = it.cloneNode(true) as HTMLElement;
            cl.setAttribute("aria-hidden", "true");
            cl.setAttribute("data-clone", "");
            cl.querySelectorAll("a,button,[tabindex]").forEach((x) =>
              x.setAttribute("tabindex", "-1")
            );
            cl.querySelectorAll("img").forEach((im) => im.setAttribute("loading", "eager"));
            list.appendChild(cl);
          });
        anim?.cancel();
        if (reduced()) return;
        const from = forward ? -setLen : 0;
        const to = forward ? 0 : -setLen;
        anim = list.animate(
          [
            { transform: `translateX(${from}px)` },
            { transform: `translateX(${to}px)` },
          ],
          { duration: (setLen / speed) * 1000, iterations: Infinity, easing: "linear" }
        );
        anim.playbackRate = hovering ? hoverRate : 1;
        if (!visible) anim.pause();
      };
      const rebuild = () => {
        const s = t.clientWidth + list.scrollHeight;
        if (Math.abs(s - lastSize) < 2 && anim) return;
        lastSize = s;
        build();
      };
      new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (anim) visible ? anim.play() : anim.pause();
      }).observe(t);
      if (hoverRate !== 1) {
        t.addEventListener("pointerenter", () => {
          hovering = true;
          if (anim)
            anim.updatePlaybackRate
              ? anim.updatePlaybackRate(hoverRate)
              : (anim.playbackRate = hoverRate);
        });
        t.addEventListener("pointerleave", () => {
          hovering = false;
          if (anim)
            anim.updatePlaybackRate
              ? anim.updatePlaybackRate(1)
              : (anim.playbackRate = 1);
        });
      }
      let rt = 0;
      new ResizeObserver(() => {
        clearTimeout(rt);
        rt = setTimeout(rebuild, 120) as unknown as number;
      }).observe(t);
      build();
    });

    /* Header gains a solid tone once the page scrolls. */
    const header = document.querySelector("[data-header]");
    const tone = () => header?.classList.toggle("is-scrolled", window.scrollY > 24);
    tone();
    window.addEventListener("scroll", tone, { passive: true });

    return () => {
      document.removeEventListener("click", onClick);
      lenis?.destroy();
      (window as unknown as { __lenis?: Lenis }).__lenis = undefined;
      root.classList.remove("motion");
    };
  }, []);

  return null;
}

/* ---------- Count-up number (the template's Our Numbers animation) ---------- */
export function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 1.6,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced()) {
      setVal(to);
      return;
    }
    let started = false;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || started) return;
        started = true;
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / (duration * 1000));
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(Math.max(0, Math.round(to * eased)));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        io.disconnect();
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {val}
      {suffix}
    </span>
  );
}

/* ---------- Cursor pill (the template's "View Project" cursor) ---------- */
export function CursorPill() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches || reduced()) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let cx = x;
    let cy = y;
    let raf = 0;

    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = (e.target as HTMLElement).closest?.("[data-cursor]");
      setOn(!!t);
      const label = el.querySelector<HTMLElement>(".cursor-pill__label");
      if (label) label.textContent = t?.getAttribute("data-cursor") || "";
    };
    const loop = () => {
      cx += (x - cx) * 0.16;
      cy += (y - cy) * 0.16;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className={`cursor-pill${on ? " is-on" : ""}`} aria-hidden="true">
      <span className="cursor-pill__inner">
        <span className="cursor-pill__label" />
      </span>
    </div>
  );
}
