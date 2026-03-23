import 'dotenv/config'

import { ChartJSNodeCanvas } from 'chartjs-node-canvas'
import { program } from 'commander'
import fs from 'fs'
import path from 'path'

import type { SystemExecutor } from '../core/application/executor'
import type { QuadrantResult } from '../core/application/usecase/careerMap/compareCareerMapEncodings'
import { createCompareCareerMapEncodings } from './usecase/careerMap'

program
  .name('career-map:compare')
  .description('エンコーディング方式の4象限比較レポートを生成する')
  .option('-n, --name <name>', '検索対象の人物名', '森田大地')
  .option('-l, --limit <limit>', '検索件数', '5')
  .parse()

const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small'

async function generateCharts(
  quadrants: QuadrantResult[],
  outDir: string,
): Promise<{ similarityChart: string; tokenChart: string }> {
  const chartCanvas = new ChartJSNodeCanvas({ width: 800, height: 400, backgroundColour: 'white' })

  const labels = quadrants.map((q) => `${q.embedEncoding} × ${q.searchEncoding}`)
  const colors = ['#4dc9f6', '#f67019', '#f53794', '#537bc4']

  // 平均類似度チャート
  const avgSimilarities = quadrants.map((q) =>
    q.results.length > 0
      ? q.results.reduce((s, r) => s + r.similarity, 0) / q.results.length * 100
      : 0
  )

  const similarityBuf = await chartCanvas.renderToBuffer({
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: '平均類似度 (%)',
        data: avgSimilarities,
        backgroundColor: colors,
      }],
    },
    options: {
      plugins: {
        title: { display: true, text: 'エンコーディング別 平均類似度', font: { size: 18 } },
        legend: { display: false },
      },
      scales: {
        y: { min: 0, max: 100, title: { display: true, text: '%' } },
      },
    },
  })

  const similarityFile = 'images/similarity-chart.png'
  fs.mkdirSync(path.join(outDir, 'images'), { recursive: true })
  fs.writeFileSync(path.join(outDir, similarityFile), similarityBuf)

  // トークンコストチャート
  const tokens = quadrants.map((q) => q.totalTokens)

  const tokenBuf = await chartCanvas.renderToBuffer({
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: '合計トークン',
        data: tokens,
        backgroundColor: colors,
      }],
    },
    options: {
      plugins: {
        title: { display: true, text: 'エンコーディング別 トークンコスト', font: { size: 18 } },
        legend: { display: false },
      },
      scales: {
        y: { min: 0, title: { display: true, text: 'tokens' } },
      },
    },
  })

  const tokenFile = 'images/token-chart.png'
  fs.writeFileSync(path.join(outDir, tokenFile), tokenBuf)

  return { similarityChart: similarityFile, tokenChart: tokenFile }
}

