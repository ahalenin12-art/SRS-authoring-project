import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DUR={H:6,M:3,L:1}
function load(p, cols){
  const t={}
  for(const line of fs.readFileSync(p,'utf8').split('\n')){
    if(!/^\| (FR|UX)-\d{3} \|/.test(line))continue
    const c=line.trim().replace(/^\||\|$/g,'').split('|').map(s=>s.trim())
    if(c.length<cols)continue
    const cx=c[5].replace(/\*/g,''); if(!DUR[cx])continue
    t[c[0]]={id:c[0],epic:c[1],cx,dur:DUR[cx],feat:c[2],
      deps:/^none/i.test(c[4])?[]:(c[4].match(/(?:FR|UX)-\d{3}/g)||[])}
  }
  return t
}
function analyze(T,label){
  const ids=Object.keys(T), dep=i=>T[i].deps.filter(d=>T[d])
  const indeg={};ids.forEach(i=>indeg[i]=dep(i).length)
  let q=ids.filter(i=>!indeg[i]).sort();const EF={},wave={},ord=[]
  while(q.length){const n=q.shift();ord.push(n);const ds=dep(n)
    EF[n]=(ds.length?Math.max(...ds.map(d=>EF[d])):0)+T[n].dur
    wave[n]=(ds.length?Math.max(...ds.map(d=>wave[d])):0)+1
    ids.filter(j=>dep(j).includes(n)).forEach(s=>{if(--indeg[s]===0){q.push(s);q.sort()}})}
  if(ord.length!==ids.length){console.log(label,'사이클!',ids.filter(i=>!ord.includes(i)));return}
  const end=Math.max(...Object.values(EF))
  let e=ids.reduce((a,b)=>EF[b]>EF[a]?b:a);const cp=[e]
  for(;;){const ds=dep(cp.at(-1));if(!ds.length)break;cp.push(ds.reduce((a,b)=>EF[b]>EF[a]?b:a))}
  cp.reverse()
  const eff=ids.reduce((s,i)=>s+T[i].dur,0)
  const H=ids.filter(i=>T[i].cx==='H').length,M=ids.filter(i=>T[i].cx==='M').length,L=ids.filter(i=>T[i].cx==='L').length
  console.log(`${label}: ${ids.length}건 · 공수 ${eff}d · 하한 ${end}d · 깊이 ${Math.max(...Object.values(wave))}단계 · H${H}/M${M}/L${L}`)
  console.log(`   임계경로(${cp.length}): ${cp.join(' → ')}`)
  return {n:ids.length,eff,end,depth:Math.max(...Object.values(wave)),cp}
}
const v1=analyze(load(path.join(ROOT,'docs','05_[태스크 리스트] 연금플러스_전체판.md'),6),'v1(102)')
const v2=analyze(load(path.join(ROOT,'docs','06_[태스크 리스트] 연금플러스_병합판.md'),7),'v2(67) ')
console.log(`\n차이: 태스크 ${v1.n}→${v2.n} (${v2.n-v1.n}) · 공수 ${v1.eff}→${v2.eff}d (${v2.eff-v1.eff}) · 하한 ${v1.end}→${v2.end}d (${v2.end-v1.end}) · 깊이 ${v1.depth}→${v2.depth}`)
// 주의: v2에는 감사 보정 신규 FR-050(M/3d)이 포함되어 있다.
// 병합만의 효과는 FR-050을 제외한 66건 기준 — 공수 356→284d, 하한 36→39d.
// [분석] 태스크 축약 수행 결과 검증 문서의 수치가 그 값이다.
