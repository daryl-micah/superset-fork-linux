import { describe, expect, test } from "bun:test";
import { isAgentWorkbenchLocalMode } from "./env.renderer";

describe("Agent Workbench local mode", () => {
	test("defaults to enabled", () => {
		expect(isAgentWorkbenchLocalMode(undefined)).toBe(true);
	});

	test("stays enabled for explicit truthy values", () => {
		expect(isAgentWorkbenchLocalMode("1")).toBe(true);
	});

	test("can be disabled for a cloud-compatible build", () => {
		expect(isAgentWorkbenchLocalMode("0")).toBe(false);
	});
});
