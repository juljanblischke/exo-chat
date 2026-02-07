import * as signalR from "@microsoft/signalr";
import { getSession } from "next-auth/react";

const HUB_URL = process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:5000/hubs/chat";

let connection: signalR.HubConnection | null = null;

export type ConnectionState = "connected" | "reconnecting" | "disconnected";

export function getConnection(): signalR.HubConnection {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: async () => {
          const session = await getSession();
          return session?.accessToken ?? "";
        },
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          const delays = [0, 1000, 2000, 5000, 10000, 30000];
          return delays[Math.min(retryContext.previousRetryCount, delays.length - 1)] ?? 30000;
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();
  }
  return connection;
}

export function getConnectionState(): ConnectionState {
  if (!connection) return "disconnected";
  switch (connection.state) {
    case signalR.HubConnectionState.Connected:
      return "connected";
    case signalR.HubConnectionState.Reconnecting:
      return "reconnecting";
    default:
      return "disconnected";
  }
}

export async function startConnection(): Promise<void> {
  const conn = getConnection();
  if (conn.state === signalR.HubConnectionState.Disconnected) {
    await conn.start();
  }
}

export async function stopConnection(): Promise<void> {
  if (connection) {
    await connection.stop();
    connection = null;
  }
}

export async function joinConversation(conversationId: string): Promise<void> {
  const conn = getConnection();
  if (conn.state === signalR.HubConnectionState.Connected) {
    await conn.invoke("JoinConversation", conversationId);
  }
}

export async function leaveConversation(conversationId: string): Promise<void> {
  const conn = getConnection();
  if (conn.state === signalR.HubConnectionState.Connected) {
    await conn.invoke("LeaveConversation", conversationId);
  }
}

export async function sendTyping(conversationId: string): Promise<void> {
  const conn = getConnection();
  if (conn.state === signalR.HubConnectionState.Connected) {
    await conn.invoke("StartTyping", conversationId);
  }
}

export async function sendStopTyping(conversationId: string): Promise<void> {
  const conn = getConnection();
  if (conn.state === signalR.HubConnectionState.Connected) {
    await conn.invoke("StopTyping", conversationId);
  }
}

export async function markAsRead(
  conversationId: string,
  messageId: string
): Promise<void> {
  const conn = getConnection();
  if (conn.state === signalR.HubConnectionState.Connected) {
    await conn.invoke("MarkAsRead", conversationId, messageId);
  }
}

export async function initiateCallSignalR(
  conversationId: string,
  isVideo: boolean
): Promise<void> {
  const conn = getConnection();
  if (conn.state === signalR.HubConnectionState.Connected) {
    await conn.invoke("InitiateCall", conversationId, isVideo);
  }
}

export async function acceptCallSignalR(
  conversationId: string
): Promise<void> {
  const conn = getConnection();
  if (conn.state === signalR.HubConnectionState.Connected) {
    await conn.invoke("AcceptCall", conversationId);
  }
}

export async function rejectCallSignalR(
  conversationId: string
): Promise<void> {
  const conn = getConnection();
  if (conn.state === signalR.HubConnectionState.Connected) {
    await conn.invoke("RejectCall", conversationId);
  }
}

export async function endCallSignalR(
  conversationId: string
): Promise<void> {
  const conn = getConnection();
  if (conn.state === signalR.HubConnectionState.Connected) {
    await conn.invoke("EndCall", conversationId);
  }
}
