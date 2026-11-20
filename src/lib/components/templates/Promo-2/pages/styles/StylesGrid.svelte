<script lang="ts">
	import ContentText from '$lib/components/templates/Promo-2/ContentText.svelte';
	// Артикул: 2.4.2.1 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { getContext } from 'svelte';
	import { editStore } from '$lib/stores/edit.svelte';
	import {
		EDITABLE_VISIBILITY_CONTEXT,
		HIDDEN_EDITABLE_FIELDS_KEY,
		type EditableVisibility
	} from '$lib/utils/editable-visibility.svelte';
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

	let visible = $state(false);

	const defaultStyles = [
		{
			id: 'modern',
			name: 'Современный',
			description:
				'Чистые линии, минимализм, интегрированная техника и матовые текстуры для создания идеального пространства',
			image: 'https://storage.yandexcloud.net/zovtop/stiles/sovremjknvndgvhj.jpg',
			tags: ['Минимализм', 'Hi-Tech', 'Матовость']
		},
		{
			id: 'classic',
			name: 'Классика',
			description:
				'Традиционные формы, резные фасады, обилие дерева и теплые оттенки для уюта и респектабельности',
			image: 'https://storage.yandexcloud.net/zovtop/stiles/claskjdgnbkdgmj.jpg',
			tags: ['Дерево', 'Резьба', 'Патина']
		},
		{
			id: 'loft',
			name: 'Лофт',
			description:
				'Индустриальный шик: бетон, кирпич, металл и брутальные формы, создающие стильное современное пространство',
			image: 'https://storage.yandexcloud.net/zovtop/stiles/loftelkjbngrtobnhekrjthbn.jpg',
			tags: ['Бетон', 'Металл', 'Брутальность']
		},
		{
			id: 'minimalist',
			name: 'Минимализм',
			description:
				'Лаконичность, строгая геометрия форм без лишних деталей, нейтральная палитра для создания просторного интерьера',
			image: 'https://storage.yandexcloud.net/zovtop/stiles/minimkjfvnfsjnvk.jpg',
			tags: ['Лаконичность', 'Геометрия', 'Пространство']
		},
		{
			id: 'modern2',
			name: 'Модерн',
			description:
				'Плавные линии, элегантная асимметрия, сочетание природных мотивов и современных материалов в каждой детали',
			image: 'https://storage.yandexcloud.net/zovtop/stiles/modernlkthetrlkmjkdrythk.jpg',
			tags: ['Плавные линии', 'Элегантность', 'Природа']
		},
		{
			id: 'retro',
			name: 'Ретро',
			description:
				'Винтажный шарм, смелые цветовые акценты, стилизованная техника и эстетика, отсылающая к ярким эпохам прошлого',
			image: 'https://storage.yandexcloud.net/zovtop/stiles/retrofmsjvbjksdfvbnjksdjds.jpg',
			tags: ['Винтаж', 'Акценты', 'Стилизация']
		},
		{
			id: 'neoclassic',
			name: 'Неоклассика',
			description:
				'Изящное сочетание традиционных элементов с современными материалами и светлыми интерьерными тонами',
			image: 'https://storage.yandexcloud.net/zovtop/stiles/neokjewtgniertwjv.jpg',
			tags: ['Изящность', 'Мрамор', 'Светлые тона']
		},
		{
			id: 'scandinavian',
			name: 'Скандинавский',
			description:
				'Максимум света и пространства, натуральные материалы, светлое дерево и функциональный лаконичный дизайн',
			image: 'https://storage.yandexcloud.net/zovtop/stiles/scandkjbfvkjsdenbkj.jpg',
			tags: ['Свет', 'Уют', 'Функциональность']
		},
		{
			id: 'provence',
			name: 'Прованс',
			description:
				'Французский кантри с пастельными тонами, винтажной фурнитурой и домашним теплом',
			image: 'https://storage.yandexcloud.net/zovtop/stiles/provanjvngkjenbkjrn.jpg',
			tags: ['Кантри', 'Винтаж', 'Уют']
		}
	];

	const styles = $derived(
		Array.isArray(data?.styles) && (data.styles as unknown[]).length > 0
			? (data.styles as typeof defaultStyles)
			: defaultStyles
	);

	const visibility = getContext<EditableVisibility | null>(EDITABLE_VISIBILITY_CONTEXT);
	let savingCard = $state<number | null>(null);
	let saveError = $state<{ card: number; message: string } | null>(null);
	const canEditTags = $derived(isEditable && !!editContext);
	const tagControlsDisabled = $derived(
		savingCard !== null || !!editStore.activeField || !!visibility?.isPending('styles')
	);

	async function changeTags(card: number, removeIndex?: number) {
		if (!canEditTags || !editContext || tagControlsDisabled) return;

		const tags = styles[card].tags ?? [];
		const nextTags =
			removeIndex === undefined
				? [...tags, 'Новая метка']
				: tags.filter((_, index) => index !== removeIndex);
		const updated: Record<string, unknown> = {
			...data,
			styles: styles.map((style, index) => (index === card ? { ...style, tags: nextTags } : style))
		};

		const hiddenFields = data[HIDDEN_EDITABLE_FIELDS_KEY];
		if (removeIndex !== undefined && Array.isArray(hiddenFields)) {
			const prefix = `styles.${card}.tags.`;
			// Ключи видимости привязаны к позиции метки в сохранённом списке.
			updated[HIDDEN_EDITABLE_FIELDS_KEY] = hiddenFields.flatMap((key) => {
				if (typeof key !== 'string' || !key.startsWith(prefix)) return [key];
				const index = Number(key.slice(prefix.length));
				if (index === removeIndex) return [];
				return [index > removeIndex ? `${prefix}${index - 1}` : key];
			});
		}

		savingCard = card;
		saveError = null;
		try {
			const id = await saveComponentData(editContext, 'StylesGrid', updated);
			if (!id) throw new Error('Сервер не подтвердил сохранение. Повторите попытку.');
			data = updated;
		} catch {
			saveError = { card, message: 'Не удалось сохранить метки. Повторите попытку.' };
		} finally {
			savingCard = null;
		}
	}

	function observeSection(section: HTMLElement) {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) visible = true;
				});
			},
			{ threshold: 0.1 }
		);
		observer.observe(section);
		return () => observer.disconnect();
	}
