import ChartCard from "../ChartCard";

export default function ChartCardExample() {
  const mockData = [
    { date: "2025-10-01", running: 1100, net: 500, notes: "NBA Lakers spread" },
    { date: "2025-10-01", running: 1300, net: 200, notes: "MLB Yankees ML" },
    { date: "2025-10-02", running: 1600, net: 300, notes: "NFL parlay 3-leg" },
    { date: "2025-10-02", running: 1450, net: -150, notes: "Live bet Celtics - loss" },
    { date: "2025-10-03", running: 850, net: -600, notes: "Bad beat - Cowboys last second TD" },
    { date: "2025-10-03", running: 950, net: 100, notes: "Small NHL win" },
    { date: "2025-10-04", running: 550, net: -400, notes: "MLB parlay busted" },
    { date: "2025-10-04", running: 300, net: -250, notes: "Live NBA bet - loss" },
    { date: "2025-10-05", running: 100, net: -200, notes: "NFL early game loss" },
    { date: "2025-10-05", running: 0, net: -100, notes: "Afternoon slate - nothing hit" },
    { date: "2025-10-05", running: 50, net: 50, notes: "Small late game win" },
    { date: "2025-10-06", running: 450, net: 400, notes: "Added $400 from pocket (total investment now $1000)" },
    { date: "2025-10-06", running: 750, net: 300, notes: "NBA 5-team parlay hits!" },
    { date: "2025-10-07", running: 950, net: 200, notes: "MLB afternoon slate" },
    { date: "2025-10-07", running: 1350, net: 400, notes: "NFL Sunday night winner" },
    { date: "2025-10-08", running: 1200, net: -150, notes: "MLB loss" },
    { date: "2025-10-08", running: 1150, net: -50, notes: "Small live bet loss" },
    { date: "2025-10-08", running: 1250, net: 100, notes: "Late game recovery" },
  ];

  return <ChartCard data={mockData} baseline={600} />;
}
