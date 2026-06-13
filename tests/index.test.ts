import { afterEach, describe, expect, it, vi } from 'vitest'

const releaseMock = vi.hoisted(() => vi.fn(() => '6.8.0-39-generic'))
vi.mock('os', async (importOriginal) => {
  const actual = await importOriginal<typeof import('os')>()
  return { ...actual, release: releaseMock }
})

import { hasGuiDisplay, isWslEnv, normalizeBinaryPathForWsl } from '../src/index.ts'

const realPlatform = process.platform

function setPlatform(platform: string) {
  Object.defineProperty(process, 'platform', { value: platform })
}

afterEach(() => {
  setPlatform(realPlatform)
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('isWslEnv', () => {
  it('returns false on non-linux platforms even when WSLENV is set', () => {
    setPlatform('win32')
    vi.stubEnv('WSLENV', 'PATH/l')
    expect(isWslEnv()).toBe(false)
  })

  it('returns true on linux when WSL_DISTRO_NAME is set', () => {
    setPlatform('linux')
    vi.stubEnv('WSL_DISTRO_NAME', 'Ubuntu')
    expect(isWslEnv()).toBe(true)
  })

  it('returns true on linux when WSL_INTEROP is set', () => {
    setPlatform('linux')
    vi.stubEnv('WSL_DISTRO_NAME', '')
    vi.stubEnv('WSLENV', '')
    vi.stubEnv('WSL_INTEROP', '/run/WSL/8_interop')
    expect(isWslEnv()).toBe(true)
  })

  it('falls back to the kernel release string when env vars are empty', () => {
    setPlatform('linux')
    vi.stubEnv('WSL_DISTRO_NAME', '')
    vi.stubEnv('WSL_INTEROP', '')
    vi.stubEnv('WSLENV', '')
    releaseMock.mockReturnValue('5.15.90.1-microsoft-standard-WSL2')
    expect(isWslEnv()).toBe(true)
  })

  it('returns false on plain linux', () => {
    setPlatform('linux')
    vi.stubEnv('WSL_DISTRO_NAME', '')
    vi.stubEnv('WSL_INTEROP', '')
    vi.stubEnv('WSLENV', '')
    releaseMock.mockReturnValue('6.8.0-39-generic')
    expect(isWslEnv()).toBe(false)
  })
})

describe('hasGuiDisplay', () => {
  it('returns true when DISPLAY is set', () => {
    vi.stubEnv('DISPLAY', ':0')
    vi.stubEnv('WAYLAND_DISPLAY', '')
    expect(hasGuiDisplay()).toBe(true)
  })

  it('returns true when WAYLAND_DISPLAY is set', () => {
    vi.stubEnv('DISPLAY', '')
    vi.stubEnv('WAYLAND_DISPLAY', 'wayland-0')
    expect(hasGuiDisplay()).toBe(true)
  })

  it('returns false when neither display variable is set', () => {
    vi.stubEnv('DISPLAY', '')
    vi.stubEnv('WAYLAND_DISPLAY', '')
    expect(hasGuiDisplay()).toBe(false)
  })
})

describe('normalizeBinaryPathForWsl', () => {
  it('returns empty input unchanged', () => {
    expect(normalizeBinaryPathForWsl('')).toBe('')
  })

  it('strips surrounding double quotes', () => {
    setPlatform('darwin')
    expect(normalizeBinaryPathForWsl('"/usr/bin/google-chrome"')).toBe(
      '/usr/bin/google-chrome'
    )
  })

  it('strips surrounding single quotes', () => {
    setPlatform('darwin')
    expect(normalizeBinaryPathForWsl("'/usr/bin/google-chrome'")).toBe(
      '/usr/bin/google-chrome'
    )
  })

  it('leaves windows paths alone outside WSL', () => {
    setPlatform('win32')
    expect(normalizeBinaryPathForWsl('C:\\Program Files\\Chrome\\chrome.exe')).toBe(
      'C:\\Program Files\\Chrome\\chrome.exe'
    )
  })

  it('converts windows drive paths to /mnt paths inside WSL', () => {
    setPlatform('linux')
    vi.stubEnv('WSL_DISTRO_NAME', 'Ubuntu')
    expect(normalizeBinaryPathForWsl('C:\\Program Files\\Chrome\\chrome.exe')).toBe(
      '/mnt/c/Program Files/Chrome/chrome.exe'
    )
  })

  it('handles forward-slash windows paths inside WSL', () => {
    setPlatform('linux')
    vi.stubEnv('WSL_DISTRO_NAME', 'Ubuntu')
    expect(normalizeBinaryPathForWsl('D:/Tools/brave.exe')).toBe(
      '/mnt/d/Tools/brave.exe'
    )
  })

  it('leaves linux paths alone inside WSL', () => {
    setPlatform('linux')
    vi.stubEnv('WSL_DISTRO_NAME', 'Ubuntu')
    expect(normalizeBinaryPathForWsl('/usr/bin/google-chrome')).toBe(
      '/usr/bin/google-chrome'
    )
  })
})
