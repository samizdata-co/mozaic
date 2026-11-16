<script lang="ts">
	import { setLoadFonts } from '../../lib/frame/index.js';
	import type { Theme } from '../../lib/styles/index.js';
	import BarsFixture from './BarsFixture.svelte';

	let { style, loadFonts }: { style: Theme; loadFonts?: boolean } = $props();
	setLoadFonts(false);
</script>

<BarsFixture {style} {loadFonts} />
