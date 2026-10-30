/** Kernel shapes for `kernelSmooth`. Gaussian has unbounded support; the others reach zero at one bandwidth. */
export type Kernel = 'gaussian' | 'epanechnikov' | 'tricube' | 'box';

type X = number | Date;

const kernels: Record<Kernel, (u: number) => number> = {
	gaussian: (u) => Math.exp(-0.5 * u * u),
	epanechnikov: (u) => (Math.abs(u) < 1 ? 0.75 * (1 - u * u) : 0),
	tricube: (u) => (Math.abs(u) < 1 ? (1 - Math.abs(u) ** 3) ** 3 : 0),
	box: (u) => (Math.abs(u) <= 1 ? 1 : 0)
};

export interface KernelSmoothOptions<T, A extends X> {
	/** Position of each datum (numbers or dates). */
	x: (d: T) => X;
	/** Value to smooth. Missing values (null, undefined, NaN) are skipped. */
	y: (d: T) => number | null | undefined;
	/** Where to evaluate the smoothed curve, e.g. every day in the range. */
	at: Iterable<A>;
	/** Kernel bandwidth in x units (milliseconds for dates). For the Gaussian it is the standard deviation. */
	bandwidth: number;
	kernel?: Kernel;
	/** Extra weight per datum, e.g. `√n` for sample size. Gets the evaluation point to allow time-varying weights. */
	weight?: (d: T, at: number) => number;
	/** Sampling variance of each value. When given, the result includes a standard error. */
	variance?: (d: T) => number;
}

export interface Smoothed<A extends X = number> {
	x: A;
	/** Kernel-weighted mean. */
	y: number;
	/** Standard error of the mean (only with `variance`). */
	se?: number;
	/** Effective number of observations: (Σw)² / Σw². */
	neff: number;
	/** Total weight at this point. */
	weight: number;
}

/**
 * A kernel-weighted moving average (Nadaraya–Watson): at each point in `at`,
 * the mean of the values weighted by their distance in x and by `weight`.
 * Points with no weight (no data within reach of the kernel) are left out.
 *
 * With `variance`, the standard error is √(Σ w²σ²) / Σ w, which assumes
 * independent observations: add any error you expect beyond sampling (house
 * effects, for polls) to the variance yourself.
 */
export function kernelSmooth<T, A extends X>(data: T[], options: KernelSmoothOptions<T, A>): Smoothed<A>[] {
	const { x, y, at, bandwidth, kernel = 'gaussian', weight, variance } = options;
	const k = kernels[kernel];
	const rows = data
		.map((d) => ({ d, x: +x(d), y: y(d) }))
		.filter((r): r is { d: T; x: number; y: number } => r.y != null && Number.isFinite(r.y) && Number.isFinite(r.x));
	const out: Smoothed<A>[] = [];
	for (const point of at) {
		const p = +point;
		let sw = 0;
		let sw2 = 0;
		let swy = 0;
		let sw2v = 0;
		for (const r of rows) {
			const w = k((r.x - p) / bandwidth) * (weight ? weight(r.d, p) : 1);
			if (!(w > 0)) continue;
			sw += w;
			sw2 += w * w;
			swy += w * r.y;
			if (variance) sw2v += w * w * variance(r.d);
		}
		if (sw <= 0) continue;
		out.push({
			x: point,
			y: swy / sw,
			neff: (sw * sw) / sw2,
			weight: sw,
			...(variance ? { se: Math.sqrt(sw2v) / sw } : {})
		});
	}
	return out;
}

export interface LoessOptions<T, A extends X> {
	x: (d: T) => X;
	y: (d: T) => number | null | undefined;
	/** Where to evaluate. Defaults to the data's own x values. */
	at?: Iterable<A>;
	/** Share of the data used for each local fit (0–1). Larger is smoother. */
	span?: number;
	/** Prior weight per datum, e.g. sample size. */
	weight?: (d: T) => number;
	/** Robustness iterations that down-weight outliers (bisquare). 0 is plain LOESS. */
	iterations?: number;
}

/**
 * Locally weighted linear regression (LOESS, degree 1), as in the smoothed
 * poll lines on Wikipedia. Each point is fitted from the nearest `span` share
 * of the data, weighted by the tricube of the distance (and by `weight`).
 */
export function loess<T, A extends X = number>(
	data: T[],
	{ x, y, at, span = 0.75, weight, iterations = 0 }: LoessOptions<T, A>
): { x: A; y: number }[] {
	const rows = data
		.map((d) => ({ x: +x(d), y: y(d), w: weight ? weight(d) : 1, xv: x(d) }))
		.filter((r): r is { x: number; y: number; w: number; xv: X } => r.y != null && Number.isFinite(r.y))
		.sort((a, b) => a.x - b.x);
	const n = rows.length;
	if (n === 0) return [];
	const q = Math.min(n, Math.max(2, Math.floor(span * n)));
	const robust = new Array(n).fill(1);

	const fit = (p: number) => {
		const distances = rows.map((r) => Math.abs(r.x - p));
		const sorted = [...distances].sort((a, b) => a - b);
		const reach = Math.max(sorted[q - 1], 1e-12) * (q < n ? 1 : 1 + 1e-9);
		let sw = 0;
		let sx = 0;
		let sy = 0;
		let sxx = 0;
		let sxy = 0;
		rows.forEach((r, i) => {
			const u = distances[i] / reach;
			if (u >= 1) return;
			const w = (1 - u ** 3) ** 3 * r.w * robust[i];
			const dx = r.x - p;
			sw += w;
			sx += w * dx;
			sy += w * r.y;
			sxx += w * dx * dx;
			sxy += w * dx * r.y;
		});
		if (sw <= 0) return NaN;
		const denominator = sw * sxx - sx * sx;
		// Local line through (p, intercept); fall back to the weighted mean when all x are equal.
		return Math.abs(denominator) < 1e-12 * Math.max(1, sw * sxx) ? sy / sw : (sxx * sy - sx * sxy) / denominator;
	};

	for (let it = 0; it < iterations; it++) {
		const residuals = rows.map((r) => r.y - fit(r.x));
		const mad = [...residuals.map(Math.abs)].sort((a, b) => a - b)[Math.floor(n / 2)];
		if (!(mad > 0)) break;
		residuals.forEach((e, i) => {
			const u = e / (6 * mad);
			robust[i] = Math.abs(u) < 1 ? (1 - u * u) ** 2 : 0;
		});
	}

	const points: A[] = at ? [...at] : (rows.map((r) => r.xv) as A[]);
	return points.map((p) => ({ x: p, y: fit(+p) })).filter((d) => Number.isFinite(d.y));
}
