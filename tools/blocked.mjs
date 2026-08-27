import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const J = f => path.join(HERE, f)
const D = JSON.parse(fs.readFileSync(J('dag.json'),'utf8')), S = JSON.parse(fs.readFileSync(J('sched.json'),'utf8'))
const T = D.tasks, ids = Object.keys(T), dep = i => T[i].deps.filter(d=>T[d])
const BLOCK = { 'FR-018':'OPEN-TEC-004', 'FR-028':'OPEN-TEC-004', 'FR-022':'OPEN-TEC-007',
                'FR-032':'OPEN-TEC-001/002', 'FR-033':'OPEN-TEC-001/002' }
const PARTIAL = ['FR-038','FR-039','FR-040','FR-041','FR-042']

console.log('[차단 태스크의 착수 예정일 = 답변 기한]')
for (const key of ['3_1','4_2','6_2']) {
  const r = S.detail[key], [dv,ds] = key.split('_')
  console.log(`\n dev${dv}/des${ds} (총 ${r.end}일)`)
  Object.entries(BLOCK).forEach(([t,o]) => console.log(`   ${t}  착수 D+${r.start[t]+1}  완료 D+${r.fin[t]}  ← ${o}`))
  const p = PARTIAL.map(t=>r.start[t]+1)
  console.log(`   부분제약 F1화면 최초착수 D+${Math.min(...p)}`)
}

// 차단 태스크 제외 시 임계경로
const memo={}, rem = i => memo[i] ??= T[i].dur + Math.max(0,...ids.filter(j=>dep(j).includes(i)).map(rem))
const drop = new Set(Object.keys(BLOCK))
const keep = ids.filter(i=>!drop.has(i))
const EF={}, ord=[]
let indeg={}; keep.forEach(i=>indeg[i]=dep(i).filter(d=>keep.includes(d)).length)
let q=keep.filter(i=>!indeg[i]).sort()
while(q.length){const n=q.shift();ord.push(n)
  const ds=dep(n).filter(d=>keep.includes(d))
  EF[n]=(ds.length?Math.max(...ds.map(d=>EF[d])):0)+T[n].dur
  keep.filter(j=>dep(j).includes(n)).forEach(s=>{if(--indeg[s]===0){q.push(s);q.sort()}})}
const end2=Math.max(...Object.values(EF))
let e=keep.reduce((a,b)=>EF[b]>EF[a]?b:a); const cp2=[e]
for(;;){const ds=dep(cp2.at(-1)).filter(d=>keep.includes(d)); if(!ds.length)break; cp2.push(ds.reduce((a,b)=>EF[b]>EF[a]?b:a))}
cp2.reverse()
console.log(`\n[차단 5건 제외 시] 하한 ${end2}일 (원래 ${D.project_days_infinite}일)`)
console.log('  경로: '+cp2.join(' → '))

// Epic별 차단 영향
const blockedReach = new Set()
const memoS={}, reach = n => memoS[n] ??= ids.filter(j=>dep(j).includes(n)).reduce((s,x)=>{s.add(x);reach(x).forEach(y=>s.add(y));return s},new Set())
Object.keys(BLOCK).forEach(t=>{blockedReach.add(t); reach(t).forEach(x=>blockedReach.add(x))})
console.log(`\n차단 태스크 + 그 후행 = ${blockedReach.size}건 / 66건 (${(blockedReach.size/66*100).toFixed(0)}%)`)
console.log('  영향권:', [...blockedReach].sort().join(' '))
console.log(`\n차단 무관 즉시 착수 가능: ${66-blockedReach.size}건`)
