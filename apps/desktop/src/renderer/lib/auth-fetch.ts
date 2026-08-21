const LOCAL_AUTH_ERROR = {
	code: "AGENT_WORKBENCH_LOCAL_MODE",
	message: "Cloud authentication is disabled in Agent Workbench local mode.",
};

type AuthFetch = (
	input: RequestInfo | URL,
	init?: RequestInit,
) => Promise<Response>;

function requestPath(input: RequestInfo | URL): string {
	const value = input instanceof Request ? input.url : input.toString();
	return new URL(value).pathname;
}

/**
 * Keep Better Auth's session store usable without contacting the cloud. Local
 * mode has no account, so the session endpoint resolves to an empty session and
 * every mutating/auth-only endpoint fails locally with an explicit response.
 */
export function createAuthFetch(
	localMode: boolean,
	fetchImpl: AuthFetch = globalThis.fetch,
): AuthFetch {
	return async (input, init) => {
		if (!localMode) return fetchImpl(input, init);

		if (requestPath(input).endsWith("/get-session")) {
			return Response.json(null);
		}

		return Response.json(LOCAL_AUTH_ERROR, { status: 503 });
	};
}
