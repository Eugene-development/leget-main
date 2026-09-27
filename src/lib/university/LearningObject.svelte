<script lang="ts">
	import UniversityMark from '$lib/components/templates/Promo-1/pages/university/UniversityMark.svelte';
	const leaves = [0, 1, 2, 3, 4, 5, 6];
</script>

<!-- An open, fanned course book: original CSS geometry, no downloaded artwork. -->
<div class="uni-learning-object" aria-hidden="true">
	<div class="uni-book-shadow"></div>
	<div class="uni-book-fan">
		{#each leaves as leaf}
			<div class="uni-book-leaf" style:--leaf={leaf}>
				<div class="uni-book-face">
					<UniversityMark class="uni-book-mark" />
					<span class="uni-book-name"
						>{#if leaf === leaves.length - 1}Основы<br />дизайна{:else}Учиться<br
							/>понимать.{/if}</span
					>
					<span class="uni-book-imprint">УНИВЕР / О ДОМЕ</span>
				</div>
			</div>
		{/each}
	</div>
</div>
