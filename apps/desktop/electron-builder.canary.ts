/**
 * Electron Builder Configuration - Canary Build
 *
 * Extends the base config with canary-specific overrides for internal testing.
 * Can be installed side-by-side with the stable release.
 *
 * @see https://www.electron.build/configuration/configuration
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Configuration } from "electron-builder";
import baseConfig from "./electron-builder";
import pkg from "./package.json";

const displayName = "Agent Workbench Canary";
// Linux installs to /opt/<productName>; keep it space-free like stable.
const productName =
	process.platform === "linux" ? "agent-workbench-canary" : displayName;
const canaryMacIconPath = join(pkg.resources, "build/icons/icon-canary.icns");
const canaryLinuxIconPath = join(pkg.resources, "build/icons/icon-canary.png");
const canaryWinIconPath = join(pkg.resources, "build/icons/icon-canary.ico");

const config: Configuration = {
	...baseConfig,
	appId: "dev.agentworkbench.desktop.canary",
	productName,

	publish: {
		provider: "github",
		owner: "daryl-micah",
		repo: "superset-fork-linux",
		releaseType: "prerelease",
	},

	mac: {
		...baseConfig.mac,
		...(existsSync(canaryMacIconPath) ? { icon: canaryMacIconPath } : {}),
		artifactName: `Agent-Workbench-Canary-\${version}-\${arch}.\${ext}`,
		extendInfo: {
			...baseConfig.mac?.extendInfo,
			CFBundleName: displayName,
			CFBundleDisplayName: displayName,
		},
	},

	linux: {
		...baseConfig.linux,
		...(existsSync(canaryLinuxIconPath) ? { icon: canaryLinuxIconPath } : {}),
		desktop: { entry: { Name: displayName } },
		synopsis: `${pkg.description} (Canary)`,
		artifactName: `agent-workbench-canary-\${version}-\${arch}.\${ext}`,
	},

	win: {
		...baseConfig.win,
		...(existsSync(canaryWinIconPath) ? { icon: canaryWinIconPath } : {}),
		artifactName: `Agent-Workbench-Canary-\${version}-\${arch}.\${ext}`,
	},
};

export default config;
