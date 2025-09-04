import React, { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

interface ProgressChartProps {
  data: {
    labels: string[];
    datasets: {
      workouts?: number[];
      minutes?: number[];
      calories?: number[];
    };
  };
  type: 'workouts' | 'minutes' | 'calories';
  height?: number;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ data, type, height = 200 }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !data.labels.length) return;

    // Уничтожаем предыдущий график
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Настройки для разных типов графиков
    const configs = {
      workouts: {
        label: 'Тренировки',
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        data: data.datasets.workouts || []
      },
      minutes: {
        label: 'Минуты',
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        data: data.datasets.minutes || []
      },
      calories: {
        label: 'Калории',
        borderColor: 'rgb(251, 146, 60)',
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        data: data.datasets.calories || []
      }
    };

    const config = configs[type];

    const chartConfig: ChartConfiguration = {
      type: 'line',
      data: {
        labels: data.labels.map(label => {
          const date = new Date(label);
          return date.toLocaleDateString('ru', { day: 'numeric', month: 'short' });
        }),
        datasets: [{
          label: config.label,
          data: config.data,
          borderColor: config.borderColor,
          backgroundColor: config.backgroundColor,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: config.borderColor,
          pointBorderColor: '#1f2937',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#1f2937',
            titleColor: '#fff',
            bodyColor: '#9ca3af',
            padding: 12,
            borderColor: '#374151',
            borderWidth: 1,
            displayColors: false,
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                if (type === 'workouts') return `${value} тренировок`;
                if (type === 'minutes') return `${value} минут`;
                if (type === 'calories') return `${value} ккал`;
                return String(value);
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(55, 65, 81, 0.3)',
              drawBorder: false
            },
            ticks: {
              color: '#9ca3af',
              font: {
                size: 11
              }
            }
          },
          y: {
            grid: {
              color: 'rgba(55, 65, 81, 0.3)',
              drawBorder: false
            },
            ticks: {
              color: '#9ca3af',
              font: {
                size: 11
              },
              callback: function(value) {
                if (type === 'calories') return value + ' ккал';
                if (type === 'minutes') return value + ' мин';
                return value;
              }
            },
            beginAtZero: true
          }
        }
      }
    };

    chartInstance.current = new Chart(ctx, chartConfig);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, type]);

  return (
    <div style={{ height: `${height}px` }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};