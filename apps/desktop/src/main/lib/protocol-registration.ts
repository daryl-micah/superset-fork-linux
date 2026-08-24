export function shouldRegisterProtocolClient(
	options: { platform?: NodeJS.Platform; appImagePath?: string } = {},
): boolean {
	const platform = options.platform ?? process.platform;
	const appImagePath = options.appImagePath ?? process.env.APPIMAGE;

	// A portable AppImage has no installed .desktop entry for xdg-settings to
	// target. Debian installs do, and AppImage launchers can provide their own
	// integration without the app emitting a misleading registration failure.
	return platform !== "linux" || !appImagePath;
}
