import * as signalR from "@microsoft/signalr";

const HUB_URL = process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:5000/hubs/chat";

let connection: signalR.HubConnection | null = null;

export function getConnection(): signalR.HubConnection {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        // TODO: Add access token factory in Phase 2
        // accessTokenFactory: () => getAuthToken(),
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();
  }
  return connection;
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
