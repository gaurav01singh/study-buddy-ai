import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, ArrowLeft, Brain, Trash2, Loader2 } from "lucide-react";
import { FlatButton } from "@/components/FlatButton";
import SubjectCard from "@/components/SubjectCard";
import ChatBubble from "@/components/ChatBubble";
import { useAppStore } from "@/store/app-store";
import { askQuestion, AIResponse } from "@/lib/ai-service";
import { buildNotesContext } from "@/lib/pdf-parser";
import { toast } from "sonner";

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    subjects,
    activeSubjectId,
    setActiveSubject,
    chatHistory,
    addChatMessage,
    clearChat,
  } = useAppStore();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSubject = subjects.find((s) => s.id === activeSubjectId);
  const messages = activeSubjectId ? chatHistory[activeSubjectId] || [] : [];

  useEffect(() => {
    if (subjects.length === 0) {
      navigate("/setup");
    }
  }, [subjects, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeSubject || loading) return;

    const userMsg = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content: input.trim(),
      timestamp: new Date(),
    };
    addChatMessage(activeSubject.id, userMsg);
    setInput("");
    setLoading(true);

    try {
      const context = buildNotesContext(activeSubject.notes);
      const response: AIResponse = await askQuestion(
        userMsg.content,
        activeSubject.name,
        context
      );

      addChatMessage(activeSubject.id, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: response.answer,
        response,
        timestamp: new Date(),
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to get response");
      addChatMessage(activeSubject.id, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please check your API key configuration.",
        timestamp: new Date(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-80 border-r-2 border-border bg-card flex flex-col">
        <div className="p-4 border-b-2 border-border">
          <div className="flex items-center gap-2 mb-4">
            <FlatButton onClick={() => navigate("/")} variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </FlatButton>
            <h2 className="font-display text-lg font-bold">Subjects</h2>
          </div>

          <FlatButton
            onClick={() => navigate("/study")}
            variant="accent"
            size="sm"
            className="w-full"
          >
            <Brain className="w-4 h-4 mr-2" />
            Study Mode
          </FlatButton>
        </div>

        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          {subjects.map((subject, i) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              index={i}
              isActive={subject.id === activeSubjectId}
              onSelect={() => setActiveSubject(subject.id)}
              compact
            />
          ))}
        </div>

        <div className="p-4 border-t-2 border-border">
          <FlatButton
            onClick={() => navigate("/setup")}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Manage Subjects
          </FlatButton>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-border bg-card flex items-center justify-between">
          {activeSubject ? (
            <>
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: activeSubject.color }}
                />
                <h1 className="font-display text-heading font-bold">
                  {activeSubject.name}
                </h1>
                <span className="flat-tag bg-muted text-muted-foreground border-border text-xs">
                  {activeSubject.notes.length} files
                </span>
              </div>
              <FlatButton
                onClick={() => clearChat(activeSubject.id)}
                variant="ghost"
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear
              </FlatButton>
            </>
          ) : (
            <h1 className="font-display text-subheading font-bold text-muted-foreground">
              Select a subject to start
            </h1>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 pattern-dots">
          {!activeSubject && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="font-display text-display font-bold text-muted-foreground/20 mb-2">
                  👈
                </p>
                <p className="font-display text-xl font-bold text-muted-foreground">
                  Pick a subject from the sidebar
                </p>
              </div>
            </div>
          )}

          {activeSubject && messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <p className="font-display text-heading font-bold mb-2">
                  Ask about {activeSubject.name}
                </p>
                <p className="text-muted-foreground">
                  Your answers will be grounded in your uploaded notes with citations and confidence levels.
                </p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              response={msg.response}
            />
          ))}

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-body text-sm">Searching your notes...</span>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {activeSubject && (
          <div className="px-6 py-4 border-t-2 border-border bg-card">
            <div className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder={`Ask about ${activeSubject.name}...`}
                disabled={loading}
                className="flex-1 px-5 py-3 rounded-xl border-2 border-border bg-background font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              />
              <FlatButton
                onClick={handleSend}
                variant="primary"
                size="md"
                disabled={!input.trim() || loading}
              >
                <Send className="w-5 h-5" />
              </FlatButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
