import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";
import { Flag, Loader2, Mic, MicOff, Pause, Play, Square, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSpeechInput } from "@/hooks/useSpeechInput";
import { useReadAloud } from "@/hooks/useReadAloud";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { BuddyMark } from "@/components/BuddyMark";
import { cn } from "@/lib/utils";

const STARTERS = [
  "I don't know what career I want.",
  "What careers can I do with Mathematics?",
  "What can I become if I enjoy coding?",
  "Which subjects should I choose?",
  "What is the difference between university and TVET?",
  "I'm in Grade 12 and don't know what to study.",
];

type DbMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

function textOf(message: UIMessage) {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}

export function ChatView({ conversationId }: { conversationId: string }) {
  const { user, profile, session } = useAuth();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [dbIds, setDbIds] = useState<Record<string, string>>({});
  const titleSet = useRef(false);

  const { data: history, isLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async (): Promise<DbMessage[]> => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, role, content, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as DbMessage[];
    },
  });

  const initialMessages = useMemo<UIMessage[]>(
    () =>
      (history ?? []).map((m) => ({
        id: m.id,
        role: m.role,
        parts: [{ type: "text", text: m.content }],
      })),
    [history],
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: () => ({
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        }),
        body: () => ({
          name: profile?.name ?? "",
          grade: profile?.grade ?? 10,
          language: profile?.preferred_language ?? "English",
        }),
      }),
    [session?.access_token, profile?.name, profile?.grade, profile?.preferred_language],
  );

  const persist = useCallback(
    async (role: "user" | "assistant", content: string, uiId?: string) => {
      if (!user || !content) return;
      const { data } = await supabase
        .from("messages")
        .insert({ conversation_id: conversationId, user_id: user.id, role, content })
        .select("id")
        .single();
      if (data && uiId) {
        setDbIds((prev) => ({ ...prev, [uiId]: data.id }));
      }
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    },
    [conversationId, user],
  );

  const { messages, sendMessage, status, stop } = useChat({
    id: conversationId,
    messages: initialMessages,
    transport,
    onFinish: ({ message }) => {
      void persist("assistant", textOf(message), message.id);
    },
    onError: () => {
      toast.error(
        "CareerBuddy couldn't reply just now. Please check your connection and try again.",
      );
    },
  });

  const busy = status === "submitted" || status === "streaming";

  const speech = useSpeechInput((text) => setInput(text));
  const readAloud = useReadAloud(session?.access_token);

  const toggleReadAloud = (id: string, text: string) => {
    if (readAloud.activeId === id) {
      if (readAloud.state === "playing") return readAloud.pause();
      if (readAloud.state === "paused") return readAloud.resume();
      return;
    }
    void readAloud.play(id, text, () =>
      toast.error("CareerBuddy couldn't read that out loud. Please try again."),
    );
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput("");
    void persist("user", trimmed);

    if (!titleSet.current && messages.length === 0) {
      titleSet.current = true;
      const title = trimmed.length > 48 ? `${trimmed.slice(0, 48)}…` : trimmed;
      await supabase.from("conversations").update({ title }).eq("id", conversationId);
      await queryClient.invalidateQueries({ queryKey: ["conversations", user?.id] });
    }

    void sendMessage({ text: trimmed });
  };

  const report = async (uiMessageId: string) => {
    const messageId = dbIds[uiMessageId];
    if (!messageId) {
      toast.error("Please wait a moment and try reporting again.");
      return;
    }
    const { error } = await supabase
      .from("message_reports")
      .insert({ message_id: messageId, user_id: user!.id, reason: "Reported by pupil" });
    if (error) {
      toast.error("We couldn't send your report. Please try again.");
      return;
    }
    toast.success("Thanks for reporting this reply. We'll review it.");
  };

  const greetingName = profile?.name ?? "there";
  const grade = profile?.grade ?? 10;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="mx-auto w-full max-w-3xl px-4 pt-6 pb-2">
          {/* Greeting */}
          {!isLoading && (
            <div className="mb-6 flex gap-3">
              <BuddyMark className="mt-1 h-8 w-8 shrink-0" />
              <div className="space-y-3 text-sm leading-relaxed sm:text-base">
                <p>
                  Hi {greetingName}! 👋 I'm CareerBuddy, your AI career mentor.
                </p>
                <p>
                  I can help you explore careers, understand your school subjects, learn
                  about qualifications and plan your next steps. Since you're in Grade{" "}
                  {grade}, we can start with careers that match your interests and
                  subjects.
                </p>
                <p className="font-semibold">What subjects do you enjoy most?</p>
              </div>
            </div>
          )}

          {messages.length === 0 && !isLoading && (
            <div className="mb-4 grid gap-2 sm:grid-cols-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => void send(s)}
                  className={cn(
                    "rounded-2xl border border-border bg-card px-4 py-3 text-left text-sm font-medium transition-colors hover:border-secondary hover:bg-accent",
                    s.startsWith("I don't know") && "border-highlight bg-highlight/15",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {messages.map((message) => {
            const text = textOf(message);
            if (!text) return null;
            return (
              <Message from={message.role} key={message.id}>
                <MessageContent
                  className={cn(
                    message.role === "user"
                      ? "bg-bubble-user text-bubble-user-foreground"
                      : "bg-transparent p-0 text-foreground",
                  )}
                >
                  <MessageResponse>{text}</MessageResponse>
                  {message.role === "assistant" && (
                    <MessageActions className="mt-1 flex items-center gap-1">
                      {(() => {
                        const active = readAloud.activeId === message.id;
                        const state = active ? readAloud.state : "idle";
                        const label =
                          state === "loading"
                            ? "Preparing audio"
                            : state === "playing"
                              ? "Pause reading"
                              : state === "paused"
                                ? "Continue reading"
                                : "Read this reply aloud";
                        return (
                          <>
                            <MessageAction
                              tooltip={label}
                              label={label}
                              onClick={() => toggleReadAloud(message.id, text)}
                              className={cn(
                                "transition-all duration-200",
                                active && "text-secondary-foreground bg-secondary/25",
                              )}
                            >
                              {state === "loading" ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : state === "playing" ? (
                                <Pause className="h-4 w-4" />
                              ) : state === "paused" ? (
                                <Play className="h-4 w-4" />
                              ) : (
                                <Volume2 className="h-4 w-4" />
                              )}
                            </MessageAction>
                            {active && state !== "idle" && (
                              <>
                                <MessageAction
                                  tooltip="Stop reading"
                                  label="Stop reading"
                                  onClick={readAloud.stop}
                                >
                                  <Square className="h-4 w-4" />
                                </MessageAction>
                                <span className="text-[11px] font-medium text-muted-foreground">
                                  {state === "loading"
                                    ? "Preparing…"
                                    : state === "playing"
                                      ? "Reading aloud…"
                                      : "Paused"}
                                </span>
                              </>
                            )}
                          </>
                        );
                      })()}
                      <MessageAction
                        tooltip="Report this reply"
                        label="Report this reply"
                        onClick={() => void report(message.id)}
                      >
                        <Flag className="h-4 w-4" />
                      </MessageAction>
                    </MessageActions>
                  )}
                </MessageContent>
              </Message>
            );
          })}

          {status === "submitted" && (
            <div className="flex items-center gap-3 py-2">
              <BuddyMark className="h-7 w-7" />
              <Shimmer className="text-sm">CareerBuddy is thinking...</Shimmer>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="sticky bottom-0 border-t border-border bg-background/95 px-4 pt-3 pb-4 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl">
          <PromptInput
            onSubmit={(message, event) => {
              event.preventDefault();
              void send(message.text || input);
            }}
          >
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask CareerBuddy about subjects, careers or your next steps..."
            />
            <PromptInputFooter className="justify-between">
              <div className="flex items-center gap-2">
                {speech.supported && (
                  <Button
                    type="button"
                    variant={speech.listening ? "default" : "ghost"}
                    size="icon-sm"
                    aria-label={speech.listening ? "Stop recording" : "Speak your message"}
                    onClick={speech.toggle}
                  >
                    {speech.listening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                )}
                {speech.listening && (
                  <span className="text-xs font-medium text-muted-foreground">
                    Listening... speak now
                  </span>
                )}
              </div>
              <PromptInputSubmit status={status} onStop={stop} disabled={!input.trim() && !busy} />
            </PromptInputFooter>
          </PromptInput>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            CareerBuddy is an AI mentor and can make mistakes. Always check admission,
            course and bursary details with the institution.
          </p>
        </div>
      </div>
    </div>
  );
}
