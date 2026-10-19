import { Testimonials } from "@/components/ui/unique-testimonial";

/** Standalone integration example; the live site uses its existing sample stories. */
export default function TestimonialDemo() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="w-full">
        <p className="text-center text-xs text-muted-foreground">Sample testimonials · Illustrative stock portraits</p>
        <Testimonials />
      </div>
    </main>
  );
}
