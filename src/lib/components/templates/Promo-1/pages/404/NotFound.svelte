<script lang="ts">
	import { browser } from '$app/environment';
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
		await saveComponentData(editContext, 'NotFound', updated);
		data = updated;
	}

	/**
	 * «Назад» — на страницу, с которой пользователь пришёл.
	 *
	 * Порядок источников не случаен. history.back() — единственный вариант,
	 * который верен и после клиентской навигации: document.referrer в этом случае
	 * остаётся от документа, с которого началась сессия, а не от предыдущей
	 * страницы SPA. Реферер нужен для второго случая — переход по внешней ссылке
	 * в новую вкладку: истории там нет, зато есть откуда вернуться. Чужие домены
	 * не принимаем — кнопка «назад» не должна уводить с сайта.
	 *
	 * До гидратации оба состояния пустые, и кнопки в разметке нет: на сервере
	 * ни истории, ни реферера не видно, а мигание ссылкой-заглушкой хуже её
	 * отсутствия.
	 */
	let canGoBack = $state(false);
	let backHref = $state<string | null>(null);

	$effect(() => {
		if (!browser) return;

		if (window.history.length > 1) {
			canGoBack = true;
			return;
		}

		if (!document.referrer) return;

		try {
			const ref = new URL(document.referrer);
			if (ref.origin !== window.location.origin) return;
			if (ref.pathname === window.location.pathname) return;
			backHref = ref.pathname + ref.search + ref.hash;
		} catch {
			// Реферер нечитаем — остаёмся с одной кнопкой «На главную».
		}
	});

	const hasBack = $derived(canGoBack || backHref !== null);
</script>

<!--
	Страница 404 шаблона Promo-1.

	Секция самодостаточна: рендерится не только как страница /404, но и как тело
	ошибки в src/routes/+error.svelte, где вокруг неё может не быть ничего, кроме
	хэдера и футера. Отсюда min-h-screen и собственный фон — на пустом маршруте
	блок обязан закрывать экран целиком.

	Палитра — базовая тёмная шаблона (slate-950 + красный акцент), как у HeroMain.
-->
<section
	class="nf-enter relative isolate flex min-h-screen items-center overflow-hidden bg-ink-950 py-24 sm:py-28"
