<script lang="ts">
	import ContactCTAV1 from './v1/ContactCTA.svelte';
	import ContactCTAV2 from './v2/ContactCTA.svelte';
	import VersionSwitcher from '$lib/components/VersionSwitcher.svelte';
	import { fly } from 'svelte/transition';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false,
		sitePhone = null
	}: {
		data: Record<string, unknown>;
		editContext?: any;
		isEditable?: boolean;
		sitePhone?: string | null;
	} = $props();

	// Версию читаем сразу при инициализации, а не только в $effect: на сервере
	// эффекты не выполняются, и SSR отдавал бы v1 независимо от данных —
	// на живых сайтах это давало подмену версии после гидратации, а каталог
	// /_ds (пререндер) вообще не смог бы показать ничего, кроме v1.
	let selectedVersion = $state<'v1' | 'v2' | 'disabled'>(
		(data?.contactCTAVersion as 'v1' | 'v2' | 'disabled') ?? 'v1'
	);
</script>

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
			componentType="ContactCTA"
			versionKey="contactCTAVersion"
			versions={['v1', 'v2']}
			themeVersions={['v1', 'v2']}
			themeDefault="dark"
			title="Призыв к действию"
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

		<!--
			Оба варианта лежат в одной grid-ячейке, поэтому во время перехода уходящий
			и приходящий блоки накладываются друг на друга, а не встают в поток.
		-->
		<div class="grid w-full">
			{#if selectedVersion === 'v2'}
				<div
					class="col-start-1 row-start-1 w-full"
					in:fly={{ x: 1200, duration: 600 }}
					out:fly={{ x: 1200, duration: 600 }}
				>
					<ContactCTAV2 bind:data {editContext} {isEditable} {sitePhone} />
				</div>
			{:else}
				<div
					class="col-start-1 row-start-1 w-full"
					in:fly={{ x: -1200, duration: 600 }}
					out:fly={{ x: -1200, duration: 600 }}
				>
					<ContactCTAV1 bind:data {editContext} {isEditable} {sitePhone} />
				</div>
			{/if}
		</div>
	</div>
{/if}
