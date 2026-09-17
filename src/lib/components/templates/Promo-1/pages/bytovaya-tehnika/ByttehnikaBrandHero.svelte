<script lang="ts">
	// Артикул: 1.28.2.1 — см. docs/architecture/component-articles-map.md
	//
	// Шапка страницы бренда (/bytovaya-tehnika/{brand}). Заголовок и описание
	// приезжают из справочника: RenderPage кладёт в `data` строку бренда, как
	// MebelCategoryHero получает свою категорию. Правки инлайн сохраняются в
	// блок страницы и с этого момента побеждают справочник — так же, как у
	// остальных блоков рубрики.
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { serviceOrderStore } from '$lib/stores/serviceOrder.svelte';
	import '../../theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: any;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	const title = $derived(String(data.title || 'Бренд'));
	const logo = $derived(String(data.logo || ''));

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'ByttehnikaBrandHero', updated);
		data = updated;
	}
</script>

<div class="p1-catalog-container mt-16">
	<section
		class="relative isolate overflow-hidden rounded-3xl bg-linear-to-br from-ink-950 via-ink-900 to-ink-800 shadow-[0_24px_60px] shadow-scrim/30"
		data-p1-theme="dark"
	>
		<div
			class="pointer-events-none absolute -top-28 right-1/4 size-80 rounded-full bg-ink-700/35 blur-3xl"
			aria-hidden="true"
		></div>
		<div
			class="pointer-events-none absolute -right-24 -bottom-36 size-96 rounded-full bg-surface-raised/8 blur-3xl"
			aria-hidden="true"
		></div>

		<div
			class="relative grid min-h-[360px] items-stretch lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]"
		>
			<div class="flex flex-col justify-center px-8 py-10 sm:px-12 sm:py-14 lg:px-14 lg:py-16">
				<nav class="p1-muted mb-7 flex flex-wrap items-center gap-2 text-sm">
					<a href="/" class="transition-colors hover:text-on-dark">Главная</a>
					<span aria-hidden="true">/</span>
					<a href="/bytovaya-tehnika" class="transition-colors hover:text-on-dark"
						>Бытовая техника</a
					>
					<span aria-hidden="true">/</span>
					<span class="p1-title" aria-current="page">{title}</span>
				</nav>

				<h1 class="p1-title max-w-2xl text-3xl text-balance sm:text-4xl lg:text-5xl">
					<EditableField
						fieldKey="ByttehnikaBrandHero.title"
						label="Заголовок"
						value={title}
						{isEditable}
						inline
						onSave={(v) => saveField('title', v)}
					>
						{#snippet children(val)}<RichText value={val} />{/snippet}
					</EditableField>
				</h1>

				{#if data.description}
					<p class="p1-body mt-5 max-w-xl text-lg">
						<EditableField
							fieldKey="ByttehnikaBrandHero.description"
							label="Описание"
							value={String(data.description)}
							{isEditable}
							inline
							multiline
							onSave={(v) => saveField('description', v)}
						>
							{#snippet children(val)}<RichText value={val} />{/snippet}
						</EditableField>
					</p>
				{/if}

				<div class="mt-9 flex flex-wrap gap-4">
					<button
						data-metrika-goal="pages_bytovaya_tehnika_byttehnikabrandhero_open_1"
						data-goal-label="Консультация (текст кнопки настраивается)"
						data-goal-action="open"
						type="button"
						class="inline-flex items-center gap-2 rounded-lg bg-link-500 px-6 py-3 font-medium text-on-accent transition-all hover:bg-link-600"
						onclick={() => serviceOrderStore.open('consultation')}
					>
						<EditableField
							fieldKey="ByttehnikaBrandHero.buttonText"
							label="Текст кнопки"
							value={String(data.buttonText || 'Подобрать технику')}
							{isEditable}
							inline
							onSave={(v) => saveField('buttonText', v)}
						>
							{#snippet children(val)}<RichText value={val} />{/snippet}
						</EditableField>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 8l4 4m0 0l-4 4m4-4H3"
							/>
						</svg>
					</button>
				</div>
			</div>

			<div class="flex items-stretch p-5 sm:p-7 lg:p-8 lg:pl-0">
				<div
					class="group flex min-h-56 w-full items-center justify-center rounded-2xl bg-surface-raised px-8 py-10 text-ink-500 shadow-[0_20px_50px] shadow-scrim/35 sm:min-h-64 sm:px-12 lg:min-h-full"
				>
					{#if logo || isEditable}
						<div
							class="p1-logo-slot w-full max-w-md justify-center [--p1-logo-plate-pad:0px] [--p1-logo-slot:112px] sm:[--p1-logo-slot:136px]"
						>
							<ImageFallback
								imagePath={['logo']}
								src={logo}
								alt="Логотип {title}"
								class="p1-logo max-h-full max-w-full"
							/>
						</div>
					{:else}
						<span
							class="max-w-full text-center text-4xl font-semibold break-words text-ink-900 sm:text-5xl lg:text-6xl"
							aria-label="Логотип {title}"
						>
							{title}
						</span>
					{/if}
				</div>
			</div>
		</div>
	</section>
</div>
