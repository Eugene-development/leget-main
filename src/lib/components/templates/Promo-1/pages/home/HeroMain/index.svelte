<script lang="ts">
	import HeroV1 from './v1/HeroMain.svelte';
	import HeroV2 from './v2/HeroMain.svelte';
	import HeroV3 from './v3/HeroMain.svelte';
	import HeroV4 from './v4/HeroMain.svelte';
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
	let selectedVersion = $state<'v1' | 'v2' | 'v3' | 'v4' | 'disabled'>(
		(data?.heroVersion as 'v1' | 'v2' | 'v3' | 'v4' | 'disabled') ?? 'v1'
	);
</script>

{#if selectedVersion !== 'disabled' || isEditable}
	<div
		class="hero-wrapper relative w-full overflow-hidden {selectedVersion === 'disabled'
			? 'opacity-40 grayscale'
			: ''}"
	>
		<!-- Встраиваемый переключатель версий -->
		<VersionSwitcher
			bind:data
			{editContext}
			{isEditable}
			componentType="HeroMain"
			versionKey="heroVersion"
			versions={['v1', 'v2', 'v3', 'v4']}
			themeVersions={['v2', 'v3', 'v4']}
			themeDefault="dark"
			title="Главный экран"
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
		{#if selectedVersion === 'v4'}
			<div
				class="relative h-auto w-full lg:absolute lg:inset-0 lg:h-full"
				in:fly={{ x: 500, y: 500, duration: 600 }}
				out:fly={{ x: -500, y: -500, duration: 600 }}
			>
				<HeroV4 bind:data {editContext} {isEditable} />
			</div>
		{:else if selectedVersion === 'v3'}
			<div
				class="relative h-auto w-full lg:absolute lg:inset-0 lg:h-full"
				in:fly={{ y: 800, duration: 600 }}
				out:fly={{ y: -800, duration: 600 }}
			>
				<HeroV3 bind:data {editContext} {isEditable} />
			</div>
		{:else if selectedVersion === 'v2'}
			<div
				class="relative h-auto w-full lg:absolute lg:inset-0 lg:h-full"
				in:fly={{ x: 1200, duration: 600 }}
				out:fly={{ x: -1200, duration: 600 }}
			>
				<HeroV2 bind:data {editContext} {isEditable} />
			</div>
		{:else}
			<div
				class="relative h-auto w-full lg:absolute lg:inset-0 lg:h-full"
				in:fly={{ x: -1200, duration: 600 }}
				out:fly={{ x: 1200, duration: 600 }}
			>
				<HeroV1 bind:data {editContext} {isEditable} />
			</div>
		{/if}
	</div>
{/if}

<style>
	/* Hero занимает ровно видимый viewport минус высоту баннера + хедера.
	   --banner-h задаётся Banner.svelte, --header-h — Header.svelte (оба через ResizeObserver).
	   Дефолты (--banner-h: 36px, --header-h: 72px) прописаны в layout.css для SSR
	   и исключают флеш при гидратации.

	   `display: flex` — не для раскладки (внутри всегда ровно один элемент в
	   потоке, тумблер версий уже `absolute`), а чтобы отдать этому элементу
	   реальную высоту. На lg+ он сам `lg:absolute lg:inset-0 lg:h-full` и
	   получает высоту через inset независимо от родителя. На мобильном он
	   остаётся в потоке с `min-h-full` — а `min-height: 100%` резолвится
	   только когда высота родителя «определена», чего один `min-height` на
	   `.hero-wrapper` не даёт (spec: у родителя без `height` она класса auto,
	   т.е. не задана явно, — даже если `min-height` фактически растянул бокс).
	   Без флекса секция на мобильном схлопывалась до высоты контента, а
	   `.hero-wrapper` всё равно держал полный calc(), и разница проступала
	   пустым полем под карточкой — ровно перед следующим блоком страницы.
	   Флекс-контейнер решает это иначе: он растягивает единственный
	   in-flow-элемент (`align-items: stretch` по умолчанию) на итоговую
	   высоту контейнера, какой бы она ни была — calc() или больше, если
	   контенту нужно место (min-height остаётся полом, не потолком).

	   Направление намеренно НЕ column: у row поперечная (растягиваемая
	   `align-items: stretch`) ось — вертикальная, ровно та, что нужна.
	   У column поперечная ось горизонтальная — растянула бы ширину, а
	   высоту оставила бы по контенту, то есть саму дыру, которую чиним. */
	.hero-wrapper {
		display: flex;
		min-height: calc(100dvh - var(--banner-h, 36px) - var(--header-h, 72px));
	}
</style>
