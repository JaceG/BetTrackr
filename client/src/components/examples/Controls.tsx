import { useState } from "react";
import Controls from "../Controls";

export default function ControlsExample() {
  const [baseline, setBaseline] = useState(600);
  const [viewMode, setViewMode] = useState<"per-bet" | "per-day">("per-bet");
  const [storageMode, setStorageMode] = useState<"local" | "server">("local");

  return (
    <Controls
      baseline={baseline}
      onBaselineChange={setBaseline}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      storageMode={storageMode}
      onStorageModeChange={setStorageMode}
      onAddEntry={() => console.log("Add entry")}
      onImportCsv={() => console.log("Import CSV")}
      onExportCsv={() => console.log("Export CSV")}
      onClear={() => console.log("Clear all")}
      hasEntries={false}
    />
  );
}
