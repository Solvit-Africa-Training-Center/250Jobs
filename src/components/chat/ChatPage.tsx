import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { listRooms, listMessages, sendMessage, editMessage, deleteMessage, type Message, type Room, getWsUrl } from "../../api/chat";
import { listTechnicians } from "../../api/employers";
import type { TechnicianMini, Paginated } from "../../types/employer";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import { useTheme } from "../context/ThemeContext";

type Participant = Room["participants"][number];

function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listRooms();
      setRooms(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    refresh();
  }, []);
  return { rooms, loading, error, refresh, setRooms };
}

function ChatPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRecipientRaw = useMemo(() => {
    const v =
      searchParams.get("recipient") ||
      searchParams.get("recipient_id") ||
      searchParams.get("user") ||
      searchParams.get("user_id");
    return v ?? undefined;
  }, [searchParams]);
  const initialRecipientId = useMemo(() => {
    if (!initialRecipientRaw) return undefined;
    const n = Number(initialRecipientRaw);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [initialRecipientRaw]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const editInputRef = useRef<HTMLInputElement | null>(null);
  const [editEmojiOpen, setEditEmojiOpen] = useState(false);
  const [bubbleMenuId, setBubbleMenuId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [wsError, setWsError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { rooms, loading, error, refresh, setRooms } = useRooms();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const pollRef = useRef<number | null>(null);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [q, setQ] = useState("");
  const [techs, setTechs] = useState<Paginated<TechnicianMini> | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  // Emoji picker state
  const [emojiOpen, setEmojiOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  // Build emojis via code points to avoid encoding issues
  const commonEmojiCodes = [
    0x1f600, 0x1f601, 0x1f602, 0x1f923, 0x1f60a, 0x1f60d, 0x1f618, 0x1f60e, 0x1f929, 0x1f973,
    0x1f607, 0x1f643, 0x1f609, 0x1f917, 0x1f914, 0x1f634, 0x1f62d, 0x1f621, 0x1f44d, 0x1f44e,
    0x1f64f, 0x1f44f, 0x1f525, 0x2728,   0x1f389, 0x2764,   0x1f494, 0x1f525, 0x1f4af, 0x2705,
    0x274c
  ];
  const commonEmojis = useMemo(() => commonEmojiCodes.map((cp) => String.fromCodePoint(cp)), []);
  // Call (WebRTC) state
  const [callOpen, setCallOpen] = useState(false);
  const [callType, setCallType] = useState<"audio" | "video">("video");
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const currentUserId = useMemo(() => {
    if (user?.id) return user.id;
    const raw = localStorage.getItem("authUserId");
    return raw ? Number(raw) : undefined;
  }, [user?.id]);
  const currentUsername = useMemo(() => (user?.username || "").toLowerCase(), [user?.username]);
  // Total unread rooms count to display in left header
  const unreadRoomsCount = useMemo(() => {
    try {
      return rooms.reduce((acc: number, r: any) => acc + ((r?.unread_count || 0) > 0 ? 1 : 0), 0);
    } catch { return 0; }
  }, [rooms]);

  const counterpartOf = (room: Room): Participant | undefined => {
    if (!currentUserId) return room.participants[0];
    return room.participants.find((p) => p.id !== currentUserId) || room.participants[0];
  };

  useEffect(() => {
    if (selectedRoom) {
      (async () => {
        try {
          const data = await listMessages(selectedRoom.id);
          setMessages(data);
          // reflect read locally in the rooms list without refetch
          setRooms((prev) => prev.map((r: any) => (r.id === selectedRoom.id ? { ...r, unread_count: 0 } : r)));
          try { window.dispatchEvent(new Event('chat:read')); } catch {}
        } catch (e: any) {
          setMessages([]);
        }
      })();
    } else {
      setMessages([]);
    }
  }, [selectedRoom?.id]);

  useEffect(() => {
    if (!selectedRoom) return;
    const wsUrl = getWsUrl(selectedRoom.id);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    setWsError(null);

    ws.onmessage = (evt) => {
      try {
        const payload = JSON.parse(evt.data) as any;
        // Handle signaling messages for calls
        if (payload && payload.signal) {
          handleSignal(payload.signal);
          return;
        }
        setMessages((prev) => {
          const pAny: any = payload as any;
          // Handle server-driven updates/deletes
          if (pAny.action === "update") {
            return prev.map((m: any) => (m.id === pAny.id ? { ...(m as any), ...pAny } : m));
          }
          if (pAny.action === "delete") {
            return prev.filter((m) => m.id !== pAny.id);
          }
          // Remove any pending optimistic that matches this payload
          let next = prev;
          if (pAny.client_id) {
            next = next.filter((m: any) => !(m?.pending && m.client_id && m.client_id === pAny.client_id));
          } else {
            next = next.filter((m: any) => !(m?.pending && m.room === (payload as any).room && m.content === (payload as any).content));
          }
          // Avoid duplicates by id
          if (next.some((m) => m.id === (payload as any).id)) return next;
          return [...next, payload];
        });
      } catch {
        // ignore malformed
      }
    };
    ws.onerror = () => setWsError("Realtime connection error");
    ws.onclose = () => {
      // start polling fallback if ws not open
      if (!pollRef.current) {
        pollRef.current = window.setInterval(async () => {
          try {
            const data = await listMessages(selectedRoom.id);
            setMessages(data);
          } catch {}
        }, 3000);
      }
    };

    return () => {
      try { ws.close(); } catch {}
      wsRef.current = null;
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [selectedRoom?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const runSearch = async () => {
    setSearching(true);
    setSearchError(null);
    try {
      const res = await listTechnicians(q ? { search: q, page_size: 12 } : { page_size: 12 });
      setTechs(res);
    } catch (e: any) {
      setSearchError(e?.message || "Failed to search technicians");
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    // If page opened with recipient param and user is an employer, attempt lazy-create on first send.
    if (!initialRecipientId) return;
    const existing = rooms.find((r) => r.participants.some((p) => p.id === initialRecipientId));
    if (existing) setSelectedRoom(existing);
  }, [initialRecipientId, rooms]);

  const canSend = !!(selectedRoom || initialRecipientId);

  // Context menu/popover removed per request; using inline kebab per message

  const doEdit = async () => {
    if (!editingId) return;
    const newText = editingText.trim();
    if (!newText) return;
    // optimistic update
    setMessages((prev) => prev.map((m) => (m.id === editingId ? { ...m, content: newText } : m)));
    setEditingId(null);
    try {
      await editMessage(editingId, newText);
    } catch (e) {
      // On error, could refetch room messages or show toast; keep optimistic for now
    }
  };

  // Emoji insert for inline edit input
  const insertEmojiToEdit = (emoji: string) => {
    const el = editInputRef.current;
    if (!el) {
      setEditingText((v) => (v || "") + emoji);
      setEditEmojiOpen(false);
      return;
    }
    const start = el.selectionStart ?? (editingText?.length || 0);
    const end = el.selectionEnd ?? (editingText?.length || 0);
    const base = editingText || "";
    const next = base.slice(0, start) + emoji + base.slice(end);
    setEditingText(next);
    setTimeout(() => {
      try { el.focus(); el.setSelectionRange(start + emoji.length, start + emoji.length); } catch {}
    }, 0);
    setEditEmojiOpen(false);
  };

  const doDelete = async (msg: Message) => {
    // If this is an optimistic pending message (no real id), just remove locally
    if ((msg as any).pending) {
      setMessages((prev) => prev.filter((m) => m !== msg));
      return;
    }
    // optimistic remove
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    try {
      await deleteMessage(msg.id);
    } catch (e) {
      // On error, fallback to refresh
      try { if (selectedRoom) setMessages(await listMessages(selectedRoom.id)); } catch {}
    }
  };

  // Emoji helpers
  const insertEmoji = (emoji: string) => {
    const el = inputRef.current;
    if (!el) {
      setInput((v) => v + emoji);
      // Close the emoji panel after selection
      setEmojiOpen(false);
      return;
    }
    const start = el.selectionStart ?? input.length;
    const end = el.selectionEnd ?? input.length;
    const next = input.slice(0, start) + emoji + input.slice(end);
    setInput(next);
    setTimeout(() => {
      try { el.focus(); el.setSelectionRange(start + emoji.length, start + emoji.length); } catch {}
    }, 0);
    // Close the emoji panel after selection
    setEmojiOpen(false);
  };

  // WebRTC helpers
  const ensurePc = () => {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection({ iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }] });
    pc.onicecandidate = (e) => {
      if (e.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ signal: { type: "ice-candidate", candidate: e.candidate } }));
      }
    };
    pc.ontrack = (e) => {
      const [stream] = e.streams;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
    };
    pcRef.current = pc;
    return pc;
  };

  const startCall = async (type: "audio" | "video") => {
    setCallType(type);
    setCallOpen(true);
    const pc = ensurePc();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: type === "video" });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    wsRef.current?.send(JSON.stringify({ signal: { type: "offer", sdp: offer.sdp, media: type } }));
  };

  const handleSignal = async (signal: any) => {
    const pc = ensurePc();
    if (signal.type === "offer") {
      setCallType(signal.media === "audio" ? "audio" : "video");
      setCallOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: signal.media !== "audio" });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      await pc.setRemoteDescription({ type: "offer", sdp: signal.sdp });
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      wsRef.current?.send(JSON.stringify({ signal: { type: "answer", sdp: answer.sdp } }));
    } else if (signal.type === "answer") {
      await pc.setRemoteDescription({ type: "answer", sdp: signal.sdp });
    } else if (signal.type === "ice-candidate" && signal.candidate) {
      try { await pc.addIceCandidate(signal.candidate); } catch {}
    } else if (signal.type === "hangup") {
      endCall();
    }
  };

  const endCall = () => {
    try { wsRef.current?.send(JSON.stringify({ signal: { type: "hangup" } })); } catch {}
    try { pcRef.current?.getSenders().forEach((s) => s.track && s.track.stop()); } catch {}
    try { localStreamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
    try { pcRef.current?.close(); } catch {}
    pcRef.current = null;
    localStreamRef.current = null;
    setCallOpen(false);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    if (!canSend) {
      setWsError("Pick a chat on the left or open from a Message button.");
      return;
    }
    // Clear input immediately for snappy UX
    setInput("");
    setSending(true);
    try {
      if (selectedRoom && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        // Optimistically append a pending message for instant UI feedback
        const nowIso = new Date().toISOString();
        const clientId = Math.random().toString(36).slice(2);
        const optimistic: any = {
          id: Number.NEGATIVE_INFINITY + Math.random(), // temp id
          room: selectedRoom.id,
          sender: user?.id ? { id: user.id, username: user.username || "", email: user.email || "" } : (user?.username || "me"),
          content: text,
          timestamp: nowIso,
          read: true,
          pending: true,
          client_id: clientId,
        };
        setMessages((prev) => {
          // If a non-pending message with same content already exists (race), skip adding optimistic
          if (prev.some((m: any) => !m?.pending && m.room === selectedRoom.id && m.content === text)) return prev;
          return [...prev, optimistic];
        });
        wsRef.current.send(JSON.stringify({ content: text, client_id: clientId }));
      } else if (selectedRoom) {
        // Fallback: WS not connected; send via HTTP using counterpart id
        const cp = counterpartOf(selectedRoom);
        if (!cp?.id) throw new Error("Recipient not determined");
        const nowIso = new Date().toISOString();
        const clientId = Math.random().toString(36).slice(2);
        const optimistic: any = {
          id: Number.NEGATIVE_INFINITY + Math.random(),
          room: selectedRoom.id,
          sender: user?.id ? { id: user.id, username: user.username || "", email: user.email || "" } : (user?.username || "me"),
          content: text,
          timestamp: nowIso,
          read: true,
          pending: true,
          client_id: clientId,
        };
        setMessages((prev) => [...prev, optimistic]);
        const res = await sendMessage(cp.id, text, clientId);
        // Replace optimistic with the real message
        setMessages((prev) => {
          const idx = (prev as any[]).findIndex((m: any) => m?.pending && m.client_id === clientId);
          if (idx === -1) return prev;
          const next = prev.slice();
          (next as any[])[idx] = res.message as any;
          return next;
        });
      } else {
        // No room selected or WS not open. If a recipient is provided in URL, try HTTP send which creates room when allowed.
        if (!initialRecipientId) throw new Error("Recipient not provided");
        const res = await sendMessage(initialRecipientId, text);
        // Ensure this room appears and is selected
        const newRoom = res.room;
        // Optimistically insert or update
        setRooms((prev) => {
          const exists = prev.some((r) => r.id === newRoom.id);
          return exists ? prev.map((r) => (r.id === newRoom.id ? newRoom : r)) : [newRoom, ...prev];
        });
        setSelectedRoom(newRoom);
        setMessages((prev) => [...prev, res.message]);
      }
    } catch (e: any) {
      setWsError(e?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex justify-center pt-24 px-6 pb-24">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white border border-gray-200 rounded-2xl p-4 md:col-span-1 h-[70vh] flex flex-col">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Messages</h2>
            </div>
            <div className="flex gap-2">
              {user?.role?.toLowerCase() === "employer" && (
                <Button variant="outline" onClick={() => { setNewChatOpen(true); setTechs(null); setQ(""); }}>New Chat</Button>
              )}
            </div>
          </div>
         
          {error && <div className="text-red-600">{error}</div>}
          <div className="overflow-y-auto divide-y divide-gray-200">
            {rooms.map((room) => {
              const cp = counterpartOf(room);
              const unread = (room as any).unread_count as number | undefined;
              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
className={`w-full text-left p-3 hover:bg-blue-50 transition ${
  selectedRoom?.id === room.id ? "bg-blue-50" : ""
}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                      {(cp?.username || cp?.email || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                     <div className="font-medium text-gray-900">{cp?.username || cp?.email || "Unknown"}</div>
                      {typeof unread === 'number' && unread > 0 && (
                        <span className="text-xs text-white bg-red-500 rounded-full px-2 py-0.5">{unread}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
            {!loading && rooms.length === 0 && (
              <div className="text-gray-500 text-sm p-3">No conversations yet.</div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 md:col-span-2 h-[70vh] flex flex-col">
          {selectedRoom ? (
            <>
              <div className="border-b border-gray-200 pb-3 mb-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-900">{counterpartOf(selectedRoom)?.username || counterpartOf(selectedRoom)?.email || "Conversation"}</div>
                <div className="flex gap-2">
  <Button 
    variant="secondary" 
    onClick={() => startCall("audio")}
    className="text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
  >
    Audio Call
  </Button>
  <Button 
    variant="secondary" 
    onClick={() => startCall("video")}
    className="text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
  >
    Video Call
  </Button>
</div>

                </div>
                {/* Removed room id label */}
                {wsError && <div className="text-xs text-red-600 mt-1">{wsError}</div>}
              </div>
              <div className="flex-1 overflow-y-auto space-y-3">
                {messages.map((m) => {
                  const senderIsString = typeof m.sender === "string";
                  const senderId = senderIsString ? undefined : (m.sender as any)?.id;
                  const senderUsername = senderIsString ? String(m.sender).toLowerCase() : String((m.sender as any)?.username || "").toLowerCase();
                  const mine = (currentUserId !== undefined && senderId === currentUserId) || (!!currentUsername && senderUsername === currentUsername);
                  return (
                   <div
  key={m.id}
  className={`flex ${mine ? "justify-end" : "justify-start"}`}
>
  <div
    className={`group relative max-w-[80%] rounded-lg px-3 py-2 ${
      mine ? "bg-blue-100 dark:bg-blue-800" : "bg-gray-100 dark:bg-gray-800"
    } border border-gray-200 dark:border-gray-600`} // Adjust or remove border as needed
    onClick={mine ? (() => setBubbleMenuId((id) => (id === m.id ? null : m.id))) : undefined}
  >
    {mine && bubbleMenuId === m.id && (
      <div className="absolute top-5 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow text-sm z-50 min-w-[140px]">
        <button
          className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
          onClick={(e) => {
            e.stopPropagation();
            setEditingId(m.id);
            setEditingText(m.content);
            setBubbleMenuId(null);
          }}
        >
          Edit
        </button>
        <button
          className="block w-full text-left px-3 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={(e) => {
            e.stopPropagation();
            setBubbleMenuId(null);
            doDelete(m);
          }}
        >
          Delete
        </button>
      </div>
    )}
    {editingId === m.id ? (
      <div className="flex items-center gap-2">
        <button
          className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 emoji-font"
          title="Insert emoji"
          onClick={(e) => {
            e.stopPropagation();
            setEditEmojiOpen((v) => !v);
          }}
        >
          {commonEmojis[0] || "😊"}
        </button>
        <input
          ref={editInputRef}
          className="flex-1 bg-white/70 dark:bg-gray-800/70 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm text-gray-900 dark:text-white emoji-font"
          value={editingText}
          onChange={(e) => setEditingText(e.target.value)}
          onFocus={() => setEditEmojiOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") doEdit();
            if (e.key === "Escape") setEditingId(null);
          }}
          autoFocus
        />
        <button
          className="text-xs text-blue-700 dark:text-blue-300 font-medium"
          onClick={doEdit}
        >
          Save
        </button>
        <button
          className="text-xs text-gray-600 dark:text-gray-300"
          onClick={() => setEditingId(null)}
        >
          Cancel
        </button>
        {editEmojiOpen && (
          <div className="absolute -top-2 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow p-2 z-50">
            <div className="flex flex-wrap gap-1 max-w-[220px]">
              {commonEmojis.map((em, idx) => (
                <button
                  key={idx}
                  className="text-xl emoji-font"
                  title={em}
                  onClick={(e) => {
                    e.stopPropagation();
                    insertEmojiToEdit(em);
                  }}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    ) : (
      <>
        <div
          className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap"
          style={{
            fontFamily:
              "system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji',sans-serif",
          }}
        >
          {m.content}
        </div>
        <div className="text-[10px] text-gray-500 dark:text-gray-300 mt-1">
          {new Date(m.timestamp).toLocaleString()}
        </div>
      </>
    )}
  </div>
</div>
                  );
                })}
                {messages.length === 0 && (
                  <div className="text-gray-500 text-sm">No messages yet. Say hello!</div>
                )}
                <div ref={bottomRef} />
              </div>
              <div className="pt-3 mt-3 border-t border-gray-200 flex gap-2 items-center">
                <button
                  className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                  title="Insert emoji"
                  onClick={() => setEmojiOpen((v) => !v)}
                >😊</button>
                <input
                  className="flex-1 bg-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 emoji-font"
                  placeholder="Type a message"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => setEmojiOpen(false)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                  ref={inputRef}
                />
                <Button onClick={handleSend} loading={sending} disabled={!canSend}>Send</Button>
              </div>
              {emojiOpen && (
                <div className="mt-2 p-2 border border-gray-200 rounded-lg bg-white max-w-md">
                  <div className="flex flex-wrap gap-2">
                    {commonEmojis.map((em, idx) => (
                      <button
                        key={idx}
                        className="text-2xl"
                        style={{ fontFamily: "'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji','Twemoji Mozilla','EmojiOne Color','Segoe UI Symbol','Android Emoji',sans-serif" }}
                        onClick={() => insertEmoji(em)}
                        title={em}
                      >{em}</button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm text-center px-6">
              <div>
                <p className="mb-2 font-medium text-gray-700">Select a conversation to start chatting</p>
                {initialRecipientId ? (
                  <p className="text-xs text-gray-500">New chat with user #{initialRecipientId}. Type your first message.</p>
                ) : user?.role?.toLowerCase() === "employer" ? (
                  <p className="text-xs text-gray-500">To start a new chat, use a Message button (e.g., from Applications).</p>
                ) : null}
                {wsError && <div className="text-xs text-red-600 mt-2">{wsError}</div>}
                <div className="pt-3 flex gap-2">
                  <input
                    className="flex-1 bg-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 emoji-font"
                    placeholder={initialRecipientId ? `Message to user #${initialRecipientId}` : "Pick a chat on the left"}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                  />
                  <Button onClick={handleSend} loading={sending} disabled={!initialRecipientId}>Send</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {bubbleMenuId !== null && (
        <div className="fixed inset-0 z-40" onClick={() => setBubbleMenuId(null)} />
      )}
      {/* Action popover removed per request */}

      {/* New Chat Modal (employer only) */}
      <Modal open={newChatOpen} onClose={() => setNewChatOpen(false)} title="Start a new chat">
        <div className="space-y-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                label="Search technicians"
                placeholder="Name, location, skill..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }}
              />
            </div>
            <Button variant="outline" onClick={runSearch} loading={searching}>Search</Button>
          </div>
          {searchError && <div className="text-sm text-red-600">{searchError}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
            {(techs?.results || []).map((t, idx) => (
              <button
                key={idx}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 transition text-left w-full"
                onClick={() => {
                  setNewChatOpen(false);
                  navigate(`/employer/messages?recipient=${(t as any).user_id}`);
                }}
              >
                <div className="w-10 h-10 rounded-full bg-[#2984df] text-white font-bold flex items-center justify-center">
                  {((t as any).first_name?.[0] || '')}{((t as any).last_name?.[0] || '')}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{(t as any).first_name} {(t as any).last_name}</div>
                  <div className="text-xs text-gray-500">{(t as any).location || '-'} · {(t as any).years_experience ?? 0} yrs</div>
                </div>
                <span className="ml-auto text-sm text-blue-700">Message →</span>
              </button>
            ))}
            {!searching && techs && techs.results.length === 0 && (
              <div className="text-sm text-gray-600">No results. Try another search.</div>
            )}
          </div>
        </div>
      </Modal>

      {/* Call Modal */}
      <Modal open={callOpen} onClose={endCall} title={callType === "audio" ? "Audio Call" : "Video Call"}>
        <div className="space-y-3">
          {callType === "video" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3"> 
              <video ref={localVideoRef} autoPlay muted playsInline className="w-full rounded-lg bg-black/80 h-48 object-cover" />
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full rounded-lg bg-black/80 h-48 object-cover" />
            </div>
          ) : (
            <div className="text-gray-600">Audio call in progress…</div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={endCall}>Hang up</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ChatPage;
