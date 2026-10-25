<!--
@component
Scrollytelling: a sticky graphic with text steps scrolling over it. The
graphic snippet receives the active step index and the progress (0–1)
through that step, so the chart can change state as the reader scrolls.

Scroll stories need the page itself to scroll: publish them as a full page
(or a full-page embed), not inside an auto-height iframe.

```svelte
<Scroller steps={texts}>
  {#snippet graphic({ index, progress })}<MyChart state={index} />{/snippet}
  {#snippet step(text)}<p>{text}</p>{/snippet}
</Scroller>
```
-->
<script lang="ts" generics="S">
	import type { Snippet } from 'svelte';

	interface Props {
		steps: S[];
		graphic: Snippet<[{ index: number; progress: number }]>;
		step: Snippet<[S, number]>;
		/** Active step index (bindable). */
		index?: number;
		/** Progress through the active step, 0–1 (bindable). */
		progress?: number;
		/** Viewport position of the trigger line, 0 = top, 1 = bottom. */
		offset?: number;
		class?: string;
	}

	let {
		steps,
		graphic,
		step,
		index = $bindable(0),
		progress = $bindable(0),
		offset = 0.6,
		class: className = ''
	}: Props = $props();

	let stepEls: HTMLElement[] = $state([]);

	$effect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries)
					if (entry.isIntersecting) index = Number((entry.target as HTMLElement).dataset.index);
			},
			// A one-pixel-high root at the trigger line.
			{ rootMargin: `-${offset * 100}% 0px -${(1 - offset) * 100}% 0px` }
		);
		for (const el of stepEls) if (el) observer.observe(el);
		return () => observer.disconnect();
	});

	$effect(() => {
		const update = () => {
			const el = stepEls[index];
			if (!el) return;
			const rect = el.getBoundingClientRect();
			const line = window.innerHeight * offset;
			progress = Math.max(0, Math.min(1, (line - rect.top) / Math.max(1, rect.height)));
		};
		update();
		window.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update);
		return () => {
			window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
	});
</script>

<div class="mz-scroller {className}">
	<div class="mz-scroller-graphic">
		{@render graphic({ index, progress })}
	</div>
	<div class="mz-scroller-steps">
		{#each steps as s, i}
			<section class="mz-scroller-step" class:active={i === index} data-index={i} bind:this={stepEls[i]}>
				<div class="mz-scroller-card">{@render step(s, i)}</div>
			</section>
		{/each}
	</div>
</div>

<style>
	.mz-scroller {
		position: relative;
	}
	.mz-scroller-graphic {
		position: sticky;
		top: 0;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.mz-scroller-steps {
		position: relative;
		margin-top: -100vh;
		pointer-events: none;
	}
	.mz-scroller-step {
		min-height: 90vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 16px;
	}
	.mz-scroller-step:first-child {
		margin-top: 50vh;
	}
	.mz-scroller-step:last-child {
		margin-bottom: 40vh;
	}
	.mz-scroller-card {
		max-width: 28rem;
		padding: 1rem 1.25rem;
		background: color-mix(in srgb, var(--mz-color-bg, #fff) 94%, transparent);
		border: 1px solid var(--mz-color-border, #e4e4e4);
		border-radius: var(--mz-radius-floating, 6px);
		box-shadow: var(--mz-shadow-floating, 0 2px 10px rgb(0 0 0 / 0.08));
		opacity: 0.45;
		transition: opacity 200ms;
		pointer-events: auto;
	}
	.active .mz-scroller-card {
		opacity: 1;
	}
	@media (prefers-reduced-motion: reduce) {
		.mz-scroller-card {
			transition: none;
		}
	}
	@media print {
		.mz-scroller-graphic {
			position: static;
			height: auto;
		}
		.mz-scroller-steps {
			margin-top: 0;
		}
	}
</style>
