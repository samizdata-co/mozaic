import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } }
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts'],
		languageOptions: { parserOptions: { parser: ts.parser, extraFileExtensions: ['.svelte'] } }
	},
	{
		rules: {
			// d3 and generic chart code legitimately uses `any` for scale inputs.
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			// Keyed each blocks are good practice but not required for static chart marks.
			'svelte/require-each-key': 'off',
			// Charts navigate with plain links in embeds; resolve() is not needed.
			'svelte/no-navigation-without-resolve': 'off'
		}
	},
	{
		ignores: ['**/node_modules', '**/dist', '**/build', '**/.svelte-kit', '**/test-results', '**/playwright-report']
	}
);
