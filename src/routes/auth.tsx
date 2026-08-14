import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BuddyMark, BuddyWordmark } from "@/components/BuddyMark";
import { GoogleIcon } from "@/components/GoogleIcon";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  mode: z.enum(["login", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Log in or sign up — CareerBuddy SA" },
      {
        name: "description",
        content:
          "Create your free CareerBuddy SA account, choose your grade and start chatting with your AI career mentor.",
      },
      { property: "og:title", content: "Log in or sign up — CareerBuddy SA" },
      {
        property: "og:description",
        content: "Create a CareerBuddy SA account and pick your grade to get started.",
      },
    ],
  }),
  component: AuthPage,
});

const GRADES = [9, 10, 11, 12] as const;

const signupSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(60),
  email: z.string().trim().email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Your password must be at least 8 characters long.")
    .max(72),
  grade: z.number(),
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">(mode ?? "login");
  const [busy, setBusy] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  // login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // signup state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [grade, setGrade] = useState<number>(10);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/chat" });
  }, [loading, user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    });
    setBusy(false);
    if (error) {
      toast.error("That email or password is incorrect.");
      return;
    }
    void navigate({ to: "/chat" });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ name, email, password, grade });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/chat`,
        data: { name: parsed.data.name, grade: parsed.data.grade },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(
        error.message.toLowerCase().includes("already")
          ? "That email is already registered. Try logging in."
          : "We couldn't create your account. Please check your details and try again.",
      );
      return;
    }
    if (!data.session) {
      setConfirmSent(true);
      return;
    }
    void navigate({ to: "/chat" });
  };

  const handleGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in didn't work. Please try again.");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/chat" });
  };

  const handleReset = async () => {
    const parsed = z.string().email().safeParse(loginEmail.trim());
    if (!parsed.success) {
      toast.error("Please enter a valid email address first.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error("We couldn't send the reset email. Please try again later.");
      return;
    }
    toast.success("Check your email for a link to reset your password.");
  };

  if (confirmSent) {
    return (
      <Shell>
        <div className="surface-card animate-fade-up p-7 text-center">
          <h1 className="text-xl">Almost there! 📧</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            We sent a confirmation link to <strong>{email}</strong>. Click it to confirm
            your email, then come back and log in.
          </p>
          <Button className="mt-5 w-full rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow" onClick={() => setConfirmSent(false)}>
            Back to login
          </Button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
        <TabsList className="grid w-full grid-cols-2 rounded-full bg-muted p-1">
          <TabsTrigger
            value="login"
            className="rounded-full text-sm font-semibold transition-all duration-200"
          >
            Log in
          </TabsTrigger>
          <TabsTrigger
            value="signup"
            className="rounded-full text-sm font-semibold transition-all duration-200"
          >
            Sign up
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <form onSubmit={handleLogin} className="surface-card animate-fade-up space-y-4 p-6 sm:p-7">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-full shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow"
              disabled={busy}
            >
              Log in
            </Button>
            <button
              type="button"
              onClick={handleReset}
              className="w-full text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              Forgot your password?
            </button>
            <GoogleButton onClick={handleGoogle} disabled={busy} />
          </form>
        </TabsContent>

        <TabsContent value="signup">
          <form onSubmit={handleSignup} className="surface-card animate-fade-up space-y-4 p-6 sm:p-7">
            <div className="space-y-2">
              <Label htmlFor="name">What should CareerBuddy call you?</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name or nickname"
                maxLength={60}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Use at least 8 characters.
              </p>
            </div>

            <div className="space-y-2">
              <Label>What grade are you currently in?</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {GRADES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGrade(g)}
                    aria-pressed={grade === g}
                    className={cn(
                      "rounded-2xl border px-3 py-3 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5",
                      grade === g
                        ? "border-secondary bg-secondary text-secondary-foreground shadow-soft"
                        : "border-border bg-card text-foreground hover:border-secondary hover:bg-accent",
                    )}
                  >
                    Grade {g}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-full shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow"
              disabled={busy}
            >
              Start My Career Journey
            </Button>
            <GoogleButton onClick={handleGoogle} disabled={busy} />
            <p className="text-center text-xs text-muted-foreground">
              We only ask for what we need: your name, email and grade.
            </p>
          </form>
        </TabsContent>
      </Tabs>
    </Shell>
  );
}

function GoogleButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2 rounded-full font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent hover:shadow-soft"
        onClick={onClick}
        disabled={disabled}
      >
        <GoogleIcon className="h-[18px] w-[18px]" />
        Continue with Google
      </Button>
    </>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-5 py-12">
      <div className="pointer-events-none absolute -top-40 -right-32 h-96 w-96 rounded-full bg-secondary/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-28 h-80 w-80 rounded-full bg-highlight/20 blur-3xl" />

      <Link
        to="/"
        className="relative mb-3 transition-transform duration-200 hover:scale-[1.03]"
      >
        <BuddyWordmark />
      </Link>
      <p className="relative mb-7 flex items-center gap-2 text-center text-sm text-muted-foreground">
        <BuddyMark className="h-4 w-4" /> Your AI career mentor for Grade 9–12
      </p>
      <div className="relative w-full max-w-md space-y-4">{children}</div>
    </main>
  );
}
