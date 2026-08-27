import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const J2 = f => path.join(path.dirname(fileURLToPath(import.meta.url)), f)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT,'docs','06_[태스크 리스트] 연금플러스_병합판.md')
const DUR = { H: 6, M: 3, L: 1 }               // 개발자 1명 기준 영업일 (가정)
const tasks = {}
for (const line of fs.readFileSync(SRC, 'utf8').split('\n')) {
  if (!/^\| (FR|UX)-\d{3} \|/.test(line)) continue
  const c = line.trim().replace(/^\||\|$/g, '').split('|').map(s => s.trim())
  if (c.length < 7) continue
  const cx = c[5].replace(/\*/g, '')
  if (!DUR[cx]) continue
  tasks[c[0]] = { id: c[0], epic: c[1], feat: c[2], srs: c[3], cx, dur: DUR[cx], origin: c[6],
    deps: /^none/i.test(c[4]) ? [] : (c[4].match(/(?:FR|UX)-\d{3}/g) || []) }
}
const ids = Object.keys(tasks)
const dep = id => tasks[id].deps.filter(d => tasks[d])
const succ = {}; ids.forEach(i => succ[i] = [])
ids.forEach(i => dep(i).forEach(d => succ[d].push(i)))

const indeg = {}; ids.forEach(i => indeg[i] = dep(i).length)
let q = ids.filter(i => indeg[i] === 0).sort()
const order = [], ES = {}, EF = {}, wave = {}
while (q.length) {
  const n = q.shift(); order.push(n)
  const ds = dep(n)
  ES[n] = ds.length ? Math.max(...ds.map(d => EF[d])) : 0
  EF[n] = ES[n] + tasks[n].dur
  wave[n] = ds.length ? Math.max(...ds.map(d => wave[d])) + 1 : 1
  for (const s of succ[n]) if (--indeg[s] === 0) { q.push(s); q.sort() }
}
if (order.length !== ids.length) { console.log('!! 사이클:', ids.filter(i => !order.includes(i))); process.exit(1) }

const project = Math.max(...Object.values(EF))
let end = ids.reduce((a, b) => EF[b] > EF[a] ? b : a)
const cp = [end]
for (;;) { const ds = dep(cp[cp.length - 1]); if (!ds.length) break
  cp.push(ds.reduce((a, b) => EF[b] > EF[a] ? b : a)) }
cp.reverse()

const memo = {}
const reach = n => memo[n] ??= succ[n].reduce((s, x) => { s.add(x); reach(x).forEach(y => s.add(y)); return s }, new Set())
const bn = [...ids].sort((a, b) => reach(b).size - reach(a).size || a.localeCompare(b)).slice(0, 12)

const waves = {}; order.forEach(n => (waves[wave[n]] ??= []).push(n))
const out = { total: ids.length, sum_effort: ids.reduce((s, i) => s + tasks[i].dur, 0),
  project_days_infinite: project, cp_days: cp.reduce((s, i) => s + tasks[i].dur, 0),
  critical_path: cp.map(i => ({ id: i, cx: tasks[i].cx, dur: tasks[i].dur, epic: tasks[i].epic, feat: tasks[i].feat })),
  waves, wave_profile: Object.fromEntries(Object.entries(waves).map(([w, v]) => [w,
    { count: v.length, effort: v.reduce((s, i) => s + tasks[i].dur, 0), maxdur: Math.max(...v.map(i => tasks[i].dur)) }])),
  bottlenecks: bn.map(n => ({ id: n, direct: succ[n].length, transitive: reach(n).size, cx: tasks[n].cx, epic: tasks[n].epic, feat: tasks[n].feat })),
  no_dep: ids.filter(i => !dep(i).length).sort(),
  by_epic: Object.entries(ids.reduce((m, i) => ((m[tasks[i].epic] ??= { n: 0, d: 0 }).n++, m[tasks[i].epic].d += tasks[i].dur, m), {}))
             .map(([e, v]) => ({ epic: e, count: v.n, effort: v.d })).sort((a, b) => b.effort - a.effort) }
fs.writeFileSync(J2('dag.json'), JSON.stringify({ ...out, tasks }, null, 1))

console.log(`태스크 ${out.total}건 · 총 공수 ${out.sum_effort}일(1인 환산)`)
console.log(`무한 자원 최단 ${project}일 · 임계 경로 ${cp.length}단계 ${out.cp_days}일`)
console.log('\n[임계 경로]'); cp.forEach(i => console.log(`  ${i} [${tasks[i].cx}/${tasks[i].dur}d] ${tasks[i].epic} — ${tasks[i].feat.slice(0, 46)}`))
console.log('\n[웨이브]'); Object.keys(out.wave_profile).sort((a,b)=>a-b).forEach(w => { const p = out.wave_profile[w]
  console.log(`  W${w}: ${p.count}건 공수${p.effort}d 최장${p.maxdur}d  ${waves[w].join(' ')}`) })
console.log('\n[병목 상위 8]'); out.bottlenecks.slice(0, 8).forEach(b => console.log(`  ${b.id} 직접${b.direct} 전이${b.transitive} [${b.cx}] ${b.feat.slice(0,42)}`))
console.log('\n[Epic별 공수]'); out.by_epic.forEach(e => console.log(`  ${e.epic}: ${e.count}건 ${e.effort}d`))
console.log('\n선행없음:', out.no_dep.join(', '))
