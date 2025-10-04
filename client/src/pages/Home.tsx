import { useState, useMemo, useRef, useEffect } from "react";
import Papa from "papaparse";
import { z } from "zod";
import Controls from "@/components/Controls";
import StatsStrip from "@/components/StatsStrip";
import ChartCard from "@/components/ChartCard";
import DataTable from "@/components/DataTable";
import EntryForm from "@/components/EntryForm";
import TipExpenseForm from "@/components/TipExpenseForm";
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

interface CapitalInjection {
  id: string;
  date: string;
  amount: number;
  notes?: string;
}

interface TipExpense {
  id: string;
  date: string;
  amount: number;
  provider?: string;
  notes?: string;
}

interface DataPoint extends Entry {
  running: number;
}

const STORAGE_KEY = "bt.entries.v1";
const BASELINE_KEY = "bt.baseline.v1";
const INJECTIONS_KEY = "bt.injections.v7";
const TIP_EXPENSES_KEY = "bt.tipExpenses.v1";

const entrySchema = z.object({
  id: z.string(),
  date: z.string(),
  net: z.coerce.number(),
  betAmount: z.coerce.number(),
  winningAmount: z.coerce.number(),
  notes: z.string().optional(),
});

const capitalInjectionSchema = z.object({
  id: z.string(),
  date: z.string(),
  amount: z.coerce.number(),
  notes: z.string().optional(),
});

const tipExpenseSchema = z.object({
  id: z.string(),
  date: z.string(),
  amount: z.coerce.number(),
  provider: z.string().optional(),
  notes: z.string().optional(),
});

const entriesArraySchema = z.array(entrySchema);
const injectionsArraySchema = z.array(capitalInjectionSchema);
const tipExpensesArraySchema = z.array(tipExpenseSchema);

