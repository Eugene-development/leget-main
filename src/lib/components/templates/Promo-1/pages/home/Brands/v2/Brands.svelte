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
		Array.isArray(data?.brands) && data.brands.length > 0
			? (data.brands as { name: string; logo: string; country: string; description: string }[])
			: [
					{ name: 'BLUM',    logo: 'https://storage.yandexcloud.net/novostroy/logo/blum-Logo.png',    country: 'Австрия', description: 'Компания BLUM занимается производством премиальной мебельной фурнитуры'                                    },
					{ name: 'Hettich', logo: 'https://storage.yandexcloud.net/novostroy/logo/hettich-Logo.png', country: 'Германия', description: 'Бренд, специализирующийся на производстве мебельной фурнитуры высокого класса'                          },
					{ name: 'FGV',     logo: 'https://storage.yandexcloud.net/novostroy/logo/FGV-Logo.png',     country: 'Италия',  description: 'Компания, специализирующаяся на производстве систем выдвижения и мебельных петель'                       },
					{ name: 'Egger',   logo: 'https://storage.yandexcloud.net/novostroy/logo/egger-Logo.png',   country: 'Австрия', description: 'Производство плитных материалов различной толщины для каркасов и мебельных фасадов'                      },
					{ name: 'Renolit', logo: 'https://storage.yandexcloud.net/novostroy/logo/Renolit_logo.svg.png', country: 'Германия', description: 'Высококачественные полимерные пленки и термопластик для фасадов различного цвета'                 },
					{ name: 'GTV',     logo: 'https://storage.yandexcloud.net/novostroy/logo/GTV-Logo.png',     country: 'Польша',  description: 'Доступная и качественная мебельная фурнитура и освещение с доставкой по всему миру'                      },
				]
	);

	const partners = $derived(
		Array.isArray(data?.partners) && data.partners.length > 0
			? (data.partners as { name: string; logo: string; url: string }[])
			: [
					{ name: 'ЗОВ',            logo: 'https://storage.zovrus/brand/logo-rus-x2.png',                                                                                                                url: 'https://zov.top/'             },
					{ name: 'Стильные кухни', logo: 'https://avatars.mds.yandex.net/i?id=ada48033e9cfa95f38d69fc9ae7b5bcc25b72f13-5037427-images-thumbs&n=13',                                                                     url: 'https://www.stilkuhni.ru/'     },
					{ name: 'Мария',          logo: 'https://avatars.mds.yandex.net/i?id=b761d395235060d89bd5d574233ee6bca202edcb-2037526-images-thumbs&n=13',                                                                     url: 'https://www.marya.ru/'         },
					{ name: 'Мистер Дорс',    logo: 'https://avatars.mds.yandex.net/i?id=cf4673eacc853d6f062852c16c8f10af8dd28ace-7909006-images-thumbs&n=13',                                                                     url: 'https://www.mrdoors.ru/'       },
					{ name: 'Кухонный двор',  logo: 'https://avatars.mds.yandex.net/i?id=a74ec62d72576744e414d4b9ac3b0455aa296a51-4477047-images-thumbs&n=13',                                                                     url: 'https://www.kuxni.net/'        },
					{ name: 'Аристо',         logo: 'https://www.aristo.ru/include/logo_header.png',                                                                                                                               url: 'https://www.aristo.ru'         },
				]
	);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Brands', updated);
		data = updated;
	}
</script>

<section class="relative overflow-hidden bg-slate-950 py-20 sm:py-28 font-sans select-none text-white">
	<!-- Вспомогательные светящиеся бэкдропы -->
	<div class="absolute left-10 top-10 w-96 h-96 rounded-full bg-sky-500/5 blur-3xl pointer-events-none"></div>
	<div class="absolute right-10 bottom-10 w-96 h-96 rounded-full bg-violet-600/5 blur-3xl pointer-events-none"></div>

	<div class="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
		<!-- Заголовок -->
		<div class="mx-auto max-w-2xl text-center">
			<span class="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-300">
				<EditableField
					fieldKey="Brands.badge"
					label="Метка"
					value={String(data?.badge ?? 'Материалы')}
					{isEditable}
					onSave={(v) => saveField('badge', v)}
					class="inline"
				>
					{#snippet children(displayValue)}{displayValue}{/snippet}
				</EditableField>
			</span>
			<EditableField
				fieldKey="Brands.title"
				label="Заголовок"
				value={String(data?.title ?? 'Бренды, говорящие о качестве')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2 class="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl font-display leading-tight">{displayValue}</h2>
				{/snippet}
			</EditableField>
		</div>

		<!-- Карточки брендов (V2 Carbon Dark Glassmorphism) -->
		<div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each brands as brand}
				<div class="group rounded-3xl border border-white/5 bg-slate-900/30 p-6 transition-all duration-300 hover:border-sky-500/30 hover:bg-slate-900/50 hover:shadow-2xl hover:shadow-sky-500/5">
					<div class="flex items-center gap-4">
						<div class="p-2.5 rounded-2xl bg-white/5 border border-white/10 group-hover:border-sky-500/20 group-hover:bg-white/10 transition-all duration-300">
							<img class="h-8 w-auto filter brightness-0 invert" src={brand.logo} alt={brand.name} />
						</div>
						<div>
							<h3 class="font-bold text-white group-hover:text-sky-300 transition-colors duration-300">{brand.name}</h3>
							<p class="text-xs font-semibold uppercase tracking-wider text-slate-500 group-hover:text-slate-400 transition-colors duration-300">{brand.country}</p>
						</div>
					</div>
					<p class="mt-4 text-sm leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors duration-300">{brand.description}</p>
				</div>
			{/each}
		</div>

		<!-- Партнёры-производители -->
		<div class="mt-16 border-t border-white/10 pt-12">
			<p class="text-center text-xs font-bold uppercase tracking-widest text-slate-400">
				<EditableField
					fieldKey="Brands.partnersLabel"
					label="Подпись партнёров"
					value={String(data?.partnersLabel ?? 'Наши партнёры-производители')}
					{isEditable}
					onSave={(v) => saveField('partnersLabel', v)}
					inline
					class="inline"
				>
					{#snippet children(displayValue)}{displayValue}{/snippet}
				</EditableField>
			</p>
			
			<!-- Минималистичная карусель партнеров на V2 -->
			<div class="mt-10 grid grid-cols-3 items-center gap-8 sm:grid-cols-6">
				{#each partners as partner}
					<a href={partner.url} target="_blank" rel="noopener noreferrer" class="group flex items-center justify-center">
						<img
							class="h-10 w-auto opacity-40 grayscale filter brightness-0 invert transition-all duration-300 group-hover:opacity-100 group-hover:scale-105 group-hover:filter group-hover:brightness-100 group-hover:invert-0"
							src={partner.logo}
							alt={partner.name}
						/>
					</a>
				{/each}
			</div>

			{#if data?.partnersNote}
				<div class="mt-12 text-center">
					<p class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2 text-xs font-semibold uppercase tracking-wider text-slate-300 backdrop-blur-md">
						{String(data.partnersNote)}
					</p>
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&display=swap');

	.font-display {
		font-family: 'Outfit', sans-serif;
	}
</style>
