import * as os from 'os'

/**
 * Whether the current process is running inside Windows Subsystem for Linux.
 *
 * Checks the WSL environment variables first and falls back to sniffing
 * the kernel release string for environments where they are unavailable.
 */
export function isWslEnv(): boolean {
  // Guard against false positives on native Windows where WSLENV may be set
  if (process.platform !== 'linux') return false

  const hasWslEnv = Boolean(
    String(process.env.WSL_DISTRO_NAME || '').trim() ||
      String(process.env.WSL_INTEROP || '').trim() ||
      String(process.env.WSLENV || '').trim()
  )
  if (hasWslEnv) return true

  // Fallback heuristic for Linux environments where env vars are unavailable
  return /microsoft/i.test(os.release())
}

/**
 * Whether a GUI display server (X11 or Wayland) is available, e.g. via WSLg.
 */
export function hasGuiDisplay(): boolean {
  const display = String(process.env.DISPLAY || '').trim()
  const waylandDisplay = String(process.env.WAYLAND_DISPLAY || '').trim()

  return display.length > 0 || waylandDisplay.length > 0
}

/**
 * Normalize a binary path for use inside WSL.
 *
 * Strips surrounding quotes and, when running under WSL, converts Windows
 * drive paths (`C:\...` or `C:/...`) to their `/mnt/<drive>/...` equivalent.
 * Outside WSL the (unquoted) input is returned unchanged.
 */
export function normalizeBinaryPathForWsl(input: string): string {
  let value = String(input || '').trim()

  if (!value) return value

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1)
  }

  if (!isWslEnv()) return value

  if (/^[a-zA-Z]:[\\/]/.test(value)) {
    const drive = value[0].toLowerCase()
    const rest = value.slice(2).replace(/\\/g, '/').replace(/^\/+/, '')
    return `/mnt/${drive}/${rest}`
  }

  return value
}
