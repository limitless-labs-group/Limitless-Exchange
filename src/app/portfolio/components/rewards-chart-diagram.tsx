import { useToken } from '@chakra-ui/react'
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
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { isMobile } from 'react-device-detect'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function RewardsChartDiagram() {
  const [grey300, grey500, blue500] = useToken('colors', ['grey.300', 'grey.500', 'blue.500'])
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        border: {
          display: false,
        },
        grid: {
          display: false,
        },
        ticks: {
          color: grey500,
          maxTicksLimit: isMobile ? 3 : 10,
        },
      },
      y: {
        position: 'right',
        border: {
          display: false,
        },
        grid: {
          display: true,
          color: grey300,
        },
        ticks: {
          color: grey500,
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
          stepSize: 25,
          maxTicksLimit: 5,
          padding: 8,
          // @ts-ignore
          callback: (value: number) => `   ${value}`,
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          pointStyle: 'circle',
          boxWidth: 12,
          boxHeight: 2,
          useBorderRadius: true,
          generateLabels: (chart) => {
            const datasets = chart.data.datasets
            return datasets.map((dataset, i) => ({
              text: dataset.label || '',
              fillStyle: dataset.borderColor as string,
              strokeStyle: dataset.borderColor as string,
              lineWidth: 0,
              hidden: !chart.isDatasetVisible(i),
              index: i,
              fontColor: dataset.borderColor as string,
              borderRadius: 1,
            }))
          },
          font: {
            family: 'Inter, sans-serif',
            size: 14,
            weight: 400,
          },
        },
      },
    },
  }

  const labels = [
    '1 AM',
    '2 AM',
    '3 AM',
    '4 AM',
    '5 AM',
    '6 AM',
    '7 AM',
    '8 AM',
    '9 AM',
    '10 AM',
    '11 AM',
  ]

  const data = {
    labels,
    datasets: [
      {
        label: 'Actual earnings',
        data: [100, 120, 150, 180, 450, 300, 400, 500, 450, 400, 450],
        borderColor: blue500,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 1.5,
      },
    ],
  }

  return (
    <div
      style={{
        borderRadius: '8px',
        width: '100%',
        height: '214px',
      }}
    >
      <Line options={options} data={data} />
    </div>
  )
}
