import ChartCard from "../ChartCard";

export default function ChartCardExample() {
  const mockData = [
    { date: "2025-09-30", running: 1000, net: 400, notes: "PADRES/CUBS — NRFI" },
    { date: "2025-10-01", running: 1900, net: 900, notes: "Parlay win" },
    { date: "2025-10-02", running: 500, net: -1400, notes: "Loss — large stake" },
    { date: "2025-10-03", running: 1350, net: 850, notes: "MLB win" },
    { date: "2025-10-04", running: 1550, net: 200, notes: "Small win" },
  ];

  return <ChartCard data={mockData} baseline={600} />;
}
