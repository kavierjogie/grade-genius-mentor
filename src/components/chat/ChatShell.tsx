import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { History, LogOut, Plus, Settings, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BuddyWordmark } from "@/components/BuddyMark";
import { cn } from "@/lib/utils";

type Conversation = { id: string; title: string; updated_at: string };

export function useConversations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["conversations", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Conversation[]> => {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, title, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function ChatShell({
  children,
  activeConversationId,
}: {
  children: ReactNode;
  activeConversationId?: string;
}) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: conversations = [] } = useConversations();
  const [historyOpen, setHistoryOpen] = useState(false);

  const startNew = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title: "New conversation" })
      .select("id")
      .single();
    if (error || !data) {
      toast.error("We couldn't start a new conversation. Please try again.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["conversations", user.id] });
    setHistoryOpen(false);
    void navigate({
      to: "/chat/$conversationId",
      params: { conversationId: data.id },
    });
  };

  const deleteConversation = async (id: string) => {
    const { error } = await supabase.from("conversations").delete().eq("id", id);
    if (error) {
      toast.error("We couldn't delete that chat.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["conversations", user?.id] });
    if (id === activeConversationId) void navigate({ to: "/chat" });
  };

  const historyList = (
    <div className="space-y-1">
      {conversations.length === 0 && (
        <p className="px-2 py-6 text-sm text-muted-foreground">
          Your chats will appear here.
        </p>
      )}
      {conversations.map((c) => (
        <div
          key={c.id}
          className={cn(
            "group flex items-center gap-1 rounded-xl px-1",
            c.id === activeConversationId ? "bg-accent" : "hover:bg-accent/60",
          )}
        >
          <Link
            to="/chat/$conversationId"
            params={{ conversationId: c.id }}
            onClick={() => setHistoryOpen(false)}
            className="flex-1 truncate px-2 py-2.5 text-sm font-medium"
          >
            {c.title}
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${c.title}`}
            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            onClick={() => void deleteConversation(c.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex h-screen flex-col bg-background lg:flex-row">
      {/* Desktop history rail */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-sidebar p-4 lg:flex">
        <Link to="/chat" className="mb-5 px-1">
          <BuddyWordmark />
        </Link>
        <Button onClick={() => void startNew()} className="mb-4 w-full">
          <Plus className="mr-2 h-4 w-4" /> New conversation
        </Button>
        <p className="mb-1 px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Chat history
        </p>
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">{historyList}</div>
        <div className="mt-3 space-y-1 border-t border-border pt-3">
          <Button asChild variant="ghost" className="w-full justify-start">
            <Link to="/settings">
              <Settings className="mr-2 h-4 w-4" /> Account & settings
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              void signOut().then(() => navigate({ to: "/" }));
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Log out
          </Button>
          <p className="px-3 pt-1 text-xs text-muted-foreground">
            {profile?.name ? `${profile.name} · ` : ""}
            {profile ? `Grade ${profile.grade}` : ""}
          </p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b border-border bg-sidebar px-3 py-2.5 lg:hidden">
        <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Chat history">
              <History className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-4">
            <SheetHeader className="px-0">
              <SheetTitle className="text-left">Your chats</SheetTitle>
            </SheetHeader>
            <Button onClick={() => void startNew()} className="mb-3 w-full">
              <Plus className="mr-2 h-4 w-4" /> New conversation
            </Button>
            <div className="max-h-[60vh] overflow-y-auto">{historyList}</div>
            <div className="mt-4 space-y-1 border-t border-border pt-3">
              <Button asChild variant="ghost" className="w-full justify-start">
                <Link to="/settings" onClick={() => setHistoryOpen(false)}>
                  <Settings className="mr-2 h-4 w-4" /> Account & settings
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  void signOut().then(() => navigate({ to: "/" }));
                }}
              >
                <LogOut className="mr-2 h-4 w-4" /> Log out
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <Link to="/chat">
          <BuddyWordmark />
        </Link>

        <Button
          variant="ghost"
          size="icon"
          aria-label="New conversation"
          onClick={() => void startNew()}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </header>

      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
