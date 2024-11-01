// @ts-check

import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
// import eslintConfigPrettier from "eslint-config-prettier"

export default tseslint.config({
    languageOptions: {
        parserOptions: {
            project: true,
            tsconfigRootDir: import.meta.dirname
        }
    },
    files: ["**/*.ts"],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
    rules: {
        "no-console": "error",
        "no-useless-catch": 0,
        quotes: ["error", "double", { allowTemplateLiterals: true }],
        "@typescript-eslint/no-explicit-any": "off"
    }
})

