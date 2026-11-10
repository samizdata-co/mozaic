import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** This package's root: the CLI ships inside `@samizdata/mozaic`, next to the recipe sources. */
const PACKAGE_ROOT = fileURLToPath(new URL('../../', import.meta.url));

/**
 * Recipe names: the `.svelte` files in the package's `src/lib/recipes/`.
 * @param {string} [root] package root (default: this package)
 * @returns {string[]}
 */
export function recipeNames(root = PACKAGE_ROOT) {
	return readdirSync(join(root, 'src', 'lib', 'recipes'))
		.filter((file) => file.endsWith('.svelte'))
		.map((file) => file.slice(0, -'.svelte'.length))
		.sort();
}

/**
 * Rewrite a recipe's internal imports (`../core/index.js`) to package imports (`@samizdata/mozaic/core`).
 * @param {string} source
 */
export function rewriteImports(source) {
	return source.replace(/from '\.\.\/([a-z]+)\/index\.js'/g, "from '@samizdata/mozaic/$1'");
}

/**
 * Copy a recipe's source into the project so it can be edited freely.
 * @param {{ name: string, to: string, cwd: string, force?: boolean, mozaicDir?: string }} options
 * @returns {Promise<string>} the written file
 */
export async function eject({ name, to, cwd, force = false, mozaicDir = PACKAGE_ROOT }) {
	const recipes = recipeNames(mozaicDir);
	if (!recipes.includes(name)) throw new Error(`Unknown recipe "${name}". Recipes: ${recipes.join(', ')}.`);
	const source = await readFile(join(mozaicDir, 'src', 'lib', 'recipes', `${name}.svelte`), 'utf8');
	const target = resolve(cwd, to, `${name}.svelte`);
	const exists = await access(target).then(
		() => true,
		() => false
	);
	if (exists && !force) throw new Error(`${target} already exists. Use --force to overwrite it.`);
	await mkdir(dirname(target), { recursive: true });
	await writeFile(target, rewriteImports(source));
	return target;
}
