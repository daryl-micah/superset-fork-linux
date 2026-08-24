import { describe, expect, test } from "bun:test";
import { ONBOARDING_STEPS } from "./onboarding-steps";

describe("onboarding steps", () => {
	test("contains no macOS-only permissions gate", () => {
		expect(ONBOARDING_STEPS.map((step) => step.path)).toEqual([
			"/onboarding",
			"/onboarding/project",
		]);
		expect(
			ONBOARDING_STEPS.some((step) => step.path.includes("permissions")),
		).toBe(false);
	});
});
