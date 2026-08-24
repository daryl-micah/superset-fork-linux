import { describe, expect, test } from "bun:test";
import { shouldRegisterProtocolClient } from "./protocol-registration";

describe("shouldRegisterProtocolClient", () => {
	test("registers installed Linux packages", () => {
		expect(
			shouldRegisterProtocolClient({ platform: "linux", appImagePath: "" }),
		).toBe(true);
	});

	test("leaves portable AppImage integration to the launcher", () => {
		expect(
			shouldRegisterProtocolClient({
				platform: "linux",
				appImagePath: "/tmp/Agent-Workbench.AppImage",
			}),
		).toBe(false);
	});

	test("keeps registration enabled on other platforms", () => {
		expect(
			shouldRegisterProtocolClient({
				platform: "darwin",
				appImagePath: "/tmp/Agent-Workbench.AppImage",
			}),
		).toBe(true);
	});
});
