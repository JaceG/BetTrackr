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

  const aboveBaseline = runningBalances.map((val) =>
    val >= baseline ? val : null
  );
  const belowBaseline = runningBalances.map((val) =>
    val < baseline ? val : null
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: "Running Balance",
        data: runningBalances,
        borderColor: "hsl(0, 0%, 50%)",
        backgroundColor: "transparent",
        borderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0,
        order: 3,
      },
      {
        label: "Above Baseline",
        data: aboveBaseline,
        borderColor: "hsl(142, 76%, 50%)",
        backgroundColor: "hsl(142, 76%, 50%, 0.1)",
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0,
        spanGaps: true,
        segment: {
          borderColor: (ctx: any) => {
            const value = ctx.p1.parsed.y;
            return value >= baseline ? "hsl(142, 76%, 50%)" : "transparent";
          },
        },
        order: 1,
      },
      {
        label: "Below Baseline",
        data: belowBaseline,
        borderColor: "hsl(0, 72%, 60%)",
        backgroundColor: "hsl(0, 72%, 60%, 0.1)",
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0,
        spanGaps: true,
        segment: {
          borderColor: (ctx: any) => {
            const value = ctx.p1.parsed.y;
            return value < baseline ? "hsl(0, 72%, 60%)" : "transparent";
          },
        },
        order: 2,
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
        annotations: {
          baseline: {
            type: "line",
            yMin: baseline,
            yMax: baseline,
            borderColor: "hsl(0, 0%, 75%)",
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              display: true,
              content: `Baseline: $${baseline}`,
              position: "start",
              backgroundColor: "hsl(220, 14%, 14%)",
              color: "hsl(0, 0%, 95%)",
              padding: 4,
            },
          },
        },
      },
    },
    scales: {
      y: {
        min: Math.min(...runningBalances, baseline) - 200,
        max: Math.max(...runningBalances, baseline) + 200,
        grid: {
          color: "hsl(220, 10%, 20%, 0.1)",
        },
        ticks: {
          color: "hsl(0, 0%, 65%)",
          callback: (value) => `$${value}`,
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
      <div className="h-80 sm:h-96" data-testid="chart-balance">
        <Line data={chartData} options={options} />
      </div>
    </Card>
  );
}
