/**
 * Minimal argument parser: positionals, `--flag`, `--key value`, `--key=value`,
 * and `--no-flag`.
 * @param {string[]} argv
 * @returns {{ positionals: string[], options: Record<string, string | boolean> }}
 */
export function parseArgs(argv) {
	/** @type {string[]} */
	const positionals = [];
	/** @type {Record<string, string | boolean>} */
	const options = {};
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === '--') {
			positionals.push(...argv.slice(i + 1));
			break;
		}
		if (arg.startsWith('--')) {
			const body = arg.slice(2);
			const eq = body.indexOf('=');
			if (eq >= 0) options[body.slice(0, eq)] = body.slice(eq + 1);
			else if (body.startsWith('no-')) options[body.slice(3)] = false;
			else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith('-')) options[body] = argv[++i];
			else options[body] = true;
		} else if (arg.startsWith('-') && arg.length > 1) {
			options[arg.slice(1)] = true;
		} else {
			positionals.push(arg);
		}
	}
	return { positionals, options };
}
