"use client";

/* NEXORA — "Start a Project" flow.
   Every Start-a-Project button opens a brief builder (what do you need —
   website, branding, …) that continues straight into WhatsApp on the studio's
   number (+91 86046 83669) with the brief pre-filled. */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { site } from "@/lib/site-content";
import { cn } from "@/lib/utils";

const StartProjectCtx = createContext<{ open: (preset?: string) => void }>({
  open: () => {},
});

export function useStartProject() {
  return useContext(StartProjectCtx);
}

const WA_URL = `https://wa.me/${site.contact.whatsapp}`;

const WHATSAPP_GLYPH = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4 shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export function StartProjectProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [needs, setNeeds] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [budget, setBudget] = useState("");
  const [details, setDetails] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  const open = useCallback((preset?: string) => {
    setNeeds(preset ? [preset] : []);
    setName("");
    setBusiness("");
    setBudget("");
    setDetails("");
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  const toggleNeed = (need: string) =>
    setNeeds((v) =>
      v.includes(need) ? v.filter((n) => n !== need) : [...v, need],
    );

  /* While open: lock scrolling (and the Lenis smoother), focus the panel,
     close on Escape. */
  useEffect(() => {
    if (!isOpen) return;
    const lenis = (window as unknown as { __lenis?: { stop(): void; start(): void } }).__lenis;
    lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lenis?.start();
    };
  }, [isOpen, close]);

  const sp = site.startProject;
  const ready = needs.length > 0 && name.trim().length > 0;

  const message = [
    "Hi NEXORA! I'd like to start a project.",
    "",
    `Name: ${name.trim()}`,
    ...(business.trim() ? [`Business: ${business.trim()}`] : []),
    `Need: ${needs.join(", ")}`,
    ...(budget ? [`Budget: ${budget}`] : []),
    ...(details.trim() ? ["", details.trim()] : []),
  ].join("\n");
  const href = `${WA_URL}?text=${encodeURIComponent(message)}`;

  return (
    <StartProjectCtx.Provider value={{ open }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="start-project"
            className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center"
            style={{ background: "rgba(0,0,0,.68)", backdropFilter: "blur(8px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
          >
            <motion.div
              ref={panelRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby="sp-title"
              onClick={(e) => e.stopPropagation()}
              className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-[28px] p-6 text-left sm:p-8"
              style={{
                background: "linear-gradient(180deg,#151829 0%,#0d0f18 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,.07), 0 0 0 1px rgba(255,255,255,.08), 0 40px 90px -32px rgba(0,0,0,.95)",
              }}
              initial={{ opacity: 0, y: 36, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="pill-label">
                    <i aria-hidden="true" />
                    {sp.title}
                  </p>
                  <h3
                    id="sp-title"
                    className="mt-4 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl"
                  >
                    What are we building?
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {sp.sub}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground shadow-[inset_0_0_0_1px_var(--line-3)] transition-colors hover:bg-white/5 hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* What do you need? */}
              <fieldset className="mt-6">
                <legend className="text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--muted-strong)]">
                  {sp.needsLabel}
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sp.needs.map((need) => {
                    const on = needs.includes(need);
                    return (
                      <button
                        key={need}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleNeed(need)}
                        className={cn("need-chip", on && "is-on")}
                      >
                        {need}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Name + business */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--muted-strong)]">
                    {sp.nameLabel}
                  </span>
                  <input
                    className="field mt-2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={sp.namePlaceholder}
                    autoComplete="name"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--muted-strong)]">
                    {sp.businessLabel}
                  </span>
                  <input
                    className="field mt-2"
                    value={business}
                    onChange={(e) => setBusiness(e.target.value)}
                    placeholder={sp.businessPlaceholder}
                    autoComplete="organization"
                  />
                </label>
              </div>

              {/* Budget */}
              <label className="mt-4 block">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--muted-strong)]">
                  {sp.budgetLabel}
                </span>
                <select
                  className="field mt-2"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                >
                  <option value="">Select a range (optional)</option>
                  {sp.budget.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </label>

              {/* Details */}
              <label className="mt-4 block">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--muted-strong)]">
                  {sp.detailsLabel}
                </span>
                <textarea
                  className="field mt-2"
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={sp.detailsPlaceholder}
                />
              </label>

              {/* Continue on WhatsApp */}
              <div className="mt-6">
                {ready ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={close}
                    className="btn btn--dark w-full justify-center"
                  >
                    <span className="btn__label gap-2.5">
                      <span style={{ color: "#25D366" }}>{WHATSAPP_GLYPH}</span>
                      {sp.submit}
                    </span>
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="btn btn--dark w-full cursor-not-allowed justify-center opacity-40"
                  >
                    <span className="btn__label gap-2.5">
                      <span style={{ color: "#25D366" }}>{WHATSAPP_GLYPH}</span>
                      {sp.submit}
                    </span>
                  </button>
                )}
                <p className="mt-3 text-center text-xs leading-relaxed text-[color:var(--muted)]">
                  {ready ? sp.hint : sp.needHint}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </StartProjectCtx.Provider>
  );
}

/** A button that opens the Start-a-Project form (optionally with a need pre-selected). */
export function StartProjectButton({
  className,
  children,
  preset,
  ariaLabel,
}: {
  className?: string;
  children: ReactNode;
  preset?: string;
  ariaLabel?: string;
}) {
  const { open } = useStartProject();
  return (
    <button
      type="button"
      className={className}
      aria-label={ariaLabel}
      onClick={() => open(preset)}
    >
      {children}
    </button>
  );
}
