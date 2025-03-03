import globals from "globals";
import ts from "typescript-eslint";
import js from "@eslint/js";
import turboPlugin from "eslint-plugin-turbo";
import onlyWarn from "eslint-plugin-only-warn";
import stylistic from "@stylistic/eslint-plugin";
import stylisticTs from "@stylistic/eslint-plugin-ts";
import jestPlugin from 'eslint-plugin-jest'

export const config = ts.config(
  {
    plugins: {
      "@typescript-eslint": ts.plugin,
      turbo: turboPlugin,
      onlyWarn: onlyWarn,
      "@stylistic": stylistic,
      "@stylistic/ts": stylisticTs,
      jest: jestPlugin,
    },
  },
  {
    ignores: [
      ".github/**",
      ".next/**",
      ".vscode/**",
      "**/node_modules/**",
      "**/dist/**",
      "**/fixtures/**",
      "**/coverage/**",
      "**/__snapshots__/**",
      "**/generated/**",
      "**/build/**",
      "*.d.ts",
      "eslint.config.mjs",
      "jest.config.ts",
      "jest.unit.config.ts",
      "jest.integration.config.ts"
    ]
  },
  js.configs.recommended,
  ...ts.configs.recommendedTypeChecked,
  stylistic.configs["recommended-flat"],
  {
    ...jestPlugin.configs['flat/recommended'],
    files: ['*.spec.ts', '__tests__/**/*.ts'],
  },
  {
    files: ['*.spec.ts', '__tests__/**/*.ts'],
    rules: {
        '@typescript-eslint/unbound-method': 'off',
        'jest/unbound-method': 'error',
    }
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@stylistic/quotes": ["error", "single"],
      "@stylistic/semi": ["error", "never"],
      "@stylistic/semi": ["error", "never"],
      "@stylistic/no-multiple-empty-lines": ["error", { max: 2 }],
      "@stylistic/arrow-parens": ["warn", "as-needed"],
      "@typescript-eslint/no-unused-vars": ["off"],
      "array-element-newline": ["error", {
        "ArrayExpression": "always",
        "ArrayPattern": { "minItems": 3 },
      }],
      "array-bracket-newline": ["error", { "minItems": 2 }],
    }
  },
);

