import { execSync } from 'node:child_process'

export default (filePath?: string) => {
  if (!filePath) return null
  const dateString = execSync(`git log -1 --format=%cI -- "${filePath}"`, {
    encoding: 'utf8'
  }).trim()
  return dateString ? new Date(dateString) : null
}
