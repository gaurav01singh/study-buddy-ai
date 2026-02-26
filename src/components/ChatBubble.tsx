import React from "react";
import { motion } from "framer-motion";
import { AIResponse } from "@/lib/ai-service";
import { User, Bot, Quote, AlertTriangle } from "lucide-react";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  response?: AIResponse;
}

const ConfidenceBadge: React.FC<{ level: string }> = ({ level }) => {
  const cls =
    level === "High"
      ? "confidence-high"
      : level === "Medium"
      ? "confidence-medium"
      : "confidence-low";
  return <span className={`flat-tag ${cls} text-xs`}>{level} Confidence</span>;
};

const ChatBubble: React.FC<ChatBubbleProps> = ({ role, content, response }) => {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className={`
          w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border-2
          ${isUser
            ? "bg-navy text-navy-foreground border-navy"
            : "bg-primary text-primary-foreground border-primary"
          }
        `}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      <div
        className={`
          max-w-[75%] rounded-2xl p-4 border-2
          ${isUser
            ? "bg-navy text-navy-foreground border-navy"
            : "bg-card text-card-foreground border-border"
          }
        `}
      >
        <p className="font-body text-sm leading-relaxed whitespace-pre-wrap">{content}</p>

        {response && !response.notFound && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <ConfidenceBadge level={response.confidence} />
            </div>

            {response.citations.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-display font-bold uppercase tracking-wider text-muted-foreground">
                  Citations
                </p>
                {response.citations.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-xs p-2 rounded-lg bg-muted/50 border border-border"
                  >
                    <Quote className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
                    <div>
                      <span className="font-semibold">{c.fileName}</span>
                      <span className="text-muted-foreground"> — {c.section}</span>
                      {c.snippet && (
                        <p className="mt-1 text-muted-foreground italic">"{c.snippet}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {response.evidenceSnippets.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-display font-bold uppercase tracking-wider text-muted-foreground">
                  Evidence
                </p>
                {response.evidenceSnippets.map((s, i) => (
                  <p key={i} className="text-xs text-muted-foreground italic p-2 rounded-lg bg-muted/30 border border-border">
                    "{s}"
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {response?.notFound && (
          <div className="mt-3 flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-bold">Not found in notes</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatBubble;
