import { hierarchy, treemap, treemapSquarify, type HierarchyRectangularNode } from 'd3-hierarchy';

export interface TreemapCell<T> {
	datum: T;
	group: string | undefined;
	value: number;
	x0: number;
	y0: number;
	x1: number;
	y1: number;
}

/**
 * Squarified treemap of flat rows, optionally grouped one level deep.
 * Returns one cell per row with pixel coordinates inside `width` × `height`.
 */
export function treemapLayout<T>(
	data: T[],
	options: {
		value: (d: T) => number;
		group?: (d: T) => string;
		width: number;
		height: number;
		padding?: number;
		groupPadding?: number;
	}
): TreemapCell<T>[] {
	const { value, group, width, height, padding = 1, groupPadding = 3 } = options;
	type Node = { name?: string; children?: Node[]; datum?: T };
	const root: Node = group
		? {
				children: Array.from(
					data.reduce((m, d) => m.set(group(d), [...(m.get(group(d)) ?? []), d]), new Map<string, T[]>()),
					([name, rows]) => ({ name, children: rows.map((d) => ({ datum: d })) })
				)
			}
		: { children: data.map((d) => ({ datum: d })) };

	const h = hierarchy<Node>(root)
		.sum((n) => (n.datum ? Math.max(0, value(n.datum)) : 0))
		.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

	const laidOut = treemap<Node>()
		.tile(treemapSquarify)
		.size([Math.max(0, width), Math.max(0, height)])
		.paddingInner(padding)
		.paddingOuter(group ? groupPadding : 0)
		.round(true)(h);

	return laidOut.leaves().map((leaf: HierarchyRectangularNode<Node>) => ({
		datum: leaf.data.datum as T,
		group: group ? leaf.parent?.data.name : undefined,
		value: leaf.value ?? 0,
		x0: leaf.x0,
		y0: leaf.y0,
		x1: leaf.x1,
		y1: leaf.y1
	}));
}
