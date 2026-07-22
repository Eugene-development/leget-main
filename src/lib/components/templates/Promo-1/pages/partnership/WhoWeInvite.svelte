<script lang="ts">
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

	async function saveField(field: string, value: unknown) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'WhoWeInvite', updated);
		data = updated;
	}

	const defaultCards = [
		{ title: 'Дизайнеры', text: 'Реализуйте ваши проекты с качественной мебелью. Получайте вознаграждение за каждый заказ.', color: 'violet' },
		{ title: 'Ремонтные бригады', text: 'После ремонта клиенты покупают мебель и технику. Рекомендуйте нас и повышайте ваш доход.', color: 'amber' },
		{ title: 'Продавцы мебели', text: 'Передавайте заказы на мебель, которой нет у вас в ассортименте. Расширьте ваши возможности.', color: 'emerald' },
		{ title: 'Физ. лица', text: 'Рекомендуйте нас друзьям и знакомым. Получайте вознаграждение от суммы каждого заказа.', color: 'sky' },
	];

	const colorMap: Record<string, { bg: string; icon: string; dot: string }> = {
		violet:  { bg: 'from-violet-100 to-purple-100',  icon: 'from-violet-500 to-purple-600 shadow-violet-500/25',  dot: 'bg-violet-500' },
		amber:   { bg: 'from-amber-100 to-orange-100',   icon: 'from-amber-500 to-orange-600 shadow-amber-500/25',    dot: 'bg-amber-500' },
		emerald: { bg: 'from-emerald-100 to-teal-100',   icon: 'from-emerald-500 to-teal-600 shadow-emerald-500/25',  dot: 'bg-emerald-500' },
		sky:     { bg: 'from-sky-100 to-blue-100',       icon: 'from-sky-500 to-blue-600 shadow-sky-500/25',          dot: 'bg-sky-500' },
	};

	async function updateCard(index: number, field: string, value: string) {
		if (!editContext) return;
		const updatedCards = [...cards];
		updatedCards[index] = { ...updatedCards[index], [field]: value };
		await saveField('cards', updatedCards);
	}

	const cards = $derived(
		Array.isArray(data?.cards) && (data.cards as unknown[]).length > 0
			? (data.cards as typeof defaultCards)
			: defaultCards
	);
</script>

<div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
	<div class="text-center">
		<EditableField
			fieldKey="WhoWeInvite.title"
			label="Заголовок"
			value={String(data?.title ?? 'Кого мы приглашаем')}
			{isEditable}
			onSave={(v) => saveField('title', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<h2 class="text-4xl font-bold text-slate-900">{displayValue}</h2>
			{/snippet}
		</EditableField>
		<EditableField
			fieldKey="WhoWeInvite.subtitle"
			label="Подзаголовок"
			value={String(data?.subtitle ?? 'Партнёрство для профессионалов в сфере интерьера и ремонта')}
			{isEditable}
			onSave={(v) => saveField('subtitle', v)}
			class="mt-4 block"
		>
			{#snippet children(displayValue)}
				<p class="mx-auto mt-4 max-w-2xl text-slate-600">{displayValue}</p>
			{/snippet}
		</EditableField>
	</div>

	<div class="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
		{#each cards as card, i}
			{@const c = colorMap[card.color] ?? colorMap.sky}
			<div class="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
				<div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-linear-to-br {c.bg} opacity-50 transition-transform duration-300 group-hover:scale-150"></div>
				<div class="relative">
					<div class="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br {c.icon} text-white shadow-lg">
						<svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
					</div>
					<h3 class="mt-6 text-xl font-bold text-slate-900">
						<EditableField 
							fieldKey="WhoWeInvite.{i}.title" 
							label="Заголовок" 
							value={card.title} 
							{isEditable} 
							inline 
							onSave={(v) => updateCard(i, 'title', v)}
						>
							{#snippet children(val)}{val}{/snippet}
						</EditableField>
					</h3>
					<p class="mt-3 text-slate-600">
						<EditableField 
							fieldKey="WhoWeInvite.{i}.text" 
							label="Описание" 
							value={card.text} 
							{isEditable} 
							inline 
							onSave={(v) => updateCard(i, 'text', v)}
						>
							{#snippet children(val)}{val}{/snippet}
						</EditableField>
					</p>
				</div>
			</div>
		{/each}
	</div>

	<div class="mt-12 text-center">
		<EditableField
			fieldKey="WhoWeInvite.platformText"
			label="Текст о платформе"
			value={String(data?.platformText ?? 'Профессиональная платформа для автоматизации партнёрских продаж: регистрируйте новые заказы, отслеживайте статус реализации проектов в реальном времени и управляйте начислениями бонусов через единую прозрачную систему.')}
			{isEditable}
			multiline
			onSave={(v) => saveField('platformText', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<p class="mb-6 mx-auto max-w-2xl text-slate-600 leading-relaxed">{displayValue}</p>
			{/snippet}
		</EditableField>
		<EditableField
			fieldKey="WhoWeInvite.platformUrl"
			label="Ссылка на платформу"
			value={String(data?.platformUrl ?? '')}
			{isEditable}
			onSave={(v) => saveField('platformUrl', v)}
			class="inline-block"
		>
			{#snippet children(displayValue)}
				{#if displayValue}
					<a
						href={displayValue}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-red-500 to-red-600 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
					>
						<EditableField
							fieldKey="WhoWeInvite.platformButtonText"
							label="Текст кнопки платформы"
							value={String(data?.platformButtonText ?? 'Перейти на платформу')}
							{isEditable}
							onSave={(v) => saveField('platformButtonText', v)}
							class="inline"
						>
							{#snippet children(btnText)}
								{btnText}
							{/snippet}
						</EditableField>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
						</svg>
					</a>
				{/if}
			{/snippet}
		</EditableField>
	</div>
</div>
