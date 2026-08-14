import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Compass,
  GraduationCap,
  MessageCircle,
  Sparkle,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BuddyMark, BuddyWordmark } from "@/components/BuddyMark";
import { cn } from "@/lib/utils";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Compass,
    title: "Find your direction",
    body: "Answer a few friendly questions and discover careers that actually match what you enjoy.",
  },
  {
    icon: BookOpen,
    title: "Choose the right subjects",
    body: "Understand how Maths, Physical Sciences, Accounting and more open different doors.",
  },
  {
    icon: GraduationCap,
    title: "University or TVET",
    body: "Compare study pathways, APS requirements and what each qualification leads to.",
  },
  {
    icon: Wallet,
    title: "Funding & bursaries",
    body: "Learn how NSFAS and bursaries work, and what to prepare before you apply.",
  },
];

const STEPS = [
  { n: "1", title: "Create your free account", body: "Tell CareerBuddy your name and grade." },
  { n: "2", title: "Start chatting", body: "Ask anything about subjects, careers or studying." },
  { n: "3", title: "Plan your next step", body: "Walk away with clear, practical actions." },
];

function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <div className="pointer-events-none absolute -top-48 -right-40 h-[28rem] w-[28rem] rounded-full bg-secondary/25 blur-3xl" />
      <div className="pointer-events-none absolute top-[40rem] -left-40 h-96 w-96 rounded-full bg-highlight/20 blur-3xl" />

      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "border-b border-border bg-background/80 shadow-soft backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3.5">
          <Link to="/" className="transition-transform duration-200 hover:scale-[1.03]">
            <BuddyWordmark />
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {[
              { href: "#how-it-works", label: "How it works" },
              { href: "#what-you-get", label: "What you get" },
              { href: "#faq", label: "Questions" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="relative rounded-full px-3.5 py-2 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="transition-transform duration-200 hover:-translate-y-0.5">
              <Link to="/auth">Log in</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow"
            >
              <Link to="/auth" search={{ mode: "signup" }}>
                Get started
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="relative">
        {/* Hero */}
        <section className="mx-auto w-full max-w-6xl px-5 pt-12 pb-16 sm:pt-20 sm:pb-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="animate-fade-up text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground shadow-soft">
                <BuddyMark className="h-4 w-4" /> For South African Grade 9–12 pupils
              </span>

              <h1 className="mt-6 text-[2.6rem] leading-[1.05] font-extrabold tracking-tight sm:text-6xl lg:text-[4.1rem]">
                Your Future <span className="text-gradient-buddy">Starts Here.</span>
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
                Meet CareerBuddy — your AI career mentor for exploring subjects, careers
                and your future.
              </p>

              <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="group w-full rounded-full px-7 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow sm:w-auto"
                >
                  <Link to="/auth" search={{ mode: "signup" }}>
                    Start My Career Journey
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="w-full rounded-full px-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft sm:w-auto"
                >
                  <Link to="/auth">
                    <MessageCircle className="mr-2 h-4 w-4" /> Chat With CareerBuddy
                  </Link>
                </Button>
              </div>

              <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 text-center lg:mx-0 lg:text-left">
                {[
                  ["4", "Grades supported"],
                  ["24/7", "Always available"],
                  ["R0", "Free for pupils"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <dt className="font-display text-2xl font-extrabold text-foreground">
                      {value}
                    </dt>
                    <dd className="mt-1 text-xs text-muted-foreground">{label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Chat preview card */}
            <div className="animate-fade-up [animation-delay:120ms]">
              <div className="surface-card relative mx-auto max-w-md overflow-hidden p-5 transition-transform duration-500 hover:-translate-y-1">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <BuddyMark className="h-7 w-7" />
                  <span className="font-display text-sm font-bold">CareerBuddy</span>
                  <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
                    Online
                  </span>
                </div>
                <div className="space-y-3 pt-4 text-sm leading-relaxed">
                  <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-bubble-user px-4 py-2.5 text-bubble-user-foreground">
                    I'm in Grade 10 and I like Maths, but I don't know what to become.
                  </p>
                  <p className="w-fit max-w-[90%] rounded-2xl rounded-bl-md bg-muted px-4 py-2.5">
                    Great starting point! Maths opens doors to engineering, data science,
                    actuarial work and more. Which do you enjoy more — building things or
                    solving puzzles?
                  </p>
                  <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-bubble-user px-4 py-2.5 text-bubble-user-foreground">
                    Building things 🔧
                  </p>
                  <div className="flex w-fit items-center gap-1.5 rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-secondary [animation-delay:0ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-secondary [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-secondary [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What you get */}
        <section id="what-you-get" className="mx-auto w-full max-w-6xl px-5 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-highlight/20 px-3 py-1 text-xs font-bold tracking-wide text-foreground uppercase">
              <Sparkle className="h-3.5 w-3.5" /> What you get
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl">
              Real answers to the questions school doesn't cover
            </h2>
            <p className="mt-3 text-muted-foreground">
              Built around the South African school system, in language that actually
              makes sense.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                style={{ animationDelay: `${i * 80}ms` }}
                className="surface-card animate-fade-up group p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto w-full max-w-6xl px-5 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl sm:text-4xl">How it works</h2>
            <p className="mt-3 text-muted-foreground">
              Three simple steps — no forms, no jargon, no pressure.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                style={{ animationDelay: `${i * 90}ms` }}
                className="surface-card animate-fade-up relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow"
              >
                <span className="font-display text-5xl font-extrabold text-secondary/35">
                  {s.n}
                </span>
                <h3 className="mt-3 text-base">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Reassurance / FAQ */}
        <section id="faq" className="mx-auto w-full max-w-4xl px-5 py-16 sm:py-20">
          <div className="surface-card p-7 sm:p-10">
            <div className="flex items-start gap-4">
              <BuddyMark className="mt-1 h-10 w-10 shrink-0" />
              <div>
                <h2 className="text-2xl sm:text-3xl">
                  Not sure what you want to become? That's okay.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  CareerBuddy can help you figure it out — one friendly question at a
                  time. Whether you're picking Grade 10 subjects or finalising your
                  university applications in Grade 12, you'll get guidance that fits where
                  you are right now.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                ["Is it free?", "Yes — CareerBuddy is free for pupils."],
                ["Do I need my parents?", "No, but they're welcome to chat with you."],
                ["Which grades?", "Grade 9 through Grade 12."],
                ["Is my info private?", "Only your name, email and grade are stored."],
              ].map(([q, a]) => (
                <div
                  key={q}
                  className="rounded-2xl border border-border bg-muted/50 p-4 transition-colors duration-200 hover:bg-accent"
                >
                  <p className="font-display text-sm font-bold">{q}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto w-full max-w-4xl px-5 pb-20">
          <div className="surface-card relative overflow-hidden p-8 text-center sm:p-12">
            <div className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-secondary/20 blur-3xl" />
            <h2 className="relative text-3xl sm:text-4xl">
              Ready to explore <span className="text-gradient-buddy">your future?</span>
            </h2>
            <p className="relative mx-auto mt-3 max-w-lg text-muted-foreground">
              Create your free account and start chatting in under a minute.
            </p>
            <Button
              asChild
              size="lg"
              className="group relative mt-8 rounded-full px-8 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow"
            >
              <Link to="/auth" search={{ mode: "signup" }}>
                Start My Career Journey
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-5 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <BuddyWordmark />
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
            CareerBuddy is an AI mentor. Always double-check admission, bursary and course
            details with the institution.
          </p>
        </div>
      </footer>
    </div>
  );
}
