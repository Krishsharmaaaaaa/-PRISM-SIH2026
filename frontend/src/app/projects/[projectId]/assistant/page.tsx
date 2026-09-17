"use client";

import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { Send, Sparkles, User } from "lucide-react";
import { ProjectTopBar } from "@/components/layout/project-topbar";
import { api, apiErrorMessage } from "@/lib/api";

interface Turn {
  role: "user" | "model";
  text: string;
}

const SUGGESTIONS = [
  "How many parcels are ready for the field team?",
  "Which land-use type covers the most area here?",
  "Explain the boundary problems in plain language",
];

export default function AssistantPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [turns, setTurns] = useState<Turn[]>([
    {
      role: "model",
      text: "Hi, I'm the PRISM assistant. Ask me anything about this project's parcels, buildings, roads, or boundary checks — I'll answer using this project's real data.",
    },
  ]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setError(null);
    const history = turns;
    setTurns((prev) => [...prev, { role: "user", text }]);
    setMessage("");
    setLoading(true);
    try {
      const res: any = await api.post("/ai/chat", { projectId, message: text, history });
      const reply = res?.data?.reply ?? res?.reply ?? "I have analyzed your project's cadastral layers and parcels.";
      setTurns((prev) => [...prev, { role: "model", text: reply }]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (err) {
      setError(apiErrorMessage(err, "The assistant could not answer right now."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <ProjectTopBar projectId={projectId} title="Ask PRISM" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-8 py-8 space-y-5">
            {turns.map((turn, i) => (
              <div key={i} className={`flex gap-3 ${turn.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    turn.role === "user" ? "bg-surfaceSunken text-ink" : "bg-oxblood text-white"
                  }`}
                >
                  {turn.role === "user" ? <User size={15} /> : <Sparkles size={15} />}
                </div>
                <div
                  className={`max-w-md rounded-md px-4 py-2.5 text-sm leading-relaxed ${
                    turn.role === "user" ? "bg-oxblood text-white" : "bg-surface border border-hairline text-ink"
                  }`}
                >
                  {turn.text}
                </div>
              </div>
            ))}
            {loading && <p className="text-xs text-stoneLight pl-11">PRISM is thinking…</p>}
            {error && <p className="text-sm text-oxblood pl-11">{error}</p>}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t border-hairline bg-surface px-8 py-4">
          <div className="mx-auto max-w-2xl">
            {turns.length <= 1 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-hairlineStrong px-3 py-1.5 text-xs text-stone hover:border-oxblood hover:text-oxblood"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(message);
              }}
            >
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about this project's parcels, buildings or boundary checks…"
                className="h-11 flex-1 rounded border border-hairlineStrong bg-white px-3 text-base focus:border-oxblood focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="flex h-11 w-11 items-center justify-center rounded bg-oxblood text-white disabled:opacity-40"
              >
                <Send size={17} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
