# Development

Run the dev server without env validation or auth:

```bash
SKIP_ENV_VALIDATION=1 bun run dev
```

This skips environment variable validation and the sign-in screen. Desktop chat also falls back to local-only session bootstrap in this mode, so you can test chat/streaming without the cloud API as long as you have local model credentials configured.

# Release

When building for release, make sure `node-pty` is built for the correct architecture with `bun run install:deps`, then run `bun run release`.

# Linux (.deb and AppImage) local build

Agent Workbench currently targets Ubuntu/Debian x86_64. Install the native build
prerequisites first:

```bash
sudo apt-get update
sudo apt-get install -y pkg-config libx11-dev libxkbfile-dev
```

From `apps/desktop`:

```bash
bun run clean:dev
bun run generate:icons
bun run compile:app
bun run package -- --publish never
```

Release builds default to local mode: no account is required and the embedded
mock organization owns local projects and workspaces. Set
`AGENT_WORKBENCH_LOCAL_MODE=0` at compile time only when intentionally building
an upstream-cloud-compatible variant.

Expected outputs in `apps/desktop/release/`:

- `*.deb`
- `*.AppImage`
- `*-linux.yml` (Linux auto-update manifest)

# Linux auto-update verification (local)

From `apps/desktop` after packaging:

```bash
ls -la release/*.AppImage
ls -la release/*.deb
ls -la release/*-linux.yml
```

If all three files exist, packaging produced the native Debian package, portable
AppImage, and updater metadata that `electron-updater` expects.

The native package is the primary Ubuntu/Debian artifact because it integrates
with the system package database and avoids relying on an AppImage mount for the
Chromium sandbox. Never make `--no-sandbox` the default Linux launch behavior.

The AppImage uses electron-builder's static runtime and does not require FUSE 2.
That runtime probes user namespace support and applies its sandbox fallback only
when the host cannot provide Chromium namespaces; never add a global
`--no-sandbox` switch to the application.

To run the same packaged renderer readiness check used by CI:

```bash
xvfb-run -a ./release/*.AppImage --smoke-test
```
