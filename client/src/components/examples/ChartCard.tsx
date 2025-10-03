import ChartCard from "../ChartCard";

export default function ChartCardExample() {
  const mockData = [
    { date: "2025-09-30", running: 1000, net: 400, notes: "PADRES/CUBS — NRFI" },
    { date: "2025-10-01", running: 1500, net: 500, notes: "NBA parlay" },
    { date: "2025-10-02", running: 300, net: -1200, notes: "Loss — large stake" },
    { date: "2025-10-03", running: 150, net: -150, notes: "Another loss" },
    { date: "2025-10-04", running: 550, net: 400, notes: "Recovery win" },
    { date: "2025-10-05", running: 850, net: 300, notes: "MLB win" },
    { date: "2025-10-06", running: 450, net: -400, notes: "Small loss" },
    { date: "2025-10-07", running: 1100, net: 650, notes: "Big comeback" },
  ];

  return <ChartCard data={mockData} baseline={600} />;
}
