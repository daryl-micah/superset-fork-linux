import { describe, expect, mock, test } from "bun:test";
import { createAuthFetch } from "./auth-fetch";

describe("createAuthFetch", () => {
	test("passes requests through when local mode is disabled", async () => {
		const response = new Response("cloud");
		const fetchImpl = mock(async () => response);
		const authFetch = createAuthFetch(false, fetchImpl);

		expect(
			await authFetch("https://api.example.test/api/auth/get-session"),
		).toBe(response);
		expect(fetchImpl).toHaveBeenCalledTimes(1);
	});

	test("returns an empty session locally without making a request", async () => {
		const fetchImpl = mock(async () => new Response("unexpected"));
		const authFetch = createAuthFetch(true, fetchImpl);

		const response = await authFetch(
			new Request("https://api.example.test/api/auth/get-session"),
		);

		expect(response.status).toBe(200);
		expect(await response.json()).toBeNull();
		expect(fetchImpl).not.toHaveBeenCalled();
	});

	test("rejects cloud auth actions locally without making a request", async () => {
		const fetchImpl = mock(async () => new Response("unexpected"));
		const authFetch = createAuthFetch(true, fetchImpl);

		const response = await authFetch("https://api.example.test/api/auth/token");

		expect(response.status).toBe(503);
		expect(await response.json()).toEqual({
			code: "AGENT_WORKBENCH_LOCAL_MODE",
			message:
				"Cloud authentication is disabled in Agent Workbench local mode.",
		});
		expect(fetchImpl).not.toHaveBeenCalled();
	});
});
