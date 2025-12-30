// @ts-check
import eslint from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
	globalIgnores(['./**/*', '!./src/**']),
	eslint.configs.recommended,
	tseslint.configs.all,
	{
		languageOptions: {
			parserOptions: {
				projectService: true
			}
		},
		rules: {
			'@typescript-eslint/class-methods-use-this': 'off',
			'@typescript-eslint/consistent-return': 'off',
			'@typescript-eslint/init-declarations': 'off',
			'@typescript-eslint/max-params': 'off',
			'@typescript-eslint/member-ordering': 'off',
			'@typescript-eslint/naming-convention': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/no-magic-numbers': 'off',
			'@typescript-eslint/no-redeclare': 'off',
			'@typescript-eslint/no-unsafe-type-assertion': 'off',
			'@typescript-eslint/parameter-properties': 'off',
			'@typescript-eslint/prefer-readonly-parameter-types': 'off',
			'@typescript-eslint/prefer-regexp-exec': 'off',
			'@typescript-eslint/restrict-template-expressions': 'off',

			'@typescript-eslint/explicit-function-return-type': [
				'error',
				{
					allowConciseArrowFunctionExpressionsStartingWithVoid: true,
					allowExpressions: true,
					allowIIFEs: true
				}
			],
			'@typescript-eslint/explicit-member-accessibility': [
				'error',
				{
					accessibility: 'no-public'
				}
			],
			'@typescript-eslint/no-misused-promises': [
				'error',
				{
					checksVoidReturn: { arguments: false }
				}
			],
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true
				}
			]
		}
	}
);
