# Agent Workbench modifications

Agent Workbench is a Linux-focused derivative of Superset. It is not affiliated
with or endorsed by Superset, Inc.

The initial downstream changes are intentionally narrow:

- a distinct application name, bundle identifier, protocol, data directory,
  executable, and update feed;
- Ubuntu/Debian packaging in addition to the upstream AppImage;
- account-free local mode by default, with telemetry disabled by default;
- Linux-first build verification and documentation.

The original copyright and Elastic License 2.0 notices remain in place. Modified
copies must continue to include `LICENSE.md` and this notice. This project must
not be offered as a hosted or managed service that exposes a substantial set of
the licensed software's functionality, and license-key functionality must not be
removed, disabled, or circumvented.

Generic fixes should be proposed to
[`superset-sh/superset`](https://github.com/superset-sh/superset) first. The
downstream repository is
[`daryl-micah/superset-fork-linux`](https://github.com/daryl-micah/superset-fork-linux).

Downstream releases use `agent-workbench-v<version>` tags and the dedicated
`.github/workflows/agent-workbench-linux.yml` workflow. Do not use the upstream
`desktop-v*` release automation for Agent Workbench artifacts.
