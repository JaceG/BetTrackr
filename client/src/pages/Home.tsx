import { useState, useMemo, useRef } from "react";
import Papa from "papaparse";
import Controls from "@/components/Controls";
import StatsStrip from "@/components/StatsStrip";
import ChartCard from "@/components/ChartCard";
import DataTable from "@/components/DataTable";
import EntryForm from "@/components/EntryForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import TimelineFilter, { TimelineRange } from "@/components/TimelineFilter";
import { useToast } from "@/hooks/use-toast";

interface Entry {
  id: string;
  date: string;
  net: number;
  betAmount: number;
  winningAmount: number;
  notes?: string;
}

interface DataPoint extends Entry {
  running: number;
}

export default function Home() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [baseline, setBaseline] = useState(-600);
  const [viewMode, setViewMode] = useState<"per-bet" | "per-day">("per-bet");
  const [storageMode, setStorageMode] = useState<"local" | "server">("local");
  const [timelineRange, setTimelineRange] = useState<TimelineRange>("all");
  const [entries, setEntries] = useState<Entry[]>([
    { id: "1", date: "2025-10-01T14:30", net: 500, betAmount: 100, winningAmount: 600, notes: "NBA Lakers spread" },
    { id: "2", date: "2025-10-01T19:00", net: 200, betAmount: 100, winningAmount: 300, notes: "MLB Yankees ML" },
    { id: "3", date: "2025-10-02T15:00", net: 300, betAmount: 150, winningAmount: 450, notes: "NFL parlay 3-leg" },
    { id: "4", date: "2025-10-02T20:30", net: -150, betAmount: 150, winningAmount: 0, notes: "Live bet Celtics - loss" },
    { id: "5", date: "2025-10-03T16:45", net: -600, betAmount: 600, winningAmount: 0, notes: "Bad beat - Cowboys last second TD" },
    { id: "6", date: "2025-10-03T21:00", net: 100, betAmount: 50, winningAmount: 150, notes: "Small NHL win" },
    { id: "7", date: "2025-10-04T14:00", net: -400, betAmount: 400, winningAmount: 0, notes: "MLB parlay busted" },
    { id: "8", date: "2025-10-04T20:15", net: -250, betAmount: 250, winningAmount: 0, notes: "Live NBA bet - loss" },
    { id: "9", date: "2025-10-05T13:30", net: -200, betAmount: 200, winningAmount: 0, notes: "NFL early game loss" },
    { id: "10", date: "2025-10-05T17:00", net: -100, betAmount: 100, winningAmount: 0, notes: "Afternoon slate - nothing hit" },
    { id: "11", date: "2025-10-05T21:00", net: 50, betAmount: 25, winningAmount: 75, notes: "Small late game win" },
    { id: "12", date: "2025-10-06T15:30", net: 400, betAmount: 0, winningAmount: 400, notes: "Added $400 from pocket (total investment now $1000)" },
    { id: "13", date: "2025-10-06T19:00", net: 300, betAmount: 100, winningAmount: 400, notes: "NBA 5-team parlay hits!" },
    { id: "14", date: "2025-10-07T14:30", net: 200, betAmount: 100, winningAmount: 300, notes: "MLB afternoon slate" },
    { id: "15", date: "2025-10-07T20:00", net: 400, betAmount: 200, winningAmount: 600, notes: "NFL Sunday night winner" },
    { id: "16", date: "2025-10-08T15:00", net: -150, betAmount: 150, winningAmount: 0, notes: "MLB loss" },
    { id: "17", date: "2025-10-08T17:45", net: -50, betAmount: 50, winningAmount: 0, notes: "Small live bet loss" },
    { id: "18", date: "2025-10-08T21:30", net: 100, betAmount: 50, winningAmount: 150, notes: "Late game recovery" },
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

  const { filteredData, startingBalance, firstEntryId } = useMemo(() => {
    const sorted = [...entries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const firstId = sorted.length > 0 ? sorted[0].id : null;

    const cutoffDate = getCutoffDate(timelineRange);
    const now = new Date();
    
    if (!cutoffDate) {
      return {
        filteredData: sorted.filter((e) => new Date(e.date) <= now),
        startingBalance: baseline,
        firstEntryId: firstId,
      };
    }

    const beforeCutoff = sorted.filter((e) => new Date(e.date) < cutoffDate);
    const afterCutoff = sorted.filter((e) => {
      const entryDate = new Date(e.date);
      return entryDate >= cutoffDate && entryDate <= now;
    });

    let balanceBeforeCutoff = baseline;
    beforeCutoff.forEach((e) => {
      if (e.id === firstId && e.net >= 0) {
        balanceBeforeCutoff += e.betAmount + e.net;
      } else {
        balanceBeforeCutoff += e.net;
      }
    });

    return {
      filteredData: afterCutoff,
      startingBalance: balanceBeforeCutoff,
      firstEntryId: firstId,
    };
  }, [entries, timelineRange, baseline]);

  const dataPoints = useMemo(() => {
    if (viewMode === "per-day") {
      const dailyGroups = new Map<string, Entry[]>();
      
      for (const entry of filteredData) {
        const dateKey = entry.date.split("T")[0];
        if (!dailyGroups.has(dateKey)) {
          dailyGroups.set(dateKey, []);
        }
        dailyGroups.get(dateKey)!.push(entry);
      }

      const aggregated: DataPoint[] = [];
      let running = startingBalance;

      for (const [dateKey, dayEntries] of Array.from(dailyGroups.entries()).sort()) {
        const totalNet = dayEntries.reduce((sum, e) => sum + e.net, 0);
        const totalBet = dayEntries.reduce((sum, e) => sum + e.betAmount, 0);
        const totalWinning = dayEntries.reduce((sum, e) => sum + e.winningAmount, 0);
        const notes = `${dayEntries.length} ${dayEntries.length === 1 ? "bet" : "bets"}`;

        const isFirstEntryInDay = dayEntries.some((e) => e.id === firstEntryId);
        const firstEntry = dayEntries.find((e) => e.id === firstEntryId);

        if (isFirstEntryInDay && firstEntry && firstEntry.net >= 0) {
          running += firstEntry.betAmount + firstEntry.net;
          const remainingNet = totalNet - firstEntry.net;
          running += remainingNet;
        } else {
          running += totalNet;
        }

        aggregated.push({
          id: dateKey,
          date: `${dateKey}T12:00`,
          net: totalNet,
          betAmount: totalBet,
          winningAmount: totalWinning,
          notes,
          running,
        });
      }

      return aggregated;
    } else {
      let running = startingBalance;
      return filteredData.map((entry) => {
        if (entry.id === firstEntryId && entry.net >= 0) {
          running += entry.betAmount + entry.net;
        } else {
          running += entry.net;
        }
        return { ...entry, running };
      });
    }
  }, [filteredData, startingBalance, firstEntryId, viewMode]);
  
  const currentBalance = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].running : startingBalance;
  const netPL = currentBalance - startingBalance;
  const peakBalance = Math.max(...dataPoints.map((d) => d.running), startingBalance);
  const maxDrawdown = Math.min(...dataPoints.map((d) => d.running - startingBalance), 0);

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

  const handleSaveEntry = (entryData: { date: string; net: number; betAmount: number; winningAmount: number; notes: string }) => {
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
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const importedEntries: Entry[] = [];
          const existingKeys = new Set(
            entries.map((e) => `${e.date}-${e.notes}-${e.net}`)
          );
          let skippedCount = 0;
          let invalidCount = 0;

          for (const row of results.data as any[]) {
            if (!row.date || row.net === undefined) {
              invalidCount++;
              continue;
            }

            const net = Number(row.net);
            const betAmount = Number(row.betAmount || 0);
            const winningAmount = Number(row.winningAmount || 0);

            if (isNaN(net) || isNaN(betAmount) || isNaN(winningAmount)) {
              invalidCount++;
              continue;
            }

            const key = `${row.date}-${row.notes || ""}-${net}`;
            if (existingKeys.has(key)) {
              skippedCount++;
              continue;
            }

            existingKeys.add(key);

            importedEntries.push({
              id: Date.now().toString() + Math.random(),
              date: row.date,
              net,
              betAmount,
              winningAmount,
              notes: row.notes || "",
            });
          }

          if (importedEntries.length > 0) {
            setEntries([...entries, ...importedEntries]);
            const messages = [`Imported ${importedEntries.length} ${importedEntries.length === 1 ? "entry" : "entries"}`];
            if (skippedCount > 0) messages.push(`${skippedCount} duplicate${skippedCount === 1 ? "" : "s"} skipped`);
            if (invalidCount > 0) messages.push(`${invalidCount} invalid row${invalidCount === 1 ? "" : "s"} skipped`);
            
            toast({
              title: "Import Successful",
              description: messages.join(", "),
            });
          } else {
            const messages = [];
            if (skippedCount > 0) messages.push(`${skippedCount} duplicate${skippedCount === 1 ? "" : "s"}`);
            if (invalidCount > 0) messages.push(`${invalidCount} invalid row${invalidCount === 1 ? "" : "s"}`);
            
            toast({
              title: "No Entries Imported",
              description: messages.length > 0 ? messages.join(", ") : "CSV file is empty",
            });
          }
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "Error parsing CSV file. Please check the format.",
            variant: "destructive",
          });
        }
      },
      error: () => {
        toast({
          title: "Import Failed",
          description: "Could not read the CSV file.",
          variant: "destructive",
        });
      },
    });

    event.target.value = "";
  };

  const handleExportCsv = () => {
    const sorted = [...entries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const csvData = sorted.map((entry) => ({
      date: entry.date,
      betAmount: entry.betAmount,
      winningAmount: entry.winningAmount,
      net: entry.net,
      notes: entry.notes || "",
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `betting-tracker-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `Exported ${sorted.length} ${sorted.length === 1 ? "entry" : "entries"}`,
    });
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

        <ChartCard data={dataPoints} baseline={startingBalance} />

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

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        style={{ display: "none" }}
        data-testid="input-csv-file"
      />
    </div>
  );
}
