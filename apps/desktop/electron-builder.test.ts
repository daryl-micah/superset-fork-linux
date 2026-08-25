import { describe, expect, test } from "bun:test";
import { mkdtemp, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import config, {
	CHROME_SANDBOX_MODE,
	getProductName,
	hardenLinuxSandbox,
} from "./electron-builder";
import pkg from "./package.json";

describe("Agent Workbench packaging", () => {
	test("uses an identity isolated from upstream Superset", () => {
		expect(config.appId).toBe("dev.agentworkbench.desktop");
		expect(getProductName("linux")).toBe("agent-workbench");
		expect(getProductName("darwin")).toBe("Agent Workbench");
		expect(pkg.desktopName).toBe("agent-workbench");
		expect(config.extraMetadata).toMatchObject({ name: "agent-workbench" });
		expect(config.protocols).toEqual({
			name: "Agent Workbench",
			schemes: ["agent-workbench"],
		});
		expect(config.publish).toMatchObject({
			provider: "github",
			owner: "daryl-micah",
			repo: "superset-fork-linux",
		});
	});

	test("builds native Debian and portable AppImage artifacts", () => {
		expect(config.toolsets).toEqual({ appimage: "1.0.3" });
		expect(config.linux).toMatchObject({
			executableName: "agent-workbench",
			syncDesktopName: true,
			desktop: { entry: { Name: "Agent Workbench" } },
			maintainer:
				"Agent Workbench Contributors <daryl-micah@users.noreply.github.com>",
			target: ["deb", "AppImage"],
			artifactName: `agent-workbench-\${version}-\${arch}.\${ext}`,
		});
		expect(config.deb).toMatchObject({
			packageCategory: "utils",
			appArmorProfile: expect.stringContaining("build/apparmor-profile"),
			depends: expect.arrayContaining(["libasound2"]),
		});
		expect(config.extraResources).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ to: "LICENSE.md" }),
				expect.objectContaining({ to: "MODIFICATIONS.md" }),
			]),
		);
	});

	test("preserves Chromium's sandbox in packaged Linux applications", async () => {
		const appOutDir = await mkdtemp(join(tmpdir(), "agent-workbench-pack-"));
		const sandboxPath = join(appOutDir, "chrome-sandbox");

		try {
			await writeFile(sandboxPath, "sandbox");
			await hardenLinuxSandbox(appOutDir, "linux");

			const sandboxStat = await stat(sandboxPath);
			expect(sandboxStat.mode & 0o7777).toBe(CHROME_SANDBOX_MODE);
		} finally {
			await rm(appOutDir, { recursive: true });
		}
	});
});
