<script lang="ts">
	// Артикулы: 1.28.5.1, 1.30.5.1, 1.31.5.1, 1.36.3.1, 1.37.3.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import '../../theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	const title = $derived(String(data.title || 'О бренде'));
	const description = $derived(String(data.description || ''));

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'BrandAbout', updated);
		data = updated;
	}
</script>

{#if title || description || isEditable}
	<section class="p1-catalog-container mt-6" data-p1-theme="light">
		<div
			class="quote-card relative isolate overflow-hidden rounded-3xl bg-linear-to-r from-ink-900 to-ink-800 shadow-[0_24px_60px] shadow-scrim/25"
		>
			<div class="quote-paper p1-paper pointer-events-none absolute inset-x-0 bottom-0"></div>

			<div class="quote-content relative z-10">
				<h2 class="text-4xl text-ink-900 sm:text-5xl lg:text-6xl">
					<EditableField
						fieldKey="BrandAbout.title"
						label="Заголовок"
						value={title}
						{isEditable}
						inline
						onSave={(value) => saveField('title', value)}
					>
						{#snippet children(value)}<RichText {value} />{/snippet}
					</EditableField>
				</h2>

				<div class="ds-prose p1-prose mt-7 max-w-[65ch] italic sm:mt-8">
					<EditableField
						fieldKey="BrandAbout.description"
						label="Описание бренда"
						value={description}
						isEditable={isEditable && !data.managedBrand}
						multiline
						onSave={(value) => saveField('description', value)}
						class="block"
					>
						{#snippet children(value)}
							<div class="ds-prose-content p1-body text-lg sm:text-xl">
								<RichText {value} />
							</div>
						{/snippet}
					</EditableField>
				</div>
			</div>
		</div>
	</section>
{/if}

<style>
	.quote-card {
		min-height: 24rem;
	}

	.quote-paper {
		top: 4rem;
		clip-path: polygon(0 0, 100% 4rem, 100% 100%, 0 100%);
	}

	.quote-content {
		max-width: 52rem;
		padding: 10rem 4rem 4rem;
	}

	@media (max-width: 639px) {
		.quote-card {
			min-height: 22rem;
		}

		.quote-paper {
			top: 3rem;
			clip-path: polygon(0 0, 100% 2.5rem, 100% 100%, 0 100%);
		}

		.quote-content {
			padding: 7.5rem 1.5rem 3rem;
		}
	}
</style>
