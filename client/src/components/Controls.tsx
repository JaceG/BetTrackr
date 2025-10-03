import { Plus, Upload, Download, Trash2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ControlsProps {
  baseline: number | null;
  onBaselineChange: (value: number | null) => void;
  viewMode: "per-bet" | "per-day";
  onViewModeChange: (mode: "per-bet" | "per-day") => void;
  onAddEntry: () => void;
  onImportCsv: () => void;
  onExportCsv: () => void;
  onClear: () => void;
  hasEntries: boolean;
}

export default function Controls({
  baseline,
  onBaselineChange,
  viewMode,
  onViewModeChange,
  onAddEntry,
  onImportCsv,
  onExportCsv,
  onClear,
  hasEntries,
}: ControlsProps) {
  return (
    <div className="sticky top-0 z-50 backdrop-blur-md bg-background/90 border-b p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold">Betting Tracker</h1>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" data-testid="button-info">
                <Info className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">Track your betting balance with detailed analytics</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="baseline" className="text-sm font-medium">
              Starting Balance ($) - Enter debt amount
            </Label>
            <Input
              id="baseline"
              type="number"
              value={baseline !== null ? Math.abs(baseline) : ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  onBaselineChange(null);
                } else {
                  const num = Math.abs(Number(value));
                  onBaselineChange(-num);
                }
              }}
              className="font-mono text-base"
              data-testid="input-baseline"
              placeholder="Enter debt (e.g., 600 for -$600)"
              disabled={hasEntries}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">View Mode</Label>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "per-bet" ? "default" : "outline"}
                onClick={() => onViewModeChange("per-bet")}
                className="flex-1"
                data-testid="button-view-per-bet"
              >
                Per Bet
              </Button>
              <Button
                variant={viewMode === "per-day" ? "default" : "outline"}
                onClick={() => onViewModeChange("per-day")}
                className="flex-1"
                data-testid="button-view-per-day"
              >
                Per Day
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={onAddEntry} className="gap-2" data-testid="button-add-entry">
            <Plus className="w-4 h-4" />
            Add Entry
          </Button>
          <Button onClick={onImportCsv} variant="outline" className="gap-2" data-testid="button-import-csv">
            <Upload className="w-4 h-4" />
            Import CSV
          </Button>
          <Button onClick={onExportCsv} variant="outline" className="gap-2" data-testid="button-export-csv">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button onClick={onClear} variant="destructive" className="gap-2 ml-auto" data-testid="button-clear">
            <Trash2 className="w-4 h-4" />
            Clear All
          </Button>
        </div>
      </div>
    </div>
  );
}
