// docs/tasks/ 의 태스크 파일을 GitHub Issue로 발행한다.
// 사용: node tools/gh_issues.mjs [--dry] [--only FR-001] [--limit N]
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url'
import { execFileSync, execSync } from 'child_process'
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO = 'ahalenin12-art/SRS-authoring-project'
const BLOB = `https://github.com/${REPO}/blob/main`
const DIR = 'docs/tasks'
const argv = process.argv.slice(2)
const DRY = argv.includes('--dry')
const ONLY = argv.includes('--only') ? argv[argv.indexOf('--only')+1] : null
const LIMIT = argv.includes('--limit') ? +argv[argv.indexOf('--limit')+1] : Infinity

// 1) 기존 이슈 제목 수집 → 중복 방지
let existing = new Set()
try {
  const raw = execSync(`gh issue list --repo ${REPO} --state all --limit 500 --json title`,{encoding:'utf8'})
  JSON.parse(raw).forEach(i=>{ const m=i.title.match(/^\[((?:FR|UX)-\d{3})\]/); if(m) existing.add(m[1]) })
} catch(e){ console.error('기존 이슈 조회 실패:', e.message.split('\n')[0]) }
console.log(`기존 이슈 ${existing.size}건 확인`)

// 2) 상대 링크 → 절대 URL
const abs = (body) => body.replace(/\]\(([^)\s]+)\)/g, (m, link) => {
  if (/^(https?:|mailto:|#)/.test(link)) return m
  const [p, anchor] = link.split('#')
  const target = path.posix.normalize(path.posix.join(DIR, p))
  return `](${BLOB}/${encodeURI(target).replace(/\(/g,'%28').replace(/\)/g,'%29')}${anchor?'#'+anchor:''})`
})

const _sab=new SharedArrayBuffer(4), _ia=new Int32Array(_sab)
const sleep = ms => { try{ Atomics.wait(_ia,0,0,ms) }catch{} }

const files = fs.readdirSync(path.join(ROOT,DIR)).filter(f=>/^(FR|UX)-\d{3}\.md$/.test(f)).sort()
let made=0, skipped=0, failed=0
for (const f of files) {
  const id = f.replace('.md','')
  if (ONLY && id !== ONLY) continue
  if (made >= LIMIT) break
  if (existing.has(id)) { skipped++; console.log(`  = ${id} 이미 존재 — 건너뜀`); continue }

  const raw = fs.readFileSync(path.join(ROOT,DIR,f),'utf8')
  const tm = raw.match(/^# ((?:FR|UX)-\d{3}) — (.+)$/m)
  if (!tm) { console.log(`  ! ${id} 제목 추출 실패`); failed++; continue }
  const title = `[${tm[1]}] ${tm[2].trim()}`

  // 라벨 = 파일의 labels 줄 + Issue Automation
  const lm = raw.match(/^\*\*labels:\*\*\s*(.+)$/m)
  const labels = ['Issue Automation']
  if (lm) lm[1].replace(/`/g,'').split(',').map(s=>s.trim()).filter(Boolean).forEach(l=>labels.push(l))

  // 본문 = h1 제거 · labels 줄 제거 · 링크 절대화 · 원본 링크 추가
  let body = raw.replace(/^# .+\n/,'').replace(/^\*\*labels:\*\*.*\n/m,'')
  body = abs(body).trim()
  body += `\n\n---\n\n<sub>원본: [\`${DIR}/${f}\`](${BLOB}/${DIR}/${f}) · \`node tools/gh_issues.mjs\` 로 발행</sub>`

  if (DRY) { console.log(`\n──── ${title}\n라벨: ${labels.join(', ')}\n본문 ${body.length}자 / 첫 3줄:`); console.log(body.split('\n').slice(0,3).map(l=>'  '+l).join('\n')); made++; continue }

  const args = ['issue','create','--repo',REPO,'--title',title,'--body',body]
  labels.forEach(l=>{ args.push('--label', l) })
  try {
    const out = execFileSync('gh', args, {encoding:'utf8'}).trim()
    console.log(`  + ${id} → ${out}`); made++; sleep(1200)   // secondary rate limit 회피
  } catch(e){ console.log(`  ! ${id} 실패: ${(e.stderr||e.message).split('\n')[0]}`); failed++ }
}
console.log(`\n생성 ${made} · 건너뜀 ${skipped} · 실패 ${failed}`)
