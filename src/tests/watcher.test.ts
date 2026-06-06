import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startWatcher } from '../lib/watcher.js'
import { generateContent } from '../lib/generator.js'

vi.mock('../lib/generator.js', () => ({
  generateContent: vi.fn()
}))

const mockOn = vi.fn()
const mockWatcher = {
  on: mockOn
}
const mockWatch = vi.fn().mockReturnValue(mockWatcher)

vi.mock('chokidar', () => ({
  default: {
    watch: mockWatch
  },
  watch: mockWatch
}))

describe('watcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts watcher and registers event listener', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await startWatcher('/content', '/output', '/docs')

    expect(mockWatch).toHaveBeenCalledWith('/content', {
      ignoreInitial: true,
      cwd: process.cwd()
    })
    expect(mockOn).toHaveBeenCalledWith('all', expect.any(Function))
    expect(consoleSpy).toHaveBeenCalled()
  })

  it('triggers content generation on mdx change', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    await startWatcher('/content', '/output', '/docs')

    // Retrieve the callback passed to watcher.on('all')
    const callback = mockOn.mock.calls.find((call) => call[0] === 'all')?.[1]
    expect(callback).toBeDefined()

    callback('change', 'index.mdx')

    // Rebuilding shouldn't happen immediately due to 100ms debounce
    expect(generateContent).not.toHaveBeenCalled()

    // Advance time by 100ms
    vi.advanceTimersByTime(100)
    expect(generateContent).toHaveBeenCalledWith(
      '/content',
      '/output',
      '/docs',
      undefined
    )
  })

  it('triggers content generation on json change', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    await startWatcher('/content', '/output', '/docs')

    const callback = mockOn.mock.calls.find((call) => call[0] === 'all')?.[1]
    callback('change', 'config.json')

    vi.advanceTimersByTime(100)
    expect(generateContent).toHaveBeenCalled()
  })

  it('does not trigger content generation on other file changes', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    await startWatcher('/content', '/output', '/docs')

    const callback = mockOn.mock.calls.find((call) => call[0] === 'all')?.[1]
    callback('change', 'script.js')

    vi.advanceTimersByTime(100)
    expect(generateContent).not.toHaveBeenCalled()
  })

  it('debounces multiple changes within 100ms', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    await startWatcher('/content', '/output', '/docs')

    const callback = mockOn.mock.calls.find((call) => call[0] === 'all')?.[1]

    callback('change', 'index.mdx')
    vi.advanceTimersByTime(50)
    expect(generateContent).not.toHaveBeenCalled()

    callback('change', 'index.mdx')
    vi.advanceTimersByTime(50)
    // 100ms total elapsed since first, but only 50ms since second change
    expect(generateContent).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)
    // Now 100ms since second change
    expect(generateContent).toHaveBeenCalledTimes(1)
  })
})
