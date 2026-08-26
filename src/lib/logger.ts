import pc from 'picocolors'

function getTime(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })
}

export function log(message: string): void {
  console.log(`${pc.dim(getTime())} ${pc.cyan('[slugtree]')} ${message}`)
}

export function logSuccess(message: string): void {
  console.log(
    `${pc.dim(getTime())} ${pc.cyan('[slugtree]')} ${pc.green(message)}`
  )
}

export function logChange(filePath: string): void {
  const rel = filePath.replace(/\\/g, '/')
  console.log(
    `${pc.dim(getTime())} ${pc.cyan('[slugtree]')} change detected in ${pc.bold(rel)}`
  )
}

export function logWarn(message: string): void {
  console.warn(`${pc.dim(getTime())} ${pc.yellow('[slugtree]')} ${message}`)
}
