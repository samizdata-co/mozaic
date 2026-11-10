import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';

/** @type {Record<string, string>} */
const TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.woff2': 'font/woff2',
	'.woff': 'font/woff',
	'.csv': 'text/csv; charset=utf-8',
	'.txt': 'text/plain; charset=utf-8'
};

/**
 * Serve a static directory on 127.0.0.1 (random port). Directory requests
 * get their index.html. Returns the base URL and a close function.
 * @param {string} dir
 * @returns {Promise<{ url: string, close: () => Promise<void> }>}
 */
export async function serveStatic(dir) {
	const root = resolve(dir);
	const server = createServer(async (req, res) => {
		try {
			const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
			let file = normalize(join(root, pathname));
			if (file !== root && !file.startsWith(root + sep))
				throw Object.assign(new Error('Forbidden'), { code: 'EACCES' });
			const info = await stat(file).catch(() => null);
			if (info?.isDirectory()) file = join(file, 'index.html');
			else if (!info && !extname(file)) file = `${file}.html`;
			const body = await readFile(file);
			res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
			res.end(body);
		} catch (error) {
			const code = /** @type {{ code?: string }} */ (error).code;
			res.writeHead(code === 'EACCES' ? 403 : 404, { 'content-type': 'text/plain' });
			res.end(code === 'EACCES' ? 'Forbidden' : 'Not found');
		}
	});
	await new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(undefined)));
	const address = server.address();
	if (!address || typeof address === 'string') throw new Error('Could not start the static server.');
	return {
		url: `http://127.0.0.1:${address.port}/`,
		close: () => new Promise((ok) => server.close(() => ok(undefined)))
	};
}
