import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Turn off unescaped entities error - we use proper HTML entities where needed
      "react/no-unescaped-entities": "off",
      // Allow any types in specific cases (maps, external libraries)
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow unused vars with _ prefix
      "@typescript-eslint/no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      // Turn img warnings into warnings not errors
      "@next/next/no-img-element": "warn",
    }
  }
];

export default eslintConfig;
