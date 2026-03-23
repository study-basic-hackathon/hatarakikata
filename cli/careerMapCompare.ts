import 'dotenv/config'

import { ChartJSNodeCanvas } from 'chartjs-node-canvas'
import { program } from 'commander'
import fs from 'fs'
import path from 'path'

import type { SystemExecutor } from '../core/application/executor'
import type { QuadrantResult } from '../core/application/usecase/careerMap/compareCareerMapEncodings'
import { STAGE_PRESETS } from '../core/domain/service/careerMap'
import { createCompareCareerMapEncodings } from './usecase/careerMap'

program
  .name('career-map:compare')
  .description('エンコーディング方式の段階的比較レポートを生成する')
  .option('-n, --name <name>', '検索対象の人物名', '森田大地')
  .option('-l, --limit <limit>', '検索件数', '5')
  .option('-s, --stages <stages>', 'ステージ (カンマ区切り)', Object.keys(STAGE_PRESETS).join(','))
  .parse()

const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small'
const COLORS = ['#4dc9f6', '#f67019', '#f53794', '#537bc4']

function fieldsLabel(fields: Record<string, boolean | undefined>): string {
  return Object.entries(fields).filter(([, v]) => v).map(([k]) => k).join(', ')
}

async function generateStageCharts(
  stage: string,
  quadrants: QuadrantResult[],
  outDir: string,
): Promise<{ similarityChart: string; tokenChart: string }> {
  const chartCanvas = new ChartJSNodeCanvas({ width: 800, height: 400, backgroundColour: 'white' })
  const imagesDir = path.join(outDir, 'images')
  fs.mkdirSync(imagesDir, { recursive: true })

  const labels = quadrants.map((q) => `${q.embedEncoding} × ${q.searchEncoding}`)

  // 平均類似度
  const avgSimilarities = quadrants.map((q) =>
    q.results.length > 0
      ? q.results.reduce((s, r) => s + r.similarity, 0) / q.results.length * 100
      : 0
  )
  const similarityBuf = await chartCanvas.renderToBuffer({
    type: 'bar',
    data: { labels, datasets: [{ label: '平均類似度 (%)', data: avgSimilarities, backgroundColor: COLORS }] },
    options: {
      plugins: { title: { display: true, text: `${stage} 平均類似度`, font: { size: 18 } }, legend: { display: false } },
      scales: { y: { min: 0, max: 100, title: { display: true, text: '%' } } },
    },
  })
  const similarityFile = `images/similarity-${stage}.png`
  fs.writeFileSync(path.join(outDir, similarityFile), similarityBuf)

  // トークンコスト
  const tokenBuf = await chartCanvas.renderToBuffer({
    type: 'bar',
    data: { labels, datasets: [{ label: '合計トークン', data: quadrants.map((q) => q.totalTokens), backgroundColor: COLORS }] },
    options: {
      plugins: { title: { display: true, text: `${stage} トークンコスト`, font: { size: 18 } }, legend: { display: false } },
      scales: { y: { min: 0, title: { display: true, text: 'tokens' } } },
    },
  })
  const tokenFile = `images/token-${stage}.png`
  fs.writeFileSync(path.join(outDir, tokenFile), tokenBuf)

  return { similarityChart: similarityFile, tokenChart: tokenFile }
}

