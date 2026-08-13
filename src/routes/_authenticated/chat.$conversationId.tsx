import { createFileRoute } from "@tanstack/react-router";
import { ChatShell } from "@/components/chat/ChatShell";
import { ChatView } from "@/components/chat/ChatView";

export const Route = createFileRoute("/_authenticated/chat/$conversationId")({
  head: () => ({
    meta: [
      { title: "Chat with CareerBuddy — CareerBuddy SA" },
      {
        name: "description",
        content:
          "Chat with CareerBuddy about your school subjects, career ideas and South African study pathways.",
      },
      { property: "og:title", content: "Chat with CareerBuddy — CareerBuddy SA" },
      {
        property: "og:description",
        content:
          "Your personal AI career mentor for Grade 9-12 pupils in South Africa.",
      },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { conversationId } = Route.useParams();

  return (
    <ChatShell activeConversationId={conversationId}>
      <ChatView key={conversationId} conversationId={conversationId} />
    </ChatShell>
  );
}
