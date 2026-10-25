<script lang="ts">
	import { geoMercator } from 'd3-geo';
	import type { FeatureCollection } from 'geojson';
	import { Chart } from '../../lib/frame/index.js';
	import { Plot, Svg } from '../../lib/core/index.js';
	import { GeoPath, Points, Text } from '../../lib/marks/index.js';

	// Clockwise exterior ring, as d3-geo expects.
	const square: FeatureCollection = {
		type: 'FeatureCollection',
		features: [
			{
				type: 'Feature',
				properties: { name: 'square' },
				geometry: {
					type: 'Polygon',
					coordinates: [
						[
							[28, 46],
							[28, 48],
							[30, 48],
							[30, 46],
							[28, 46]
						]
					]
				}
			}
		]
	};
</script>

<Chart width={300}>
	<Plot
		projection={geoMercator()}
		fit={square}
		height={200}
		width={300}
		padding={{ top: 0, right: 0, bottom: 0, left: 0 }}
	>
		<Svg>
			<GeoPath data={square.features} fill="#ccc" />
			<Points data={[{ lon: 29, lat: 47 }]} x={(d) => d.lon} y={(d) => d.lat} />
			<Text data={[{ lon: 29, lat: 47 }]} x={(d) => d.lon} y={(d) => d.lat} text="centre" />
		</Svg>
	</Plot>
</Chart>
