import http from "../lib/http";

export type ChatUser = {
  id: number;
  username: string;
  email: string;
  role?: string;
  profile_picture?: string | null;
};

export type Room = {
  id: number;
  participants: ChatUser[];
  created_at: string;
  unread_count?: number;
};

export type Message = {
  id: number;
  room: number;
  sender: string | { id: number; username: string; email: string; role?: string };
  content: string;
  timestamp: string;
  read: boolean;
  // Optional fields echoed during optimistic reconciliation and server broadcasts
  client_id?: string;
  action?: "update" | "delete";
};

export async function listRooms(): Promise<Room[]> {
  const res = await http.get<Room[]>("/chat/rooms/");
  return res.data;
}

export async function listMessages(roomId: number): Promise<Message[]> {
  const res = await http.get<Message[]>(`/chat/rooms/${roomId}/messages/`);
  return res.data;
}

export async function sendMessage(recipientId: number, content: string, clientId?: string) {
  const res = await http.post("/chat/messages/send/", {
    recipient_id: recipientId,
    content,
    client_id: clientId,
  });
  return res.data as { room: Room; message: Message };
}

export async function editMessage(messageId: number, content: string) {
  const res = await http.patch(`/chat/messages/${messageId}/`, { content });
  return res.data as Message;
}

export async function deleteMessage(messageId: number) {
  await http.delete(`/chat/messages/${messageId}/`);
}

export function getWsUrl(roomId: number) {
  const base = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
  // derive origin without trailing /api
  const url = new URL(base);
  const wsProtocol = url.protocol === "https:" ? "wss:" : "ws:";
  const tokenKey = import.meta.env.VITE_AUTH_TOKEN_KEY || "accessToken";
  let token = localStorage.getItem(tokenKey) || "";
  const lower = token.toLowerCase();
  if (lower.startsWith("bearer ")) {
    token = token.slice(7).trim();
  } else if (lower.startsWith("token ")) {
    token = token.slice(6).trim();
  }
  const origin = `${wsProtocol}//${url.host}`;
  return `${origin}/ws/chat/${roomId}/?token=${encodeURIComponent(token)}`;
}
