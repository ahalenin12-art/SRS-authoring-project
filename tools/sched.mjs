import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const J = f => path.join(HERE, f)
const D = JSON.parse(fs.readFileSync(J('dag.json'), 'utf8'))
const T = D.tasks, ids = Object.keys(T)
const dep = i => T[i].deps.filter(d => T[d])
const kind = i => i.startsWith('UX') ? 'des' : 'dev'

// 자원 제약 스케줄링 (리스트 스케줄링 — 임계 경로 잔여길이 큰 것 우선)
const memoR = {}
const rem = i => memoR[i] ??= T[i].dur + Math.max(0, ...ids.filter(j => dep(j).includes(i)).map(rem))

function run(nDev, nDes) {
  const done = {}, start = {}, fin = {}
  const free = { dev: Array(nDev).fill(0), des: Array(nDes).fill(0) }
  const left = new Set(ids)
  let guard = 0
  while (left.size && guard++ < 5000) {
    const ready = [...left].filter(i => dep(i).every(d => d in fin))
    if (!ready.length) return null
    ready.sort((a, b) => rem(b) - rem(a) || a.localeCompare(b))
    // 각 ready 태스크에 가장 빨리 비는 자원 배정
    let best = null
    for (const i of ready) {
      const pool = free[kind(i)]
      const s = Math.max(dep(i).length ? Math.max(...dep(i).map(d => fin[d])) : 0, Math.min(...pool))
      if (!best || s < best.s || (s === best.s && rem(i) > rem(best.i))) best = { i, s }
    }
    const { i, s } = best
    const pool = free[kind(i)]
    pool[pool.indexOf(Math.min(...pool))] = s + T[i].dur
    start[i] = s; fin[i] = s + T[i].dur; left.delete(i); done[i] = 1
  }
  const end = Math.max(...Object.values(fin))
  // 일별 동시 작업 수
  const conc = Array(end).fill(0)
  ids.forEach(i => { for (let d = start[i]; d < fin[i]; d++) conc[d]++ })
  return { end, start, fin, peak: Math.max(...conc), avg: +(conc.reduce((a,b)=>a+b,0)/end).toFixed(1) }
}

console.log('편성안 비교 (dev/des → 기간)')
const opts = [[1,1],[2,1],[3,1],[3,2],[4,2],[5,2],[6,2],[8,3],[12,4]]
const rows = []
for (const [dv, ds] of opts) {
  const r = run(dv, ds)
  const devEff = ids.filter(i=>kind(i)==='dev').reduce((s,i)=>s+T[i].dur,0)
  const desEff = ids.filter(i=>kind(i)==='des').reduce((s,i)=>s+T[i].dur,0)
  const util = ((devEff+desEff)/(r.end*(dv+ds))*100).toFixed(0)
  rows.push({ dev: dv, des: ds, days: r.end, peak: r.peak, avg: r.avg, util: util+'%' })
  console.log(`  dev${dv} des${ds} → ${r.end}일 (동시최대 ${r.peak}, 평균 ${r.avg}, 가동률 ${util}%)`)
}
const devEff = ids.filter(i=>kind(i)==='dev').reduce((s,i)=>s+T[i].dur,0)
const desEff = ids.filter(i=>kind(i)==='des').reduce((s,i)=>s+T[i].dur,0)
console.log(`\n개발 공수 ${devEff}일(${ids.filter(i=>kind(i)==='dev').length}건) · 디자인 공수 ${desEff}일(${ids.filter(i=>kind(i)==='des').length}건)`)
console.log(`무한자원 하한 ${D.project_days_infinite}일 (임계경로)`)

// 대표 편성 3안 상세
for (const [dv, ds, name] of [[3,1,'최소'],[4,2,'표준'],[5,2,'압축']]) {
  const r = run(dv, ds)
  console.log(`\n=== ${name} dev${dv}/des${ds} — ${r.end}일 ===`)
  const byWeek = {}
  ids.forEach(i => { const w = Math.floor(r.start[i]/5)+1; (byWeek[w] ??= []).push(i) })
  Object.keys(byWeek).sort((a,b)=>a-b).forEach(w => console.log(`  W${w}(${(w-1)*5+1}~${w*5}일): ${byWeek[w].sort().join(' ')}`))
}
fs.writeFileSync(J('sched.json'), JSON.stringify({ rows, devEff, desEff, floor: D.project_days_infinite,
  detail: Object.fromEntries([[3,1],[4,2],[5,2]].map(([a,b]) => [`${a}_${b}`, run(a,b)])) }, null, 1))
