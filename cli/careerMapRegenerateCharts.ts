import { ChartJSNodeCanvas } from 'chartjs-node-canvas'
import { program } from 'commander'
import fs from 'fs'
import path from 'path'

import { STAGE_PRESETS } from '../core/domain/service/careerMap'

program
  .name('career-map:regenerate-charts')
  .description('既存データからチャートを再生成する')
  .argument('<dir>', 'レポートディレクトリ (例: docs/compare-report/森田大地/2026-03-27)')
  .parse()

const reportDir = program.args[0]

// ── 統計ユーティリティ ──

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function quartiles(arr: number[]): { q1: number; q2: number; q3: number } {
  const sorted = [...arr].sort((a, b) => a - b)
  const q2 = median(sorted)
  const lower = sorted.slice(0, Math.floor(sorted.length / 2))
  const upper = sorted.slice(Math.ceil(sorted.length / 2))
  return { q1: median(lower), q2, q3: median(upper) }
}

function descriptiveStats(arr: number[]) {
  const sorted = [...arr].sort((a, b) => a - b)
  const { q1, q2, q3 } = quartiles(arr)
  const iqr = q3 - q1
  const mean = arr.reduce((s, v) => s + v, 0) / arr.length
  const min = sorted[0]
  const max = sorted[sorted.length - 1]
  const std = Math.sqrt(arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length)
  const outliers = arr.filter((v) => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr)
  return { min, max, mean, std, q1, q2, q3, iqr, outliers }
}

// ── データ読み込み ──

type StageData = {
  stage: string
  similarities: number[]
  totalTokens: number
  embedTokens: number
  searchTokens: number
}

const COLORS = ['#4dc9f6', '#f67019', '#f53794', '#537bc4', '#acc236']

function loadStages(dir: string): StageData[] {
  const dataDir = path.join(dir, 'data')
  const stageNames = Object.keys(STAGE_PRESETS)
  const stages: StageData[] = []

  for (const stage of stageNames) {
    const stageDir = path.join(dataDir, stage)
    if (!fs.existsSync(stageDir)) continue

    const results: { similarity: number }[] = JSON.parse(fs.readFileSync(path.join(stageDir, 'results.json'), 'utf-8'))
    const embedText = fs.readFileSync(path.join(stageDir, 'embed.txt'), 'utf-8')
    const searchText = fs.readFileSync(path.join(stageDir, 'search.txt'), 'utf-8')

    // embedTokens はインデックス全体のトークン数だが、ここでは対象ユーザー分のテキスト長で代用
    // README のトークンコスト情報が正とする
    stages.push({
      stage,
      similarities: results.map((r) => r.similarity * 100),
      embedTokens: embedText.length,
      searchTokens: searchText.length,
      totalTokens: embedText.length + searchText.length,
    })
  }

  return stages
}

// ── チャート生成 ──

async function generateHistograms(stages: StageData[], outDir: string): Promise<string[]> {
  const imagesDir = path.join(outDir, 'images')
  fs.mkdirSync(imagesDir, { recursive: true })

  const files: string[] = []
  const binCount = 15

  for (const stage of stages) {
    const chartCanvas = new ChartJSNodeCanvas({ width: 800, height: 400, backgroundColour: 'white' })
    const values = stage.similarities
    const min = Math.floor(Math.min(...values))
    const max = Math.ceil(Math.max(...values))
    const binWidth = (max - min) / binCount || 1
    const bins = Array.from({ length: binCount }, () => 0)
    const binLabels = Array.from({ length: binCount }, (_, i) =>
      `${(min + i * binWidth).toFixed(1)}`,
    )

    for (const v of values) {
      const idx = Math.min(Math.floor((v - min) / binWidth), binCount - 1)
      bins[idx]++
    }

    const buf = await chartCanvas.renderToBuffer({
      type: 'bar',
      data: {
        labels: binLabels,
        datasets: [{
          label: '件数',
          data: bins,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        }],
      },
      options: {
        plugins: {
          title: { display: true, text: `${stage.stage} — 類似度ヒストグラム`, font: { size: 16 } },
          legend: { display: false },
        },
        scales: {
          x: { title: { display: true, text: 'cosine similarity (%)' } },
          y: { title: { display: true, text: '件数' }, beginAtZero: true },
        },
      },
    })
    const file = `images/histogram-${stage.stage}.png`
    fs.writeFileSync(path.join(outDir, file), buf)
    files.push(file)
  }

  return files
}

async function generateBoxplot(stages: StageData[], outDir: string): Promise<string> {
  const imagesDir = path.join(outDir, 'images')
  fs.mkdirSync(imagesDir, { recursive: true })

  const chartCanvas = new ChartJSNodeCanvas({ width: 1000, height: 500, backgroundColour: 'white' })

  const labels = stages.map((s) => s.stage)
  const statsArr = stages.map((s) => descriptiveStats(s.similarities))

  const allMin = Math.min(...statsArr.map((s) => s.min))
  const allMax = Math.max(...statsArr.map((s) => s.max))
  const yMin = Math.floor(allMin / 5) * 5
  const yMax = Math.ceil(allMax / 5) * 5

  const buf = await chartCanvas.renderToBuffer({
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'ひげ (min–max)',
          data: statsArr.map((s) => [s.min, s.max] as [number, number]),
          backgroundColor: 'rgba(0, 0, 0, 0)',
          borderColor: 'rgba(100, 100, 100, 1)',
          borderWidth: 1,
          barPercentage: 0.08,
          order: 3,
        },
        {
          label: 'IQR (Q1–Q3)',
          data: statsArr.map((s) => [s.q1, s.q3] as [number, number]),
          backgroundColor: COLORS.map((c) => c + '80'),
          borderColor: COLORS,
          borderWidth: 2,
          barPercentage: 0.5,
          order: 2,
        },
        {
          label: '中央値',
          data: statsArr.map((s) => [s.q2 - 0.15, s.q2 + 0.15] as [number, number]),
          backgroundColor: 'rgba(255, 99, 132, 1)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 0,
          barPercentage: 0.5,
          order: 1,
        },
      ],
    },
    options: {
      indexAxis: 'x',
      plugins: {
        title: { display: true, text: 'Stage 別 類似度分布（箱ひげ図）', font: { size: 18 } },
        legend: { display: true, position: 'top' },
      },
      scales: {
        y: {
          min: yMin,
          max: yMax,
          title: { display: true, text: 'cosine similarity (%)' },
        },
      },
    },
  })

  const file = 'images/boxplot.png'
  fs.writeFileSync(path.join(outDir, file), buf)
  return file
}

// ── メイン ──

async function main() {
  if (!fs.existsSync(path.join(reportDir, 'data'))) {
    console.error(`データディレクトリが見つかりません: ${reportDir}/data`)
    process.exit(1)
  }

  const stages = loadStages(reportDir)
  console.log(`${stages.length} ステージのデータを読み込みました`)

  console.log('チャート生成中...')
  await generateHistograms(stages, reportDir)
  await generateBoxplot(stages, reportDir)

  console.log('完了')
}

main()
