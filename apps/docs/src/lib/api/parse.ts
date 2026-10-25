/**
 * Extracts API documentation from a mozaic component's source: the
 * `@component` comment, the `generics` attribute, the `Props` interface (or
 * inline props type) with JSDoc, and default values from the `$props()`
 * destructuring. Deliberately small: it understands the conventions used in
 * the library, not all of TypeScript.
 */

export interface PropDoc {
	name: string;
	type: string;
	optional: boolean;
	default?: string;
	description: string;
}

export interface ComponentDoc {
	name: string;
	module: string;
	description: string;
	generics?: string;
	props: PropDoc[];
}

const OPEN = '([{<';
const CLOSE = ')]}>';

/** If a comment starts at `i`, the index of its last character; otherwise -1. */
function commentEnd(text: string, i: number): number {
	if (text[i] !== '/') return -1;
	if (text[i + 1] === '*') {
		const end = text.indexOf('*/', i + 2);
		return end < 0 ? text.length : end + 1;
	}
	if (text[i + 1] === '/') {
		const end = text.indexOf('\n', i + 2);
		return end < 0 ? text.length : end;
	}
	return -1;
}

/** Index of the bracket matching the one at `start`, honouring nesting, comments, strings and `=>`. */
function matching(text: string, start: number): number {
	let depth = 0;
	for (let i = start; i < text.length; i++) {
		const c = text[i];
		const comment = commentEnd(text, i);
		if (comment >= 0) {
			i = comment;
			continue;
		}
		if (c === "'" || c === '"' || c === '`') {
			i = text.indexOf(c, i + 1);
			if (i < 0) return -1;
			continue;
		}
		if (c === '=' && text[i + 1] === '>') {
			i++;
			continue;
		}
		if (OPEN.includes(c)) depth++;
		else if (CLOSE.includes(c)) {
			depth--;
			if (depth === 0) return i;
		}
	}
	return -1;
}

/** Split at top-level occurrences of `separator` characters. */
function splitTop(text: string, separators: string): string[] {
	const parts: string[] = [];
	let depth = 0;
	let start = 0;
	for (let i = 0; i < text.length; i++) {
		const c = text[i];
		const comment = commentEnd(text, i);
		if (comment >= 0) {
			i = comment;
			continue;
		}
		if (c === "'" || c === '"' || c === '`') {
			const end = text.indexOf(c, i + 1);
			if (end > 0) i = end;
			continue;
		}
		if (c === '=' && text[i + 1] === '>') {
			i++;
			continue;
		}
		if (OPEN.includes(c)) depth++;
		else if (CLOSE.includes(c)) depth--;
		else if (depth === 0 && separators.includes(c)) {
			parts.push(text.slice(start, i));
			start = i + 1;
		}
	}
	parts.push(text.slice(start));
	return parts.map((p) => p.trim()).filter(Boolean);
}

function cleanDoc(raw: string): string {
	return raw
		.split('\n')
		.map((line) => line.replace(/^\s*\*\s?/, '').trim())
		.join(' ')
		.replace(/\s+/g, ' ')
		.trim();
}

/** Members of a type literal body: `/** doc *\/ name?: type;` … */
export function parseMembers(body: string): PropDoc[] {
	const props: PropDoc[] = [];
	let doc = '';
	let i = 0;
	while (i < body.length) {
		const rest = body.slice(i);
		const space = /^\s+/.exec(rest);
		if (space) {
			i += space[0].length;
			continue;
		}
		if (rest.startsWith('/**')) {
			const end = body.indexOf('*/', i);
			doc = cleanDoc(body.slice(i + 3, end));
			i = end + 2;
			continue;
		}
		if (rest.startsWith('//')) {
			const end = body.indexOf('\n', i);
			i = end < 0 ? body.length : end + 1;
			continue;
		}
		const member = /^([A-Za-z_$][\w$]*)(\?)?\s*:\s*/.exec(rest);
		if (!member) {
			i++;
			continue;
		}
		i += member[0].length;
		const start = i;
		let depth = 0;
		while (i < body.length) {
			const c = body[i];
			if (c === '=' && body[i + 1] === '>') {
				i += 2;
				continue;
			}
			if (OPEN.includes(c)) depth++;
			else if (CLOSE.includes(c)) depth--;
			else if (depth === 0 && (c === ';' || c === '\n')) break;
			i++;
		}
		props.push({
			name: member[1],
			optional: Boolean(member[2]),
			type: body.slice(start, i).trim().replace(/\s+/g, ' '),
			description: doc
		});
		doc = '';
		i++;
	}
	return props;
}

/** Defaults from `let { a = 1, b: alias = 'x', c = $bindable() }: … = $props();` */
export function parseDefaults(script: string): Record<string, string> {
	const call = script.indexOf('$props()');
	if (call < 0) return {};
	const start = script.lastIndexOf('let {', call);
	if (start < 0) return {};
	const open = start + 4;
	const close = matching(script, open);
	const defaults: Record<string, string> = {};
	for (const entry of splitTop(script.slice(open + 1, close), ',')) {
		const m = /^([\w$]+)(?:\s*:\s*[\w$]+)?(?:\s*=\s*([\s\S]+))?$/.exec(entry);
		if (m && m[2] !== undefined) defaults[m[1]] = m[2].trim().replace(/\s+/g, ' ');
	}
	return defaults;
}

export function parseComponent(name: string, module: string, source: string): ComponentDoc {
	const description = /<!--\s*@component\s*([\s\S]*?)-->/.exec(source)?.[1].trim() ?? '';
	const generics = /<script[^>]*\bgenerics="([^"]+)"/.exec(source)?.[1];
	const script = /<script(?![^>]*\bmodule\b)[^>]*>([\s\S]*?)<\/script>/.exec(source)?.[1] ?? '';

	let body = '';
	const iface = script.indexOf('interface Props');
	if (iface >= 0) {
		const open = script.indexOf('{', iface);
		body = script.slice(open + 1, matching(script, open));
	} else {
		// Inline: let { … }: { …type… } = $props();
		const call = script.indexOf('$props()');
		const typeEnd = call >= 0 ? script.lastIndexOf('}', call) : -1;
		if (typeEnd >= 0) {
			let depth = 0;
			for (let i = typeEnd; i >= 0; i--) {
				if (script[i] === '}') depth++;
				else if (script[i] === '{') depth--;
				if (depth === 0) {
					body = script.slice(i + 1, typeEnd);
					break;
				}
			}
			body = splitTop(body, ';').join(';\n');
		}
	}

	const defaults = parseDefaults(script);
	const props = parseMembers(body).map((p) => ({ ...p, default: defaults[p.name] }));
	return { name, module, description, generics, props };
}
