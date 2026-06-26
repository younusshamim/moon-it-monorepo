import type { UserConfig } from "@commitlint/types";

// Conventional Commits, enforced by the commit-msg hook. See INFRASTRUCTURE.md §13.
const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
};

export default config;
