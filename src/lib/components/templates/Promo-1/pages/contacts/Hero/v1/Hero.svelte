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

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'ContactsHero', updated);
		data = updated;
	}
</script>

<!--
	min-h-* синхронизирован с вариантом 2 (contact-hero-v2), чтобы оба варианта
	занимали одинаковую высоту при переключении в редакторе.
-->
<section
	class="contact-hero relative isolate flex min-h-96 items-center overflow-hidden bg-[#09090b] py-12 sm:min-h-104 sm:py-14 lg:min-h-112 lg:py-16"
>
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div
			class="absolute inset-0 bg-[radial-gradient(circle_at_78%_38%,rgba(239,68,68,0.11),transparent_31%),radial-gradient(circle_at_15%_8%,rgba(255,255,255,0.055),transparent_26%)]"
		></div>
		<div
			class="absolute inset-0 opacity-[0.035]"
			style="background-image: linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px); background-size: 64px 64px; mask-image: linear-gradient(to bottom, black, transparent 88%);"
		></div>
		<div
			class="absolute top-0 left-1/2 h-px w-3/5 -translate-x-1/2 bg-linear-to-r from-transparent via-red-400/70 to-transparent"
		></div>
	</div>

	<div class="relative mx-auto w-full max-w-7xl px-6 lg:px-8">
		<div class="relative z-10">
			<EditableField
				fieldKey="ContactsHero.eyebrow"
				label="Надпись над заголовком"
				value={String(data?.eyebrow ?? 'Связь с нами')}
				{isEditable}
				onSave={(v) => saveField('eyebrow', v)}
				class="contact-hero__eyebrow inline-block"
			>
				{#snippet children(displayValue)}
					<p
						class="inline-flex items-center gap-3 text-xs font-semibold tracking-[0.22em] text-red-400 uppercase"
					>
						<span class="h-px w-8 bg-red-400" aria-hidden="true"></span>
						{displayValue}
					</p>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="ContactsHero.title"
				label="Заголовок"
				value={String(data?.title ?? 'Контакты')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="contact-hero__title mt-4 block"
			>
				{#snippet children(displayValue)}
					<h1
						class="max-w-3xl text-4xl leading-none font-semibold tracking-[-0.04em] text-pretty text-white sm:text-5xl lg:text-6xl"
					>
						{displayValue}
					</h1>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="ContactsHero.subtitle"
				label="Подзаголовок"
				value={String(
					data?.subtitle ??
						'Мы работаем с понедельника по субботу с 10:00 до 20:00. В иное время воспользуйтесь онлайн-чатом или почтой.'
				)}
				{isEditable}
				multiline
				onSave={(v) => saveField('subtitle', v)}
				class="contact-hero__subtitle mt-5 block"
			>
				{#snippet children(displayValue)}
					<p class="max-w-2xl text-sm/6 text-gray-300 sm:text-base/7">{displayValue}</p>
				{/snippet}
			</EditableField>
		</div>
	</div>
</section>

<style>
	@keyframes contact-hero-reveal {
		from {
			opacity: 0;
			transform: translateY(18px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	:global(.contact-hero__eyebrow) {
		animation: contact-hero-reveal 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}
	:global(.contact-hero__title) {
		animation: contact-hero-reveal 850ms 90ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}
	:global(.contact-hero__subtitle) {
		animation: contact-hero-reveal 850ms 180ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.contact-hero__eyebrow),
		:global(.contact-hero__title),
		:global(.contact-hero__subtitle) {
			animation: none;
		}
	}
</style>
