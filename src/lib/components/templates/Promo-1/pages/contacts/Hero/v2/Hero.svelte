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
	Вариант 2 — светлая «editorial»-подача: тёплый бумажный фон, крупная
	типографика по центру, тонкая рамка-паспарту и вертикальные линии-разделители.
	Контрастирует с тёмным асимметричным вариантом 1.
-->
<section
	class="contact-hero-v2 relative isolate flex min-h-96 items-center overflow-hidden bg-[#f7f5f2] py-12 sm:min-h-104 sm:py-14 lg:min-h-112 lg:py-16"
>
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div
			class="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.07),transparent_45%)]"
		></div>
		<div
			class="absolute inset-0 opacity-[0.5]"
			style="background-image: linear-gradient(90deg, rgba(15,23,42,0.05) 1px, transparent 1px); background-size: 25% 100%;"
		></div>
		<div
			class="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-[#efece7] to-transparent"
		></div>
	</div>

	<div class="relative mx-auto w-full max-w-4xl px-6 lg:px-8">
		<div
			class="contact-hero-v2__frame relative rounded-3xl border border-slate-900/10 bg-white/70 px-6 py-9 text-center shadow-[0_40px_90px_-60px_rgba(15,23,42,0.45)] backdrop-blur-sm sm:rounded-4xl sm:px-12 sm:py-11 lg:px-16"
		>
			<span
				class="pointer-events-none absolute -top-px left-1/2 h-px w-24 -translate-x-1/2 bg-red-500/70"
				aria-hidden="true"
			></span>

			<EditableField
				fieldKey="ContactsHero.eyebrow"
				label="Надпись над заголовком"
				value={String(data?.eyebrow ?? 'Связь с нами')}
				{isEditable}
				onSave={(v) => saveField('eyebrow', v)}
				class="contact-hero-v2__eyebrow inline-block"
			>
				{#snippet children(displayValue)}
					<p
						class="text-[11px] font-semibold tracking-[0.42em] text-red-600/90 uppercase sm:text-xs"
					>
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
				class="contact-hero-v2__title mt-5 block"
			>
				{#snippet children(displayValue)}
					<h1
						class="text-4xl leading-[1.04] font-light tracking-[-0.02em] text-pretty text-slate-900 sm:text-5xl lg:text-6xl"
					>
						{displayValue}
					</h1>
				{/snippet}
			</EditableField>

			<div
				class="contact-hero-v2__rule mx-auto mt-6 flex max-w-xs items-center gap-3"
				aria-hidden="true"
			>
				<span class="h-px flex-1 bg-linear-to-r from-transparent to-slate-900/20"></span>
				<span class="size-1.5 rotate-45 border border-red-500/60"></span>
				<span class="h-px flex-1 bg-linear-to-l from-transparent to-slate-900/20"></span>
			</div>

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
				class="contact-hero-v2__subtitle mt-6 block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto max-w-xl text-sm/6 text-slate-600 sm:text-base/7">{displayValue}</p>
				{/snippet}
			</EditableField>
		</div>
	</div>
</section>

<style>
	@keyframes contact-hero-v2-rise {
		from {
			opacity: 0;
			transform: translateY(14px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes contact-hero-v2-frame {
		from {
			opacity: 0;
			transform: scale(0.985);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes contact-hero-v2-rule {
		from {
			opacity: 0;
			transform: scaleX(0.4);
		}
		to {
			opacity: 1;
			transform: scaleX(1);
		}
	}

	.contact-hero-v2__frame {
		animation: contact-hero-v2-frame 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}
	:global(.contact-hero-v2__eyebrow) {
		animation: contact-hero-v2-rise 700ms 120ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}
	:global(.contact-hero-v2__title) {
		animation: contact-hero-v2-rise 850ms 220ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}
	.contact-hero-v2__rule {
		animation: contact-hero-v2-rule 800ms 340ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}
	:global(.contact-hero-v2__subtitle) {
		animation: contact-hero-v2-rise 850ms 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	@media (prefers-reduced-motion: reduce) {
		.contact-hero-v2__frame,
		:global(.contact-hero-v2__eyebrow),
		:global(.contact-hero-v2__title),
		.contact-hero-v2__rule,
		:global(.contact-hero-v2__subtitle) {
			animation: none;
		}
	}
</style>
