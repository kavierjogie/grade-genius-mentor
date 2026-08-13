import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTheme, type ThemeChoice } from "@/hooks/useTheme";
import { ChatShell } from "@/components/chat/ChatShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Account & settings — CareerBuddy SA" },
      {
        name: "description",
        content:
          "Update your preferred name, grade, language, theme and password, or delete your CareerBuddy SA account.",
      },
      { property: "og:title", content: "Account & settings — CareerBuddy SA" },
      {
        property: "og:description",
        content: "Manage your CareerBuddy SA account and security settings.",
      },
    ],
  }),
  component: SettingsPage,
});

const LANGUAGES = [
  "English",
  "Afrikaans",
  "isiZulu",
  "isiXhosa",
  "Sesotho",
  "Setswana",
  "Sepedi",
];

function SettingsPage() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [grade, setGrade] = useState(10);
  const [language, setLanguage] = useState("English");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setGrade(profile.grade);
      setLanguage(profile.preferred_language);
    }
  }, [profile]);

  const saveProfile = async () => {
    if (name.trim().length < 2) {
      toast.error("Please enter a name with at least 2 characters.");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim(), grade, preferred_language: language })
      .eq("id", user!.id);
    setSaving(false);
    if (error) {
      toast.error("We couldn't save your details. Please try again.");
      return;
    }
    await refreshProfile();
    toast.success("Saved.");
  };

  const changePassword = async () => {
    if (newPassword.length < 8) {
      toast.error("Your password must be at least 8 characters long.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error("We couldn't update your password. Please log in again and retry.");
      return;
    }
    setNewPassword("");
    toast.success("Password updated.");
  };

  const deleteAccount = async () => {
    // Removes all of the pupil's data; the login itself is removed with it.
    const { error } = await supabase.from("profiles").delete().eq("id", user!.id);
    if (error) {
      toast.error("We couldn't delete your data. Please try again.");
      return;
    }
    await supabase.from("conversations").delete().eq("user_id", user!.id);
    await signOut();
    toast.success("Your CareerBuddy data has been deleted.");
    void navigate({ to: "/" });
  };

  return (
    <ChatShell>
      <div className="mx-auto w-full max-w-2xl space-y-5 overflow-y-auto px-4 py-8">
        <h1 className="text-2xl">Account & settings</h1>

        <section className="surface-card space-y-4 p-5">
          <h2 className="text-lg">About you</h2>
          <div className="space-y-2">
            <Label htmlFor="name">Preferred name</Label>
            <Input
              id="name"
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Grade</Label>
            <div className="grid grid-cols-4 gap-2">
              {[9, 10, 11, 12].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  aria-pressed={grade === g}
                  className={cn(
                    "rounded-xl border px-2 py-2.5 text-sm font-semibold transition-colors",
                    grade === g
                      ? "border-secondary bg-secondary text-secondary-foreground"
                      : "border-border bg-card hover:bg-accent",
                  )}
                >
                  Grade {g}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Preferred language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              CareerBuddy will use simple English if it can't translate reliably.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["light", "dark", "system"] as ThemeChoice[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  aria-pressed={theme === t}
                  className={cn(
                    "rounded-xl border px-2 py-2.5 text-sm font-semibold capitalize transition-colors",
                    theme === t
                      ? "border-secondary bg-secondary text-secondary-foreground"
                      : "border-border bg-card hover:bg-accent",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={() => void saveProfile()} disabled={saving}>
            Save changes
          </Button>
        </section>

        <section className="surface-card space-y-4 p-5">
          <h2 className="text-lg">Security</h2>
          <p className="text-sm text-muted-foreground">
            Signed in as <strong>{user?.email}</strong>
          </p>
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>
          <Button variant="secondary" onClick={() => void changePassword()}>
            Update password
          </Button>
          <p className="text-xs text-muted-foreground">
            If you signed up with Google, keep using the “Continue with Google” button to
            log in.
          </p>
        </section>

        <section className="surface-card space-y-3 p-5">
          <h2 className="text-lg">Privacy</h2>
          <p className="text-sm text-muted-foreground">
            CareerBuddy only stores your name, email, grade, language and your chats.
            CareerBuddy will never ask for passwords, banking details or your home
            address.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete my account data</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your CareerBuddy data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes your profile and all of your conversations.
                  This can't be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => void deleteAccount()}>
                  Delete everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
      </div>
    </ChatShell>
  );
}
