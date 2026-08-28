<script lang="ts">
	import ProjectsFeedV1 from './v1/ProjectsFeed.svelte';
	import ProjectsFeedV2 from './v2/ProjectsFeed.svelte';
	import VersionSwitcher from '$lib/components/VersionSwitcher.svelte';
	import { fly } from 'svelte/transition';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: any;
		isEditable?: boolean;
	} = $props();

	// Версию читаем сразу при инициализации, а не только в $effect: на сервере
	// эффекты не выполняются, и SSR отдавал бы v1 независимо от данных —
	// на живых сайтах это давало подмену версии после гидратации, а каталог
	// /_ds (пререндер) вообще не смог бы показать ничего, кроме v1.
	let selectedVersion = $state<'v1' | 'v2' | 'disabled'>(
		(data?.projectsFeedVersion as 'v1' | 'v2' | 'disabled') ?? 'v1'
	);
</script>

<!--
	Блок 1.26.2. Единственный на странице, у кого есть содержимое, и
	единственный, кто своим содержимым НЕ владеет: работы приходят из каталога,
	а правит их тенант в карточке проекта. Поэтому `isEditable` уходит только
	сюда, в переключатель, и ни одна версия его не получает — редактировать
	внутри блока нечего. Разбор — в ./data.ts.
-->
{#if selectedVersion !== 'disabled' || isEditable}
	<div
		class="relative w-full overflow-hidden {selectedVersion === 'disabled'
			? 'opacity-40 grayscale'
			: ''}"
	>
		<!-- Встраиваемый переключатель версий -->
		<VersionSwitcher
			bind:data
			{editContext}
			{isEditable}
			componentType="ProjectsFeed"
			versionKey="projectsFeedVersion"
			themeVersions={['v1', 'v2']}
			themeDefault="light"
			title="Лента проектов"
			bind:selectedVersion
		/>

		{#if selectedVersion === 'disabled'}
			<!-- Информационная плашка "Компонент отключен" -->
			<div
				class="absolute inset-0 z-40 flex items-center justify-center bg-ink-950/20 backdrop-blur-[2px]"
			>
				<div
					class="mx-4 flex max-w-sm flex-col items-center gap-3 rounded-2xl border border-brand-500/30 bg-ink-900/90 px-6 py-4 text-center shadow-2xl select-none"
				>
					<div
						class="flex items-center gap-2 text-xs font-bold tracking-wider text-brand-400 uppercase"
					>
						<span class="h-2.5 w-2.5 animate-pulse rounded-full bg-brand-500"></span>
						Блок отключен
					</div>
					<p class="text-[11px] font-medium text-ink-400">
						Этот блок не будет отображаться для обычных (не авторизованных) пользователей.
					</p>
				</div>
			</div>
		{/if}

		<!-- Динамический рендеринг выбранного компонента с эффектом слайдера -->
		{#if selectedVersion === 'v2'}
			<div class="w-full" in:fly={{ x: 1200, duration: 600 }} out:fly={{ x: 1200, duration: 600 }}>
				<ProjectsFeedV2 bind:data />
			</div>
		{:else}
			<div
				class="w-full"
				in:fly={{ x: -1200, duration: 600 }}
				out:fly={{ x: -1200, duration: 600 }}
			>
				<ProjectsFeedV1 bind:data />
			</div>
		{/if}
	</div>
{/if}
