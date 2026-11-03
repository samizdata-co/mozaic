import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defaultClientConditions, defaultServerConditions } from 'vite';
import { defineConfig } from 'vitest/config';

// `mozaic-dev` makes workspace imports of `@samizdata/mozaic` resolve to its source
// (packages/mozaic/src/lib) instead of the built dist, so edits hot-reload.
const conditions = ['mozaic-dev'];

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
			},
			adapter: adapter(),
			prerender: {
				// Endpoints not linked from any page.
				entries: ['*', '/embed/manifest.json', '/embed.js', '/llms.txt']
			}
		})
	],
	test: {
		include: ['src/**/*.spec.ts'],
		environment: 'node'
	},
	resolve: { conditions: [...conditions, ...defaultClientConditions] },
	ssr: { resolve: { conditions: [...conditions, ...defaultServerConditions] } }
});
