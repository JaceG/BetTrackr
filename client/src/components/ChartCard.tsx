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
  Plugin,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";

const crosshairPlugin: Plugin<"line"> = {
  id: "crosshair",
  afterDatasetsDraw: (chart) => {
    const activeElements = chart.tooltip?.getActiveElements();
    if (activeElements && activeElements.length > 0) {
      const ctx = chart.ctx;
      // Find the Running Balance dataset (index 1, the second dataset)
      const runningBalancePoint = activeElements.find((el: any) => el.datasetIndex === 1);
      if (!runningBalancePoint) return;
      
      const y = runningBalancePoint.element.y;
      const leftX = chart.chartArea.left;
      const rightX = chart.chartArea.right;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(leftX, y);
      ctx.lineTo(rightX, y);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(156, 163, 175, 0.7)";
      ctx.setLineDash([5, 3]);
      ctx.stroke();
      ctx.restore();
    }
  },
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin,
  crosshairPlugin
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
  const labels = ["Start", ...data.map((d) => new Date(d.date).toLocaleDateString())];
  const runningBalances = [baseline, ...data.map((d) => d.running)];

  const peak = runningBalances.length > 0 ? Math.max(...runningBalances) : baseline;
  const valley = runningBalances.length > 0 ? Math.min(...runningBalances) : baseline;
  const yMin = Math.floor((valley - 1000) / 500) * 500;
  const yMax = Math.ceil((peak + 1000) / 500) * 500;

  let currentInvestment = baseline;
  const totalInvested = [baseline, ...data.map((d) => {
    const note = d.notes?.toLowerCase() || "";
    if (note.includes("added") && note.includes("pocket")) {
      const match = note.match(/total investment now \$(\d+)/i);
      if (match) {
        currentInvestment = Number(match[1]);
      }
    }
    return currentInvestment;
  })];

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
            if (index === 0) {
              return "Starting Balance";
            }
            return `Date: ${data[index - 1].date}`;
          },
          label: (context) => {
            const index = context.dataIndex;
            if (index === 0) {
              return `Starting Balance: $${baseline.toLocaleString()}`;
            }
            const point = data[index - 1];
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
        min: yMin,
        max: yMax,
        ticks: {
          stepSize: 500,
          color: "hsl(0, 0%, 65%)",
          callback: (value) => `$${Number(value).toLocaleString()}`,
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
