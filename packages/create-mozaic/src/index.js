import { spawn } from 'node:child_process';
import { cp, readdir, readFile, rename, stat, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const LOCALES = ['en', 'ro', 'ru'];
const TEMPLATE = fileURLToPath(new URL('../template', import.meta.url));
const TEXT = /\.(svelte|ts|js|json|md|yml|yaml|toml|R|py|csv|html|txt)$|^(justfile|_gitignore)$/;

/**
 * @typedef {{ dir: string, name?: string, title?: string, locales?: string[], mozaic?: string, cli?: string }} ScaffoldOptions
 */

/** @param {string} value */
export function slugify(value) {
	return value
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

/**
 * A dependency spec for mozaic packages: a version range, or `link:` for a local path.
 * @param {string} value
 */
function spec(value) {
	return /^[.~/]/.test(value) ? `link:${resolve(value)}` : value;
}

/**
 * @param {string} dir
 * @returns {AsyncGenerator<string>}
 */
async function* walk(dir) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) yield* walk(path);
		else yield path;
	}
}

/**
 * Copy the template into `dir` and fill in its placeholders.
 * @param {ScaffoldOptions} options
 * @returns {Promise<{ dir: string, name: string }>}
 */
export async function scaffold(options) {
	const dir = resolve(options.dir);
	const name = slugify(options.name ?? basename(dir));
	if (!name) throw new Error('Could not derive a project name; pass --name.');
	const locales = options.locales ?? ['en'];
	const unknown = locales.filter((l) => !LOCALES.includes(l));
	if (unknown.length || !locales.length)
		throw new Error(`Unknown locale(s) ${unknown.join(', ')}. Locales: ${LOCALES.join(', ')}.`);

	const existing = await readdir(dir).catch(() => []);
	if (existing.length) throw new Error(`${dir} is not empty.`);

	await cp(TEMPLATE, dir, {
		recursive: true,
		filter: (src) => !/[/\\](node_modules|\.svelte-kit|build)([/\\]|$)/.test(src)
	});
	await rename(join(dir, '_gitignore'), join(dir, '.gitignore'));

	/** @type {Record<string, string>} */
	const replacements = {
		__PROJECT_NAME__: name,
		__PROJECT_TITLE__: options.title ?? name,
		__LOCALES__: JSON.stringify(locales).replace(/"/g, "'"),
		__MOZAIC_SPEC__: spec(options.mozaic ?? '^0.1.0'),
		__CLI_SPEC__: spec(options.cli ?? '^0.1.0')
	};
	for await (const file of walk(dir)) {
		if (!TEXT.test(basename(file))) continue;
		const source = await readFile(file, 'utf8');
		const filled = source.replace(/__[A-Z_]+__/g, (token) => replacements[token] ?? token);
		if (filled !== source) await writeFile(file, filled);
	}
	return { dir, name };
}

/**
 * @param {string} command
 * @param {string[]} args
 * @param {string} cwd
 */
function exec(command, args, cwd) {
	return new Promise((ok, fail) => {
		const child = spawn(command, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
		child.on('exit', (code) => (code === 0 ? ok(undefined) : fail(new Error(`${command} ${args.join(' ')} failed`))));
		child.on('error', fail);
	});
}

const HELP = `create-mozaic — start a new mozaic analysis project

Usage:
  pnpm create mozaic <dir> [options]

Options:
  --locales <list>      comma-separated: ${LOCALES.join(',')} (default: en)
  --title <text>        project title (default: the folder name)
  --name <slug>         package name (default: from the folder name)
  --mozaic <spec|path>  mozaic version, or a local path to packages/mozaic
  --cli <spec|path>     @mozaic/cli version, or a local path to packages/cli
  --git / --no-git      initialise a git repository (default: yes)
  --install             run pnpm install afterwards
`;

/**
 * @param {string[]} argv
 * @returns {Promise<number>}
 */
export async function run(argv) {
	/** @type {Record<string, string | boolean>} */
	const options = {};
	/** @type {string[]} */
	const positionals = [];
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (!arg.startsWith('--')) positionals.push(arg);
		else if (arg.startsWith('--no-')) options[arg.slice(5)] = false;
		else if (arg.includes('=')) options[arg.slice(2, arg.indexOf('='))] = arg.slice(arg.indexOf('=') + 1);
		else if (argv[i + 1] && !argv[i + 1].startsWith('--')) options[arg.slice(2)] = argv[++i];
		else options[arg.slice(2)] = true;
	}
	if (options.help || !positionals[0]) {
		console.log(HELP);
		return options.help ? 0 : 1;
	}

	const str = (/** @type {string} */ key) =>
		typeof options[key] === 'string' ? /** @type {string} */ (options[key]) : undefined;
	const { dir, name } = await scaffold({
		dir: positionals[0],
		name: str('name'),
		title: str('title'),
		locales: str('locales')?.split(','),
		mozaic: str('mozaic'),
		cli: str('cli')
	});
	if (options.git !== false)
		await exec('git', ['init', '-q'], dir).catch(() => console.warn('git init failed; skipping.'));
	if (options.install) await exec('pnpm', ['install'], dir);

	const relative = positionals[0];
	console.log(
		`\nCreated ${name} in ${dir}\n\nNext:\n  cd ${relative}\n${options.install ? '' : '  pnpm install\n'}  pnpm dev\n`
	);
	await stat(dir);
	return 0;
}
