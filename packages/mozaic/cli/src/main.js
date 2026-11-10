import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseArgs } from './args.js';
import { exportEmbeds } from './export.js';
import { eject, recipeNames } from './eject.js';

const HELP = `mozaic — chart library tools

Usage:
  mozaic export [dir]        Export every embed in a built site (default dir: build)
      --out <dir>            Output folder (default: exports)
      --only <slugs>         Comma-separated chart slugs
      --formats <list>       svg,pdf,png (default: all)
      --web-width <px>       Width for web PNG/SVG (default: 640)
      --browser <path>       Chromium/Chrome executable (or set MOZAIC_BROWSER)

  mozaic eject <recipe>      Copy a recipe into your project to edit it
      --to <dir>             Destination (default: src/lib/recipes)
      --force                Overwrite an existing file

  Recipes: ${recipeNames().join(', ')}

  mozaic --version
  mozaic --help
`;

/**
 * @param {string[]} argv
 * @returns {Promise<number>} exit code
 */
export async function main(argv) {
	const { positionals, options } = parseArgs(argv);
	const [command, ...rest] = positionals;

	if (options.version) {
		const pkg = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
		console.log(pkg.version);
		return 0;
	}
	if (!command || options.help || command === 'help') {
		console.log(HELP);
		return command || options.help ? 0 : 1;
	}

	if (command === 'export') {
		const dir = resolve(rest[0] ?? 'build');
		const out = resolve(typeof options.out === 'string' ? options.out : 'exports');
		const formats = new Set(String(typeof options.formats === 'string' ? options.formats : 'svg,pdf,png').split(','));
		const only = typeof options.only === 'string' ? options.only.split(',') : undefined;
		const webWidth = Number(options['web-width'] ?? 640);
		const files = await exportEmbeds({
			dir,
			out,
			only,
			formats,
			webWidth,
			browser: typeof options.browser === 'string' ? options.browser : undefined,
			log: console.log
		});
		console.log(`Wrote ${files.length} files to ${out}`);
		return 0;
	}

	if (command === 'eject') {
		const name = rest[0];
		if (!name) throw new Error(`Name a recipe: ${recipeNames().join(', ')}.`);
		const file = await eject({
			name,
			to: typeof options.to === 'string' ? options.to : 'src/lib/recipes',
			cwd: process.cwd(),
			force: options.force === true
		});
		console.log(`Ejected ${name} to ${file}. Import it from there instead of '@samizdata/mozaic/recipes'.`);
		return 0;
	}

	console.error(`Unknown command "${command}".\n`);
	console.log(HELP);
	return 1;
}
