"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, MessageSquare, Search } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Message, Profile } from "@/types";
import { getCurrentProfile, getConversations, getMessages, sendMessage as sendMessageAction } from "@/lib/actions/chat";

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => await getCurrentProfile() || null,
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations", currentUser?.id],
    enabled: !!currentUser,
    queryFn: async () => await getConversations(),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", selectedConversation],
    enabled: !!selectedConversation,
    queryFn: async () => await getMessages(selectedConversation!),
    refetchInterval: 3000,
  });

  // Scroll to bottom when messages load
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ requestId, content, receiverId }: { requestId: string, content: string, receiverId: string }) => {
      await sendMessageAction(requestId, content, receiverId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedConversation] });
      setNewMessage("");
    }
  });

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;
    
    const conv = conversations.find(c => c.id === selectedConversation) as any;
    const receiverId = conv?.homeowner_id === currentUser.id ? conv?.technician_id : conv?.homeowner_id;

    sendMessageMutation.mutate({
      requestId: selectedConversation,
      content: newMessage.trim(),
      receiverId: receiverId,
    });
  };

  return (
    <>
      <DashboardHeader title="Messages" subtitle="Chat with homeowners and technicians" />
      <main className="flex-1 flex overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
        {/* Conversations sidebar */}
        <div className="w-72 border-r bg-white flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-9 h-9 text-sm" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <MessageSquare className="w-10 h-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm font-medium">No conversations</p>
                <p className="text-xs text-muted-foreground">Conversations appear when you have service requests.</p>
              </div>
            ) : conversations.map((conv: any) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={cn(
                  "w-full text-left p-4 hover:bg-muted/50 transition-colors",
                  selectedConversation === conv.id && "bg-primary/5 border-l-2 border-l-primary"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {conv.title?.charAt(0) || "J"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.title || "Service Request"}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {conv.profiles?.full_name || "Homeowner"}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-muted/20">
          {!selectedConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 gradient-blue rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                Choose a conversation from the left panel to start chatting.
              </p>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => {
                  const isOwn = msg.sender_id === currentUser?.id;
                  const sender = (msg as any).sender;
                  return (
                    <div key={msg.id} className={cn("flex items-end gap-2", isOwn && "flex-row-reverse")}>
                      {!isOwn && (
                        <Avatar className="w-7 h-7 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {sender?.full_name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn(
                        "max-w-[65%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                        isOwn
                          ? "gradient-blue text-white rounded-br-sm"
                          : "bg-white text-foreground border border-border rounded-bl-sm"
                      )}>
                        <p className="leading-relaxed">{msg.content}</p>
                        <p className={cn("text-[10px] mt-1", isOwn ? "text-white/70" : "text-muted-foreground")}>
                          {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} disabled={sendMessageMutation.isPending || !newMessage.trim()} size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