async function generateSummaryChart(
  allQuadrants: QuadrantResult[],
  outDir: string,
): Promise<string> {
  const chartCanvas = new ChartJSNodeCanvas({ width: 1200, height: 500, backgroundColour: 'white' })

  const labels = allQuadrants.map((q) => [q.stage, `${q.embedEncoding}×${q.searchEncoding}`])

  const avgSimilarities = allQuadrants.map((q) =>
    q.results.length > 0
      ? q.results.reduce((s, r) => s + r.similarity, 0) / q.results.length * 100
      : 0
  )
  const totalTokens = allQuadrants.map((q) => q.totalTokens)

  const buf = await chartCanvas.renderToBuffer({
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: '平均類似度 (%)',
          data: avgSimilarities,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          yAxisID: 'y-similarity',
          order: 2,
        },
        {
          label: '合計トークン',
          data: totalTokens,
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          yAxisID: 'y-tokens',
          order: 1,
        },
      ],
    },
    options: {
      plugins: {
        title: { display: true, text: '精度 vs コスト（実施方法別）', font: { size: 18 } },
        legend: { display: true, position: 'top' },
      },
      scales: {
        'y-similarity': {
          type: 'linear',
          position: 'left',
          min: 0,
          max: 100,
          title: { display: true, text: '平均類似度 (%)' },
          grid: { drawOnChartArea: true },
        },
        'y-tokens': {
          type: 'linear',
          position: 'right',
          min: 0,
          title: { display: true, text: '合計トークン数' },
          grid: { drawOnChartArea: false },
        },
      },
    },
  })

  const file = 'images/summary.png'
  fs.writeFileSync(path.join(outDir, file), buf)
  return file
}

function formatReport(
  targetName: string,
  allQuadrants: QuadrantResult[],
  stageCharts: Map<string, { similarityChart: string; tokenChart: string }>,
  summaryChart: string,
): string {
  const lines: string[] = []
  lines.push(`# 段階的エンコーディング比較レポート`)
  lines.push(``)
  lines.push(`対象人物: **${targetName}**`)
  lines.push(`モデル: ${embeddingModel}`)
  lines.push(`生成日: ${new Date().toISOString().slice(0, 10)}`)
  lines.push(``)

  // 全体サマリーチャート
  lines.push(`## 全体比較`)
  lines.push(``)
  lines.push(`![全体比較](./${summaryChart})`)
  lines.push(``)

  // ステージごとのセクション
  const stages = [...new Set(allQuadrants.map((q) => q.stage))]

  for (const stage of stages) {
    const quadrants = allQuadrants.filter((q) => q.stage === stage)
    const charts = stageCharts.get(stage)!

    lines.push(`---`)
    lines.push(``)
    lines.push(`## ${stage}`)
    lines.push(``)
    lines.push(`含める属性: **${fieldsLabel(quadrants[0].fields)}**`)
    lines.push(``)

    // チャート
    lines.push(`![類似度](./${charts.similarityChart})`)
    lines.push(``)
    lines.push(`![トークン](./${charts.tokenChart})`)
    lines.push(``)

    for (const q of quadrants) {
      const label = `${stage}_${q.embedEncoding}_${q.searchEncoding}`
      lines.push(`### ${q.embedEncoding} × ${q.searchEncoding}`)
      lines.push(``)
      lines.push(`- インデックス時トークン: ${q.embedTokens.toLocaleString()}`)
      lines.push(`- 検索クエリトークン: ${q.searchTokens.toLocaleString()}`)
      lines.push(`- 合計トークン: ${q.totalTokens.toLocaleString()}`)
      lines.push(`- インデックスデータ: [embed_${label}.txt](./data/embed_${label}.txt)`)
      lines.push(`- 検索クエリデータ: [search_${label}.txt](./data/search_${label}.txt)`)
      lines.push(``)
      lines.push(`| 順位 | 名前 | 類似度 |`)
      lines.push(`|------|------|--------|`)
      q.results.forEach((r, i) => {
        lines.push(`| ${i + 1} | ${r.userName ?? '(名前なし)'} | ${(r.similarity * 100).toFixed(2)}% |`)
      })
      lines.push(``)
    }
  }

  // 全体サマリーテーブル
  lines.push(`---`)
  lines.push(``)
  lines.push(`## サマリー`)
  lines.push(``)
  lines.push(`| ステージ | 組み合わせ | 属性 | 合計トークン | 平均類似度 | 最高類似度 |`)
  lines.push(`|----------|-----------|------|-------------|-----------|-----------|`)
  for (const q of allQuadrants) {
    const avgSim = q.results.length > 0
      ? (q.results.reduce((s, r) => s + r.similarity, 0) / q.results.length * 100).toFixed(2)
      : '-'
    const maxSim = q.results.length > 0
      ? (Math.max(...q.results.map((r) => r.similarity)) * 100).toFixed(2)
      : '-'
    lines.push(`| ${q.stage} | ${q.embedEncoding}×${q.searchEncoding} | ${fieldsLabel(q.fields)} | ${q.totalTokens.toLocaleString()} | ${avgSim}% | ${maxSim}% |`)
  }
  lines.push(``)

  // 推奨
  lines.push(`### 推奨`)
  lines.push(``)
  const bestByAvg = [...allQuadrants].sort((a, b) => {
    const avgA = a.results.reduce((s, r) => s + r.similarity, 0) / (a.results.length || 1)
    const avgB = b.results.reduce((s, r) => s + r.similarity, 0) / (b.results.length || 1)
    return avgB - avgA
  })[0]
  const cheapest = [...allQuadrants].sort((a, b) => a.totalTokens - b.totalTokens)[0]

  lines.push(`- **最高精度**: ${bestByAvg.stage} / ${bestByAvg.embedEncoding} × ${bestByAvg.searchEncoding}`)
  lines.push(`- **最低コスト**: ${cheapest.stage} / ${cheapest.embedEncoding} × ${cheapest.searchEncoding} (${cheapest.totalTokens.toLocaleString()} tokens)`)
  lines.push(``)

  return lines.join('\n')
}

