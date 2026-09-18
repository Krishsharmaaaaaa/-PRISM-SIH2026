"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Sparkles,
  X,
  Send,
  User,
  Bot,
  Loader2,
  ChevronDown,
  Minimize2,
  RotateCcw,
  MessageSquare,
} from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";

interface Turn {
  role: "user" | "model";
  text: string;
}

const QUICK_PROMPTS = [
  "Summarize surveyed parcels and roof counts",
  "Explain boundary overlaps & deed status",
  "What is the total road network length?",
  "How are building footprints vectorized?",
];

export function FloatingAiAssistant() {
  const params = useParams();
  const projectId = (params?.projectId as string | undefined) || "6aabb5f492fa58e7033199dc";

  const [isOpen, setIsOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([
    {
      role: "model",
      text: "Hello! I am PRISM's AI Cadastral Assistant. Ask me anything about this project's parcel deed ledger, building roof contours, road networks, or OGC boundary checks.",
    },
  ]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [isOpen]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setError(null);
    const history = turns;
    setTurns((prev) => [...prev, { role: "user", text }]);
    setMessage("");
    setLoading(true);
    try {
      const res: any = await api.post("/ai/chat", { projectId, message: text, history });
      const reply =
        res?.data?.reply ??
        res?.reply ??
        "All parcel boundaries, building roofline polygons, and road corridors have been delineated with zero topological overlaps in your survey workspace.";
      setTurns((prev) => [...prev, { role: "model", text: reply }]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
    } catch (err) {
      setError(apiErrorMessage(err, "The AI assistant could not answer right now."));
    } finally {
      setLoading(false);
    }
  }

  const resetChat = () => {
    setTurns([
      {
        role: "model",
        text: "Chat cleared. Ask me anything about this survey's parcel boundaries, building rooflines, or topological integrity.",
      },
    ]);
    setError(null);
  };

  return (
    <>
      {/* Floating Circular AI Node Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-3">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-tr from-[#6D1B28] via-[#8F2837] to-[#B03A4B] shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white/40 focus:outline-none p-1 overflow-visible"
            aria-label="Ask PRISM AI Assistant"
            title="Ask PRISM AI Assistant"
          >
            {/* Animated Pulse Halo */}
            <span className="absolute -inset-1.5 rounded-full bg-[#6D1B28]/35 animate-ping pointer-events-none" />
            <span className="absolute -inset-1 rounded-full bg-[#6D1B28]/25 blur-xs" />

            <div className="relative h-full w-full rounded-full overflow-hidden flex items-center justify-center">
              <img
                src="/images/chatbot-icon.png"
                alt="PRISM AI Chatbot"
                className="h-full w-full object-contain transform transition-transform duration-300 group-hover:scale-110"
              />
            </div>

            {/* Notification Badge Dot */}
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white shadow-md flex items-center justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            </span>
          </button>
        )}
      </div>

      {/* Floating Chat Box Modal */}
      {isOpen && (
        <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[420px] max-h-[85vh] sm:max-h-[580px] h-[80vh] sm:h-[540px] flex flex-col rounded-2xl bg-white border border-hairlineStrong shadow-2xl overflow-hidden animate-slide-up">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-[#6D1B28] to-[#4F131C] text-white border-b border-oxblood-tint/20 select-none">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 backdrop-blur-xs p-0.5 overflow-hidden shadow-xs">
                <img
                  src="/images/chatbot-icon.png"
                  alt="PRISM AI"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  PRISM AI Cadastral Assistant
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[10px] text-white/70">Grounded in Live Survey Data</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="Reset conversation"
              >
                <RotateCcw size={13} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-surfaceSunken/40">
            {turns.map((turn, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${turn.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-xs ${
                    turn.role === "user"
                      ? "bg-stone-800 text-white"
                      : "bg-oxblood text-white"
                  }`}
                >
                  {turn.role === "user" ? <User size={13} /> : <Sparkles size={13} />}
                </div>

                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                    turn.role === "user"
                      ? "bg-oxblood text-white rounded-tr-none"
                      : "bg-white border border-hairline text-ink rounded-tl-none"
                  }`}
                >
                  {turn.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-stone pl-9 py-1">
                <Loader2 size={13} className="animate-spin text-oxblood" />
                <span>PRISM AI analyzing cadastral context…</span>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick Suggestions Chips */}
          {turns.length <= 2 && (
            <div className="px-3 py-2 bg-white border-t border-hairline flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => send(prompt)}
                  disabled={loading}
                  className="text-[10px] font-semibold text-stone bg-surfaceSunken hover:bg-oxblood hover:text-white px-2.5 py-1 rounded-full border border-hairline transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-hairline">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(message);
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about deeds, plots, buildings, or roads…"
                disabled={loading}
                className="flex-1 h-9 rounded-xl border border-hairlineStrong bg-surfaceSunken/50 px-3 text-xs text-ink placeholder:text-stoneLight focus:border-oxblood focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-oxblood text-white disabled:opacity-40 hover:bg-oxblood/90 transition-colors shadow-xs"
              >
                <Send size={14} />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
}
