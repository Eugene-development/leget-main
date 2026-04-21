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

	const cards = $derived(
		Array.isArray(data?.cards) && data.cards.length > 0
			? (data.cards as { title: string; description: string; image: string; alt: string }[])
			: [
					{ title: 'Дизайн-проект',    description: 'Бесплатный 3D-проект с визуализацией и точными замерами', image: '/message/design_project.png', alt: 'Дизайн-проект'    },
					{ title: 'Мебель',            description: 'Производство по точным размерам и вашим предпочтениям',   image: '/message/kitchen.png',         alt: 'Мебель на заказ'  },
					{ title: 'Партнёрство',       description: 'Сотрудничаем с лучшими фабриками и поставщиками',         image: '/message/partnership.png',     alt: 'Партнёрство'      },
					{ title: 'Гарантия качества', description: 'Гарантия до 5 лет на мебель и полное сопровождение заказа', image: '/message/quality.png',       alt: 'Гарантия качества' },
				]
	);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Message', updated);
		data = updated;
	}
</script>

<!-- О компании (Message) -->
<section class="bg-slate-50">
	<div class="bg-slate-50 py-16 sm:py-28">
		<div class="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 lg:px-8">
			<!-- Логотип -->
			{#if data?.logoUrl}
				<div class="w-full max-w-xs sm:max-w-sm">
					<div class="relative">
						<div class="absolute -inset-4 rounded-3xl bg-linear-to-r from-sky-100 to-cyan-100 opacity-50 blur-xl"></div>
						<img
							src={String(data.logoUrl)}
							alt={String(data?.logoAlt ?? 'Логотип')}
							class="relative w-full rounded-2xl object-contain"
						/>
					</div>
				</div>
			{/if}

			<!-- Текст -->
			<div class="w-full max-w-3xl text-center">
				<figure class="relative">
					<blockquote class="relative text-lg font-medium leading-relaxed text-slate-900 sm:text-xl">
						<EditableField
							fieldKey="Message.text"
							label="Текст"
							value={String(data?.text ?? '')}
							{isEditable}
							multiline
							onSave={(v) => saveField('text', v)}
							class="block"
						>
							{#snippet children(displayValue)}
								<p>{displayValue}</p>
							{/snippet}
						</EditableField>
					</blockquote>
					<div class="mx-auto mt-8 h-px w-24 bg-linear-to-r from-sky-300 to-cyan-300"></div>
				</figure>
			</div>
		</div>

		<!-- Карточки преимуществ -->
		<div class="mx-auto mt-16 max-w-7xl px-6 lg:px-8">
			<div class="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
				{#each cards as card}
					<div class="message-card group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80 transition-all duration-500 hover:shadow-lg hover:ring-slate-300 hover:-translate-y-1">
						<div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-sky-50/80 transition-transform duration-500 group-hover:scale-125"></div>
						<div class="relative">
							<div class="mb-4 size-24 overflow-hidden rounded-xl">
								<img src={card.image} alt={card.alt} class="h-full w-full object-cover" />
							</div>
							<h3 class="text-sm font-bold text-slate-900 sm:text-base">{card.title}</h3>
							<p class="mt-1.5 text-xs leading-relaxed text-slate-500 sm:text-sm">{card.description}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	.message-card {
		animation: message-fade-in 0.6s ease-out both;
	}
	.message-card:nth-child(1) { animation-delay: 0.1s; }
	.message-card:nth-child(2) { animation-delay: 0.2s; }
	.message-card:nth-child(3) { animation-delay: 0.3s; }
	.message-card:nth-child(4) { animation-delay: 0.4s; }

	@keyframes message-fade-in {
		from { opacity: 0; transform: translateY(16px); }
		to   { opacity: 1; transform: translateY(0);    }
	}
</style>
