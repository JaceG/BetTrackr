import ChartCard from "../ChartCard";

export default function ChartCardExample() {
  const mockData = [
    { date: "2025-10-01", running: 1100, net: 500, notes: "Starting strong - NBA win" },
    { date: "2025-10-02", running: 1400, net: 300, notes: "MLB parlay hits" },
    { date: "2025-10-03", running: 800, net: -600, notes: "Bad beat - loss eating profits" },
    { date: "2025-10-04", running: 400, net: -400, notes: "Another loss - now in the red vs $600 start" },
    { date: "2025-10-05", running: 100, net: -300, notes: "Deep loss - only $100 left" },
    { date: "2025-10-06", running: 500, net: 400, notes: "Added $400 from pocket (total investment now $1000)" },
    { date: "2025-10-07", running: 1100, net: 600, notes: "Big win - back to profit!" },
    { date: "2025-10-08", running: 900, net: -200, notes: "Small loss but still below $1000 total investment" },
  ];

  return <ChartCard data={mockData} baseline={600} />;
}
