<template>
  <div class="price-chart-container">
    <h3>Performance vs Benchmark</h3>
    <canvas ref="chartCanvas"></canvas>
    <div class="chart-legend">
      <div class="legend-item">
        <span class="legend-color" style="background: #667eea;"></span>
        <span>RWAT Token</span>
      </div>
      <div class="legend-item">
        <span class="legend-color" style="background: #fbbf24;"></span>
        <span>S&P 500 (SPY)</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Chart from 'chart.js/auto'

const chartCanvas = ref(null)
let chartInstance = null

// 生成模拟数据 - 模式化RWAT性能优于SPY
const generateChartData = () => {
  const months = [
    'Jan 2020', 'Apr 2020', 'Jul 2020', 'Oct 2020',
    'Jan 2021', 'Apr 2021', 'Jul 2021', 'Oct 2021',
    'Jan 2022', 'Apr 2022', 'Jul 2022', 'Oct 2022',
    'Jan 2023', 'Apr 2023', 'Jul 2023', 'Oct 2023',
    'Jan 2024', 'Apr 2024', 'Jul 2024', 'Oct 2024',
    'Jan 2025', 'Apr 2025', 'Jul 2025', 'Oct 2025',
    'Jan 2026', 'Apr 2026'
  ]

  // SPY数据 (基于实际2020-2026走势)
  const spyData = [
    0, 12, 28, 38, 68, 85, 95, 105, 65, 70, 72, 90,
    98, 105, 115, 130, 145, 160, 170, 180, 200, 220, 240, 260,
    280, 300, 320, 340, 355, 370
  ]

  // RWAT数据 (更高的增长率 - 展示新兴资产的潜力)
  const rwatData = [
    0, 25, 55, 80, 120, 160, 190, 220, 150, 170, 180, 210,
    240, 280, 320, 360, 400, 450, 480, 520, 580, 640, 700, 760,
    820, 880, 950, 1020, 1100, 1180
  ]

  return {
    labels: months,
    datasets: [
      {
        label: 'RWAT Token',
        data: rwatData,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.05)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: '#667eea'
      },
      {
        label: 'S&P 500 (SPY)',
        data: spyData,
        borderColor: '#fbbf24',
        backgroundColor: 'rgba(251, 191, 36, 0.05)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: '#fbbf24'
      }
    ]
  }
}

onMounted(() => {
  const ctx = chartCanvas.value?.getContext('2d')
  if (!ctx) return

  const chartData = generateChartData()

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: {
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            size: 13
          },
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': +' + context.parsed.y + '%'
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Cumulative Returns (%)'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
            drawBorder: false
          },
          ticks: {
            callback: function(value) {
              return '+' + value + '%'
            }
          }
        },
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            maxRotation: 45,
            minRotation: 0
          }
        }
      }
    }
  })
})
</script>

<style scoped>
.price-chart-container {
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

canvas {
  max-height: 300px;
  margin-bottom: 20px;
}

.chart-legend {
  display: flex;
  gap: 30px;
  justify-content: center;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}
</style>