export default function Home() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [baseline, setBaseline] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"per-bet" | "per-day">("per-bet");
  const [timelineRange, setTimelineRange] = useState<TimelineRange>("all");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [capitalInjections, setCapitalInjections] = useState<CapitalInjection[]>([]);
  const [tipExpenses, setTipExpenses] = useState<TipExpense[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [tipExpenseFormOpen, setTipExpenseFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.removeItem('bt.injections.v1');
    localStorage.removeItem('bt.injections.v2');
    localStorage.removeItem('bt.injections.v3');
    localStorage.removeItem('bt.injections.v4');
    localStorage.removeItem('bt.injections.v5');
    localStorage.removeItem('bt.injections.v6');
    localStorage.removeItem('bt.injections.v7');
    
    console.log('Cleared all old injection data');
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const validated = entriesArraySchema.safeParse(parsed);
        
        if (validated.success) {
          console.log('=== LOADED ENTRIES ===');
          console.log('Total entries loaded:', validated.data.length);
          validated.data.forEach((entry, idx) => {
            console.log(`Entry ${idx + 1}: ${entry.date} | Net: ${entry.net} | Bet: ${entry.betAmount} | Win: ${entry.winningAmount}`);
          });
          console.log('=== END LOADED ENTRIES ===');
          setEntries(validated.data);
        } else {
          console.error("Invalid entries in localStorage, clearing:", validated.error);
          localStorage.removeItem(STORAGE_KEY);
        }
      } else {
        console.log('No entries found in localStorage');
      }

      const storedBaseline = localStorage.getItem(BASELINE_KEY);
      if (storedBaseline) {
        const baselineValue = Number(storedBaseline);
        if (isFinite(baselineValue)) {
          console.log('Loaded baseline from localStorage:', baselineValue);
          setBaseline(baselineValue);
        } else {
          console.error("Invalid baseline in localStorage, using default");
        }
      } else {
        console.log('No baseline found in localStorage');
      }

      const storedInjections = localStorage.getItem(INJECTIONS_KEY);
      if (storedInjections) {
        const parsed = JSON.parse(storedInjections);
        const validated = injectionsArraySchema.safeParse(parsed);
        
        if (validated.success) {
          setCapitalInjections(validated.data);
        } else {
          console.error("Invalid injections in localStorage, clearing:", validated.error);
          localStorage.removeItem(INJECTIONS_KEY);
        }
      }

      const storedTipExpenses = localStorage.getItem(TIP_EXPENSES_KEY);
      if (storedTipExpenses) {
        const parsed = JSON.parse(storedTipExpenses);
        const validated = tipExpensesArraySchema.safeParse(parsed);
        
        if (validated.success) {
          setTipExpenses(validated.data);
        } else {
          console.error("Invalid tip expenses in localStorage, clearing:", validated.error);
          localStorage.removeItem(TIP_EXPENSES_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(BASELINE_KEY);
      localStorage.removeItem(INJECTIONS_KEY);
      localStorage.removeItem(TIP_EXPENSES_KEY);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }, [entries]);

  useEffect(() => {
    try {
      if (baseline !== null) {
        localStorage.setItem(BASELINE_KEY, baseline.toString());
      } else {
        localStorage.removeItem(BASELINE_KEY);
      }
    } catch (error) {
      console.error("Failed to save baseline to localStorage:", error);
    }
  }, [baseline]);

  useEffect(() => {
    try {
      localStorage.setItem(INJECTIONS_KEY, JSON.stringify(capitalInjections));
    } catch (error) {
      console.error("Failed to save capital injections to localStorage:", error);
    }
  }, [capitalInjections]);

  useEffect(() => {
    try {
      localStorage.setItem(TIP_EXPENSES_KEY, JSON.stringify(tipExpenses));
    } catch (error) {
      console.error("Failed to save tip expenses to localStorage:", error);
    }
  }, [tipExpenses]);

  useEffect(() => {
    if (baseline !== null && entries.length > 0) {
      const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const sortedExpenses = [...tipExpenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      console.log('=== CAPITAL INJECTION CALCULATION ===');
      console.log('Baseline:', baseline);
      console.log('Total Entries:', sorted.length);
      console.log('Total Tip Expenses:', sortedExpenses.length);
      
      const newInjections: CapitalInjection[] = [];
      let running = baseline;
      const injectionDates = new Set<number>();
      const firstEntryId = sorted[0]?.id;
      
      let entryIdx = 0;
      let expenseIdx = 0;
      
      while (entryIdx < sorted.length || expenseIdx < sortedExpenses.length) {
        const entry = sorted[entryIdx];
        const expense = sortedExpenses[expenseIdx];
        
        const entryTime = entry ? new Date(entry.date).getTime() : Infinity;
        const expenseTime = expense ? new Date(expense.date).getTime() : Infinity;
        
        if (entryTime <= expenseTime && entry) {
          const beforeNet = running;
          
          if (entry.id === firstEntryId && entry.net >= 0) {
            running += entry.betAmount + entry.net;
            console.log(`Entry ${entry.date}: FIRST ENTRY +betAmount, net=${entry.net}, running: ${beforeNet} → ${running}`);
          } else {
            running += entry.net;
            console.log(`Entry ${entry.date}: net=${entry.net}, running: ${beforeNet} → ${running}`);
          }
          
          if (running < baseline && entry.net < 0) {
            if (!injectionDates.has(entryTime)) {
              const injectionAmount = Math.abs(running - baseline);
              console.log(`  → INJECTION TRIGGERED: balance=${running}, baseline=${baseline}, inject ${injectionAmount} to reach baseline`);
              newInjections.push({
                id: `${Date.now()}-${Math.random()}`,
                date: entry.date,
                amount: injectionAmount,
                notes: `Auto-generated: balance went below starting line`,
              });
              injectionDates.add(entryTime);
              running += injectionAmount;
              console.log(`  → After injection: running=${running}`);
            }
          }
          
          entryIdx++;
        } else if (expense) {
          const beforeExpense = running;
          running -= expense.amount;
          console.log(`Tip Expense ${expense.date}: -${expense.amount}, running: ${beforeExpense} → ${running}`);
          
          if (running < baseline) {
            if (!injectionDates.has(expenseTime)) {
              const injectionAmount = Math.abs(running - baseline);
              console.log(`  → INJECTION TRIGGERED: balance=${running}, baseline=${baseline}, inject ${injectionAmount} to reach baseline`);
              newInjections.push({
                id: `${Date.now()}-${Math.random()}`,
                date: expense.date,
                amount: injectionAmount,
                notes: `Auto-generated: balance went below starting line (tip expense)`,
              });
              injectionDates.add(expenseTime);
              running += injectionAmount;
              console.log(`  → After injection: running=${running}`);
            }
          }
          
          expenseIdx++;
        }
      }
      
      console.log('Total Injections Generated:', newInjections.length);
      console.log('Injection Details:', newInjections);
      console.log('=== END CAPITAL INJECTION CALCULATION ===');
      
      setCapitalInjections(newInjections);
      
      if (newInjections.length > 0 && capitalInjections.length === 0) {
        toast({
          title: "Capital Injections Calculated",
          description: `Generated ${newInjections.length} capital injection${newInjections.length === 1 ? "" : "s"} for existing entries and expenses`,
        });
      }
    }
  }, [baseline, entries, tipExpenses, toast]);

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

  const { filteredData, filteredTipExpenses, startingBalance, firstEntryId } = useMemo(() => {
    const sorted = [...entries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const firstId = sorted.length > 0 ? sorted[0].id : null;

    const cutoffDate = getCutoffDate(timelineRange);
    const now = new Date();
    
    if (!cutoffDate) {
      return {
        filteredData: sorted.filter((e) => new Date(e.date) <= now),
        filteredTipExpenses: tipExpenses.filter((exp) => new Date(exp.date) <= now),
        startingBalance: baseline ?? 0,
        firstEntryId: firstId,
      };
    }

    const beforeCutoff = sorted.filter((e) => new Date(e.date) < cutoffDate);
    const afterCutoff = sorted.filter((e) => {
      const entryDate = new Date(e.date);
      return entryDate >= cutoffDate && entryDate <= now;
    });

    let balanceBeforeCutoff = baseline ?? 0;
    beforeCutoff.forEach((e) => {
      if (e.id === firstId && e.net >= 0) {
        balanceBeforeCutoff += e.betAmount + e.net;
      } else {
        balanceBeforeCutoff += e.net;
      }
    });
    
    const tipExpensesBeforeCutoff = tipExpenses.filter(exp => new Date(exp.date) < cutoffDate);
    tipExpensesBeforeCutoff.forEach(exp => {
      balanceBeforeCutoff -= exp.amount;
    });
    
    const tipExpensesInRange = tipExpenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return expDate >= cutoffDate && expDate <= now;
    });

    return {
      filteredData: afterCutoff,
      filteredTipExpenses: tipExpensesInRange,
      startingBalance: balanceBeforeCutoff,
      firstEntryId: firstId,
    };
  }, [entries, timelineRange, baseline, tipExpenses]);

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
      
      const tipExpensesByDay = new Map<string, number>();
      for (const exp of filteredTipExpenses) {
        const dateKey = exp.date.split("T")[0];
        tipExpensesByDay.set(dateKey, (tipExpensesByDay.get(dateKey) || 0) + exp.amount);
      }
      
      const allDates = new Set([...dailyGroups.keys(), ...tipExpensesByDay.keys()]);
      const sortedDates = Array.from(allDates).sort();

      const aggregated: DataPoint[] = [];
      let running = startingBalance;

      for (const dateKey of sortedDates) {
        const dayEntries = dailyGroups.get(dateKey) || [];
        const tipTotal = tipExpensesByDay.get(dateKey) || 0;
        
        const totalNet = dayEntries.reduce((sum, e) => sum + e.net, 0);
        const totalBet = dayEntries.reduce((sum, e) => sum + e.betAmount, 0);
        const totalWinning = dayEntries.reduce((sum, e) => sum + e.winningAmount, 0);
        
        let notes = "";
        if (dayEntries.length > 0 && tipTotal > 0) {
          notes = `${dayEntries.length} ${dayEntries.length === 1 ? "bet" : "bets"}, $${tipTotal} tip`;
        } else if (dayEntries.length > 0) {
          notes = `${dayEntries.length} ${dayEntries.length === 1 ? "bet" : "bets"}`;
        } else if (tipTotal > 0) {
          notes = `$${tipTotal} tip expense`;
        }

        const isFirstEntryInDay = dayEntries.some((e) => e.id === firstEntryId);
        const firstEntry = dayEntries.find((e) => e.id === firstEntryId);

        if (isFirstEntryInDay && firstEntry && firstEntry.net >= 0) {
          running += firstEntry.betAmount + firstEntry.net;
          const remainingNet = totalNet - firstEntry.net;
          running += remainingNet;
        } else {
          running += totalNet;
        }
        
        running -= tipTotal;

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
      const sortedTipExpenses = [...filteredTipExpenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      let running = startingBalance;
      let tipIndex = 0;
      
      return filteredData.map((entry) => {
        const entryTime = new Date(entry.date).getTime();
        
        while (tipIndex < sortedTipExpenses.length && new Date(sortedTipExpenses[tipIndex].date).getTime() <= entryTime) {
          running -= sortedTipExpenses[tipIndex].amount;
          tipIndex++;
        }
        
        if (entry.id === firstEntryId && entry.net >= 0) {
          running += entry.betAmount + entry.net;
        } else {
          running += entry.net;
        }
        return { ...entry, running };
      });
    }
  }, [filteredData, filteredTipExpenses, startingBalance, firstEntryId, viewMode]);
  
  let currentBalance = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].running : startingBalance;
  
  if (viewMode === "per-bet" && dataPoints.length > 0) {
    const lastEntryTime = new Date(dataPoints[dataPoints.length - 1].date).getTime();
    const tipExpensesAfterLastEntry = filteredTipExpenses.filter(exp => new Date(exp.date).getTime() > lastEntryTime);
    const tipTotalAfterLastEntry = tipExpensesAfterLastEntry.reduce((sum, exp) => sum + exp.amount, 0);
    currentBalance -= tipTotalAfterLastEntry;
  }
  
  const netPL = currentBalance - startingBalance;
  const peakBalance = Math.max(...dataPoints.map((d) => d.running), startingBalance);
  
  let peak = startingBalance;
  let maxDrawdown = 0;
  for (const d of dataPoints) {
    peak = Math.max(peak, d.running);
    const drawdown = d.running - peak;
    maxDrawdown = Math.min(maxDrawdown, drawdown);
  }
  
  const totalInjections = capitalInjections.reduce((sum, inj) => sum + inj.amount, 0);
  const totalTipExpenses = tipExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalCapitalInvested = Math.abs(baseline ?? 0) + totalInjections;
  const netProfit = currentBalance - startingBalance;
  const trueROI = totalCapitalInvested > 0 ? ((netProfit / totalCapitalInvested) * 100) : 0;
  
  console.log('=== STATS CALCULATION ===');
  console.log('Baseline (Starting Bet):', baseline);
  console.log('Starting Balance (timeline):', startingBalance);
  console.log('Capital Injections:', capitalInjections);
  console.log('Total Injections Amount:', totalInjections);
  console.log('Tip Expenses:', tipExpenses);
  console.log('Total Tip Expenses:', totalTipExpenses);
  console.log('Total Capital Invested (baseline + injections):', `${Math.abs(baseline ?? 0)} + ${totalInjections} = ${totalCapitalInvested}`);
  console.log('Current Balance:', currentBalance);
  console.log('Net P/L:', netPL);
  console.log('Net Profit (after tips):', netProfit);
  console.log('Peak Balance:', peakBalance);
  console.log('Max Drawdown:', maxDrawdown);
  console.log('True ROI:', trueROI);
  console.log('=== END STATS ===');

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
      const updatedEntries = [...entries, newEntry];
      
      if (baseline !== null && entryData.net < 0) {
        const sorted = [...updatedEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const allInjectionDates = new Set(capitalInjections.map(inj => new Date(inj.date).getTime()));
        const injectionsByDate = new Map(capitalInjections.map(inj => [new Date(inj.date).getTime(), inj.amount]));
        
        let running = baseline;
        for (const entry of sorted) {
          running += entry.net;
          
          const entryTime = new Date(entry.date).getTime();
          if (injectionsByDate.has(entryTime)) {
            running += injectionsByDate.get(entryTime)!;
          }
          
          if (running < baseline && entry.net < 0 && entry.id === newEntry.id) {
            const alreadyExists = allInjectionDates.has(entryTime);
            
            if (!alreadyExists) {
              const injectionAmount = Math.abs(running - baseline);
              const newInjection: CapitalInjection = {
                id: (Date.now() + 1).toString(),
                date: entry.date,
                amount: injectionAmount,
                notes: `Auto-generated: balance went below starting line`,
              };
              setCapitalInjections([...capitalInjections, newInjection]);
              
              toast({
                title: "Capital Injection Recorded",
                description: `Added $${injectionAmount.toLocaleString()} injection - balance went below starting line`,
              });
              break;
            }
          }
        }
      }
      
      setEntries(updatedEntries);
    }
  };

  const handleAddTipExpense = () => {
    setTipExpenseFormOpen(true);
  };

  const handleSaveTipExpense = (expenseData: { date: string; amount: number; provider: string; notes: string }) => {
    const newExpense: TipExpense = {
      id: Date.now().toString(),
      ...expenseData,
    };
    setTipExpenses([...tipExpenses, newExpense]);
    
    toast({
      title: "Tip Payment Added",
      description: `Recorded $${expenseData.amount.toLocaleString()} payment`,
    });
  };

  const handleClearAll = () => {
    setConfirmOpen(true);
  };

  const confirmClearAll = () => {
    if (deleteId === null) {
      setEntries([]);
      setCapitalInjections([]);
      setTipExpenses([]);
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
            const combinedEntries = [...entries, ...importedEntries];
            const sorted = combinedEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            const firstEntry = sorted[0];
            const firstEntryId = firstEntry?.id;
            
            const newInjections: CapitalInjection[] = [];
            
            if (baseline !== null) {
              let running = baseline;
              const allInjectionDates = new Set(capitalInjections.map(inj => new Date(inj.date).getTime()));
              
              for (const entry of sorted) {
                running += entry.net;
                
                if (running < baseline && entry.net < 0) {
                  const entryTime = new Date(entry.date).getTime();
                  const alreadyExists = allInjectionDates.has(entryTime) || 
                    newInjections.some(inj => new Date(inj.date).getTime() === entryTime);
                  
                  if (!alreadyExists) {
                    const injectionAmount = Math.abs(running - baseline);
                    newInjections.push({
                      id: `${Date.now()}-${Math.random()}`,
                      date: entry.date,
                      amount: injectionAmount,
                      notes: `Auto-generated: balance went below starting line`,
                    });
                    allInjectionDates.add(entryTime);
                    running += injectionAmount;
                  }
                }
              }
            }
            
            setEntries(sorted);
            if (newInjections.length > 0) {
              setCapitalInjections([...capitalInjections, ...newInjections]);
            }
            
            const messages = [`Imported ${importedEntries.length} ${importedEntries.length === 1 ? "entry" : "entries"}`];
            if (newInjections.length > 0) messages.push(`${newInjections.length} capital injection${newInjections.length === 1 ? "" : "s"} auto-generated`);
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
        onAddEntry={handleAddEntry}
        onAddTipExpense={handleAddTipExpense}
        onImportCsv={handleImportCsv}
        onExportCsv={handleExportCsv}
        onClear={handleClearAll}
        hasEntries={entries.length > 0}
      />

      <div className="max-w-7xl mx-auto p-2 sm:p-4 space-y-2 sm:space-y-6 pb-8">
        {baseline !== null && (
          <StatsStrip
            currentBalance={currentBalance}
            netPL={netPL}
            peakBalance={peakBalance}
            maxDrawdown={maxDrawdown}
            totalCapitalInvested={totalCapitalInvested}
            totalTipsPaid={totalTipExpenses}
            trueROI={trueROI}
          />
        )}

        <TimelineFilter
          selected={timelineRange}
          onSelect={setTimelineRange}
        />

        <ChartCard data={dataPoints} baseline={startingBalance} capitalInjections={capitalInjections} />

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

      <TipExpenseForm
        open={tipExpenseFormOpen}
        onClose={() => setTipExpenseFormOpen(false)}
        onSave={handleSaveTipExpense}
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
