import { useState, useEffect, useRef } from "react";
import { Send, Sprout, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatBubble from "@/components/ChatBubble";
import CropChips from "@/components/CropChips";
import MicButton from "@/components/MicButton";
import ThemeToggle from "@/components/ThemeToggle";
import { useSpeechRecognition, speak } from "@/hooks/useSpeech";
import { queryBackend, type QueryResponse } from "@/lib/api";

interface Message {
  role: "user" | "bot";
  text: string;
  sources?: string[];
}

export default function Index() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { listening, transcript, start, stop, setTranscript } = useSpeechRecognition();

  // When transcript arrives, put it in the input
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
      setTranscript("");
    }
  }, [transcript, setTranscript]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);

    try {
      const res: QueryResponse = await queryBackend(q);
      setMessages((m) => [...m, { role: "bot", text: res.answer, sources: res.sources }]);
      speak(res.answer);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text: "Sorry, I couldn't reach the advisory service. Please ensure the backend is running on localhost:8000.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Sprout className="h-7 w-7 text-primary" />
          <h1 className="font-display text-lg font-bold tracking-tight">AgriVoice</h1>
        </div>
        <ThemeToggle />
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-muted-foreground">
            <Sprout className="h-16 w-16 text-primary/40" />
            <div>
              <p className="font-display text-xl font-semibold text-foreground">
                Agriculture Voice Advisor
              </p>
              <p className="text-sm mt-1">
                Ask me anything about crops, soil, irrigation, or pest control.
              </p>
            </div>
            <CropChips onSelect={sendMessage} disabled={loading} />
          </div>
        )}
        {messages.map((m, i) => (
          <ChatBubble key={i} role={m.role} text={m.text} sources={m.sources} />
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-chat-bot text-chat-bot-foreground rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2 text-sm shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking…
            </div>
          </div>
        )}
      </div>

      {/* Crop chips when messages exist */}
      {messages.length > 0 && (
        <div className="px-4 pb-2">
          <CropChips onSelect={sendMessage} disabled={loading} />
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 pb-4 pt-2 border-t border-border">
        <div className="flex items-center gap-3">
          <MicButton listening={listening} onPress={listening ? stop : start} />
          <form
            className="flex flex-1 gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or speak your question…"
              className="flex-1"
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !input.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