async function main() {
  const opts = program.opts<{ name: string; limit: string; stages: string }>()
  const limit = parseInt(opts.limit, 10)
  const stages = opts.stages.split(',').map((s) => s.trim())

  console.log(`対象: ${opts.name}`)
  console.log(`ステージ: ${stages.join(', ')}`)

  const outDir = path.join('docs', 'compares', opts.name)
  const outFile = path.join(outDir, 'README.md')

  const executor: SystemExecutor = {
    type: 'system',
    operation: { name: 'career-map:compare' },
  }

  const compareCareerMapEncodings = createCompareCareerMapEncodings(
    (phase, current, total) => {
      console.log(`  [${phase}] ${current}/${total}`)
    },
  )

  const result = await compareCareerMapEncodings({ userName: opts.name, limit, stages }, executor)

  if (!result.success) {
    console.error('エラー:', result.error.message)
    process.exit(1)
  }

  // 出力先ディレクトリ作成
  const dataDir = path.join(outDir, 'data')
  fs.mkdirSync(dataDir, { recursive: true })

  // embedding に送ったテキストデータを保存
  for (const q of result.data.quadrants) {
    const label = `${q.stage}_${q.embedEncoding}_${q.searchEncoding}`
    fs.writeFileSync(path.join(dataDir, `embed_${label}.txt`), q.embedText, 'utf-8')
    fs.writeFileSync(path.join(dataDir, `search_${label}.txt`), q.searchText, 'utf-8')
  }
  console.log(`データ出力: ${dataDir}/`)

  // チャート生成
  console.log('チャート生成中...')
  const uniqueStages = [...new Set(result.data.quadrants.map((q) => q.stage))]
  const stageCharts = new Map<string, { similarityChart: string; tokenChart: string }>()
  for (const stage of uniqueStages) {
    const quadrants = result.data.quadrants.filter((q) => q.stage === stage)
    const charts = await generateStageCharts(stage, quadrants, outDir)
    stageCharts.set(stage, charts)
  }
  const summaryChart = await generateSummaryChart(result.data.quadrants, outDir)

  const report = formatReport(opts.name, result.data.quadrants, stageCharts, summaryChart)

  fs.writeFileSync(outFile, report, 'utf-8')
  console.log(`\nレポート出力: ${outFile}`)

  process.exit(0)
}

main()
