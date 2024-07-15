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
    "plugin:node/recommended"
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
    "comma-dangle": ["warn", "always-multiline"],
    "no-console": 1,
    "no-extra-boolean-cast": 0,
    "indent": ["warn", 2],
    "node/no-process-env": 1,
    "node/no-unsupported-features/es-syntax": [
      "error",
      { "ignores" : ["modules"] }
    ],
    "node/no-missing-import": 0,
    "node/no-unpublished-import": 0,
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
    "node": {
      "tryExtensions": [".js", ".json", ".node", ".ts"]
    }
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
