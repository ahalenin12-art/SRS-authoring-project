// 모든 .md의 상대 링크가 실제로 존재하는지 검사한다
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url'
const R = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const walk = d => fs.readdirSync(path.join(R,d),{withFileTypes:true}).flatMap(e =>
  e.name === '.git' || e.name === 'node_modules' ? [] :
  e.isDirectory() ? walk(path.posix.join(d,e.name)) : [path.posix.join(d,e.name)])
const files = walk('.').map(f=>f.replace(/^\.\//,''))
let ok=0; const bad=[]
for (const f of files.filter(f=>f.endsWith('.md'))) {
  const txt = fs.readFileSync(path.join(R,f),'utf8')
  for (const m of txt.matchAll(/\]\(([^)\s]+)\)/g)) {
    let raw = m[1]
    if (/^(https?:|mailto:|#)/.test(raw)) continue
    const p = raw.split('#')[0]
    if (!p) continue
    let dec; try { dec = decodeURI(p) } catch { dec = p }
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(f), dec))
    if (fs.existsSync(path.join(R,target))) ok++
    else bad.push({f, dec})
  }
}
console.log(`살아있는 링크 ${ok}건 · 깨진 링크 ${bad.length}건`)
bad.forEach(b=>console.log(`  ${b.f}\n     → ${b.dec}`))
process.exit(bad.length ? 1 : 0)
