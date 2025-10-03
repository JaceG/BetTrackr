import { Card } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

interface DataPoint {
  date: string;
  running: number;
  net: number;
  notes?: string;
}

interface ChartCardProps {
  data: DataPoint[];
  baseline: number;
}

export default function ChartCard({ data, baseline }: ChartCardProps) {
  const labels = data.map((d) => new Date(d.date).toLocaleDateString());
  const runningBalances = data.map((d) => d.running);

  let currentInvestment = baseline;
  const totalInvested = data.map((d) => {
    const note = d.notes?.toLowerCase() || "";
    if (note.includes("added") && note.includes("pocket")) {
      const match = note.match(/total investment now \$(\d+)/i);
      if (match) {
        currentInvestment = Number(match[1]);
      }
    }
    return currentInvestment;
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: "Total Capital Invested",
        data: totalInvested,
        borderColor: "hsl(0, 0%, 75%)",
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        stepped: true,
        tension: 0,
      },
      {
        label: "Running Balance",
        data: runningBalances,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0,
        segment: {
          borderColor: (ctx: any) => {
            const idx = ctx.p1.$context.dataIndex;
            const investment = totalInvested[idx];
            return ctx.p1.parsed.y >= investment ? "hsl(142, 76%, 50%)" : "hsl(0, 72%, 60%)";
          },
        },
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "hsl(220, 14%, 14%)",
        titleColor: "hsl(0, 0%, 95%)",
        bodyColor: "hsl(0, 0%, 95%)",
        borderColor: "hsl(220, 10%, 18%)",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            return `Date: ${data[index].date}`;
          },
          label: (context) => {
            const index = context.dataIndex;
            const point = data[index];
            return [
              `Net Change: ${point.net >= 0 ? "+" : ""}$${point.net.toLocaleString()}`,
              `Running Balance: $${point.running.toLocaleString()}`,
              point.notes ? `Notes: ${point.notes}` : "",
            ].filter(Boolean);
          },
        },
      },
      annotation: {
        annotations: {},
      },
    },
    scales: {
      y: {
        min: (() => {
          const currentBalance = runningBalances[runningBalances.length - 1] || baseline;
          const roundedCenter = Math.round(currentBalance / 500) * 500;
          return roundedCenter - 5000;
        })(),
        max: (() => {
          const currentBalance = runningBalances[runningBalances.length - 1] || baseline;
          const roundedCenter = Math.round(currentBalance / 500) * 500;
          return roundedCenter + 5000;
        })(),
        ticks: {
          stepSize: 500,
          color: "hsl(0, 0%, 65%)",
          callback: (value) => `$${value.toLocaleString()}`,
        },
        grid: {
          color: "hsl(220, 10%, 20%, 0.1)",
        },
      },
      x: {
        grid: {
          color: "hsl(220, 10%, 20%, 0.1)",
        },
        ticks: {
          color: "hsl(0, 0%, 65%)",
          maxRotation: 45,
          minRotation: 0,
        },
      },
    },
  };

  return (
    <Card className="p-4 sm:p-6">
      <h2 className="text-lg font-semibold mb-4">Balance Over Time</h2>
      <div className="h-[600px]" data-testid="chart-balance">
        <Line data={chartData} options={options} />
      </div>
    </Card>
  );
}
