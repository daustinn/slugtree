import fs from 'fs'
import path from 'path'

const dir = path.join(process.cwd(), 'src', 'generated')
fs.mkdirSync(dir, { recursive: true })

const files = ['tree.ts', 'nodes.ts', 'meta.ts', 'slugs.ts']

for (const file of files) {
  const filePath = path.join(dir, file)
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, 'export default [] as any\n')
  }
}
