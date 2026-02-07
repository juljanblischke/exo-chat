"use client";

import { use } from "react";
import { ChatArea } from "@/components/layout/chat-area";

export default function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = use(params);
  return <ChatArea conversationId={conversationId} />;
}
