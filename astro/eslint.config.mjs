import tailwind from 'eslint-plugin-tailwindcss';
import astroPlugin from 'eslint-plugin-astro';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import * as astroParser from 'astro-eslint-parser';
import tsParser from '@typescript-eslint/parser';

const tailwindSettings = {
  tailwindcss: {
    callees: ['class:list'],
    cssConfigPath: 'src/styles/global.css',
  },
};

export default [
  // Astro files
  ...astroPlugin.configs['flat/recommended'],
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroParser,
      parserOptions: { parser: tsParser },
    },
    plugins: { tailwindcss: tailwind },
    rules: {
      ...tailwind.configs.recommended.rules,
      'tailwindcss/enforces-shorthand': 'warn',
      'tailwindcss/no-unnecessary-arbitrary-value': 'warn',
      'tailwindcss/enforces-negative-arbitrary-values': 'warn',
      'tailwindcss/no-contradicting-classname': 'error',
      'tailwindcss/no-custom-classname': 'off',
      'tailwindcss/classnames-order': 'off',
    },
    settings: tailwindSettings,
  },
  // TypeScript files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: { '@typescript-eslint': tsPlugin, tailwindcss: tailwind },
    rules: {
      ...tsPlugin.configs['strict-type-checked'].rules,
      ...tailwind.configs.recommended.rules,
      'tailwindcss/enforces-shorthand': 'warn',
      'tailwindcss/no-unnecessary-arbitrary-value': 'warn',
      'tailwindcss/classnames-order': 'off',
    },
    settings: tailwindSettings,
  },
];
