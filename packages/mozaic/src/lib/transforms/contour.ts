import { contours } from 'd3-contour';
import { geoArea } from 'd3-geo';
import type { Feature, MultiPolygon, Position } from 'geojson';

export interface ContourPointsOptions<T> {
	/** Longitude of each observation. */
	x: (d: T) => number;
	/** Latitude of each observation. */
	y: (d: T) => number;
	/** The measured value. Missing values (null, undefined, NaN) are skipped. */
	value: (d: T) => number | null | undefined;
	/** Draw the area where the smoothed value is at least each of these. */
	thresholds: number[];
	/** Smoothing radius in kilometres: the standard deviation of the Gaussian kernel. */
	bandwidth: number;
	/** Grid cell size in kilometres. Defaults to a quarter of the bandwidth. */
	cellSize?: number;
	/** Area to grid, as [[west, south], [east, north]]. Defaults to the data's bounds plus two bandwidths. */
	extent?: [[number, number], [number, number]];
	/**
	 * Where the kernel weights of the observations near a cell add up to less than this, the cell's
	 * value fades towards `background` in proportion, so the areas stop where the data stops (not in
	 * the sea or empty country) with smooth edges. Above it, the value is the plain weighted mean.
	 * One observation one bandwidth away weighs 0.61. Defaults to 0.5.
	 */
	minWeight?: number;
	/** The value where there is no data. Defaults to the smallest observed value. */
	background?: number;
	/** Extra weight per observation. */
	weight?: (d: T) => number;
}

/** The area where the smoothed value is at least `value`, in longitude and latitude. */
export type ContourArea = Feature<MultiPolygon, { value: number }>;

const KM_PER_DEGREE = 111.32;

/**
 * Contours of scattered measurements on a map, such as earthquake intensities reported by place,
 * felt reports or sensor readings: the areas where the smoothed value is at least each threshold.
 * Each grid cell takes the Gaussian-weighted mean of the observations within three bandwidths
 * (Nadaraya–Watson); at the edges of the data it fades to a background value. Returns one
 * GeoJSON feature per threshold, wound for d3-geo, ready for `<GeoPath>`. For whole-number scales (intensity, ratings),
 * a threshold half a step below a value (6.5 for VII) draws the line where the smoothed value
 * rounds to it.
 */
export function contourPoints<T>(data: Iterable<T>, options: ContourPointsOptions<T>): ContourArea[] {
	const { x, y, value, thresholds, bandwidth, weight, minWeight = 0.5 } = options;
	const cellKm = options.cellSize ?? bandwidth / 4;
	const points: { lon: number; lat: number; v: number; w: number }[] = [];
	for (const d of data) {
		const v = value(d);
		const lon = x(d);
		const lat = y(d);
		if (v == null || !Number.isFinite(v) || !Number.isFinite(lon) || !Number.isFinite(lat)) continue;
		points.push({ lon, lat, v, w: weight ? weight(d) : 1 });
	}
	if (!points.length || !thresholds.length) return thresholds.map((t) => empty(t));
	const background = options.background ?? Math.min(...points.map((p) => p.v));

	const pad = (2 * bandwidth) / KM_PER_DEGREE;
	const [[west, south], [east, north]] = options.extent ?? [
		[
			Math.min(...points.map((p) => p.lon)) - pad / Math.cos(rad(mean(points.map((p) => p.lat)))),
			Math.min(...points.map((p) => p.lat)) - pad
		],
		[
			Math.max(...points.map((p) => p.lon)) + pad / Math.cos(rad(mean(points.map((p) => p.lat)))),
			Math.max(...points.map((p) => p.lat)) + pad
		]
	];
	const kmX = KM_PER_DEGREE * Math.cos(rad((south + north) / 2));
	const dLon = cellKm / kmX;
	const dLat = cellKm / KM_PER_DEGREE;
	const nx = Math.max(2, Math.ceil((east - west) / dLon) + 1);
	const ny = Math.max(2, Math.ceil((north - south) / dLat) + 1);

	// Bucket the observations by cut-off radius so each cell only looks at its neighbours. Buckets
	// are as wide in degrees as the cut-off is at the edge furthest from the equator.
	const cutoff = 3 * bandwidth;
	const bucketLon = cutoff / (KM_PER_DEGREE * Math.cos(rad(Math.min(89, Math.max(Math.abs(south), Math.abs(north))))));
	const bucketLat = cutoff / KM_PER_DEGREE;
	const buckets = new Map<string, typeof points>();
	const key = (bx: number, by: number) => `${bx},${by}`;
	for (const p of points) {
		const k = key(Math.floor((p.lon - west) / bucketLon), Math.floor((p.lat - south) / bucketLat));
		const b = buckets.get(k);
		if (b) b.push(p);
		else buckets.set(k, [p]);
	}

	// Row 0 is the north edge, so the grid reads like the map and rings keep their orientation.
	const values = new Float64Array(nx * ny);
	const twoSigma2 = 2 * bandwidth * bandwidth;
	for (let j = 0; j < ny; j++) {
		const lat = north - j * dLat;
		const kx = KM_PER_DEGREE * Math.cos(rad(lat));
		const by = Math.floor((lat - south) / bucketLat);
		for (let i = 0; i < nx; i++) {
			const lon = west + i * dLon;
			const bx = Math.floor((lon - west) / bucketLon);
			let sw = 0;
			let swv = 0;
			for (let ox = -1; ox <= 1; ox++) {
				for (let oy = -1; oy <= 1; oy++) {
					const b = buckets.get(key(bx + ox, by + oy));
					if (!b) continue;
					for (const p of b) {
						const ex = (p.lon - lon) * kx;
						const ey = (p.lat - lat) * KM_PER_DEGREE;
						const d2 = ex * ex + ey * ey;
						if (d2 > cutoff * cutoff) continue;
						const w = p.w * Math.exp(-d2 / twoSigma2);
						sw += w;
						swv += w * p.v;
					}
				}
			}
			const fade = minWeight > 0 ? Math.min(1, sw / minWeight) : 1;
			values[j * nx + i] = sw > 0 ? background + fade * (swv / sw - background) : background;
		}
	}

	const toGeo = (pt: Position): Position => [west + (pt[0] - 0.5) * dLon, north - (pt[1] - 0.5) * dLat];
	return contours()
		.size([nx, ny])
		.thresholds(thresholds)(Array.from(values))
		.map((c) => {
			const coordinates = c.coordinates
				.map((polygon) => polygon.map((ring) => ring.map(toGeo)))
				.map((polygon) => wind(polygon));
			return { type: 'Feature', properties: { value: c.value }, geometry: { type: 'MultiPolygon', coordinates } };
		});
}

/** d3-geo reads a polygon wound the wrong way as the whole globe minus the shape: flip it. */
function wind(polygon: Position[][]): Position[][] {
	const area = geoArea({ type: 'Polygon', coordinates: polygon });
	return area > 2 * Math.PI ? polygon.map((ring) => [...ring].reverse()) : polygon;
}

function empty(value: number): ContourArea {
	return { type: 'Feature', properties: { value }, geometry: { type: 'MultiPolygon', coordinates: [] } };
}

const rad = (deg: number) => (deg * Math.PI) / 180;
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
