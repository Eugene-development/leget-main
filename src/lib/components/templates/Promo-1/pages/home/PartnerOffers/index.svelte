<script lang="ts">
	import PartnerOffersV1 from './v1/PartnerOffers.svelte';
	import VersionSwitcher from '$lib/components/VersionSwitcher.svelte';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: any;
		isEditable?: boolean;
	} = $props();

	// Версию читаем сразу при инициализации, а не в $effect: на сервере эффекты
	// не выполняются, и SSR отдавал бы v1 независимо от данных.
	let selectedVersion = $state<'v1' | 'disabled'>(
		(data?.partnerOffersVersion as 'v1' | 'disabled') ?? 'v1'
	);
</script>

{#if selectedVersion !== 'disabled' || isEditable}
	<div
		class="relative w-full overflow-hidden {selectedVersion === 'disabled'
			? 'opacity-40 grayscale'
			: ''}"
	>
		<!-- Версия одна, поэтому `versions` задан явно: дефолт свитчера — ['v1','v2'],
		     и без этого он предложил бы несуществующую вторую. -->
		<VersionSwitcher
			bind:data
			{editContext}
			{isEditable}
			componentType="PartnerOffers"
			versionKey="partnerOffersVersion"
			versions={['v1']}
			themeVersions={['v1']}
			themeDefault="dark"
			title="Спецпредложения партнёров"
			bind:selectedVersion
		/>

		{#if selectedVersion === 'disabled'}
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
					<!-- `text-xs`, а не `text-[11px]`, как в остальных копиях этой плашки:
					     11px мимо шкалы кеглей. Сама плашка продублирована в каждом
					     `index.svelte` и просится в общий компонент — отдельная задача. -->
					<p class="text-xs font-medium text-ink-400">
						Этот блок не будет отображаться для обычных (не авторизованных) пользователей.
					</p>
				</div>
			</div>
		{/if}

		<div class="w-full">
			<PartnerOffersV1 bind:data {editContext} {isEditable} />
		</div>
	</div>
{/if}
