// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import noTautologicalExpect from "./eslint-rules/no-tautological-expect.js";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "docs/.astro/**",
      "eslint-rules/__tests__/**",
      "storybook-static/**",
      ".claude/worktrees/**",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    ignores: ["src/components/ui/*.tsx", "website/src/components/ui/*.tsx"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn"],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
        },
      ],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "radix-ui",
                "radix-ui/*",
                "@radix-ui/*",
                "@base-ui/react",
                "@base-ui/react/*",
              ],
              message:
                "Import from '@/components/ui/*' instead. Primitive libraries (radix-ui, @base-ui/react) must only be referenced inside src/components/ui/ so the primitive backend can be swapped in one place.",
            },
          ],
        },
      ],
    },
  },
  storybook.configs["flat/recommended"],
  {
    files: ["src/**/*.spec.{ts,tsx}"],
    plugins: {
      "local-rules": {
        rules: {
          "no-tautological-expect": noTautologicalExpect,
        },
      },
    },
    rules: {
      "local-rules/no-tautological-expect": "error",
    },
  },
);
