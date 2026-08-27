import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url'
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const T = JSON.parse(fs.readFileSync(path.join(ROOT,'tools','dag.json'),'utf8')).tasks
const ids = Object.keys(T).sort()
const dep = i => T[i].deps.filter(d=>T[d])
const succ = {}; ids.forEach(i=>succ[i]=[])
ids.forEach(i=>dep(i).forEach(d=>succ[d].push(i)))
const W = JSON.parse(fs.readFileSync(path.join(ROOT,'tools','dag.json'),'utf8')).waves
const waveOf = {}; Object.entries(W).forEach(([w,v])=>v.forEach(i=>waveOf[i]=w))
const CP = new Set(['FR-001','FR-003','FR-005','FR-007','FR-019','FR-020','FR-021','FR-022'])
for (const i of ids) {
  const d = dep(i), s = succ[i].sort()
  console.log(`${i}|${T[i].cx}|W${waveOf[i]}|${CP.has(i)?'CP':'--'}|DEP:${d.length?d.sort().join(' '):'None'}|BLK:${s.length?s.join(' '):'None'}|N=${s.length}`)
}
