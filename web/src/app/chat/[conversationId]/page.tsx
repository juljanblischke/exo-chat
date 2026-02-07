import { ChatArea } from "@/components/layout/chat-area";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  // TODO: Load conversation data in Phase 3
  return <ChatArea />;
}
