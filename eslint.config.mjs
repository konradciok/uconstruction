import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  // Ignore generated files
  {
    ignores: [
      'src/generated/**/*',
      'node_modules/**/*',
      '.next/**/*',
      'dist/**/*',
      'build/**/*'
    ],
  },
  // Tighten rules: no explicit any, exhaustive deps, a11y
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  // Allow any in test files
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**/*'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    rules: {
      'react-hooks/exhaustive-deps': 'error',
      // Reinforce a11y checks commonly missed
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/aria-role': 'warn',
      'jsx-a11y/no-autofocus': ['warn', { ignoreNonDOM: true }],
    },
  },
];

export default eslintConfig;
