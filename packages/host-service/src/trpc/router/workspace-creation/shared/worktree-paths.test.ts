import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	defaultWorktreesRoot,
	isInsideProjectWorktreesRoot,
} from "./worktree-paths";

describe("defaultWorktreesRoot", () => {
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
		expect(defaultWorktreesRoot()).toBe("/tmp/agent-workbench-home/worktrees");
	});
});

describe("isInsideProjectWorktreesRoot", () => {
	const dirs: string[] = [];
	const tmp = (prefix: string) => {
		const d = mkdtempSync(join(tmpdir(), prefix));
		dirs.push(d);
		return d;
	};
	afterEach(() => {
		for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
	});

	test("accepts a worktree beneath <base>/<projectId>", () => {
		const base = tmp("wt-base-");
		mkdirSync(join(base, "proj", "feature"), { recursive: true });
		expect(
			isInsideProjectWorktreesRoot(join(base, "proj", "feature"), "proj", base),
		).toBe(true);
	});

	test("rejects the project root itself, siblings, and paths outside the base", () => {
		const base = tmp("wt-base-");
		mkdirSync(join(base, "proj"), { recursive: true });
		expect(isInsideProjectWorktreesRoot(join(base, "proj"), "proj", base)).toBe(
			false,
		);
		expect(
			isInsideProjectWorktreesRoot(join(base, "other", "x"), "proj", base),
		).toBe(false);
		expect(
			isInsideProjectWorktreesRoot(join(tmp("elsewhere-"), "x"), "proj", base),
		).toBe(false);
	});

	test("rejects a worktree under a project root that is a symlink out of the base", () => {
		const base = tmp("wt-base-");
		const outside = tmp("wt-outside-");
		mkdirSync(join(outside, "feature"), { recursive: true });
		symlinkSync(outside, join(base, "proj"));
		expect(
			isInsideProjectWorktreesRoot(join(base, "proj", "feature"), "proj", base),
		).toBe(false);
	});
});
