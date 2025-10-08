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
  Filler,
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
  Filler,
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
  
  // Calculate dynamic step size based on range and chart size
  const range = (peak + 1000) - (valley - 1000);
  
  // Target fewer ticks for larger charts to increase spacing
  // Use window width as proxy for chart size since we can't easily get container dimensions
  const isLargeScreen = typeof window !== 'undefined' && window.innerWidth >= 1024;
  const targetTicks = isMobile ? 8 : isLargeScreen ? 5 : 6;
  const rawStepSize = range / targetTicks;
  
  // Generate nice increments dynamically using 1, 2, 5 pattern across all magnitudes
  const generateNiceIncrements = (minValue: number) => {
    const increments: number[] = [];
    const bases = [1, 2, 5];
    
    // Start from appropriate power of 10 and go up several orders of magnitude
    let power = 100;
    const maxPower = Math.max(1000000000, minValue * 10); // At least billions or 10x the minimum
    
    while (power <= maxPower) {
      bases.forEach(base => {
        increments.push(base * power);
      });
      power *= 10;
    }
    
    return increments.sort((a, b) => a - b);
  };
  
  const niceIncrements = generateNiceIncrements(rawStepSize);
  const stepSize = niceIncrements.find(inc => inc >= rawStepSize) || rawStepSize;
  
  const yMin = Math.floor((valley - 1000) / stepSize) * stepSize;
  const yMax = Math.ceil((peak + 1000) / stepSize) * stepSize;

  const injectionsByDate = new Map<string, number>();
  capitalInjections.forEach(injection => {
    const existing = injectionsByDate.get(injection.date) || 0;
    injectionsByDate.set(injection.date, existing + injection.amount);
  });

  // Track outstanding injections (starts at 0, increases with injections, decreases when recouped)
  let outstandingInjections = 0;
  const processedInjectionDates = new Set<string>();
  
  const adjustedBaseline = [baseline, ...data.map((d) => {
    const injectionAmount = injectionsByDate.get(d.date) || 0;
    
    // Add injection (only once per datetime to prevent double-counting)
    if (injectionAmount > 0 && !processedInjectionDates.has(d.date)) {
      outstandingInjections += injectionAmount;
      processedInjectionDates.add(d.date);
    }
    
    // Calculate current yellow line position BEFORE any recoupment
    const currentYellow = baseline + outstandingInjections;
    
    // If balance exceeds yellow line, we've recouped the excess
    // Reduce outstandingInjections for FUTURE points, but this point stays at currentYellow
    if (d.running > currentYellow) {
      const excess = d.running - currentYellow;
      outstandingInjections = Math.max(0, outstandingInjections - excess);
    }
    
    return currentYellow;
  })];

  const chartData = {
    labels,
    datasets: [
      {
        label: "Capital Invested",
        data: adjustedBaseline,
        backgroundColor: "hsla(45, 93%, 47%, 0.15)",
        borderColor: "hsla(45, 93%, 47%, 0.4)",
        borderWidth: 1,
        pointRadius: 0,
        fill: {
          target: { value: baseline },
          above: "hsla(45, 93%, 47%, 0.15)",
        },
        stepped: true,
        tension: 0,
        order: 2,
      },
      {
        label: "Running Balance",
        data: runningBalances,
        borderWidth: isMobile ? 3 : 4,
        pointRadius: isMobile ? 6 : 5,
        pointHoverRadius: isMobile ? 9 : 7,
        tension: 0.1,
        order: 1,
        segment: {
          borderColor: (ctx: any) => {
            const idx = ctx.p1.$context.dataIndex;
            const adjustedValue = adjustedBaseline[idx];
            return ctx.p1.parsed.y >= adjustedValue ? "hsl(142, 76%, 50%)" : "hsl(0, 72%, 60%)";
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
        annotations: {
          baseline: {
            type: 'line',
            yMin: baseline,
            yMax: baseline,
            borderColor: 'hsla(0, 0%, 50%, 0.3)',
            borderWidth: 1,
            borderDash: [4, 4],
            label: {
              display: true,
              content: `Start: $${Math.abs(baseline).toLocaleString()}`,
              position: 'start',
              backgroundColor: 'hsla(0, 0%, 20%, 0.8)',
              color: 'hsl(0, 0%, 95%)',
              font: {
                size: isMobile ? 9 : 10,
              },
              padding: isMobile ? 3 : 4,
              xAdjust: 5,
            },
          },
          ...capitalInjections.reduce((acc, injection, idx) => {
            const dataIndex = labels.findIndex((label, i) => {
              if (i === 0) return false;
              return data[i - 1].date === injection.date;
            });
            
            if (dataIndex !== -1) {
              acc[`injection-${idx}`] = {
                type: 'line',
                xMin: dataIndex,
                xMax: dataIndex,
                borderColor: 'hsla(45, 93%, 47%, 0.6)',
                borderWidth: 2,
                borderDash: [4, 4],
                label: {
                  display: true,
                  content: `+$${injection.amount.toLocaleString()}`,
                  position: 'start',
                  backgroundColor: 'hsl(45, 93%, 47%)',
                  color: 'hsl(0, 0%, 10%)',
                  font: {
                    size: isMobile ? 9 : 10,
                    weight: 'bold',
                  },
                  padding: isMobile ? 2 : 3,
                },
              };
            }
            return acc;
          }, {} as any),
        },
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
