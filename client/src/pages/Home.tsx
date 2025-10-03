import { useState, useMemo } from "react";
import Controls from "@/components/Controls";
import StatsStrip from "@/components/StatsStrip";
import ChartCard from "@/components/ChartCard";
import DataTable from "@/components/DataTable";
import EntryForm from "@/components/EntryForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import TimelineFilter, { TimelineRange } from "@/components/TimelineFilter";

interface Entry {
  id: string;
  date: string;
  net: number;
  notes?: string;
}

interface DataPoint extends Entry {
  running: number;
}

export default function Home() {
  const [baseline, setBaseline] = useState(600);
  const [viewMode, setViewMode] = useState<"per-bet" | "per-day">("per-bet");
  const [storageMode, setStorageMode] = useState<"local" | "server">("local");
  const [timelineRange, setTimelineRange] = useState<TimelineRange>("all");
  const [entries, setEntries] = useState<Entry[]>([
    { id: "1", date: "2025-10-01T14:30", net: 500, notes: "NBA Lakers spread" },
    { id: "2", date: "2025-10-01T19:00", net: 200, notes: "MLB Yankees ML" },
    { id: "3", date: "2025-10-02T15:00", net: 300, notes: "NFL parlay 3-leg" },
    { id: "4", date: "2025-10-02T20:30", net: -150, notes: "Live bet Celtics - loss" },
    { id: "5", date: "2025-10-03T16:45", net: -600, notes: "Bad beat - Cowboys last second TD" },
    { id: "6", date: "2025-10-03T21:00", net: 100, notes: "Small NHL win" },
    { id: "7", date: "2025-10-04T14:00", net: -400, notes: "MLB parlay busted" },
    { id: "8", date: "2025-10-04T20:15", net: -250, notes: "Live NBA bet - loss" },
    { id: "9", date: "2025-10-05T13:30", net: -200, notes: "NFL early game loss" },
    { id: "10", date: "2025-10-05T17:00", net: -100, notes: "Afternoon slate - nothing hit" },
    { id: "11", date: "2025-10-05T21:00", net: 50, notes: "Small late game win" },
    { id: "12", date: "2025-10-06T15:30", net: 400, notes: "Added $400 from pocket (total investment now $1000)" },
    { id: "13", date: "2025-10-06T19:00", net: 300, notes: "NBA 5-team parlay hits!" },
    { id: "14", date: "2025-10-07T14:30", net: 200, notes: "MLB afternoon slate" },
    { id: "15", date: "2025-10-07T20:00", net: 400, notes: "NFL Sunday night winner" },
    { id: "16", date: "2025-10-08T15:00", net: -150, notes: "MLB loss" },
    { id: "17", date: "2025-10-08T17:45", net: -50, notes: "Small live bet loss" },
    { id: "18", date: "2025-10-08T21:30", net: 100, notes: "Late game recovery" },
  ]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getCutoffDate = (range: TimelineRange): Date | null => {
    if (range === "all") return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const cutoffDate = new Date(today);

    switch (range) {
      case "1d":
        cutoffDate.setDate(today.getDate() - 1);
        break;
      case "3d":
        cutoffDate.setDate(today.getDate() - 3);
        break;
      case "1w":
        cutoffDate.setDate(today.getDate() - 7);
        break;
      case "2w":
        cutoffDate.setDate(today.getDate() - 14);
        break;
      case "1m":
        cutoffDate.setMonth(today.getMonth() - 1);
        break;
      case "3m":
        cutoffDate.setMonth(today.getMonth() - 3);
        break;
      case "6m":
        cutoffDate.setMonth(today.getMonth() - 6);
        break;
      case "1y":
        cutoffDate.setFullYear(today.getFullYear() - 1);
        break;
      case "ytd":
        return new Date(today.getFullYear(), 0, 1);
    }

    return cutoffDate;
  };

  const { filteredData, startingBalance } = useMemo(() => {
    const sorted = [...entries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const cutoffDate = getCutoffDate(timelineRange);
    
    if (!cutoffDate) {
      return {
        filteredData: sorted,
        startingBalance: baseline,
      };
    }

    const beforeCutoff = sorted.filter((e) => new Date(e.date) < cutoffDate);
    const afterCutoff = sorted.filter((e) => new Date(e.date) >= cutoffDate);

    const balanceBeforeCutoff = beforeCutoff.reduce((sum, e) => sum + e.net, baseline);

    return {
      filteredData: afterCutoff,
      startingBalance: balanceBeforeCutoff,
    };
  }, [entries, timelineRange, baseline]);

  const dataPoints = useMemo(() => {
    let running = startingBalance;
    return filteredData.map((entry) => {
      running += entry.net;
      return { ...entry, running };
    });
  }, [filteredData, startingBalance]);
  const currentBalance = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].running : baseline;
  const netPL = currentBalance - baseline;
  const peakBalance = Math.max(...dataPoints.map((d) => d.running), baseline);
  const maxDrawdown = Math.min(...dataPoints.map((d) => d.running - baseline), 0);

  const handleAddEntry = () => {
    setEditingEntry(null);
    setFormOpen(true);
  };

  const handleEditEntry = (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (entry) {
      setEditingEntry(entry);
      setFormOpen(true);
    }
  };

  const handleDeleteEntry = (id: string) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setEntries(entries.filter((e) => e.id !== deleteId));
      setDeleteId(null);
    }
    setConfirmOpen(false);
  };

  const handleSaveEntry = (entryData: { date: string; net: number; notes: string }) => {
    if (editingEntry) {
      setEntries(
        entries.map((e) =>
          e.id === editingEntry.id ? { ...e, ...entryData } : e
        )
      );
    } else {
      const newEntry: Entry = {
        id: Date.now().toString(),
        ...entryData,
      };
      setEntries([...entries, newEntry]);
    }
  };

  const handleClearAll = () => {
    setConfirmOpen(true);
  };

  const confirmClearAll = () => {
    if (deleteId === null) {
      setEntries([]);
    }
    setConfirmOpen(false);
  };

  const handleImportCsv = () => {
    console.log("Import CSV - will be implemented with file input");
  };

  const handleExportCsv = () => {
    console.log("Export CSV - will generate and download CSV file");
  };

  return (
    <div className="min-h-screen bg-background">
      <Controls
        baseline={baseline}
        onBaselineChange={setBaseline}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        storageMode={storageMode}
        onStorageModeChange={setStorageMode}
        onAddEntry={handleAddEntry}
        onImportCsv={handleImportCsv}
        onExportCsv={handleExportCsv}
        onClear={handleClearAll}
        hasEntries={entries.length > 0}
      />

      <div className="max-w-7xl mx-auto p-4 space-y-6 pb-8">
        <StatsStrip
          currentBalance={currentBalance}
          netPL={netPL}
          peakBalance={peakBalance}
          maxDrawdown={maxDrawdown}
        />

        <TimelineFilter
          selected={timelineRange}
          onSelect={setTimelineRange}
        />

        <ChartCard data={dataPoints} baseline={baseline} />

        <DataTable
          entries={dataPoints}
          onEdit={handleEditEntry}
          onDelete={handleDeleteEntry}
        />
      </div>

      <EntryForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveEntry}
        initialData={editingEntry || undefined}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={deleteId ? confirmDelete : confirmClearAll}
        title={deleteId ? "Delete Entry?" : "Clear All Entries?"}
        description={
          deleteId
            ? "This will permanently delete this entry. This action cannot be undone."
            : "This will permanently delete all your betting entries. This action cannot be undone."
        }
      />
    </div>
  );
}
