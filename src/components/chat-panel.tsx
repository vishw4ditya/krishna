"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { io, type Socket } from "socket.io-client";

type Message = {
  _id?: string;
  senderId: string;
  text?: string;
  image?: string;
  readBy?: string[];
  createdAt?: string;
};

type Chat = {
  _id: string;
  customerId?: { _id: string; name: string };
  branchHeadId?: { _id: string; name: string };
  messages: Message[];
};

let socket: Socket | null = null;

export function ChatPanel({ userId }: { userId: string }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const selectedChat = useMemo(() => chats.find((item) => item._id === selectedChatId), [chats, selectedChatId]);

  const loadChats = useCallback(async () => {
    const res = await fetch("/api/chats");
    if (!res.ok) return;
    const data = await res.json();
    setChats(data);
    setSelectedChatId((current) => current ?? data[0]?._id ?? null);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadChats();
    });
  }, [loadChats]);

  useEffect(() => {
    void fetch("/api/socket");
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "", {
      path: "/api/socket_io",
    });

    socket.on("chat:message", (payload: { chatId: string; message: Message }) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === payload.chatId
            ? { ...chat, messages: [...chat.messages, payload.message] }
            : chat
        )
      );
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, []);

  async function sendMessage() {
    if (!selectedChatId || !message.trim()) return;

    const res = await fetch(`/api/chats/${selectedChatId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });

    if (!res.ok) return;
    const created = await res.json();

    setChats((prev) =>
      prev.map((chat) =>
        chat._id === selectedChatId ? { ...chat, messages: [...chat.messages, created] } : chat
      )
    );

    socket?.emit("chat:message", { chatId: selectedChatId, message: created });
    setMessage("");
  }

  return (
    <div className="grid gap-4 md:grid-cols-[280px_1fr]">
      <aside className="rounded-xl border border-zinc-200 dark:border-zinc-800">
        <h3 className="border-b border-zinc-200 p-3 font-semibold dark:border-zinc-800">Chats</h3>
        <div className="max-h-[500px] overflow-auto">
          {chats.map((chat) => (
            <button
              key={chat._id}
              onClick={() => setSelectedChatId(chat._id)}
              className={`w-full border-b border-zinc-200 p-3 text-left text-sm dark:border-zinc-800 ${selectedChatId === chat._id ? "bg-zinc-100 dark:bg-zinc-900" : ""}`}
            >
              {chat.customerId?.name ?? "Customer"} ↔ {chat.branchHeadId?.name ?? "Branch Head"}
            </button>
          ))}
        </div>
      </aside>

      <section className="flex min-h-[500px] flex-col rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex-1 space-y-3 overflow-auto p-4">
          {selectedChat?.messages.map((item, index) => (
            <div
              key={item._id ?? index}
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${item.senderId === userId ? "ml-auto bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black" : "bg-zinc-100 dark:bg-zinc-900"}`}
            >
              {item.text}
              {item.createdAt && <p className="mt-1 text-[10px] opacity-70">{new Date(item.createdAt).toLocaleString()}</p>}
            </div>
          ))}
        </div>
        <div className="flex gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type message..."
            className="input"
          />
          <button onClick={sendMessage} className="rounded-md bg-zinc-900 px-4 text-white dark:bg-zinc-100 dark:text-black">
            Send
          </button>
        </div>
      </section>
    </div>
  );
}
