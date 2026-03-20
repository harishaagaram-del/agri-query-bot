import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speak } from "@/hooks/useSpeech";

interface ChatBubbleProps {
  role: "user" | "bot";
  text: string;
  sources?: string[];
}

export default function ChatBubble({ role, text, sources }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex animate-fade-in-up ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-chat-user text-chat-user-foreground rounded-br-md"
            : "bg-chat-bot text-chat-bot-foreground rounded-bl-md"
        }`}
      >
        <p className="whitespace-pre-wrap">{text}</p>
        {sources && sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border/40 text-xs text-muted-foreground">
            <span className="font-semibold">Sources:</span>{" "}
            {sources.map((s, i) => (
              <span key={i}>
                {i > 0 && " · "}
                {s}
              </span>
            ))}
          </div>
        )}
        {!isUser && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 h-7 px-2 text-muted-foreground hover:text-foreground"
            onClick={() => speak(text)}
            aria-label="Read aloud"
          >
            <Volume2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
