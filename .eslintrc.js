module.exports = {
  // ...
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'node', 'prettier', "eslint-plugin-tsdoc"],
  overrides: [
    {
      files: ['*.ts', '*.tsx', 'examples/*.js'], // Your TypeScript files extension

      // As mentioned in the comments, you should extend TypeScript plugins here,
      // instead of extending them outside the `overrides`.
      // If you don't want to extend any rules, you don't need an `extends` attribute.
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      rules: {
        'prettier/prettier': 'warn',
        'node/no-missing-import': 'off',
        'node/no-empty-function': 'off',
        'node/no-unsupported-features/es-syntax': 'off',
        'node/no-missing-require': 'off',
        'node/shebang': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        quotes: ['warn', 'single', { avoidEscape: true }],
        'node/no-unpublished-import': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        "tsdoc/syntax": "warn"
      },
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'], // Specify it only for TypeScript files
      },
    },
  ],
}
