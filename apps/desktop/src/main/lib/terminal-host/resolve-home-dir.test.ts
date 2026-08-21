import { describe, expect, test } from "bun:test";
import { resolveTerminalHostHomeDir } from "./resolve-home-dir";

describe("resolveTerminalHostHomeDir", () => {
	test("uses an explicit app home for isolated profiles", () => {
		expect(
			resolveTerminalHostHomeDir(" /tmp/agent-workbench-smoke ", "/home/test"),
		).toBe("/tmp/agent-workbench-smoke");
	});

	test("falls back to the branded default home", () => {
		expect(resolveTerminalHostHomeDir(" ", "/home/test")).toBe(
			"/home/test/.agent-workbench",
		);
	});
});
