import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { MotionRoot, CursorPill } from "@/components/motion";
import { StartProjectProvider } from "@/components/start-project";
import KineticGrid from "@/components/ui/kinetic-grid";
import "./globals.css";

/* Self-hosted Inter Tight (SIL OFL) — carried over from the studio's site
   template; the closest free match to Helvetica Neue. Kept local so the app
   builds and serves with zero third-party font requests. */
const interTight = localFont({
  src: [
    {
      path: "./fonts/inter-tight-latin.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/inter-tight-latin-italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-inter-tight",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sakshamfit.github.io/nexora/"),
  title: "NEXORA — Design & Build Studio",
  description:
    "NEXORA creates interactive, thoughtful and tailor-made websites and digital experiences for businesses that want to be different.",
  openGraph: {
    title: "NEXORA — Design & Build Studio",
    description:
      "We create interactive, thoughtful and tailor-made digital experiences for businesses that want to be different.",
    images: ["/brand/nexora-logo.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#07070c",
};

/* Sets html.motion before first paint (the template's gate: motion is opt-in
   and never runs for visitors who asked for reduced motion). suppressHydration
   on <html> keeps React from touching the class this script adds. */
const motionScript = `(function(d){try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('motion')}catch(e){}})(document.documentElement)`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${interTight.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: motionScript }} />
        <MotionRoot />
        <CursorPill />
        {/* Interactive background: kinetic grid that warps toward the pointer
            and ripples on click. Fixed canvas behind the page (the page content
            sits at z-10; see app/page.tsx). */}
        <KineticGrid globalColor="red" />
        <StartProjectProvider>{children}</StartProjectProvider>
      </body>
    </html>
  );
}
