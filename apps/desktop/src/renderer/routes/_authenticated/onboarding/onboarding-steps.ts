export const ONBOARDING_STEPS = [
	{
		path: "/onboarding",
		match: (path: string) => path === "/onboarding",
		title: "Setup Superset",
		subtitle: "Connect your agents and tools to get started.",
	},
	{
		path: "/onboarding/project",
		match: (path: string) => path === "/onboarding/project",
		title: "Create or add a project",
		subtitle: "Start from scratch, open a folder, or clone a repo.",
	},
] as const;
