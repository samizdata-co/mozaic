import { hostScript } from 'mozaic/embed';

export const prerender = true;
export const trailingSlash = 'never';

export function GET() {
	return new Response(hostScript, { headers: { 'content-type': 'text/javascript; charset=utf-8' } });
}
