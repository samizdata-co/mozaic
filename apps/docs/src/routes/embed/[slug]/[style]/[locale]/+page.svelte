<script lang="ts">
	import { Embed, useEmbedParams } from 'mozaic/embed';
	import { getExample } from '#lib/gallery/index.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const params = useEmbedParams();
	const example = $derived(getExample(data.slug)!);
</script>

<svelte:head>
	<title>{example.title}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<Embed>
	<example.component style={data.style} locale={data.locale} medium={params.medium} width={params.width} />
</Embed>
