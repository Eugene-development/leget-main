<script lang="ts">
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let { data = $bindable(), editContext = null, isEditable = false }: { data: Record<string, unknown>; editContext?: EditContext | null; isEditable?: boolean } = $props();

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'ServicesGrid', updated);
		data = updated;
	}

	const defaultServices = [
		{
			id: 'delivery',
			title: 'Доставка',
			description: 'Быстрая и бережная доставка плитки, сантехники и отделочных материалов прямо на объект. Работаем по городу и области, обеспечиваем сохранность груза.',
			icon: `<path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" /><rect x="9" y="11" width="14" height="10" rx="2" /><circle cx="12" cy="21" r="1" /><circle cx="20" cy="21" r="1" />`,
			features: ['Доставка в день заказа', 'Аккуратная погрузка и разгрузка', 'Отслеживание заказа в реальном времени'],
			ctaText: 'Заказать доставку',
			ctaLink: '/contacts',
		},
		{
			id: 'tiler',
			title: 'Плиточник',
			description: 'Профессиональная укладка плитки, керамогранита и мозаики. Опытные мастера с портфолио готовых объектов — ванные, кухни, прихожие, фасады.',
			icon: `<rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" />`,
			features: ['Укладка любого формата и сложности', 'Точная подрезка и стыковка', 'Гарантия на работы 2 года'],
			ctaText: 'Вызвать мастера',
			ctaLink: '/contacts',
		},
		{
			id: 'plumber',
			title: 'Сантехник',
			description: 'Монтаж и подключение сантехники: ванны, душевые кабины, унитазы, раковины, смесители. Качественные работы с соблюдением всех норм и стандартов.',
			icon: `<path d="M12 22v-5" /><path d="M9 8V2" /><path d="M15 8V2" /><path d="M18 8H2a6 6 0 0 0 6 6h1v4" />`,
			features: ['Монтаж под ключ', 'Замена старых трубопроводов', 'Выезд в день обращения'],
			ctaText: 'Вызвать сантехника',
			ctaLink: '/contacts',
		},
		{
			id: 'design',
			title: 'Дизайн интерьера',
			description: 'Разработка авторских дизайн-проектов: концепция, планировочное решение, подбор отделочных материалов, 3D-визуализация.',
			icon: `<path d="M2 13.5V20a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-6.5" /><path d="M2 13.5A2.5 2.5 0 0 1 4.5 11h15a2.5 2.5 0 0 1 2.5 2.5" /><path d="M8 11V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6" /><path d="M12 11V3" />`,
			features: ['3D-визуализация каждой комнаты', 'Подбор материалов под бюджет', 'Авторский надзор за ремонтом'],
			ctaText: 'Заказать проект',
			ctaLink: '/contacts',
		},
		{
			id: 'furniture',
			title: 'Подбор мебели',
			description: 'Помогаем выбрать мебель, которая гармонично впишется в интерьер: ванные комнаты, кухни, гостиные. Работаем с ведущими производителями по выгодным ценам.',
			icon: `<path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" /><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z" /><path d="M4 18v2" /><path d="M20 18v2" /><path d="M12 4v9" />`,
			features: ['Подбор под дизайн-проект', 'Каталог сотен коллекций', 'Доставка и сборка включены'],
			ctaText: 'Подобрать мебель',
			ctaLink: '/contacts',
		},
	];

	const services = $derived(Array.isArray(data?.services) && (data.services as unknown[]).length > 0 ? (data.services as typeof defaultServices) : defaultServices);
</script>

<section class="relative py-24 lg:py-32">
	<div class="px-10 lg:px-24 xl:px-32">
		<div class="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
			{#each services as service}
				<div class="group relative flex flex-col rounded-2xl border border-surface-700/50 bg-surface-800/40 p-8 transition-all duration-500 hover:border-accent-500/30 hover:bg-surface-800/70 hover:shadow-2xl hover:shadow-accent-500/5">
					<div class="mb-6 flex size-14 items-center justify-center rounded-xl border border-accent-500/20 bg-accent-500/10 transition-all duration-300 group-hover:border-accent-500/40 group-hover:bg-accent-500/15">
						<svg viewBox="0 0 24 24" class="size-7 fill-none stroke-accent-500 stroke-[1.5]" stroke-linecap="round" stroke-linejoin="round">
							{@html service.icon}
						</svg>
					</div>
					<h2 class="font-display text-2xl font-bold text-white transition-colors duration-300 group-hover:text-accent-500">{service.title}</h2>
					<p class="mt-4 flex-1 text-base leading-relaxed text-surface-300">{service.description}</p>
					<ul class="mt-6 space-y-2.5">
						{#each service.features as item}
							<li class="flex items-center gap-3 text-sm text-surface-300">
								<span class="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-500/15">
									<svg viewBox="0 0 12 12" class="size-3 fill-accent-500"><path fill-rule="evenodd" d="M9.854 3.146a.5.5 0 010 .708l-5 5a.5.5 0 01-.708 0l-2-2a.5.5 0 01.708-.708L4.5 7.793l4.646-4.647a.5.5 0 01.708 0z" clip-rule="evenodd" /></svg>
								</span>
								{item}
							</li>
						{/each}
					</ul>
					<div class="mt-8 flex items-center justify-between border-t border-surface-700/50 pt-6">
						<a href={service.ctaLink} class="text-sm font-semibold text-accent-500 transition-colors hover:text-accent-400">{service.ctaText} →</a>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
