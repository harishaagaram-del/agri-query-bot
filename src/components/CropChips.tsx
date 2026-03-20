import { Button } from "@/components/ui/button";

const CROPS = [
  { label: "🌾 Wheat", query: "How do I grow wheat?" },
  { label: "🌽 Maize", query: "What is the best fertilizer for maize?" },
  { label: "🍚 Rice", query: "When should I plant rice?" },
  { label: "🥔 Potato", query: "How to prevent potato blight?" },
  { label: "🍅 Tomato", query: "Best practices for tomato irrigation?" },
  { label: "☕ Coffee", query: "How to manage coffee leaf rust?" },
];

interface CropChipsProps {
  onSelect: (query: string) => void;
  disabled?: boolean;
}

export default function CropChips({ onSelect, disabled }: CropChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CROPS.map((c) => (
        <Button
          key={c.label}
          variant="chip"
          size="sm"
          disabled={disabled}
          onClick={() => onSelect(c.query)}
          className="text-xs"
        >
          {c.label}
        </Button>
      ))}
    </div>
  );
}
