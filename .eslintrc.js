/* eslint sort-keys: "error" */
module.exports = {
  env: {
    es2022: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:etc/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json", "./tsconfig.eslint.json"],
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "class-method-newlines", "etc", "import"],
  root: true,
  rules: {
    "@typescript-eslint/consistent-type-assertions": [
      "error",
      {
        assertionStyle: "as",
        objectLiteralTypeAssertions: "never",
      },
    ],
    "@typescript-eslint/dot-notation": "error",
    "@typescript-eslint/explicit-member-accessibility": [
      "error",
      {
        accessibility: "explicit",
        overrides: {
          constructors: "off",
        },
      },
    ],
    "@typescript-eslint/member-ordering": [
      "error",
      {
        default: ["signature", "static-field", "field", "constructor", "static-method", "method"],
      },
    ],
    "@typescript-eslint/naming-convention": [
      "error",
      {
        format: ["strictCamelCase"],
        leadingUnderscore: "allow",
        modifiers: ["unused"],
        selector: "parameter",
        trailingUnderscore: "forbid",
      },
      {
        format: ["UPPER_CASE"],
        leadingUnderscore: "forbid",
        selector: "enumMember",
        trailingUnderscore: "forbid",
      },
      {
        format: ["PascalCase"],
        selector: "typeLike",
      },
      {
        format: ["StrictPascalCase", "UPPER_CASE"],
        selector: "typeParameter",
      },
    ],
    "@typescript-eslint/no-confusing-void-expression": [
      "error",
      {
        ignoreArrowShorthand: true,
      },
    ],
    "@typescript-eslint/no-dynamic-delete": "error",
    "@typescript-eslint/no-empty-function": [
      "error",
      {
        allow: ["arrowFunctions"],
      },
    ],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-invalid-this": "error",
    "@typescript-eslint/no-invalid-void-type": "error",
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: false,
      },
    ],
    // This rule is "warn" in the recommended set
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/no-redeclare": "error",
    "@typescript-eslint/no-shadow": [
      "error",
      {
        hoist: "functions",
      },
    ],
    "@typescript-eslint/no-throw-literal": "error",
    "@typescript-eslint/no-unused-expressions": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        args: "none",
        ignoreRestSiblings: true,
      },
    ],
    "@typescript-eslint/no-use-before-define": [
      "error",
      {
        functions: false,
      },
    ],
    "@typescript-eslint/prefer-readonly": "error",
    "@typescript-eslint/prefer-regexp-exec": "error",
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/restrict-template-expressions": [
      "error",
      {
        allowBoolean: true,
        allowNumber: true,
      },
    ],
    "@typescript-eslint/unbound-method": [
      "error",
      {
        ignoreStatic: true,
      },
    ],
    "@typescript-eslint/unified-signatures": "error",
    "class-method-newlines/class-method-newlines": "error",
    // Explanation: https://github.com/typescript-eslint/typescript-eslint/issues/3066#issuecomment-780733456
    "constructor-super": "off",
    "curly": "error",
    "eqeqeq": ["error", "smart"],
    // Explanation: https://methodpoet.com/commented-out-code/
    "etc/no-commented-out-code": "error",
    // This rule is "warn" in the recommended set
    "etc/no-deprecated": "error",
    "guard-for-in": "error",
    "import/no-deprecated": "error",
    "import/no-duplicates": "error",
    "import/no-extraneous-dependencies": "error",
    "import/no-internal-modules": ["error"],
    "import/order": [
      "error",
      {
        "alphabetize": {
          caseInsensitive: true,
          order: "asc",
        },
        "groups": [["builtin", "external"], "parent", "sibling"],
        "newlines-between": "always",
      },
    ],
    "no-bitwise": "error",
    "no-caller": "error",
    "no-constant-condition": ["error", { checkLoops: false }],
    "no-duplicate-imports": "error",
    "no-eval": "error",
    "no-extra-bind": "error",
    // @typescript-eslint/no-invalid-this requires this to be off
    "no-invalid-this": "off",
    "no-new-func": "error",
    "no-new-wrappers": "error",
    "no-return-await": "error",
    "no-sequences": "error",
    "no-template-curly-in-string": "error",
    "no-undef-init": "error",
    "no-underscore-dangle": "off",
    "no-var": "error",
    "no-warning-comments": ["error", { location: "anywhere" }],
    "padding-line-between-statements": [
      "error",
      {
        blankLine: "always",
        next: "function",
        prev: "*",
      },
      {
        blankLine: "always",
        next: "*",
        prev: "function",
      },
    ],
    "prefer-const": "error",
    "prefer-spread": "error",
    "radix": "error",
    "sort-imports": [
      "error",
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
      },
    ],
    "spaced-comment": [
      "error",
      "always",
      {
        markers: ["/"],
      },
    ],
  },
};
