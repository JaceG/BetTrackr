import DataTable from "../DataTable";

export default function DataTableExample() {
  const mockEntries = [
    {
      id: "1",
      date: "2025-09-30",
      net: 400,
      running: 1000,
      notes: "PADRES/CUBS — NRFI",
    },
    {
      id: "2",
      date: "2025-10-01",
      net: 900,
      running: 1900,
      notes: "Parlay win",
    },
    {
      id: "3",
      date: "2025-10-02",
      net: -1400,
      running: 500,
      notes: "Loss — large stake",
    },
    {
      id: "4",
      date: "2025-10-03",
      net: 850,
      running: 1350,
      notes: "MLB win",
    },
  ];

  return (
    <DataTable
      entries={mockEntries}
      onEdit={(id) => console.log("Edit", id)}
      onDelete={(id) => console.log("Delete", id)}
    />
  );
}
