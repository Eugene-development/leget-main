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

	const brands = $derived(
		Array.isArray(data?.brands)
			? (data.brands as { name: string; logo: string; url: string }[])
			: [
					{ name: 'Hettich', logo: 'https://storage.yandexcloud.net/novostroy/logo/hettich-Logo.png', url: 'https://www.hettich.com' },
					{ name: 'Egger',   logo: 'https://storage.yandexcloud.net/novostroy/logo/egger-Logo.png',   url: 'https://www.egger.com'   },
					{ name: 'Аристо',  logo: 'https://storage.yandexcloud.net/novostroy/logo/aristo-Logo.png',  url: 'https://www.aristo.ru'   },
					{ name: 'Blum',    logo: 'https://storage.yandexcloud.net/novostroy/logo/blum-Logo.png',    url: 'https://www.blum.com'    },
				]
	);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'HeroMain', updated);
		data = updated;
	}
</script>

<section class="relative w-full min-h-screen flex items-start justify-center pt-8 md:pt-10 overflow-hidden text-gray-900">
	<!-- Фоновое изображение -->
	<div class="absolute inset-0 z-0">
		<img
			src={String(data?.bgImage ?? 'https://storage.yandexcloud.net/novostroy/bg/hero-2.jpg')}
			alt="Фоновое изображение"
			class="w-full h-full object-cover"
		/>
		<div class="absolute inset-0 bg-linear-to-b from-black/20 via-black/10 to-black/30"></div>
	</div>

	<!-- Основной контент -->
	<div class="relative z-10 w-full max-w-4xl px-4 py-8 md:px-8 md:py-16 xl:px-4 xl:py-16">
		<!-- Стеклянная панель -->
		<div class="glass-panel w-full rounded-3xl border border-white/40 shadow-2xl overflow-hidden flex flex-col items-center">
			<!-- Контент -->
			<div class="px-6 py-12 md:px-12 md:py-14 text-center max-w-3xl mx-auto flex flex-col items-center">
				<!-- Логотип -->
				{#if data?.logoUrl || isEditable}
					<div class="mb-8 w-32 md:w-48">
						<EditableField
							fieldKey="HeroMain.logoUrl"
							label="Логотип (URL)"
							value={String(data?.logoUrl ?? '')}
							{isEditable}
							onSave={(v) => saveField('logoUrl', v)}
							class="block"
						>
							{#snippet children(displayValue)}
								{#if displayValue}
									<img
										src={displayValue || 'https://storage.yandexcloud.net/novostroy/logo/promo-1-logo.png'}
										alt={String(data?.logoAlt ?? 'Логотип')}
										class="relative w-full rounded-2xl object-contain"
									/>
								{:else if isEditable}
									<div class="border-2 border-dashed border-slate-400/30 rounded-2xl p-6 text-xs font-bold uppercase tracking-widest text-slate-500/50 backdrop-blur-sm bg-white/10">
										Логотип
									</div>
								{/if}
							{/snippet}
						</EditableField>
					</div>
				{/if}

				<!-- Название компании -->
				<EditableField
					fieldKey="HeroMain.companyName"
					label="Название компании"
					value={String(data?.companyName ?? '')}
					{isEditable}
					onSave={(v) => saveField('companyName', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<span class="md:text-sm text-xs font-semibold text-slate-600 uppercase tracking-[0.5em] mb-6">
							{displayValue}
						</span>
					{/snippet}
				</EditableField>

				<!-- Заголовок -->
				<EditableField
					fieldKey="HeroMain.title"
					label="Заголовок"
					value={String(data?.title ?? '')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h1 class="text-3xl md:text-5xl lg:text-7xl font-extrabold text-slate-900 leading-none mb-6">
							{displayValue}
						</h1>
					{/snippet}
				</EditableField>

				<!-- Описание -->
				<EditableField
					fieldKey="HeroMain.description"
					label="Описание"
					value={String(data?.description ?? '')}
					{isEditable}
					multiline
					onSave={(v) => saveField('description', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<p class="text-sm md:text-lg text-slate-800 max-w-2xl mx-auto mb-12 font-medium hero-description">
							{displayValue}
						</p>
					{/snippet}
				</EditableField>

				<!-- Кнопка -->
				<div class="flex flex-col-reverse md:flex-row items-center justify-center gap-6 md:gap-16 w-full md:w-auto">
					<EditableField
						fieldKey="HeroMain.buttonText"
						label="Текст кнопки"
						value={String(data?.buttonText ?? 'Бесплатный дизайн-проект с расчётом стоимости')}
						{isEditable}
						onSave={(v) => saveField('buttonText', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<a
								href={String(data?.buttonHref ?? '/contact')}
								class="bg-transparent text-slate-900 border border-slate-900/40 font-semibold text-base py-4 px-10 rounded-xl cursor-pointer shadow-sm transition-all duration-300 ease-out hover:bg-white/80 hover:border-transparent hover:shadow-xl hover:-translate-y-0.5"
							>
								{displayValue}
							</a>
						{/snippet}
					</EditableField>
				</div>
			</div>

			<!-- Разделитель -->
			<div class="w-full flex justify-center px-6 md:px-12">
				<div class="w-full max-w-xl h-px bg-slate-300/50"></div>
			</div>

			<!-- Секция брендов -->
			<div class="w-full flex px-6 pb-8 md:px-12 md:pb-12 pt-8 justify-center">
				<div class="w-full flex flex-col items-center">
					<p class="hidden md:block text-xs text-slate-700 mb-8 font-semibold uppercase tracking-widest">
						РАБОТАЕМ С ЛУЧШИМИ БРЕНДАМИ:
					</p>
					<div class="w-full flex flex-row justify-center gap-6 md:grid md:grid-cols-4 md:gap-12 items-center">
						{#each brands as brand, i}
							<a
								href={brand.url}
								target="_blank"
								rel="noopener noreferrer"
								class="group px-2 h-10 flex items-center justify-center opacity-90 transition-all duration-300 hover:opacity-100 hover:-translate-y-0.5 {i >= 3 ? 'hidden md:flex' : ''}"
							>
								<img class="max-w-full max-h-full object-contain" src={brand.logo} alt={brand.name} />
							</a>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.glass-panel {
		background: linear-gradient(145deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.3) 100%);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
	}

	.hero-description {
		line-height: 1.6;
	}

	@media (min-width: 768px) {
		.hero-description {
			line-height: 1.8;
		}
	}
</style>
