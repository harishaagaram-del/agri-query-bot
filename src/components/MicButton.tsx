import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MicButtonProps {
  listening: boolean;
  onPress: () => void;
}

export default function MicButton({ listening, onPress }: MicButtonProps) {
  return (
    <div className="relative inline-flex items-center justify-center">
      {listening && (
        <span className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-ring" />
      )}
      <Button
        variant="mic"
        size="icon"
        onClick={onPress}
        className={`h-14 w-14 ${listening ? "bg-destructive hover:bg-destructive/90" : ""}`}
        aria-label={listening ? "Stop recording" : "Start recording"}
      >
        {listening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
      </Button>
    </div>
  );
}
