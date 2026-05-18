import tailwind from 'eslint-plugin-tailwindcss';
import astroPlugin from 'eslint-plugin-astro';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import astroParser from 'astro-eslint-parser';
import tsParser from '@typescript-eslint/parser';

const tailwindSettings = {
  tailwindcss: {
    callees: ['class:list'],
    cssFiles: ['src/styles/global.css'],
  },
};

export default [
  // Astro files
  ...astroPlugin.configs['flat/recommended'],
  ...tailwind.configs['flat/recommended'],
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroParser,
      parserOptions: { parser: tsParser },
    },
    rules: {
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
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...tsPlugin.configs['strict-type-checked'].rules,
      'tailwindcss/enforces-shorthand': 'warn',
      'tailwindcss/no-unnecessary-arbitrary-value': 'warn',
      'tailwindcss/classnames-order': 'off',
    },
    settings: tailwindSettings,
  },
];
