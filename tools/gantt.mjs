// 태스크별 시작·종료 날짜를 산출한다 (영업일 기준, 주말 제외)
// 사용: node tools/gantt.mjs [--plan std|fast] [--start YYYY-MM-DD]
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url'
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const D = JSON.parse(fs.readFileSync(path.join(ROOT,'tools','dag.json'),'utf8'))
const T = D.tasks, ids = Object.keys(T)
const dep = i => T[i].deps.filter(d=>T[d])
const kind = i => i.startsWith('UX') ? 'des' : 'dev'
const argv = process.argv.slice(2)
const PLAN = argv.includes('--plan') ? argv[argv.indexOf('--plan')+1] : 'fast'
const START = argv.includes('--start') ? argv[argv.indexOf('--start')+1] : null
const CREW = { std:[4,2], fast:[6,2] }[PLAN]
if(!CREW){ console.error('--plan std|fast'); process.exit(1) }

const memo={}; const rem=i=>memo[i]??=T[i].dur+Math.max(0,...ids.filter(j=>dep(j).includes(i)).map(rem))
function schedule([nDev,nDes]){
  const free={dev:Array(nDev).fill(0),des:Array(nDes).fill(0)}, fin={}, start={}
  const left=new Set(ids); let g=0
  while(left.size && g++<9999){
    const ready=[...left].filter(i=>dep(i).every(d=>d in fin))
    if(!ready.length) throw new Error('cycle')
    let best=null
    for(const i of ready){ const pool=free[kind(i)]
      const s=Math.max(dep(i).length?Math.max(...dep(i).map(d=>fin[d])):0, Math.min(...pool))
      if(!best||s<best.s||(s===best.s&&rem(i)>rem(best.i))) best={i,s} }
    const {i,s}=best, pool=free[kind(i)]
    pool[pool.indexOf(Math.min(...pool))]=s+T[i].dur
    start[i]=s; fin[i]=s+T[i].dur; left.delete(i)
  }
  return {start,fin,end:Math.max(...Object.values(fin))}
}
// 영업일 오프셋 → 날짜 (주말 제외)
const base = START ? new Date(START+'T00:00:00Z') : (()=>{ const d=new Date(); d.setUTCHours(0,0,0,0)
  while(d.getUTCDay()===0||d.getUTCDay()===6) d.setUTCDate(d.getUTCDate()+1); return d })()
const cache=new Map()
function bizDate(off){
  if(cache.has(off))return cache.get(off)
  const d=new Date(base); let n=0
  while(n<off){ d.setUTCDate(d.getUTCDate()+1); if(d.getUTCDay()!==0&&d.getUTCDay()!==6) n++ }
  const s=d.toISOString().slice(0,10); cache.set(off,s); return s
}
const S=schedule(CREW)
const rows=ids.sort().map(i=>({ id:i, title:T[i].feat, epic:T[i].epic, cx:T[i].cx, dur:T[i].dur,
  startOff:S.start[i], endOff:S.fin[i],
  start:bizDate(S.start[i]), end:bizDate(S.fin[i]-1), wave:'W'+(D.waves? Object.entries(D.waves).find(([w,v])=>v.includes(i))?.[0] : '?') }))
fs.writeFileSync(path.join(ROOT,'tools',`gantt-${PLAN}.json`), JSON.stringify({plan:PLAN,crew:CREW,baseline:base.toISOString().slice(0,10),days:S.end,tasks:rows},null,1))
console.log(`[${PLAN}] dev${CREW[0]}/des${CREW[1]} · ${S.end}영업일 · 기준일 ${base.toISOString().slice(0,10)} → 종료 ${bizDate(S.end-1)}`)
console.log(`주차별 착수 건수:`)
const wk={}; rows.forEach(r=>{ const w=Math.floor(r.startOff/5)+1; wk[w]=(wk[w]||0)+1 })
Object.keys(wk).sort((a,b)=>a-b).forEach(w=>console.log(`  W${w}: ${wk[w]}건 (${bizDate((w-1)*5)} ~)`))
console.log(`\n샘플 5건:`); rows.slice(0,5).forEach(r=>console.log(`  ${r.id}  ${r.start} → ${r.end}  [${r.cx}/${r.dur}d] ${r.title.slice(0,40)}`))
