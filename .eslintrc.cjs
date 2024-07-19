const baseConfig = require('eslint-config-yenz')

module.exports = {
  "parser": "@typescript-eslint/parser",
  "plugins": [
    ...baseConfig.plugins,
    "@typescript-eslint"
  ],
  "extends": [
    ...baseConfig.extends,
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  "parserOptions": {
    ...baseConfig.parserOptions,
    "project": "./tsconfig.json"
  },
  "rules": {
    ...baseConfig.rules,
    "@typescript-eslint/explicit-member-accessibility": "warn",
    "@typescript-eslint/no-misused-promises": 0,
    "@typescript-eslint/no-floating-promises": 0,
    "@typescript-eslint/no-redundant-type-constituents": "off",
    "no-console": 'off',
    "no-extra-boolean-cast": 0,
    "indent": ["warn", 2],
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "pathGroups": [
          {
            "pattern": "@aces/**",
            "group": "internal"
          }
        ],
        "pathGroupsExcludedImportTypes": [
          "builtin"
        ],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }
    ]
  },
  "settings": {

  },
  "overrides": [
    {
      files: ["**/*.test.*"],
      rules: {
        "no-magic-numbers": "off"
      }
    }
  ]
}
