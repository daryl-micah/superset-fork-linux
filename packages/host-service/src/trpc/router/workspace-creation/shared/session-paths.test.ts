import { afterEach, describe, expect, test } from "bun:test";
import { defaultSessionsRoot, safeResolveSessionPath } from "./session-paths";

describe("session paths", () => {
	const originalHome = process.env.SUPERSET_HOME_DIR;

	afterEach(() => {
		if (originalHome === undefined) {
			delete process.env.SUPERSET_HOME_DIR;
		} else {
			process.env.SUPERSET_HOME_DIR = originalHome;
		}
	});

	test("uses the app-specific home directory when provided", () => {
		process.env.SUPERSET_HOME_DIR = "/tmp/agent-workbench-home";
		expect(defaultSessionsRoot()).toBe("/tmp/agent-workbench-home/sessions");
		expect(safeResolveSessionPath("review")).toBe(
			"/tmp/agent-workbench-home/sessions/review",
		);
	});

	test("rejects traversal outside the managed sessions directory", () => {
		process.env.SUPERSET_HOME_DIR = "/tmp/agent-workbench-home";
		expect(() => safeResolveSessionPath("../escape")).toThrow(
			"path traversal detected",
		);
	});
});
