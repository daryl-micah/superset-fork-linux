# Linux support

Agent Workbench supports x86_64 Ubuntu 24.04 or newer and Debian 13. The native
`.deb` is the recommended installation because it integrates with the system
package database, desktop launcher, protocol handler, and AppArmor. The
AppImage is the portable, no-install alternative.

## Install

Download `Agent-Workbench-amd64.deb` from the latest release and install it with:

```bash
sudo apt install ./Agent-Workbench-amd64.deb
```

Alternatively, download `Agent-Workbench-x64.AppImage`, make it executable, and
run it directly:

```bash
chmod +x Agent-Workbench-x64.AppImage
./Agent-Workbench-x64.AppImage
```

The AppImage uses a static runtime, so neither `libfuse2` nor `libfuse2t64` is
required. Do not make `--no-sandbox` part of a launcher or shell alias; the
runtime detects the narrow hosts where a sandbox fallback is required.
System-wide desktop and `agent-workbench://` protocol registration are provided
by the recommended `.deb`; a portable AppImage remains self-contained unless an
AppImage integration tool installs its desktop entry.

## Supported workflows

The release acceptance checklist covers first launch, local onboarding, project
and worktree creation, terminal and agent startup, persisted state, desktop
launch, and updates. CI launches both package formats on Ubuntu 24.04 and Debian
13 and fails unless the renderer becomes ready.
Linux terminals preserve `DISPLAY`, `WAYLAND_DISPLAY`, and `XAUTHORITY` so
clipboard-aware agents can reach the active X11 or Wayland session.

Before publishing a draft release, verify on Ubuntu/Wayland and Debian/X11:

1. Install the `.deb`, then launch from the desktop menu.
2. Complete local onboarding without a cloud account or macOS permissions page.
3. Add or clone a project, create a worktree, and launch a terminal and agent.
4. Confirm text and image clipboard access and open a file in an external editor.
5. Close and reopen the app and confirm projects, worktrees, and terminal state persist.
6. Upgrade from the previous release and confirm the version changes without losing state.
7. Repeat the launch, workflow, persistence, and update checks with the AppImage.

## Diagnostics

Check the package and desktop session first:

```bash
cat /etc/os-release
echo "session=$XDG_SESSION_TYPE display=$DISPLAY wayland=$WAYLAND_DISPLAY"
agent-workbench --version
```

Runtime state and terminal-host logs are under `~/.agent-workbench/`, including
`daemon.log`. Electron logs are under the app's XDG configuration directory.
When an update fails, confirm that the latest GitHub release contains the
versioned `.deb`, versioned AppImage, and `latest-linux.yml`.

## Reporting a Linux issue

Include:

- distribution and version;
- desktop environment and `XDG_SESSION_TYPE`;
- `.deb` or AppImage and the application version;
- whether the app was launched from the desktop menu or a terminal;
- exact reproduction steps and error output;
- relevant Electron and `~/.agent-workbench/daemon.log` excerpts with secrets
  removed.

Generic Linux fixes should be proposed to `superset-sh/superset` first. Keep
Agent Workbench branding, local-mode defaults, package aliases, and update-feed
changes in this downstream repository.
