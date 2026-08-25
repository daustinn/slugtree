import { execSync } from 'node:child_process'

export default (filePath: string): string => {
  return execSync(`git log -1 --format=%cI -- "${filePath}"`, {
    encoding: 'utf8'
  }).trim()
}
