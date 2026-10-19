"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type TestimonialItem = {
  id: string | number;
  quote: string;
  author: string;
  role: string;
  avatar?: string;
};

// Stock portraits are illustrative, not photos of actual reviewers.
export const stockAvatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=faces",
];

const sampleTestimonials: readonly TestimonialItem[] = [
  { id: 1, quote: "This changed everything for me.", author: "Sarah Chen", role: "Designer at Figma", avatar: stockAvatars[0] },
  { id: 2, quote: "Simply brilliant. Nothing else compares.", author: "Marcus Johnson", role: "Engineer at Vercel", avatar: stockAvatars[1] },
  { id: 3, quote: "The attention to detail is unmatched.", author: "Elena Rodriguez", role: "Founder at Craft", avatar: stockAvatars[2] },
];

function Avatar({ author, src }: { author: string; src?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-card text-xs font-semibold text-foreground">
      {src && !failed ? (
        // Native img supports the supplied remote stock images on static hosts.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" width={32} height={32} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} className="h-full w-full object-cover" />
      ) : author.split(" ").slice(0, 2).map((word) => word[0]).join("")}
    </span>
  );
}

/** The supplied quote/avatar selector, with configurable content and keyboard support. */
export function Testimonials({ testimonials = sampleTestimonials }: { testimonials?: readonly TestimonialItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current !== null) clearTimeout(timer.current);
  }, []);

  const selectedIndex = activeIndex < testimonials.length ? activeIndex : 0;
  const selected = testimonials[selectedIndex];
  if (!selected) return null;

  const handleSelect = (index: number) => {
    if (index === selectedIndex || timer.current !== null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActiveIndex(index);
      return;
    }
    setIsAnimating(true);
    timer.current = setTimeout(() => {
      setActiveIndex(index);
      setIsAnimating(false);
      timer.current = null;
    }, 200);
  };

  return (
    <div className="flex w-full flex-col items-center gap-10 py-16">
      <div className="relative w-full max-w-3xl px-6 sm:px-8">
        <span aria-hidden="true" className="pointer-events-none absolute -left-2 -top-6 select-none font-serif text-7xl text-foreground/[0.06]">&ldquo;</span>
        <div className="grid text-center text-xl font-light leading-relaxed text-foreground sm:text-2xl md:text-3xl">
          {/* Reserve the tallest quote's space so controls do not jump on selection. */}
          {testimonials.map((item) => (
            <p key={item.id} aria-hidden="true" className="invisible col-start-1 row-start-1 pointer-events-none select-none">{item.quote}</p>
          ))}
          <blockquote aria-live="polite" aria-atomic="true" className={cn(
            "col-start-1 row-start-1 self-center transition-all duration-400 ease-out motion-reduce:transition-none",
            isAnimating ? "scale-[0.98] opacity-0 blur-sm" : "scale-100 opacity-100 blur-0",
          )}>
            <p>{selected.quote}</p>
            <span className="sr-only"> — {selected.author}, {selected.role}</span>
          </blockquote>
        </div>
        <span aria-hidden="true" className="pointer-events-none absolute -right-2 -bottom-8 select-none font-serif text-7xl text-foreground/[0.06]">&rdquo;</span>
      </div>

      <div className="mt-2 flex w-full flex-col items-center gap-6">
        <p className={cn(
          "px-2 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground transition-all duration-500 ease-out motion-reduce:transition-none",
          isAnimating ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100",
        )}>{selected.role}</p>

        <div role="group" aria-label="Choose a client review" className="flex max-w-full flex-wrap items-center justify-center gap-2">
          {testimonials.map((testimonial, index) => {
            const isActive = selectedIndex === index;
            const showName = isActive || hoveredIndex === index || focusedIndex === index;
            return (
              <button
                key={testimonial.id}
                type="button"
                aria-label={`Read review from ${testimonial.author}`}
                aria-pressed={isActive}
                onClick={() => handleSelect(index)}
                onMouseEnter={() => {
                  // Expanding pills on narrow rows can move a target before a tap lands.
                  if (window.matchMedia("(min-width: 640px) and (hover: hover)").matches) setHoveredIndex(index);
                }}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={(event) => {
                  if (event.currentTarget.matches(":focus-visible")) setFocusedIndex(index);
                }}
                onBlur={() => setFocusedIndex(null)}
                className={cn(
                  "relative flex min-h-11 min-w-11 max-w-full cursor-pointer items-center justify-center gap-0 rounded-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground",
                  isActive ? "bg-foreground shadow-lg" : "bg-transparent hover:bg-muted/80",
                  showName ? "py-2 pr-4 pl-2" : "p-0.5",
                )}
              >
                <span className={cn("relative shrink-0 rounded-full transition-all duration-500 motion-reduce:transition-none", isActive ? "ring-2 ring-background/30" : "ring-0 hover:scale-105")}>
                  <Avatar key={testimonial.avatar} author={testimonial.author} src={testimonial.avatar} />
                </span>
                <span aria-hidden="true" className={cn(
                  "grid min-w-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
                  showName ? "ml-2 grid-cols-[1fr] opacity-100" : "ml-0 grid-cols-[0fr] opacity-0",
                )}>
                  <span className="overflow-hidden">
                    <span className={cn("block truncate text-sm font-medium transition-colors duration-300 motion-reduce:transition-none", isActive ? "text-background" : "text-foreground")}>{testimonial.author}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
