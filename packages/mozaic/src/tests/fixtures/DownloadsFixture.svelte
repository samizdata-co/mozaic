<script lang="ts">
	import { setDownloads } from '../../lib/frame/index.js';
	import BarsFixture from './BarsFixture.svelte';

	let { download }: { download?: boolean } = $props();
	setDownloads();
</script>

<BarsFixture {download} />
