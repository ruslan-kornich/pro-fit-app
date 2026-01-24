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
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  emptyMessage?: string;
  unit?: string;
}

export function LineChart({
  data,
  height = 200,
  color = '#10B981',
  emptyMessage = 'No data',
  unit = '',
}: LineChartProps) {
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

  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: 'Weight',
        data: data.map((d) => d.value),
        borderColor: color,
        backgroundColor: `${color}20`,
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
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
          label: (context: { raw: number }) => `${context.raw}${unit}`,
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
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
        },
        ticks: {
          color: '#9CA3AF',
          font: {
            size: 11,
          },
          callback: (value: number) => value.toFixed(1),
        },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Line data={chartData} options={options as never} />
    </div>
  );
}
