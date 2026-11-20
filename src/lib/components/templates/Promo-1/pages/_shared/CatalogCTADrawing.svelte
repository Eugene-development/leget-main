<script module lang="ts">
	export type CatalogDrawing =
		| 'appliances'
		| 'plumbing'
		| 'hardware'
		| 'tile'
		| 'lighting'
		| 'doors'
		| 'windows';
</script>

<script lang="ts">
	let { drawing }: { drawing: CatalogDrawing } = $props();
</script>

<div class="drawing">
	{#if drawing === 'appliances'}
		<!-- Фронтальная проекция встраиваемой духовки и план варочной панели. -->
		<div class="part" style="inset: 11% 48% 17% 5%">
			<div class="rule" style="inset: 23% 0 auto"></div>
			<div class="part circle" style="inset: 7% auto auto 11%; width: 8%"></div>
			<div class="part circle" style="inset: 7% 11% auto auto; width: 8%"></div>
			<div class="part" style="inset: 8% 39% 86%"></div>
			<div class="rule" style="inset: 33% 14% auto"></div>
			<div class="part inset" style="inset: 43% 10% 12%"></div>
		</div>
		<div class="part" style="inset: 19% 5% 25% 59%">
			<div class="part circle" style="inset: 12% auto auto 12%; width: 31%"></div>
			<div class="part circle" style="inset: 14% 14% auto auto; width: 24%"></div>
			<div class="part circle" style="inset: auto auto 20% 15%; width: 24%"></div>
			<div class="part circle" style="inset: auto 11% 16% auto; width: 31%"></div>
		</div>
		<div class="dimension" style="inset: 89% 48% auto 5%"></div>
		<div class="dimension" style="inset: 81% 5% auto 59%"></div>
	{:else if drawing === 'plumbing'}
		<!-- Двухсекционная мойка с монтажным отверстием. -->
		<div class="part rounded" style="inset: 17% 4% 18%">
			<div class="part inset rounded" style="inset: 18% 47% 11% 5%">
				<div class="part circle" style="inset: 46% auto auto 39%; width: 15%"></div>
			</div>
			<div class="part inset rounded" style="inset: 18% 5% 11% 56%">
				<div class="part circle" style="inset: 46% auto auto 42%; width: 18%"></div>
			</div>
			<div class="part circle" style="inset: 4% auto auto 49%; width: 3%"></div>
		</div>
		<div class="dimension" style="inset: 89% 4% auto"></div>
	{:else if drawing === 'hardware'}
		<!-- Чашечная мебельная петля. -->
		<div class="part circle" style="inset: 22% auto auto 9%; width: 33%">
			<div class="part inset circle" style="inset: 17%"></div>
			<div class="part circle" style="inset: 8% auto auto 46%; width: 8%"></div>
			<div class="part circle" style="inset: auto auto 8% 46%; width: 8%"></div>
		</div>
		<div class="part rounded" style="inset: 27% 10% 29% 57%">
			<div class="part inset circle" style="inset: 9% auto auto 44%; width: 14%"></div>
			<div class="part inset circle" style="inset: auto auto 9% 44%; width: 14%"></div>
		</div>
		<div class="part hinge-arm" style="inset: 40% 15% 41% 28%">
			<div class="rule" style="inset: 50% 8% auto 19%"></div>
		</div>
		<div class="dimension" style="inset: 85% 10% auto 9%"></div>
	{:else if drawing === 'tile'}
		<!-- Три плитки в перспективе с видимой толщиной кромки. -->
		<div class="part tile" style="inset: 48% 10% 19% 33%"></div>
		<div class="part tile" style="inset: 35% 21% 32% 22%"></div>
		<div class="part tile" style="inset: 22% 32% 45% 11%">
			<div class="rule" style="inset: 16% 7% auto"></div>
		</div>
		<div class="dimension" style="inset: 90% 8% auto 11%"></div>
	{:else if drawing === 'lighting'}
		<!-- Два подвесных светильника на разной высоте. -->
		<div class="part rounded" style="inset: 8% 16% 87%"></div>
		<div class="upright" style="inset: 13% auto 61% 32%"></div>
		<div class="upright" style="inset: 13% auto 47% 70%"></div>
		<div class="part shade" style="inset: 38% 53% 33% 17%">
			<div class="rule" style="inset: auto 0 16%"></div>
		</div>
		<div class="part shade tall-shade" style="inset: 52% 20% 15% 60%">
			<div class="rule" style="inset: auto 0 16%"></div>
		</div>
		<div class="dimension" style="inset: 92% 16% auto"></div>
	{:else if drawing === 'doors'}
		<!-- Фасад двери и схема открывания створки в плане. -->
		<div class="part" style="inset: 7% 51% 10% 15%">
			<div class="part inset" style="inset: 4% 7% 0">
				<div class="part" style="inset: 8% 17% 61%"></div>
				<div class="part" style="inset: 51% 17% 8%"></div>
				<div class="rule" style="inset: 46% 10% auto 74%"></div>
			</div>
		</div>
		<div class="rule" style="inset: 78% 12% auto 58%"></div>
		<div class="swing" style="inset: auto auto 22% 61%; width: 26%"></div>
		<div class="dimension" style="inset: 93% 51% auto 15%"></div>
	{:else}
		<!-- Двухстворчатое окно со схемой поворота правой створки. -->
		<div class="part" style="inset: 13% 8% 18%">
			<div class="part inset" style="inset: 7% 51% 7% 5%">
				<div class="reflection" style="inset: 30% auto auto 23%; width: 30%"></div>
				<div class="reflection" style="inset: 43% auto auto 23%; width: 23%"></div>
			</div>
			<div class="part inset" style="inset: 7% 5% 7% 51%">
				<div class="opening-guide"></div>
				<div class="upright" style="inset: 41% auto 41% 9%"></div>
			</div>
		</div>
		<div class="rule" style="inset: 82% 4% auto"></div>
		<div class="dimension" style="inset: 90% 8% auto"></div>
	{/if}
</div>

<style>
	.drawing {
		position: relative;
		width: min(100%, 22rem);
		aspect-ratio: 1.6;
	}

	.part,
	.rule,
	.upright,
	.dimension,
	.swing,
	.reflection,
	.opening-guide {
		position: absolute;
	}

	.part {
		border: 1px solid;
		background: color-mix(in srgb, currentColor 8%, transparent);
	}

	.inset {
		background: color-mix(in srgb, currentColor 13%, transparent);
	}

	.rounded {
		border-radius: var(--ds-radius-md);
	}

	.circle {
		aspect-ratio: 1;
		border-radius: 50%;
	}

	.rule,
	.dimension::after,
	.reflection {
		border-block-start: 1px solid;
	}

	.upright {
		border-inline-start: 1px solid;
	}

	.hinge-arm {
		border-radius: var(--ds-radius-sm);
		background: color-mix(in srgb, currentColor 14%, var(--color-accent-panel-deep));
	}

	.tile {
		transform: skewX(-27deg);
		box-shadow: 0 0.25rem 0 color-mix(in srgb, currentColor 38%, var(--color-accent-panel-deep));
		background: color-mix(in srgb, currentColor 10%, var(--color-accent-panel-deep));
	}

	.shade {
		border-radius: 48% 48% 12% 12% / 91% 91% 9% 9%;
	}

	.tall-shade {
		border-radius: 40% 40% 9% 9% / 64% 64% 6% 6%;
	}

	.swing {
		aspect-ratio: 1;
		border: 1px dashed;
		border-inline-start-style: solid;
		border-block-end: 0;
		border-start-end-radius: 100%;
	}

	.reflection {
		opacity: 0.46;
		transform: rotate(-39deg);
	}

	.opening-guide {
		inset: 0 0 0 13%;
		background: currentColor;
		opacity: 0.42;
		clip-path: polygon(100% 0, 0 50%, 100% 100%, 100% 98%, 2% 50%, 100% 2%);
	}

	.dimension {
		height: 0.4rem;
		border-inline: 1px solid;
		opacity: 0.6;
	}

	.dimension::after {
		position: absolute;
		inset: 50% 0 auto;
		content: '';
	}
</style>
