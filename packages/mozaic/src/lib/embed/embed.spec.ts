import { describe, expect, it } from 'vitest';
import { embedCode, hostScript } from './index.js';

describe('embedCode', () => {
	it('builds an iframe snippet and escapes attributes', () => {
		const code = embedCode({
			src: 'https://charts.example/a/?x=1&y=2',
			title: 'Say "hi"',
			height: 300,
			scriptSrc: 'https://charts.example/embed.js'
		});
		expect(code).toContain('src="https://charts.example/a/?x=1&amp;y=2"');
		expect(code).toContain('title="Say &quot;hi&quot;"');
		expect(code).toContain('height="300"');
		expect(code).toContain('<script src="https://charts.example/embed.js" async></script>');
	});

	it('omits the script when no script URL is given', () => {
		expect(embedCode({ src: '/a/', title: 'A' })).not.toContain('<script');
	});
});

describe('hostScript', () => {
	it('is valid JavaScript that resizes the matching iframe', () => {
		const listeners: ((e: unknown) => void)[] = [];
		const frame = { contentWindow: {}, style: { height: '' } };
		const other = { contentWindow: {}, style: { height: '' } };
		const window = { addEventListener: (_: string, fn: (e: unknown) => void) => listeners.push(fn) } as Record<
			string,
			unknown
		>;
		const document = { getElementsByTagName: () => [other, frame] };
		new Function('window', 'document', hostScript)(window, document);
		new Function('window', 'document', hostScript)(window, document); // second include is a no-op
		expect(listeners).toHaveLength(1);
		listeners[0]({ data: { type: 'mozaic:resize', id: 'x', height: 321.2 }, source: frame.contentWindow });
		expect(frame.style.height).toBe('322px');
		expect(other.style.height).toBe('');
		listeners[0]({ data: { type: 'other', height: 5 }, source: frame.contentWindow });
		expect(frame.style.height).toBe('322px');
	});
});
