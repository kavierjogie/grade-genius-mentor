import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BuddyWordmark } from "@/components/BuddyMark";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — CareerBuddy SA" },
      {
        name: "description",
        content: "Choose a new password for your CareerBuddy SA account.",
      },
      { property: "og:title", content: "Set a new password — CareerBuddy SA" },
      {
        property: "og:description",
        content: "Choose a new password for your CareerBuddy SA account.",
      },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Your password must be at least 8 characters long.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error("We couldn't update your password. Try requesting a new link.");
      return;
    }
    toast.success("Password updated.");
    void navigate({ to: "/chat" });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5">
      <div className="mb-6">
        <BuddyWordmark />
      </div>
      <form onSubmit={submit} className="surface-card w-full max-w-md space-y-4 p-6">
        <h1 className="text-xl">Set a new password</h1>
        <div className="space-y-2">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          Save new password
        </Button>
      </form>
    </main>
  );
}