>
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="nf-glow absolute -top-40 left-1/2 size-144 -translate-x-1/2 bg-brand-500/20"></div>
		<div class="nf-glow absolute -right-32 bottom-0 size-112 bg-brand-500/10"></div>
		<div
			class="absolute inset-x-0 top-0 mx-auto h-px w-2/3 bg-linear-to-r from-transparent via-brand-500/50 to-transparent"
		></div>
	</div>

	<div class="relative mx-auto w-full max-w-3xl px-4 text-center sm:px-6 lg:px-8">
		<!-- Код ошибки. Не редактируется: это статус ответа, а не контент. -->
		<p
			class="nf-item text-[5.5rem] leading-none font-semibold tracking-[-0.05em] text-transparent sm:text-[8rem] lg:text-[10rem]"
			style="background-image: linear-gradient(180deg, rgb(255 255 255 / 0.92), rgb(255 255 255 / 0.18)); -webkit-background-clip: text; background-clip: text;"
		>
			404
		</p>

		<EditableField
			fieldKey="NotFound.title"
			label="Заголовок"
			value={String(data?.title ?? 'Страница не найдена')}
			{isEditable}
			onSave={(v) => saveField('title', v)}
			class="nf-item nf-d1 mt-4 block"
		>
			{#snippet children(displayValue)}
				<h1
					class="text-3xl leading-[1.08] tracking-[-0.03em] text-pretty text-on-dark sm:text-4xl lg:text-5xl"
				>
					{displayValue}
				</h1>
			{/snippet}
		</EditableField>

		<div class="nf-rule nf-d2 mx-auto mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
			<span class="h-px flex-1 bg-on-dark/15"></span>
			<span class="size-1.5 rotate-45 border border-brand-500/80"></span>
			<span class="h-px flex-1 bg-on-dark/15"></span>
		</div>

		<EditableField
			fieldKey="NotFound.subtitle"
			label="Подзаголовок"
			value={String(
				data?.subtitle ??
					'Возможно, страница была перемещена или удалена, а ссылка устарела. Вернитесь на главную или к предыдущему разделу.'
			)}
			{isEditable}
			multiline
			onSave={(v) => saveField('subtitle', v)}
			class="nf-item nf-d3 mt-6 block"
		>
			{#snippet children(displayValue)}
				<p class="mx-auto max-w-xl text-sm/6 text-ink-300 sm:text-base/7">{displayValue}</p>
			{/snippet}
		</EditableField>

		<div class="nf-item nf-d4 mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
			<a
				href={String(data?.homeHref ?? '/')}
				class="group inline-flex items-center justify-center gap-2.5 rounded-full bg-linear-to-r from-brand-600 to-brand-500 px-7 py-3.5 text-sm font-semibold text-on-accent shadow-[0_18px_45px_-18px_rgba(239,68,68,0.95)] transition duration-300 hover:from-brand-500 hover:to-brand-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400 motion-safe:hover:-translate-y-0.5"
			>
				<svg
					class="size-4.5 transition-transform duration-300 group-hover:-translate-x-0.5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="1.8"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M3 11.5 12 4l9 7.5M5.5 10v9.5a.5.5 0 0 0 .5.5h4v-6h4v6h4a.5.5 0 0 0 .5-.5V10"
					/>
				</svg>
				<EditableField
					fieldKey="NotFound.homeButtonText"
					label="Кнопка «На главную»"
					value={String(data?.homeButtonText ?? 'На главную')}
					{isEditable}
					onSave={(v) => saveField('homeButtonText', v)}
					class="inline"
				>
					{#snippet children(displayValue)}
						{displayValue}
					{/snippet}
				</EditableField>
			</a>

			{#if hasBack}
				{@const backLabel = String(data?.backButtonText ?? 'Вернуться назад')}
				<!--
					Ссылка и кнопка — одна и та же роль, но разной природы: реферер
					адресуем ссылкой (работает средним кликом, видно в статусной строке),
					шаг по истории — только скриптом.
				-->
				{#if backHref}
					<a
						href={backHref}
						class="nf-back group inline-flex items-center justify-center gap-2.5 rounded-full border border-on-dark/15 bg-on-dark/5 px-7 py-3.5 text-sm font-semibold text-on-dark transition duration-300 hover:border-on-dark/30 hover:bg-on-dark/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-dark/60 motion-safe:hover:-translate-y-0.5"
					>
						<svg
							class="size-4.5 transition-transform duration-300 group-hover:-translate-x-1"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="1.8"
							aria-hidden="true"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M19 12H5m0 0 6-6m-6 6 6 6" />
						</svg>
						{backLabel}
					</a>
				{:else}
					<button
						type="button"
						onclick={() => window.history.back()}
						class="nf-back group inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-full border border-on-dark/15 bg-on-dark/5 px-7 py-3.5 text-sm font-semibold text-on-dark transition duration-300 hover:border-on-dark/30 hover:bg-on-dark/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-dark/60 motion-safe:hover:-translate-y-0.5"
					>
						<svg
							class="size-4.5 transition-transform duration-300 group-hover:-translate-x-1"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="1.8"
							aria-hidden="true"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M19 12H5m0 0 6-6m-6 6 6 6" />
						</svg>
						{backLabel}
					</button>
				{/if}
			{/if}
		</div>
	</div>
</section>

<style>
	/* Классы глобальные: часть анимируемых узлов — обёртки <EditableField>. */

	:global(.nf-glow) {
		filter: blur(80px);
		border-radius: 9999px;
	}

	@keyframes nf-rise {
		from {
			opacity: 0;
			transform: translateY(18px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes nf-rule {
		from {
			opacity: 0;
			transform: scaleX(0.4);
		}
		to {
			opacity: 1;
			transform: scaleX(1);
		}
	}

	/* backwards, а не both: иначе финальный transform анимации остаётся на узле
	   и перебивает hover-подъём кнопок. */
	:global(.nf-enter .nf-item) {
		animation: nf-rise 780ms cubic-bezier(0.22, 1, 0.36, 1) var(--nf-delay, 0ms) backwards;
	}

	:global(.nf-enter .nf-rule) {
		animation: nf-rule 780ms cubic-bezier(0.22, 1, 0.36, 1) var(--nf-delay, 0ms) backwards;
	}

	:global(.nf-d1) {
		--nf-delay: 80ms;
	}
	:global(.nf-d2) {
		--nf-delay: 160ms;
	}
	:global(.nf-d3) {
		--nf-delay: 240ms;
	}
	:global(.nf-d4) {
		--nf-delay: 320ms;
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.nf-enter .nf-item),
		:global(.nf-enter .nf-rule) {
			animation: none;
			opacity: 1;
			transform: none;
		}
	}
</style>
