import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';

export const RECIPES = [
	'BarChart',
	'ColumnChart',
	'LineChart',
	'ScatterChart',
	'ArrowChart',
	'BarDotChart',
	'StackedBarChart',
	'MosaicChart',
	'PercentileChart'
];

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
export async function eject({ name, to, cwd, force = false, mozaicDir }) {
	if (!RECIPES.includes(name)) throw new Error(`Unknown recipe "${name}". Recipes: ${RECIPES.join(', ')}.`);
	const root = mozaicDir ?? dirname(createRequire(join(cwd, 'package.json')).resolve('@samizdata/mozaic/package.json'));
	const source = await readFile(join(root, 'src', 'lib', 'recipes', `${name}.svelte`), 'utf8');
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
