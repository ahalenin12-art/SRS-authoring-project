// 발행된 Issue 72건을 GitHub Project(v2)로 올리고 로드맵 필드를 채운다.
//
// 선행: gh auth refresh -s project   (project scope 필요)
// 사용: node tools/gh_project.mjs [--plan fast|std] [--dry] [--title "..."]
//
// 하는 일
//   1) 프로젝트 확인 → 없으면 생성 후 리포에 link
//   2) 필드 생성 — Start date · Target date · Epic · 복잡도 · 웨이브 (없는 것만)
//   3) Issue 72건을 아이템으로 추가 (이미 있으면 건너뜀)
//   4) 각 아이템에 날짜·Epic·복잡도·웨이브 값 설정
//   로드맵 뷰는 CLI로 만들 수 없다 → 웹에서 New view → Roadmap 선택
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url'
import { execFileSync } from 'child_process'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OWNER = 'ahalenin12-art'
const REPO  = `${OWNER}/SRS-authoring-project`
const argv  = process.argv.slice(2)
const PLAN  = argv.includes('--plan') ? argv[argv.indexOf('--plan')+1] : 'fast'
const DRY   = argv.includes('--dry')
const TITLE = argv.includes('--title') ? argv[argv.indexOf('--title')+1]
            : '연금플러스 개발 로드맵'

const gh = (...a) => execFileSync('gh', a, {encoding:'utf8', maxBuffer:64*1024*1024})
const J  = (...a) => JSON.parse(gh(...a))
const sab = new SharedArrayBuffer(4), ia = new Int32Array(sab)
const sleep = ms => { try{ Atomics.wait(ia,0,0,ms) }catch{} }

// ── 0) 간트 데이터
const gf = path.join(ROOT,'tools',`gantt-${PLAN}.json`)
if (!fs.existsSync(gf)) { console.error(`먼저 실행: node tools/gantt.mjs --plan ${PLAN}`); process.exit(1) }
const G = JSON.parse(fs.readFileSync(gf,'utf8'))
const byId = Object.fromEntries(G.tasks.map(t=>[t.id,t]))
console.log(`간트 [${G.plan}] dev${G.crew[0]}/des${G.crew[1]} · ${G.days}영업일 · ${G.baseline} 기준 · ${G.tasks.length}건`)

// ── 1) 프로젝트
let projNum, projId
const list = J('project','list','--owner',OWNER,'--format','json').projects || []
const hit = list.find(p=>p.title===TITLE)
if (hit) { projNum=hit.number; projId=hit.id; console.log(`프로젝트 재사용 #${projNum} "${TITLE}"`) }
else if (DRY) { console.log(`[dry] 프로젝트 생성 예정: "${TITLE}"`); process.exit(0) }
else {
  const p = J('project','create','--owner',OWNER,'--title',TITLE,'--format','json')
  projNum=p.number; projId=p.id
  console.log(`프로젝트 생성 #${projNum} → ${p.url}`)
  try { gh('project','link',String(projNum),'--owner',OWNER,'--repo',REPO); console.log('  리포에 link 완료') }
  catch(e){ console.log('  link 실패(무해): '+String(e.stderr||e.message).split('\n')[0]) }
}

// ── 2) 필드
const EPICS=['PLT','DAT','DOM','ADP','ACT','ITG','BAT','UIF','SF1','SF2','QLT','TST','DSG']
const WAVES=['W1','W2','W3','W4','W5','W6','W7','W8','W9']
const WANT=[
  ['Start date','DATE',null],
  ['Target date','DATE',null],
  ['Epic','SINGLE_SELECT',EPICS],
  ['복잡도','SINGLE_SELECT',['H','M','L']],
  ['웨이브','SINGLE_SELECT',WAVES],
]
let fields = J('project','field-list',String(projNum),'--owner',OWNER,'--limit','60','--format','json').fields
for (const [name,type,opts] of WANT) {
  if (fields.some(f=>f.name===name)) { console.log(`  = 필드 ${name}`); continue }
  const a=['project','field-create',String(projNum),'--owner',OWNER,'--name',name,'--data-type',type]
  if (opts) a.push('--single-select-options', opts.join(','))
  gh(...a); console.log(`  + 필드 ${name}`); sleep(400)
}
fields = J('project','field-list',String(projNum),'--owner',OWNER,'--limit','60','--format','json').fields
const F = Object.fromEntries(fields.map(f=>[f.name,f]))
const optId = (fname,val) => (F[fname]?.options||[]).find(o=>o.name===val)?.id

// ── 3) 이슈 → 아이템
const issues = J('issue','list','--repo',REPO,'--state','all','--limit','300',
  '--json','number,title,url').filter(i=>/^\[(FR|UX)-\d{3}\]/.test(i.title))
console.log(`\n이슈 ${issues.length}건 대상`)

let items = J('project','item-list',String(projNum),'--owner',OWNER,'--limit','300','--format','json').items || []
const haveUrl = new Set(items.map(i=>i.content?.url).filter(Boolean))
let added=0
for (const is of issues) {
  if (haveUrl.has(is.url)) continue
  if (DRY) { added++; continue }
  gh('project','item-add',String(projNum),'--owner',OWNER,'--url',is.url)
  added++; if(added%10===0) console.log(`  추가 ${added}건…`); sleep(700)
}
console.log(`아이템 추가 ${added}건 (기존 ${haveUrl.size}건 유지)`)
if (DRY) { console.log('[dry] 여기서 종료'); process.exit(0) }

// ── 4) 필드 값 설정
items = J('project','item-list',String(projNum),'--owner',OWNER,'--limit','300','--format','json').items || []
let set=0, skip=0
for (const it of items) {
  const t = it.content?.title || ''
  const m = t.match(/^\[((?:FR|UX)-\d{3})\]/)
  if (!m || !byId[m[1]]) { skip++; continue }
  const d = byId[m[1]]
  const base = ['project','item-edit','--id',it.id,'--project-id',projId]
  const put = (fname, kind, val) => {
    if (!F[fname] || val==null) return
    try { gh(...base,'--field-id',F[fname].id, kind, String(val)) } catch(e){}
  }
  put('Start date','--date',d.start)
  put('Target date','--date',d.end)
  const EMAP={'Platform':'PLT','Data Layer':'DAT','Domain Engine':'DOM','Adapters':'ADP',
    'Server Actions':'ACT','System Integration':'ITG','Batch':'BAT','UI Foundation':'UIF',
    '화면 F1':'SF1','화면 F2':'SF2','Quality Gate':'QLT','Verification':'TST',
    'Design System':'DSG','표기 규칙 디자인':'DSG','커스텀 시각화':'DSG',
    '화면 설계 F1':'DSG','화면 설계 F2':'DSG'}
  const ecode = EMAP[d.epic] || null
  if (ecode && optId('Epic',ecode)) gh(...base,'--field-id',F['Epic'].id,'--single-select-option-id',optId('Epic',ecode))
  if (optId('복잡도',d.cx))  gh(...base,'--field-id',F['복잡도'].id,'--single-select-option-id',optId('복잡도',d.cx))
  if (optId('웨이브',d.wave)) gh(...base,'--field-id',F['웨이브'].id,'--single-select-option-id',optId('웨이브',d.wave))
  set++; if(set%10===0) console.log(`  설정 ${set}건…`); sleep(300)
}
console.log(`\n필드 설정 ${set}건 · 건너뜀 ${skip}건`)
console.log(`\n프로젝트: https://github.com/users/${OWNER}/projects/${projNum}`)
console.log(`남은 작업(웹 UI): New view → Roadmap → Start date / Target date 지정`)
