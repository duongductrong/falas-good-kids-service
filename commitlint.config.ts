import { UserConfig } from "@commitlint/types"

const config: UserConfig = {
  extends: ["@commitlint/config-conventional", "gitmoji"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "chore",
        "style",
        "refactor",
        "ci",
        "test",
        "revert",
        "perf",
        "build",
        "temp",
      ],
    ],
    "header-max-length": [0],
    "body-max-length": [0],
    "footer-max-length": [0],
  },
  "subject-case": [0],
}

export default config
