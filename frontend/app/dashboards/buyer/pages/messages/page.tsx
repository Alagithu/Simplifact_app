"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FileSignature,
  FileText,
  MessageSquare,
  AlertCircle,
  LogOut,
  Menu,
} from "lucide-react";

type Message = {
  id: number;
  body: string;
  user_id: number;
  created_at: string;
  is_read: boolean;
  user?: { name: string };
};

type User = { id: number; name: string };

type Conversation = {
  id: number;
  created_at: string;
  updated_at: string;
  users?: Array<{ id: number; name: string }>;
  last_message?: Message;
  unread_count?: number;
  sender?: User;
  receiver?: User;
};

export default function MessagesBuyer() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!token) return;
    fetch("/api/user", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.ok && res.json())
      .then((user) => user && setCurrentUserId(user.id))
      .catch(console.error);
  }, [token]);

  // Charger les conversations
  useEffect(() => {
    if (!token) return;

    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/conversations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setConversations(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Erreur fetch conversations:", err);
      }
    };

    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [token]);

  // Charger les messages
  useEffect(() => {
    if (!selectedConversation || !token) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Erreur fetch messages:", err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedConversation, token]);

  // Sélectionner une conversation
  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    setIsModalOpen(true);
  };

  // Envoyer un message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !token) return;

    try {
      setIsModalOpen(false);

      const res = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: newMessage }),
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages((prev) => [...prev, newMsg]);
        setNewMessage("");
        router.refresh(); 
      }
    } catch (err) {
      console.error("Erreur envoi message:", err);
    }
  };

  // Déconnexion
  const handleLogout = async () => {
    if (!token) return router.push("/");
    try {
      await fetch("/api/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.clear();
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };


  const getOtherUser = (conv: Conversation): string => {
    if (!conv || !currentUserId) return "Unknown";
    if (conv.sender && conv.sender.id !== currentUserId) return conv.sender.name;
    if (conv.receiver && conv.receiver.id !== currentUserId) return conv.receiver.name;
    const other = conv.users?.find((u) => u.id !== currentUserId);
    return other?.name || "Unknown";
  };

  const formatLastMessage = (conv: Conversation) => {
    if (!conv.last_message) return " ";
    return conv.last_message.body.length > 50
      ? conv.last_message.body.slice(0, 50) + "..."
      : conv.last_message.body;
  };

  return (
    <div className="flex h-screen bg-gray-100 font-inter">
      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-[#0f172a] text-gray-100 flex flex-col justify-between p-6 shadow-lg transform transition-transform duration-300 z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="Logo" width={45} height={45} className="rounded-full" />
              <h1 className="text-lg font-semibold">Buyer</h1>
            </div>
            <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              ✕
            </button>
          </div>

          <nav className="space-y-3">
            <Link href="/dashboards/buyer" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
              <LayoutDashboard size={18} /> <span>Dashboard</span>
            </Link>
            <Link href="#" className="flex items-center space-x-3 p-3 rounded-lg bg-[#1221ca] hover:bg-blue-700 transition">
              <MessageSquare size={18} /> <span>Messages</span>
            </Link>
            <Link href="/dashboards/buyer/pages/invoices" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
              <FileText size={18} /> <span>Invoices</span>
            </Link>
            <Link href="/dashboards/buyer/pages/estimates" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
              <FileSignature size={18} /> <span>Estimates</span>
            </Link>
            <Link href="/dashboards/buyer/pages/products" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
              <Package size={18} /> <span>Products</span>
            </Link>
            <Link href="/dashboards/buyer/pages/claims" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
              <AlertCircle size={18} /> <span>Claims</span>
            </Link>
          </nav>
        </div>

        <button onClick={handleLogout} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
          <LogOut size={18} /> <span>Logout</span>
        </button>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto w-full">
        <div className="flex items-center justify-between mb-6 md:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} className="text-[#1221ca]" />
          </button>
          <h2 className="text-xl font-semibold text-[#1221ca]">Messages</h2>
        </div>

        <div className="flex flex-1 h-[80vh] overflow-hidden rounded-xl shadow-lg">
          {/* Liste des conversations */}
          <div className="w-1/3 bg-white border-r overflow-y-auto">
            <div className="p-4 border-b font-bold">Conversations</div>
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                  selectedConversation?.id === conv.id ? "bg-blue-50 border-l-4 border-[#1221ca]" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-semibold text-gray-800">{getOtherUser(conv)}</div>
                  {conv.unread_count ? (
                    <span className="bg-[#1221ca] text-white text-xs px-2 py-1 rounded-full">{conv.unread_count}</span>
                  ) : null}
                </div>
                <div className="text-sm text-gray-600 truncate">{formatLastMessage(conv)}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(conv.updated_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* chat */}
          <div className="flex-1 flex flex-col bg-gray-50">
            {selectedConversation ? (
              <>
                <div className="bg-white p-4 border-b shadow-sm flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#1221ca] flex items-center justify-center text-white font-bold mr-3">
                    {getOtherUser(selectedConversation)?.charAt(0)?.toUpperCase?.() || "?"}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{getOtherUser(selectedConversation)}</div>
                    <div className="text-xs text-gray-500">En ligne</div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">Aucun message</div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.user_id === currentUserId ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${
                            msg.user_id === currentUserId
                              ? "bg-[#1221ca] text-white rounded-br-none"
                              : "bg-white text-gray-800 border rounded-bl-none"
                          }`}
                        >
                          <div className="break-words">{msg.body}</div>
                          <div
                            className={`text-xs mt-1 ${
                              msg.user_id === currentUserId ? "text-blue-100" : "text-gray-400"
                            }`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* envoi */}
                <div className="bg-white p-4 border-t shadow-sm flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Tapez votre message..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1221ca]"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-[#1221ca] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    ➤
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <p>Sélectionnez une conversation pour commencer</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
