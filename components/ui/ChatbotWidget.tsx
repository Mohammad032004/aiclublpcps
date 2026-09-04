"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";

interface Message {
  role: "bot" | "user";
  text: string;
}

const RESPONSES: Record<string, string> = {
  apply: "You can apply via the 'Apply Now' button! Applications are open until May 15, 2025. The process has 4 steps: personal info, academics, skills, and a statement of purpose.",
  event: "Upcoming events: LLM Fine-Tuning Workshop (Apr 20), AI in Production Talk (Apr 28), and AIthon 2025 Hackathon (May 3–4). Visit the Events page for full details!",
  hackathon: "AIthon 2025 is our 36-hour hackathon on May 3–4 with NLP, Vision & RL tracks. ₹1L prize pool! Head to the Events page to apply.",
  project: "We have 50+ projects! Highlights include MediScan AI, Hindi Sentiment NLP, and CyberShield. Explore them all on the Projects page.",
  team: "Our club is led by Faculty Head Dr. R. Verma, Head Aryan Kumar, and Co-Head Priya Sharma. Visit the About page for the full hierarchy.",
  resource: "Resources include ML notes, workshop recordings, cybersecurity guides, and research papers. Member login required — visit the Resources page.",
  contact: "Reach us at nexusai@college.edu.in or use the Contact page. We reply within 24 hours!",
  member: "We have 100+ members across CSE, IT, and Data Science. New batch inducted twice a year. Apply via the Apply Now button!",
  join: "To join NexusAI, click 'Apply Now' in the navbar. You'll fill out a 4-step form covering your background, skills, and motivation.",
  hello: "Hi there! 👋 I'm the NexusAI assistant. Ask me about the club, events, projects, how to apply, or anything else!",
  hi: "Hello! 👋 How can I help you today? Ask about events, projects, applications, or the team!",
};

function getBotReply(msg: string): string {
  const lower = msg.toLowerCase();
  for (const key in RESPONSES) {
    if (lower.includes(key)) return RESPONSES[key];
  }
  return "Great question! For detailed info, explore our pages or contact us directly. I'm still learning 😊 — ask about events, projects, team, or how to apply!";
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hi! 👋 I'm the NexusAI assistant. Ask me about the club, events, projects, or how to apply!" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const msgsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages, typing]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { role: "bot", text: getBotReply(text) }]);
    }, 800);
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(59,130,246,0.5)",
          zIndex: 200,
          transition: "transform 0.2s",
        }}
      >
        {open ? <X size={22} color="white" /> : <MessageCircle size={22} color="white" />}
      </button>

      {/* Chat Window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "5.5rem",
            right: "2rem",
            width: 340,
            background: "#0a1525",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 20,
            zIndex: 200,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "1rem 1.25rem",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              background: "linear-gradient(135deg,rgba(59,130,246,0.1),rgba(139,92,246,0.1))",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Bot size={18} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>NexusAI Assistant</div>
              <div style={{ fontSize: "0.72rem", color: "#8ba3c7", display: "flex", alignItems: "center", gap: 4 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#10b981",
                    display: "inline-block",
                    animation: "pulse-dot 2s infinite",
                  }}
                />
                Online
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={msgsRef}
            style={{
              height: 280,
              overflowY: "auto",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  maxWidth: "85%",
                  padding: "0.6rem 0.9rem",
                  borderRadius: 12,
                  fontSize: "0.85rem",
                  lineHeight: 1.5,
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  background:
                    m.role === "user"
                      ? "linear-gradient(135deg,#3b82f6,#8b5cf6)"
                      : "rgba(255,255,255,0.05)",
                  border: m.role === "bot" ? "1px solid rgba(255,255,255,0.08)" : "none",
                  color: "#e8f0fe",
                }}
              >
                {m.text}
              </div>
            ))}
            {typing && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: "0.6rem 0.9rem",
                  fontSize: "0.85rem",
                  color: "#8ba3c7",
                }}
              >
                Typing...
              </div>
            )}
          </div>

          {/* Input */}
          <div
            style={{
              padding: "0.75rem",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              gap: "0.5rem",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask me anything..."
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#e8f0fe",
                padding: "0.5rem 0.75rem",
                borderRadius: 8,
                fontSize: "0.85rem",
                fontFamily: "inherit",
                outline: "none",
              }}
            />
            <button
              onClick={send}
              style={{
                background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                border: "none",
                color: "white",
                padding: "0.5rem 0.75rem",
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
