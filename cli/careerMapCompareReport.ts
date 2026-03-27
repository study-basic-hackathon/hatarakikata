import 'dotenv/config'

import { ChartJSNodeCanvas } from 'chartjs-node-canvas'
import { program } from 'commander'
import fs from 'fs'
import path from 'path'

import type { CareerEvent } from '../core/domain/entity/careerEvent'
import type { SystemExecutor } from '../core/application/executor'
import { STAGE_PRESETS, type CareerMapVectorFields } from '../core/domain/service/careerMap'
import { createCompareCareerMapEncodings } from './usecase/careerMap'

program
  .name('career-map:compare-report')
  .description('TOON形式での stage 別類似度分布レポートを生成する')
  .option('-n, --name <name>', '検索対象の人物名', '森田大地')
  .option('-l, --limit <limit>', '検索件数（分布分析用に多めに）', '30')
  .option('-s, --stages <stages>', 'ステージ (カンマ区切り)', Object.keys(STAGE_PRESETS).join(','))
  .parse()

const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small'

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

// ── チャート生成 ──

type SearchResult = {
  careerMapId: string
  userName: string | null
  similarity: number
}

type StageData = {
  stage: string
  similarities: number[] // 0-100 のパーセント
  totalTokens: number
  embedTokens: number
  searchTokens: number
  embedText: string
  searchText: string
  results: SearchResult[]
}

const COLORS = ['#4dc9f6', '#f67019', '#f53794', '#537bc4', '#acc236']

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
          title: { display: true, text: `${stage.stage} — 類似度ヒストグラム（トークン: ${stage.totalTokens.toLocaleString()}）`, font: { size: 16 } },
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

  const labels = stages.map((s) => `${s.stage}\n(${s.totalTokens.toLocaleString()} tokens)`)
  const statsArr = stages.map((s) => descriptiveStats(s.similarities))

  // Y軸の範囲をデータに合わせる
  const allMin = Math.min(...statsArr.map((s) => s.min))
  const allMax = Math.max(...statsArr.map((s) => s.max))
  const yMin = Math.floor(allMin / 5) * 5 // 5刻みで切り下げ
  const yMax = Math.ceil(allMax / 5) * 5   // 5刻みで切り上げ

  // whisker: min–Q1 と Q3–max を細いバーで表現
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

async function generateScatterCostVsAccuracy(stages: StageData[], outDir: string): Promise<string> {
  const chartCanvas = new ChartJSNodeCanvas({ width: 800, height: 400, backgroundColour: 'white' })

  const datasets = stages.map((s, i) => {
    const stats = descriptiveStats(s.similarities)
    return {
      label: s.stage,
      data: [{ x: s.totalTokens, y: stats.mean }],
      backgroundColor: COLORS[i % COLORS.length],
      borderColor: COLORS[i % COLORS.length],
      pointRadius: 10,
    }
  })

  const buf = await chartCanvas.renderToBuffer({
    type: 'scatter',
    data: { datasets },
    options: {
      plugins: {
        title: { display: true, text: 'トークンコスト vs 平均類似度', font: { size: 16 } },
        legend: { display: true, position: 'top' },
      },
      scales: {
        x: { title: { display: true, text: '合計トークン数' } },
        y: { title: { display: true, text: '平均類似度 (%)' } },
      },
    },
  })
  const file = 'images/cost-vs-accuracy.png'
  fs.writeFileSync(path.join(outDir, file), buf)
  return file
}

// ── テキストデータ書き出し ──

function pickEventFields(event: CareerEvent, fields: CareerMapVectorFields): Record<string, unknown> {
  const picked: Record<string, unknown> = {}
  if (fields.name) picked.name = event.name
  if (fields.type) picked.type = event.type
  if (fields.tags) picked.tags = event.tags.map((t) => t.name)
  if (fields.strength) picked.strength = event.strength
  if (fields.dates) {
    picked.startDate = event.startDate
    picked.endDate = event.endDate
  }
  if (fields.description) picked.description = event.description
  return picked
}

function writeStageData(stagesData: StageData[], targetEvents: CareerEvent[], outDir: string) {
  for (const stage of stagesData) {
    const stageDir = path.join(outDir, 'data', stage.stage)
    fs.mkdirSync(stageDir, { recursive: true })

    const fields = STAGE_PRESETS[stage.stage]
    const filteredEvents = targetEvents.map((e) => pickEventFields(e, fields))

    fs.writeFileSync(path.join(stageDir, 'events.json'), JSON.stringify(filteredEvents, null, 2), 'utf-8')
    fs.writeFileSync(path.join(stageDir, 'embed.txt'), stage.embedText, 'utf-8')
    fs.writeFileSync(path.join(stageDir, 'search.txt'), stage.searchText, 'utf-8')
    fs.writeFileSync(path.join(stageDir, 'results.json'), JSON.stringify(stage.results, null, 2), 'utf-8')
  }
}

