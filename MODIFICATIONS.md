# Agent Workbench modifications

Agent Workbench is a Linux-focused derivative of Superset. It is not affiliated
with or endorsed by Superset, Inc.

The initial downstream changes are intentionally narrow:

- a distinct application name, bundle identifier, protocol, data directory,
  executable, and update feed;
- Ubuntu/Debian packaging in addition to the upstream AppImage;
- account-free local mode by default, with telemetry disabled by default;
- Linux-first build verification and documentation.

Linux releases recommend the native `.deb` on Ubuntu and Debian, while keeping
the shared AppImage as the portable option. The AppImage uses the static runtime
to avoid FUSE 2, and CI launches both formats on Ubuntu 24.04 and Debian 13.

The original copyright and Elastic License 2.0 notices remain in place. Modified
copies must continue to include `LICENSE.md` and this notice. This project must
not be offered as a hosted or managed service that exposes a substantial set of
the licensed software's functionality, and license-key functionality must not be
removed, disabled, or circumvented.

Generic fixes should be proposed to
[`superset-sh/superset`](https://github.com/superset-sh/superset) first. The
downstream repository is
[`daryl-micah/superset-fork-linux`](https://github.com/daryl-micah/superset-fork-linux).

Downstream releases reuse the existing `desktop-v<version>` tags and
`.github/workflows/release-desktop.yml` pipeline, configured to publish the
Linux `.deb`, AppImage, and updater manifest from this repository.
