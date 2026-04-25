<script lang="ts">
	import { onMount } from 'svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Factory', updated);
		data = updated;
	}

	let visible = $state(false);
	let sectionEl: HTMLElement;

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) visible = true;
				});
			},
			{ threshold: 0.1 }
		);
		if (sectionEl) observer.observe(sectionEl);
		return () => observer.disconnect();
	});
</script>

<section class="relative bg-surface py-section-sm lg:py-section" bind:this={sectionEl}>
	<div class="mx-auto max-w-screen-xl px-6 xl:px-1">
		<!-- Header -->
		<div
			class="mb-12 opacity-0 transition-all duration-700"
			class:animate-fade-up={visible}
		>
			<EditableField
				fieldKey="Factory.label"
				label="Лейбл"
				value={String(data?.label ?? 'Производство')}
				{isEditable}
				onSave={(v) => saveField('label', v)}
			>
				{#snippet children(displayValue)}
					<span class="text-[11px] tracking-[0.3em] text-secondary uppercase">{displayValue}</span>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="Factory.heading"
				label="Заголовок"
				value={String(data?.heading ?? 'Наша фабрика')}
				{isEditable}
				onSave={(v) => saveField('heading', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2
						class="mt-3 text-4xl font-light text-primary lg:text-5xl"
						style="font-family: var(--font-heading);"
					>
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="Factory.description"
				label="Описание"
				value={String(data?.description ?? '25 000 м² современного производства, оснащённого передовым европейским оборудованием')}
				{isEditable}
				multiline
				onSave={(v) => saveField('description', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<p class="mt-4 max-w-xl text-base leading-relaxed text-secondary">{displayValue}</p>
				{/snippet}
			</EditableField>
		</div>

		<!-- Bento Grid -->
		<div class="bento-grid">
			<!-- Cell 1 — large, spans 2 cols + 2 rows -->
			<div
				class="bento-cell bento-cell--large opacity-0 transition-all duration-700"
				class:animate-fade-up={visible}
				style="animation-delay: 0.1s"
			>
				<img
					src="https://storage.yandexcloud.net/zovtop/foto/fabr-1jhbnikjnmim.jpg"
					alt="Цех сборки"
					class="bento-media"
				/>
			</div>

			<!-- Cell 2 — top right -->
			<div
				class="bento-cell bento-cell--medium opacity-0 transition-all duration-700"
				class:animate-fade-up={visible}
				style="animation-delay: 0.2s"
			>
				<img
					src="https://storage.yandexcloud.net/zovtop/foto/fabr-2jfnvkjfdvijkmf.jpg"
					alt="ЧПУ-станки"
					class="bento-media"
				/>
			</div>

			<!-- Cell 3 — middle right -->
			<div
				class="bento-cell bento-cell--medium opacity-0 transition-all duration-700"
				class:animate-fade-up={visible}
				style="animation-delay: 0.3s"
			>
				<img
					src="https://storage.yandexcloud.net/zovtop/foto/fabr-3kjvndfnvjhdgnvjhd.jpg"
					alt="Окрасочная камера"
					class="bento-media"
				/>
			</div>

			<!-- Cell 4 — bottom left -->
			<div
				class="bento-cell bento-cell--medium opacity-0 transition-all duration-700"
				class:animate-fade-up={visible}
				style="animation-delay: 0.4s"
			>
				<img
					src="https://storage.yandexcloud.net/zovtop/foto/fabr-4dlkfvmdfmvjkfd.jpg"
					alt="Склад"
					class="bento-media"
				/>
			</div>

			<!-- Cell 5 — bottom right wide -->
			<div
				class="bento-cell bento-cell--wide opacity-0 transition-all duration-700"
				class:animate-fade-up={visible}
				style="animation-delay: 0.5s"
			>
				<img
					src="https://storage.yandexcloud.net/zovtop/foto/fabr-5kjfndvjkdfgknkgj.jpg"
					alt="Контроль качества"
					class="bento-media"
				/>
			</div>
		</div>
	</div>
</section>

<style>
	/* ── Bento Grid ── */
	.bento-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: 260px 260px;
		gap: 12px;
	}

	.bento-cell--large {
		grid-column: span 2;
		grid-row: span 2;
	}
	.bento-cell--medium {
		grid-column: span 1;
		grid-row: span 1;
	}
	.bento-cell--wide {
		grid-column: span 2;
		grid-row: span 1;
	}

	.bento-cell {
		position: relative;
		overflow: hidden;
		border-radius: 4px;
	}

	.bento-cell:hover .bento-media {
		transform: scale(1.05);
	}

	.bento-media {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
		background-color: #f5f5f5;
	}

	@media (max-width: 1024px) {
		.bento-grid {
			grid-template-columns: repeat(2, 1fr);
			grid-template-rows: auto;
		}
		.bento-cell--large {
			grid-column: span 2;
			grid-row: span 1;
			min-height: 300px;
		}
		.bento-cell--wide {
			grid-column: span 2;
		}
		.bento-cell--medium {
			min-height: 220px;
		}
	}

	@media (max-width: 640px) {
		.bento-grid {
			grid-template-columns: 1fr;
		}
		.bento-cell--large,
		.bento-cell--wide {
			grid-column: span 1;
		}
		.bento-cell {
			min-height: 200px;
		}
	}
</style>