function formatReport(
  targetName: string,
  quadrants: QuadrantResult[],
  charts: { similarityChart: string; tokenChart: string },
): string {
  const lines: string[] = []
  lines.push(`# エンコーディング比較レポート`)
  lines.push(``)
  lines.push(`対象人物: **${targetName}**`)
  lines.push(`モデル: ${embeddingModel}`)
  lines.push(`生成日: ${new Date().toISOString().slice(0, 10)}`)
  lines.push(``)

  // チャート
  lines.push(`## チャート`)
  lines.push(``)
  lines.push(`![平均類似度](./${charts.similarityChart})`)
  lines.push(``)
  lines.push(`![トークンコスト](./${charts.tokenChart})`)
  lines.push(``)

  for (const q of quadrants) {
    lines.push(`## ${q.embedEncoding} × ${q.searchEncoding}`)
    lines.push(``)
    lines.push(`- インデックス方式: **${q.embedEncoding}**`)
    lines.push(`- 検索クエリ方式: **${q.searchEncoding}**`)
    lines.push(`- インデックス時トークン: ${q.embedTokens.toLocaleString()}`)
    lines.push(`- 検索クエリトークン: ${q.searchTokens.toLocaleString()}`)
    lines.push(`- 合計トークン: ${q.totalTokens.toLocaleString()}`)
    lines.push(`- 検索テキスト長: ${q.searchTextLength.toLocaleString()} 文字`)
    lines.push(`- インデックスデータ: [embed_${q.embedEncoding}_${q.searchEncoding}.txt](./data/embed_${q.embedEncoding}_${q.searchEncoding}.txt)`)
    lines.push(`- 検索クエリデータ: [search_${q.embedEncoding}_${q.searchEncoding}.txt](./data/search_${q.embedEncoding}_${q.searchEncoding}.txt)`)
    lines.push(``)
    lines.push(`| 順位 | 名前 | 類似度 |`)
    lines.push(`|------|------|--------|`)
    q.results.forEach((r, i) => {
      const score = (r.similarity * 100).toFixed(2)
      lines.push(`| ${i + 1} | ${r.userName ?? '(名前なし)'} | ${score}% |`)
    })
    lines.push(``)
  }

  // サマリー
  lines.push(`## サマリー`)
  lines.push(``)
  lines.push(`| 組み合わせ | インデックストークン | 検索トークン | 合計トークン | 平均類似度 | 最高類似度 |`)
  lines.push(`|------------|---------------------|-------------|-------------|-----------|-----------|`)
  for (const q of quadrants) {
    const avgSim = q.results.length > 0
      ? (q.results.reduce((s, r) => s + r.similarity, 0) / q.results.length * 100).toFixed(2)
      : '-'
    const maxSim = q.results.length > 0
      ? (Math.max(...q.results.map((r) => r.similarity)) * 100).toFixed(2)
      : '-'
    lines.push(`| ${q.embedEncoding} × ${q.searchEncoding} | ${q.embedTokens.toLocaleString()} | ${q.searchTokens.toLocaleString()} | ${q.totalTokens.toLocaleString()} | ${avgSim}% | ${maxSim}% |`)
  }
  lines.push(``)

  // 結果の一致度比較
  lines.push(`### 結果の比較`)
  lines.push(``)

  const allNames = new Set<string>()
  for (const q of quadrants) {
    for (const r of q.results) {
      allNames.add(r.userName ?? r.careerMapId)
    }
  }

  lines.push(`| 名前 | ${quadrants.map((q) => `${q.embedEncoding}×${q.searchEncoding}`).join(' | ')} |`)
  lines.push(`|------|${quadrants.map(() => '------').join('|')}|`)
  for (const name of allNames) {
    const cells = quadrants.map((q) => {
      const found = q.results.find((r) => (r.userName ?? r.careerMapId) === name)
      if (!found) return '-'
      const rank = q.results.indexOf(found) + 1
      return `#${rank} (${(found.similarity * 100).toFixed(1)}%)`
    })
    lines.push(`| ${name} | ${cells.join(' | ')} |`)
  }
  lines.push(``)

  // 推奨
  lines.push(`### 推奨`)
  lines.push(``)
  const bestByAvg = [...quadrants].sort((a, b) => {
    const avgA = a.results.reduce((s, r) => s + r.similarity, 0) / (a.results.length || 1)
    const avgB = b.results.reduce((s, r) => s + r.similarity, 0) / (b.results.length || 1)
    return avgB - avgA
  })[0]
  const cheapest = [...quadrants].sort((a, b) => a.totalTokens - b.totalTokens)[0]

  lines.push(`- **最高精度**: ${bestByAvg.embedEncoding} × ${bestByAvg.searchEncoding}`)
  lines.push(`- **最低コスト**: ${cheapest.embedEncoding} × ${cheapest.searchEncoding} (${cheapest.totalTokens.toLocaleString()} tokens)`)
  lines.push(``)

  return lines.join('\n')
}

async function main() {
  const opts = program.opts<{ name: string; limit: string }>()
  const limit = parseInt(opts.limit, 10)

  console.log(`対象: ${opts.name}`)

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

  const result = await compareCareerMapEncodings({ userName: opts.name, limit }, executor)

  if (!result.success) {
    console.error('エラー:', result.error.message)
    process.exit(1)
  }

  // 出力先ディレクトリ作成
  const dataDir = path.join(outDir, 'data')
  fs.mkdirSync(dataDir, { recursive: true })

  // embedding に送ったテキストデータを保存
  for (const q of result.data.quadrants) {
    const label = `${q.embedEncoding}_${q.searchEncoding}`
    fs.writeFileSync(path.join(dataDir, `embed_${label}.txt`), q.embedText, 'utf-8')
    fs.writeFileSync(path.join(dataDir, `search_${label}.txt`), q.searchText, 'utf-8')
  }
  console.log(`データ出力: ${dataDir}/`)

  // チャート生成
  console.log('チャート生成中...')
  const charts = await generateCharts(result.data.quadrants, outDir)

  const report = formatReport(opts.name, result.data.quadrants, charts)

  fs.writeFileSync(outFile, report, 'utf-8')
  console.log(`\nレポート出力: ${outFile}`)
  console.log(`チャート: ${path.join(outDir, charts.similarityChart)}, ${path.join(outDir, charts.tokenChart)}`)

  process.exit(0)
}

main()
