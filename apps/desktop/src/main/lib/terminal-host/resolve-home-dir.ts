import { homedir } from "node:os";
import { join } from "node:path";
import { SUPERSET_DIR_NAME } from "shared/constants";

export function resolveTerminalHostHomeDir(
	explicitHome = process.env.SUPERSET_HOME_DIR,
	userHome = homedir(),
): string {
	return explicitHome?.trim() || join(userHome, SUPERSET_DIR_NAME);
}
