/**
 * Electron Builder Configuration
 * @see https://www.electron.build/configuration/configuration
 */

import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";
import type { Configuration } from "electron-builder";
import pkg from "./package.json";
import {
	packagedAsarUnpackGlobs,
	packagedNodeModuleCopies,
} from "./runtime-dependencies";

const currentYear = new Date().getFullYear();
const author = pkg.author?.name ?? pkg.author;
const productName = pkg.productName;
const macIconPath = join(pkg.resources, "build/icons/icon.icns");
const linuxIconPath = join(pkg.resources, "build/icons");
const winIconPath = join(pkg.resources, "build/icons/icon.ico");
const dmgBackgroundPath = join(
	pkg.resources,
	"build/installer/background.tiff",
);

export const CHROME_SANDBOX_MODE = 0o4755;
const execFileAsync = promisify(execFile);

export async function hardenLinuxSandbox(
	appOutDir: string,
	platform: string = process.platform,
): Promise<void> {
	if (platform !== "linux") return;

	// Chromium refuses to start if its SUID sandbox helper is present without
	// the root-executable mode expected by packaged Linux applications. Package
	// formats normalize ownership to root; preserve the required mode here.
	// Bun currently masks the setuid bit in fs.chmod(), so use the platform
	// utility that electron-builder's Linux toolchain already requires.
	await execFileAsync("chmod", [
		CHROME_SANDBOX_MODE.toString(8),
		join(appOutDir, "chrome-sandbox"),
	]);
}

const config: Configuration = {
	appId: "dev.agentworkbench.desktop",
	productName,
	copyright: `Copyright © ${currentYear} — ${author}`,
	electronVersion: pkg.devDependencies.electron.replace(/^\^/, ""),
	extraMetadata: {
		// Keep the workspace package name for monorepo tooling, but give the
		// packaged application and updater cache a downstream-specific name.
		name: "agent-workbench",
	},

	// Generate update manifests for all channels (latest.yml, canary.yml, etc.)
	// This enables proper channel-based auto-updates following electron-builder conventions
	generateUpdatesFilesForAllChannels: true,

	// Generate latest-mac.yml for auto-update (workflow handles actual upload)
	publish: {
		provider: "github",
		owner: "daryl-micah",
		repo: "superset-fork-linux",
	},

	// Directories
	directories: {
		output: "release",
		buildResources: join(pkg.resources, "build"),
	},
	afterPack: ({ appOutDir, electronPlatformName }) =>
		hardenLinuxSandbox(appOutDir, electronPlatformName),

	// ASAR configuration for native modules and external resources
	asar: true,
	asarUnpack: [
		...packagedAsarUnpackGlobs,
		// Sound files must be unpacked so external audio players (afplay, paplay, etc.) can access them
		"**/resources/sounds/**/*",
		// Tray icon must be unpacked so Electron Tray can load it
		"**/resources/tray/**/*",
	],

	// Extra resources placed outside asar archive (accessible via process.resourcesPath)
	extraResources: [
		{
			from: "../../LICENSE.md",
			to: "LICENSE.md",
		},
		{
			from: "../../MODIFICATIONS.md",
			to: "MODIFICATIONS.md",
		},
		// Database migrations - must be outside asar for drizzle-orm to read
		{
			from: "dist/resources/migrations",
			to: "resources/migrations",
			filter: ["**/*"],
		},
		{
			from: "dist/resources/host-migrations",
			to: "resources/host-migrations",
			filter: ["**/*"],
		},
		{
			from: "dist/resources/chat-migrations",
			to: "resources/chat-migrations",
			filter: ["**/*"],
		},
		{
			from: "dist/resources/bin",
			to: "resources/bin",
			filter: ["**/*"],
		},
	],

	files: [
		"dist/**/*",
		"package.json",
		{
			from: pkg.resources,
			to: "resources",
			filter: ["**/*"],
		},
		// Runtime modules that stay external to the main bundle.
		// bun creates symlinks for direct deps in workspace node_modules.
		// The copy:native-modules script replaces symlinks with real files
		// before building (required for Bun 1.3+ isolated installs).
		...packagedNodeModuleCopies,
		"!**/.DS_Store",
	],

	// Rebuild native modules for Electron's Node.js version
	npmRebuild: true,

	// macOS DMG installer
	dmg: {
		...(existsSync(dmgBackgroundPath) ? { background: dmgBackgroundPath } : {}),
		// Explicit size — dmgbuild's auto-calc under-allocates and silently truncates
		// the last large file above ~1.7GB of contents. `shrink: true` (default) keeps
		// the final artifact compact.
		size: "4g",
	},

	// macOS
	mac: {
		...(existsSync(macIconPath) ? { icon: macIconPath } : {}),
		category: "public.app-category.utilities",
		target: "default",
		hardenedRuntime: true,
		gatekeeperAssess: false,
		notarize: true,
		entitlements: join(pkg.resources, "build/entitlements.mac.plist"),
		entitlementsInherit: join(
			pkg.resources,
			"build/entitlements.mac.inherit.plist",
		),
		extendInfo: {
			CFBundleName: productName,
			CFBundleDisplayName: productName,
			// Required for macOS microphone permission prompt
			NSMicrophoneUsageDescription:
				"Agent Workbench needs microphone access so voice-enabled tools like Codex transcription can capture audio input.",
			// Required for macOS local network permission prompt
			NSLocalNetworkUsageDescription:
				"Agent Workbench needs access to your local network to discover and connect to development servers running on your network.",
			// Bonjour service types to browse for (triggers the permission prompt)
			NSBonjourServices: ["_http._tcp", "_https._tcp"],
			// Required for Apple Events / Automation permission prompt
			NSAppleEventsUsageDescription:
				"Agent Workbench needs to interact with other applications to run terminal commands and development tools.",
		},
	},

	// Deep linking protocol
	protocols: {
		name: productName,
		schemes: ["agent-workbench"],
	},

	// Linux
	linux: {
		...(existsSync(linuxIconPath) ? { icon: linuxIconPath } : {}),
		category: "Utility",
		executableName: "agent-workbench",
		maintainer:
			"Agent Workbench Contributors <daryl-micah@users.noreply.github.com>",
		synopsis: pkg.description,
		target: ["deb", "AppImage"],
		artifactName: `agent-workbench-\${version}-\${arch}.\${ext}`,
	},
	deb: {
		packageCategory: "utils",
	},

	// Windows
	win: {
		...(existsSync(winIconPath) ? { icon: winIconPath } : {}),
		target: [
			{
				target: "nsis",
				arch: ["x64"],
			},
		],
		artifactName: `${productName}-${pkg.version}-\${arch}.\${ext}`,
	},

	// NSIS installer (Windows)
	nsis: {
		oneClick: false,
		allowToChangeInstallationDirectory: true,
	},
};

export default config;