</script>

{#snippet removeTagSettings(card: number, tagIndex: number)}
	<button
		type="button"
		aria-label={`Удалить метку ${tagIndex + 1}`}
		title="Удалить метку"
		disabled={tagControlsDisabled}
		onclick={() => changeTags(card, tagIndex)}
		data-goal-ignore="удаление метки в редакторе"
		class="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-border-light text-secondary hover:border-secondary focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-default disabled:opacity-50"
	>
		<svg class="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d="m6 6 12 12M18 6 6 18"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
			/>
		</svg>
	</button>
{/snippet}

{#snippet addTagSettings(card: number)}
	<button
		type="button"
		disabled={tagControlsDisabled}
		onclick={() => changeTags(card)}
		data-goal-ignore="добавление метки в редакторе"
		class="min-h-8 cursor-pointer rounded-sm border border-dashed border-border-light px-3 py-1 text-xs text-secondary hover:border-secondary focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-default disabled:opacity-50"
	>
		{savingCard === card ? 'Сохраняем…' : 'Добавить метку'}
	</button>
{/snippet}

{#snippet tagErrorSettings(card: number)}
	{#if canEditTags && saveError?.card === card}
		<p class="mt-2 text-prose text-secondary" role="alert">{saveError.message}</p>
	{/if}
{/snippet}

<section id="styles-grid" class="p2-container mx-auto py-20" {@attach observeSection}>
	<div class="grid grid-cols-1 gap-12 md:grid-cols-2 lg:gap-16">
		{#each styles as style, i (i)}
			<div
				class="group flex cursor-pointer flex-col opacity-0"
				class:animate-fade-up={visible}
				style="animation-delay: {0.1 + i * 0.07}s"
			>
				<!-- Image container -->
				<div
					class="relative mb-6 aspect-[4/3] overflow-hidden rounded-sm bg-surface-muted transition-shadow duration-500 group-hover:shadow-elevated"
				>
					<ImageFallback
						imagePath={['styles', i, 'image']}
						imageDefaults={{ styles }}
						imageRole={savingCard !== null ? 'preview' : undefined}
						loading="lazy"
						src={style.image}
						alt={style.name}
						class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
					/>
					<!-- Subtle Hover Overlay -->
					<div
						class="absolute inset-0 bg-black/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
					></div>
				</div>

				<!-- Content -->
				<div class="flex flex-grow flex-col text-center">
					<h2
						class="mb-3 text-subsection-title text-primary transition-colors group-hover:text-secondary"
						style="font-family: var(--font-heading);"
					>
						<ContentText
							bind:data
							{editContext}
							isEditable={isEditable && savingCard === null}
							componentType="StylesGrid"
							path={['styles', styles.indexOf(style), 'name']}
							fallback={style.name}
							label="Заголовок"
							defaults={{ styles }}
						/>
					</h2>
					<p class="mb-6 line-clamp-3 text-prose text-secondary">
						<ContentText
							bind:data
							{editContext}
							isEditable={isEditable && savingCard === null}
							componentType="StylesGrid"
							path={['styles', styles.indexOf(style), 'description']}
							fallback={style.description}
							label="Описание"
							defaults={{ styles }}
							multiline
						/>
					</p>

					<div class="mt-auto flex flex-wrap justify-center gap-2" class:items-center={canEditTags}>
						{#each style.tags ?? [] as tag, tagIndex (tagIndex)}
							<span class={canEditTags ? 'inline-flex items-center gap-1' : 'contents'}>
								<span
									class="rounded-sm border border-border-light bg-transparent px-3 py-1 text-xs text-muted transition-colors group-hover:border-secondary/40 group-hover:text-secondary"
								>
									<ContentText
										bind:data
										{editContext}
										isEditable={isEditable && savingCard === null}
										componentType="StylesGrid"
										path={['styles', i, 'tags', tagIndex]}
										fallback={tag}
										label="Метка"
										defaults={{ styles }}
									/>
								</span>
								{#if canEditTags}
									{@render removeTagSettings(i, tagIndex)}
								{/if}
							</span>
						{/each}
						{#if canEditTags}
							{@render addTagSettings(i)}
						{/if}
					</div>
					{@render tagErrorSettings(i)}
				</div>
			</div>
		{/each}
	</div>
</section>
