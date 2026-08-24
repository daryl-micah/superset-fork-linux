import { access, copyFile, readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";

const MANIFEST_ALIAS = "latest-linux.yml";

interface StageOptions {
	channel?: "stable" | "canary";
}

function requireSingle(files: string[], description: string): string {
	if (files.length !== 1) {
		throw new Error(
			`Expected exactly one ${description}, found ${files.length}: ${files.join(", ") || "none"}`,
		);
	}
	return files[0];
}

function manifestArtifactNames(manifest: string): string[] {
	const names = new Set<string>();
	for (const match of manifest.matchAll(
		/^\s*(?:url|path):\s*['"]?([^'"\s]+)['"]?\s*$/gm,
	)) {
		names.add(basename(match[1]));
	}
	return [...names];
}

export async function stageLinuxArtifacts(
	directory: string,
	options: StageOptions = {},
): Promise<void> {
	const isCanary = options.channel === "canary";
	const appImageAlias = isCanary
		? "Agent-Workbench-Canary-x64.AppImage"
		: "Agent-Workbench-x64.AppImage";
	const debAlias = isCanary
		? "Agent-Workbench-Canary-amd64.deb"
		: "Agent-Workbench-amd64.deb";
	const files = await readdir(directory);
	const appImage = requireSingle(
		files.filter(
			(file) =>
				file.startsWith("agent-workbench-") && file.endsWith(".AppImage"),
		),
		"versioned AppImage",
	);
	const deb = requireSingle(
		files.filter(
			(file) => file.startsWith("agent-workbench-") && file.endsWith(".deb"),
		),
		"versioned Debian package",
	);

	const manifests = files.filter((file) => file.endsWith("-linux.yml"));
	const preferredManifest = isCanary ? "canary-linux.yml" : MANIFEST_ALIAS;
	const existingPreferredManifest = manifests.find(
		(file) => file === preferredManifest,
	);
	const sourceManifest =
		existingPreferredManifest ??
		requireSingle(manifests, "Linux update manifest");
	if (sourceManifest !== MANIFEST_ALIAS) {
		await copyFile(
			join(directory, sourceManifest),
			join(directory, MANIFEST_ALIAS),
		);
	}
	if (isCanary && sourceManifest !== "canary-linux.yml") {
		await copyFile(
			join(directory, sourceManifest),
			join(directory, "canary-linux.yml"),
		);
	}
	const manifest = MANIFEST_ALIAS;

	const manifestBody = await readFile(join(directory, manifest), "utf8");
	const referencedArtifacts = manifestArtifactNames(manifestBody);
	if (referencedArtifacts.length === 0) {
		throw new Error(`${manifest} does not reference any update artifacts`);
	}
	for (const artifact of referencedArtifacts) {
		try {
			await access(join(directory, artifact));
		} catch {
			throw new Error(`${manifest} references missing artifact ${artifact}`);
		}
	}

	await Promise.all([
		copyFile(join(directory, appImage), join(directory, appImageAlias)),
		copyFile(join(directory, deb), join(directory, debAlias)),
	]);
}

if (import.meta.main) {
	const directory = process.argv[2];
	if (!directory) {
		throw new Error(
			"Usage: bun scripts/release/stage-linux-artifacts.ts <artifact-directory>",
		);
	}
	const channel = process.argv.includes("--canary") ? "canary" : "stable";
	await stageLinuxArtifacts(directory, { channel });
	console.log(
		`Created ${channel} Linux download aliases and verified ${MANIFEST_ALIAS}`,
	);
}
