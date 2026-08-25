import { afterEach, describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { stageLinuxArtifacts } from "./stage-linux-artifacts.ts";

const directories: string[] = [];

async function fixture(): Promise<string> {
	const directory = await mkdtemp(join(tmpdir(), "linux-release-"));
	directories.push(directory);
	await Promise.all([
		writeFile(
			join(directory, "agent-workbench-1.24.1-x86_64.AppImage"),
			"appimage",
		),
		writeFile(join(directory, "agent-workbench-1.24.1-amd64.deb"), "deb"),
		writeFile(
			join(directory, "latest-linux.yml"),
			[
				"version: 1.24.1",
				"files:",
				"  - url: agent-workbench-1.24.1-x86_64.AppImage",
				"  - url: agent-workbench-1.24.1-amd64.deb",
				"path: agent-workbench-1.24.1-x86_64.AppImage",
			].join("\n"),
		),
	]);
	return directory;
}

afterEach(async () => {
	await Promise.all(
		directories
			.splice(0)
			.map((directory) => rm(directory, { recursive: true })),
	);
});

describe("stageLinuxArtifacts", () => {
	test("creates stable aliases and validates the updater manifest", async () => {
		const directory = await fixture();

		await stageLinuxArtifacts(directory);

		expect(
			await readFile(join(directory, "Agent-Workbench-x64.AppImage"), "utf8"),
		).toBe("appimage");
		expect(
			await readFile(join(directory, "Agent-Workbench-amd64.deb"), "utf8"),
		).toBe("deb");
	});

	test("rejects a manifest that points at a missing artifact", async () => {
		const directory = await fixture();
		await writeFile(
			join(directory, "latest-linux.yml"),
			"path: agent-workbench-1.24.2-x86_64.AppImage\n",
		);

		await expect(stageLinuxArtifacts(directory)).rejects.toThrow(
			"references missing artifact",
		);
	});

	test("creates canary aliases and both updater manifest names", async () => {
		const directory = await fixture();

		await stageLinuxArtifacts(directory, { channel: "canary" });

		expect(
			await readFile(
				join(directory, "Agent-Workbench-Canary-x64.AppImage"),
				"utf8",
			),
		).toBe("appimage");
		expect(
			await readFile(join(directory, "canary-linux.yml"), "utf8"),
		).toContain("version: 1.24.1");
	});
});
