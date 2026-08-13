import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BuddyMark, BuddyWordmark } from "@/components/BuddyMark";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerBuddy SA — Your AI Career Mentor" },
      {
        name: "description",
        content:
          "Not sure what to become? CareerBuddy SA helps Grade 9-12 pupils explore subjects, careers and South African study pathways through a friendly chat.",
      },
      { property: "og:title", content: "CareerBuddy SA — Your AI Career Mentor" },
      {
        property: "og:description",
        content:
          "Chat with CareerBuddy about subjects, careers, universities, TVET colleges and your next steps.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -top-40 -right-32 h-96 w-96 rounded-full bg-secondary/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-highlight/25 blur-3xl" />

      <header className="relative mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6">
        <BuddyWordmark />
        <Button asChild variant="ghost" size="sm">
          <Link to="/auth">Log in</Link>
        </Button>
      </header>

      <section className="relative mx-auto w-full max-w-3xl px-5 pt-10 pb-20 text-center sm:pt-16">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
          <BuddyMark className="h-4 w-4" /> For South African Grade 9-12 pupils
        </span>

        <h1 className="mt-6 text-4xl leading-tight font-extrabold sm:text-6xl">
          Your Future <span className="text-gradient-buddy">Starts Here.</span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          Meet CareerBuddy — your AI career mentor for exploring subjects, careers and
          your future.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/auth" search={{ mode: "signup" }}>
              Start My Career Journey <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
            <Link to="/auth">
              <MessageCircle className="mr-2 h-4 w-4" /> Chat With CareerBuddy
            </Link>
          </Button>
        </div>

        <div className="surface-card mx-auto mt-12 max-w-xl p-5 text-left">
          <div className="flex items-start gap-3">
            <BuddyMark />
            <p className="text-sm leading-relaxed sm:text-base">
              Not sure what you want to become? That's okay. CareerBuddy can help you
              figure it out — one friendly question at a time.
            </p>
          </div>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          CareerBuddy is an AI mentor. Always double-check admission, bursary and course
          details with the institution.
        </p>
      </section>
    </main>
  );
}
