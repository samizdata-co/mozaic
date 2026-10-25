<!-- One embeddable chart. Query parameters (?medium=print&width=208) are read after hydration. -->
<script lang="ts">
	import { Embed, useEmbedParams } from 'mozaic/embed';
	import { charts } from '../../../../charts';
	import { config } from '../../../../../mozaic.config';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const params = useEmbedParams();
	const chart = $derived(charts.find((c) => c.slug === data.slug)!);
</script>

<svelte:head>
	<title>{chart.title(data.locale)}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<Embed>
	<chart.component style={config.style} locale={data.locale} medium={params.medium} width={params.width} />
</Embed>