// ── レポート生成 ──

function fieldsLabel(fields: Record<string, boolean | undefined>): string {
  return Object.entries(fields).filter(([, v]) => v).map(([k]) => k).join(', ')
}

function formatReport(
  targetName: string,
  stagesData: StageData[],
  histogramFiles: string[],
  boxplotFile: string,
  scatterFile: string,
): string {
  const lines: string[] = []
  lines.push('# TOON 形式 Stage 別 類似度分布レポート')
  lines.push('')
  lines.push(`対象人物: **${targetName}**`)
  lines.push(`エンコーディング: **toon × toon**`)
  lines.push(`モデル: ${embeddingModel}`)
  lines.push(`検索件数: ${stagesData[0]?.similarities.length ?? 0}`)
  lines.push(`生成日: ${new Date().toISOString().slice(0, 10)}`)
  lines.push('')

  // ステージ一覧テーブル
  lines.push('## ステージ一覧')
  lines.push('')
  lines.push('| ステージ | 含める属性 |')
  lines.push('|----------|-----------|')
  for (const stage of stagesData) {
    const preset = STAGE_PRESETS[stage.stage]
    lines.push(`| ${stage.stage} | ${fieldsLabel(preset)} |`)
  }
  lines.push('')

  // 箱ひげ図
  lines.push('## 全体比較（箱ひげ図）')
  lines.push('')
  lines.push(`![箱ひげ図](./${boxplotFile})`)
  lines.push('')

  // コスト vs 精度
  lines.push('## トークンコスト vs 平均類似度')
  lines.push('')
  lines.push(`![コスト vs 精度](./${scatterFile})`)
  lines.push('')

  // ステージ別 統計 + ヒストグラム
  for (let i = 0; i < stagesData.length; i++) {
    const stage = stagesData[i]
    const stats = descriptiveStats(stage.similarities)
    const preset = STAGE_PRESETS[stage.stage]
    const fields = fieldsLabel(preset)

    lines.push('---')
    lines.push('')
    lines.push(`## ${stage.stage}`)
    lines.push('')
    lines.push(`含める属性: **${fields}**`)
    lines.push('')

    // テキストデータへのリンク
    lines.push('### データ')
    lines.push('')
    lines.push(`- イベントデータ: [events.json](./data/${stage.stage}/events.json)`)
    lines.push(`- インデックス用テキスト: [embed.txt](./data/${stage.stage}/embed.txt)`)
    lines.push(`- 検索クエリ用テキスト: [search.txt](./data/${stage.stage}/search.txt)`)
    lines.push(`- 検索結果: [results.json](./data/${stage.stage}/results.json)`)
    lines.push('')

    // トークンコスト
    lines.push('### トークンコスト')
    lines.push('')
    lines.push(`| 項目 | 値 |`)
    lines.push(`|------|-----|`)
    lines.push(`| インデックス時トークン | ${stage.embedTokens.toLocaleString()} |`)
    lines.push(`| 検索クエリトークン | ${stage.searchTokens.toLocaleString()} |`)
    lines.push(`| 合計トークン | ${stage.totalTokens.toLocaleString()} |`)
    lines.push('')

    // 統計量
    lines.push('### 分布統計')
    lines.push('')
    lines.push('| 統計量 | 値 |')
    lines.push('|--------|-----|')
    lines.push(`| サンプル数 | ${stage.similarities.length} |`)
    lines.push(`| 最小値 | ${stats.min.toFixed(2)}% |`)
    lines.push(`| Q1（第1四分位） | ${stats.q1.toFixed(2)}% |`)
    lines.push(`| 中央値（Q2） | ${stats.q2.toFixed(2)}% |`)
    lines.push(`| Q3（第3四分位） | ${stats.q3.toFixed(2)}% |`)
    lines.push(`| 最大値 | ${stats.max.toFixed(2)}% |`)
    lines.push(`| 平均 | ${stats.mean.toFixed(2)}% |`)
    lines.push(`| 標準偏差 | ${stats.std.toFixed(2)} |`)
    lines.push(`| IQR | ${stats.iqr.toFixed(2)} |`)
    lines.push(`| 外れ値数 | ${stats.outliers.length} |`)
    lines.push('')

    // ヒストグラム
    lines.push('### ヒストグラム')
    lines.push('')
    lines.push(`![ヒストグラム](./${histogramFiles[i]})`)
    lines.push('')
  }

  // サマリー比較テーブル
  lines.push('---')
  lines.push('')
  lines.push('## サマリー比較')
  lines.push('')
  lines.push('| ステージ | 属性 | 合計トークン | 平均類似度 | 中央値 | 標準偏差 | IQR | 最高 | 最低 |')
  lines.push('|----------|------|-------------|-----------|--------|---------|-----|------|------|')
  for (const stage of stagesData) {
    const stats = descriptiveStats(stage.similarities)
    const preset = STAGE_PRESETS[stage.stage]
    const fields = fieldsLabel(preset)
    lines.push(`| ${stage.stage} | ${fields} | ${stage.totalTokens.toLocaleString()} | ${stats.mean.toFixed(2)}% | ${stats.q2.toFixed(2)}% | ${stats.std.toFixed(2)} | ${stats.iqr.toFixed(2)} | ${stats.max.toFixed(2)}% | ${stats.min.toFixed(2)}% |`)
  }
  lines.push('')

  // 考察
  lines.push('## 考察')
  lines.push('')

  const allStats = stagesData.map((s) => ({ stage: s.stage, ...descriptiveStats(s.similarities), totalTokens: s.totalTokens }))

  const bestSpread = [...allStats].sort((a, b) => b.iqr - a.iqr)[0]
  lines.push(`### 識別力（分布の広がり）`)
  lines.push('')
  lines.push(`IQR が最も大きいのは **${bestSpread.stage}**（IQR: ${bestSpread.iqr.toFixed(2)}）。`)
  lines.push(`分布が広いほど、類似・非類似を区別する識別力が高い。`)
  lines.push('')

  const bestTop = [...allStats].sort((a, b) => b.max - a.max)[0]
  lines.push(`### 上位スコアの明確さ`)
  lines.push('')
  lines.push(`最高類似度が最も高いのは **${bestTop.stage}**（${bestTop.max.toFixed(2)}%）。`)
  lines.push(`最高値と中央値の差が大きいほど、上位マッチが明確に際立っている。`)
  lines.push('')
  for (const s of allStats) {
    lines.push(`- ${s.stage}: 最高 ${s.max.toFixed(2)}% − 中央値 ${s.q2.toFixed(2)}% = 差 ${(s.max - s.q2).toFixed(2)}`)
  }
  lines.push('')

  lines.push(`### コスト効率`)
  lines.push('')
  for (const s of allStats) {
    const efficiency = (s.mean / s.totalTokens * 10000).toFixed(4)
    lines.push(`- ${s.stage}: 平均類似度 ${s.mean.toFixed(2)}% / ${s.totalTokens.toLocaleString()} tokens（効率: ${efficiency}）`)
  }
  lines.push('')

  return lines.join('\n')
}

