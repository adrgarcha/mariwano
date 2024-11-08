import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
   baseDirectory: __dirname,
   recommendedConfig: js.configs.recommended,
   allConfig: js.configs.all,
});

export default [
   ...compat.extends('eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:eslint-plugin-prettier/recommended'),
   {
      ignores: ['web/**/*'],
   },
   {
      plugins: {
         '@typescript-eslint': typescriptEslint,
         'eslint-plugin-prettier': eslintPluginPrettierRecommended,
      },

      languageOptions: {
         globals: {
            ...globals.node,
         },

         parser: tsParser,
         ecmaVersion: 2022,
         sourceType: 'module',
      },

      rules: {
         '@typescript-eslint/no-explicit-any': 'warn',
         '@typescript-eslint/explicit-function-return-type': 'off',

         '@typescript-eslint/no-unused-vars': [
            'warn',
            {
               argsIgnorePattern: '^_',
            },
         ],
      },
   },
];
