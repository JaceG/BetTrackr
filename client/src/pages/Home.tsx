import { useState } from "react";
import Controls from "@/components/Controls";
import StatsStrip from "@/components/StatsStrip";
import ChartCard from "@/components/ChartCard";
import DataTable from "@/components/DataTable";
import EntryForm from "@/components/EntryForm";
import ConfirmDialog from "@/components/ConfirmDialog";

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
  const [entries, setEntries] = useState<Entry[]>([
    { id: "1", date: "2025-10-01T14:30", net: 500, notes: "Starting strong - NBA win" },
    { id: "2", date: "2025-10-02T19:00", net: 300, notes: "MLB parlay hits" },
    { id: "3", date: "2025-10-03T16:45", net: -600, notes: "Bad beat - loss eating profits" },
    { id: "4", date: "2025-10-04T20:15", net: -400, notes: "Another loss - now in the red vs $600 start" },
    { id: "5", date: "2025-10-05T18:00", net: -300, notes: "Deep loss - only $100 left" },
    { id: "6", date: "2025-10-06T15:30", net: 400, notes: "Added $400 from pocket (total investment now $1000)" },
    { id: "7", date: "2025-10-07T20:00", net: 600, notes: "Big win - back to profit!" },
    { id: "8", date: "2025-10-08T17:45", net: -200, notes: "Small loss but still below $1000 total investment" },
  ]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const calculateRunningBalance = (entries: Entry[]): DataPoint[] => {
    const sorted = [...entries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    let running = baseline;
    return sorted.map((entry) => {
      running += entry.net;
      return { ...entry, running };
    });
  };

  const dataPoints = calculateRunningBalance(entries);
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
      />

      <div className="max-w-7xl mx-auto p-4 space-y-6 pb-8">
        <StatsStrip
          currentBalance={currentBalance}
          netPL={netPL}
          peakBalance={peakBalance}
          maxDrawdown={maxDrawdown}
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
