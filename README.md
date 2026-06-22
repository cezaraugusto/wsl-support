[npm-version-image]: https://img.shields.io/npm/v/wsl-support.svg?color=0971fe
[npm-version-url]: https://www.npmjs.com/package/wsl-support
[npm-downloads-image]: https://img.shields.io/npm/dm/wsl-support.svg?color=2ecc40
[npm-downloads-url]: https://www.npmjs.com/package/wsl-support
[action-image]: https://github.com/cezaraugusto/wsl-support/actions/workflows/ci.yml/badge.svg?branch=main
[action-url]: https://github.com/cezaraugusto/wsl-support/actions
[provenance-image]: https://img.shields.io/badge/provenance-verified-0971fe?logo=npm&logoColor=white
[provenance-url]: https://www.npmjs.com/package/wsl-support

> Detect WSL, GUI display availability, and normalize Windows binary paths for use inside WSL.

# wsl-support [![Version][npm-version-image]][npm-version-url] [![Downloads][npm-downloads-image]][npm-downloads-url] [![workflow][action-image]][action-url] [![provenance][provenance-image]][provenance-url]

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

// True only inside WSL. Guards against false positives on
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

Returns `true` when `DISPLAY` or `WAYLAND_DISPLAY` is set, i.e. a GUI program can actually open a window (WSLg, X server, etc.).

### `normalizeBinaryPathForWsl(input: string): string`

Trims and unquotes the input. Inside WSL, converts Windows drive paths (`C:\...` or `C:/...`) to `/mnt/<drive>/...`. Outside WSL, returns the unquoted input unchanged.

## Related projects

* [pintor](https://github.com/cezaraugusto/pintor)
* [log-md](https://github.com/cezaraugusto/log-md)
* [mklicense](https://github.com/cezaraugusto/mklicense)
* [prefers-yarn](https://github.com/cezaraugusto/prefers-yarn)
* [go-git-it](https://github.com/cezaraugusto/go-git-it)
* [git-precision](https://github.com/cezaraugusto/git-precision)

## License

MIT (c) Cezar Augusto.
