# wsl-support

> Detect WSL, GUI display availability, and normalize Windows binary paths for use inside WSL.

Small, zero-dependency helpers for Node.js CLIs that launch GUI programs (browsers, editors, desktop apps) and need to behave correctly under [Windows Subsystem for Linux](https://learn.microsoft.com/windows/wsl/).

## Install

```sh
npm install wsl-support
```

## Usage

```js
import {
  isWslEnv,
  hasGuiDisplay,
  normalizeBinaryPathForWsl
} from 'wsl-support'

// True only inside WSL , guards against false positives on
// native Windows where WSLENV may be set.
isWslEnv()

// True when an X11 or Wayland display is available (e.g. WSLg).
hasGuiDisplay()

// Converts Windows drive paths to their /mnt equivalent when
// running under WSL; strips surrounding quotes everywhere.
normalizeBinaryPathForWsl('C:\\Program Files\\Chrome\\chrome.exe')
// → '/mnt/c/Program Files/Chrome/chrome.exe' (inside WSL)
// → 'C:\\Program Files\\Chrome\\chrome.exe' (everywhere else)
```

## API

### `isWslEnv(): boolean`

Returns `true` when the current process runs inside WSL. Checks `WSL_DISTRO_NAME`, `WSL_INTEROP`, and `WSLENV`, falling back to sniffing the kernel release string (`/microsoft/i`) when the environment variables are unavailable. Always `false` on non-Linux platforms.

### `hasGuiDisplay(): boolean`

Returns `true` when `DISPLAY` or `WAYLAND_DISPLAY` is set , i.e. a GUI program can actually open a window (WSLg, X server, etc.).

### `normalizeBinaryPathForWsl(input: string): string`

Trims and unquotes the input. Inside WSL, converts Windows drive paths (`C:\...` or `C:/...`) to `/mnt/<drive>/...`. Outside WSL, returns the unquoted input unchanged.

## License

MIT (c) Cezar Augusto
