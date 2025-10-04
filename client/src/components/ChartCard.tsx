import { useEffect, useRef } from "react";
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

interface CapitalInjection {
  id: string;
  date: string;
  amount: number;
  notes?: string;
}

interface ChartCardProps {
  data: DataPoint[];
  baseline: number;
  capitalInjections?: CapitalInjection[];
}

export default function ChartCard({ data, baseline, capitalInjections = [] }: ChartCardProps) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const chartRef = useRef<any>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const labels = ["Start", ...data.map((d) => new Date(d.date).toLocaleDateString())];
  const runningBalances = [baseline, ...data.map((d) => d.running)];

  useEffect(() => {
    if (!isMobile || !chartRef.current) return;
    
    const handleTouch = () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      
      tooltipTimeoutRef.current = setTimeout(() => {
        const chart = chartRef.current;
        if (chart) {
          chart.tooltip?.setActiveElements([], { x: 0, y: 0 });
          chart.update();
        }
      }, 2500);
    };

    const chartElement = chartRef.current?.canvas;
    if (chartElement) {
      chartElement.addEventListener('touchstart', handleTouch);
      return () => {
        chartElement.removeEventListener('touchstart', handleTouch);
        if (tooltipTimeoutRef.current) {
          clearTimeout(tooltipTimeoutRef.current);
        }
      };
    }
  }, [isMobile]);

  const peak = runningBalances.length > 0 ? Math.max(...runningBalances) : baseline;
  const valley = runningBalances.length > 0 ? Math.min(...runningBalances) : baseline;
  const stepSize = isMobile ? 1000 : 500;
  const yMin = Math.floor((valley - 1000) / stepSize) * stepSize;
  const yMax = Math.ceil((peak + 1000) / stepSize) * stepSize;

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
        borderWidth: isMobile ? 2 : 3,
        pointRadius: isMobile ? 5 : 4,
        pointHoverRadius: isMobile ? 8 : 6,
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
    onClick: isMobile ? (event, elements, chart) => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      tooltipTimeoutRef.current = setTimeout(() => {
        chart.tooltip?.setActiveElements([], { x: 0, y: 0 });
        chart.update();
      }, 2500);
    } : undefined,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        position: isMobile ? 'nearest' : 'average',
        backgroundColor: "hsl(220, 14%, 14%)",
        titleColor: "hsl(0, 0%, 95%)",
        bodyColor: "hsl(0, 0%, 95%)",
        borderColor: "hsl(220, 10%, 18%)",
        borderWidth: 1,
        padding: isMobile ? 8 : 12,
        displayColors: false,
        titleFont: {
          size: isMobile ? 11 : 12,
        },
        bodyFont: {
          size: isMobile ? 10 : 12,
        },
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            if (index === 0) {
              return "Start";
            }
            const date = new Date(data[index - 1].date);
            return isMobile ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `Date: ${data[index - 1].date}`;
          },
          label: (context) => {
            const index = context.dataIndex;
            if (index === 0) {
              return `Start: $${baseline.toLocaleString()}`;
            }
            const point = data[index - 1];
            const labels = [
              `Net: ${point.net >= 0 ? "+" : ""}$${point.net.toLocaleString()}`,
              `Balance: $${point.running.toLocaleString()}`,
            ];
            if (point.notes && !isMobile) {
              labels.push(`Notes: ${point.notes}`);
            }
            return labels;
          },
        },
      },
      annotation: {
        annotations: capitalInjections.reduce((acc, injection, idx) => {
          const dataIndex = labels.findIndex((label, i) => {
            if (i === 0) return false;
            return data[i - 1].date === injection.date;
          });
          
          if (dataIndex !== -1) {
            acc[`injection-${idx}`] = {
              type: 'line',
              xMin: dataIndex,
              xMax: dataIndex,
              borderColor: 'hsl(45, 93%, 47%)',
              borderWidth: 2,
              borderDash: [6, 6],
              label: {
                display: true,
                content: `+$${injection.amount.toLocaleString()}`,
                position: 'start',
                backgroundColor: 'hsl(45, 93%, 47%)',
                color: 'hsl(0, 0%, 0%)',
                font: {
                  size: isMobile ? 9 : 11,
                  weight: 'bold',
                },
                padding: isMobile ? 2 : 4,
              },
            };
          }
          return acc;
        }, {} as any),
      },
    },
    scales: {
      y: {
        min: yMin,
        max: yMax,
        ticks: {
          stepSize: stepSize,
          color: "hsl(0, 0%, 65%)",
          font: {
            size: isMobile ? 9 : 11,
          },
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
          font: {
            size: isMobile ? 9 : 10,
          },
          maxRotation: isMobile ? 90 : 45,
          minRotation: isMobile ? 45 : 0,
          autoSkip: true,
          maxTicksLimit: isMobile ? 8 : 15,
        },
      },
    },
  };

  return (
    <Card className="p-3 sm:p-4 lg:p-6">
      <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Balance Over Time</h2>
      <div className="h-[300px] sm:h-[400px] lg:h-[600px]" data-testid="chart-balance">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </Card>
  );
}
