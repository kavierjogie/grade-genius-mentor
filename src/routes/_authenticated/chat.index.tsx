import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BuddyMark } from "@/components/BuddyMark";

export const Route = createFileRoute("/_authenticated/chat/")({
  component: ChatEntry,
});

/** Opens the pupil's most recent conversation, or starts a new one. */
function ChatEntry() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const started = useRef(false);

  useEffect(() => {
    if (!user || started.current) return;
    started.current = true;

    void (async () => {
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1);

      const existingId = existing?.[0]?.id;
      if (existingId) {
        void navigate({
          to: "/chat/$conversationId",
          params: { conversationId: existingId },
          replace: true,
        });
        return;
      }

      const { data, error } = await supabase
        .from("conversations")
        .insert({ user_id: user.id, title: "New conversation" })
        .select("id")
        .single();

      if (error || !data) {
        toast.error("We couldn't start a conversation. Please try again.");
        return;
      }
      void navigate({
        to: "/chat/$conversationId",
        params: { conversationId: data.id },
        replace: true,
      });
    })();
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <BuddyMark className="h-12 w-12 animate-pulse" />
    </div>
  );
}
