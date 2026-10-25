import { resolve } from '$app/paths';

/** A site link that works under any base path, e.g. `link('gallery/')`. */
export function link(path: string): string {
	// resolve() is typed for literal route IDs; docs links are computed.
	return (resolve as unknown as (path: string) => string)(path);
}
