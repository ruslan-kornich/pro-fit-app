import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DataPoint {
  label: string;
  value: number;
  goal?: number | null;
}

interface BarChartProps {
  data: DataPoint[];
  height?: number;
  emptyMessage?: string;
}

export function BarChart({
  data,
  height = 200,
  emptyMessage = 'No data',
}: BarChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-gray-400"
        style={{ height }}
      >
        {emptyMessage}
      </div>
    );
  }

  const goal = data[0]?.goal;

  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: 'Calories',
        data: data.map((d) => d.value),
        backgroundColor: data.map((d) =>
          d.goal && d.value > d.goal ? 'rgba(239, 68, 68, 0.8)' : 'rgba(59, 130, 246, 0.8)'
        ),
        borderColor: data.map((d) =>
          d.goal && d.value > d.goal ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)'
        ),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: { raw: number }) => `${context.raw} kcal`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 11,
          },
          callback: (value: number) => value,
        },
      },
    },
    annotation: goal
      ? {
          annotations: {
            goalLine: {
              type: 'line',
              yMin: goal,
              yMax: goal,
              borderColor: 'rgba(239, 68, 68, 0.8)',
              borderWidth: 2,
              borderDash: [5, 5],
            },
          },
        }
      : undefined,
  };

  return (
    <div style={{ height }}>
      <Bar data={chartData} options={options as never} />
    </div>
  );
}
