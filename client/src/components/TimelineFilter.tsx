import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type TimelineRange = "1d" | "3d" | "1w" | "2w" | "1m" | "3m" | "6m" | "1y" | "ytd" | "all";

interface TimelineFilterProps {
  selected: TimelineRange;
  onSelect: (range: TimelineRange) => void;
}

const timelineOptions: { value: TimelineRange; label: string }[] = [
  { value: "1d", label: "1D" },
  { value: "3d", label: "3D" },
  { value: "1w", label: "1W" },
  { value: "2w", label: "2W" },
  { value: "1m", label: "1M" },
  { value: "3m", label: "3M" },
  { value: "6m", label: "6M" },
  { value: "1y", label: "1Y" },
  { value: "ytd", label: "YTD" },
  { value: "all", label: "All" },
];

export default function TimelineFilter({ selected, onSelect }: TimelineFilterProps) {
  return (
    <Card className="p-3">
      <div className="flex flex-wrap gap-2">
        {timelineOptions.map((option) => (
          <Button
            key={option.value}
            variant={selected === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(option.value)}
            className="min-w-[3rem]"
            data-testid={`button-timeline-${option.value}`}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </Card>
  );
}