// ── メイン ──

async function main() {
  const opts = program.opts<{ name: string; limit: string; stages: string }>()
  const limit = parseInt(opts.limit, 10)
  const stages = opts.stages.split(',').map((s) => s.trim())

  console.log(`対象: ${opts.name}`)
  console.log(`ステージ: ${stages.join(', ')}`)
  console.log(`検索件数: ${limit}`)
  console.log(`エンコーディング: toon のみ`)

  const dateStr = new Date().toISOString().slice(0, 10)
  const outDir = path.join('docs', 'compare-report', opts.name, dateStr)
  const outFile = path.join(outDir, 'README.md')
  fs.mkdirSync(outDir, { recursive: true })

  const executor: SystemExecutor = {
    type: 'system',
    operation: { name: 'career-map:compare-report' },
  }

  const compareCareerMapEncodings = createCompareCareerMapEncodings(
    (phase, current, total) => {
      console.log(`  [${phase}] ${current}/${total}`)
    },
  )

  const result = await compareCareerMapEncodings(
    { userName: opts.name, limit, stages, encodings: ['toon'] },
    executor,
  )

  if (!result.success) {
    console.error('エラー:', result.error.message)
    process.exit(1)
  }

  const stagesData: StageData[] = result.data.quadrants.map((q) => ({
    stage: q.stage,
    similarities: q.results.map((r) => r.similarity * 100),
    totalTokens: q.totalTokens,
    embedTokens: q.embedTokens,
    searchTokens: q.searchTokens,
    embedText: q.embedText,
    searchText: q.searchText,
    results: q.results,
  }))

  // ステージ別データ書き出し
  console.log('ステージ別データ書き出し中...')
  writeStageData(stagesData, result.data.targetEvents, outDir)

  // チャート生成
  console.log('チャート生成中...')
  const histogramFiles = await generateHistograms(stagesData, outDir)
  const boxplotFile = await generateBoxplot(stagesData, outDir)
  const scatterFile = await generateScatterCostVsAccuracy(stagesData, outDir)

  const report = formatReport(opts.name, stagesData, histogramFiles, boxplotFile, scatterFile)

  fs.writeFileSync(outFile, report, 'utf-8')
  console.log(`\nレポート出力: ${outFile}`)

  process.exit(0)
}

main()
