<script lang="ts">
	import { Chart } from '../../lib/frame/index.js';
	import { ButtonGroup, Scroller } from '../../lib/interactive/index.js';

	let { medium = 'web' }: { medium?: 'web' | 'print' } = $props();
	let value = $state('b');
</script>

<Chart width={400} {medium}>
	<ButtonGroup
		label="Measure"
		options={[
			{ value: 'a', label: 'Option A' },
			{ value: 'b', label: 'Option B' }
		]}
		bind:value
	/>
	<Scroller steps={['first step', 'second step']}>
		{#snippet graphic({ index })}<p class="graphic">graphic {index}</p>{/snippet}
		{#snippet step(text)}<p>{text}</p>{/snippet}
	</Scroller>
</Chart>
