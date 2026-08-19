<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	/**
	 * Переиспользуемая панель, выезжающая справа. Применяется для узких компонентов
	 * (баннер), где плавающий переключатель вариантов не помещается: вместо него
	 * компактная кнопка-триггер открывает эту панель с нужным интерфейсом.
	 *
	 * Тело панели передаётся сниппетом `children`. Открытие — через `bind:open`.
	 */
	let {
		open = $bindable(false),
		title = '',
		titleContent,
		children
	}: {
		open?: boolean;
		title?: string;
		/** Заменяет заголовок произвольной разметкой (напр. интерактивным бейджем артикула). `title` при этом остаётся источником aria-label. */
		titleContent?: Snippet;
		children?: Snippet;
	} = $props();

	function close() {
		open = false;
	}

	function onKeydown(event: KeyboardEvent) {
		if (!open) return;
		if (event.key === 'Escape') {
			close();
			return;
		}

		if (event.key !== 'Tab' || !panelEl) return;

		const focusable = Array.from(
			panelEl.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
			)
		).filter((element) => element.offsetParent !== null);

		if (focusable.length === 0) {
			event.preventDefault();
			panelEl.focus();
			return;
		}

		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (
			event.shiftKey &&
			(document.activeElement === first || document.activeElement === panelEl)
		) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}

	let panelEl: HTMLElement | null = $state(null);
	$effect(() => {
		if (!open) return;

		const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		const focusTimer = setTimeout(() => panelEl?.focus(), 0);

		return () => {
			clearTimeout(focusTimer);
			trigger?.focus();
		};
	});

	/**
	 * Портал в document.body: панель рендерится внутри компонента-владельца, но её
	 * DOM-узел переносится в конец body. Это выводит `fixed`-панель из чужого
	 * контекста наложения (напр. sticky-хэдера с `z-[150]`), где её `z-[210]` был бы
	 * «заперт» и часть панели перекрывалась бы нижестоящими слоями.
	 */
	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.parentNode?.removeChild(node);
			}
		};
	}
</script>

<svelte:window onkeydown={onKeydown} />

{#if open}
	<div use:portal>
		<!-- Затемнение -->
		<button
			type="button"
			tabindex="-1"
			class="fixed inset-0 z-200 h-full w-full cursor-default border-none bg-ink-950/55 backdrop-blur-[2px] outline-none"
			onclick={close}
			aria-label="Закрыть панель"
			transition:fade={{ duration: 200 }}
		></button>

		<!-- Панель справа -->
		<div
			bind:this={panelEl}
			role="dialog"
			aria-modal="true"
			aria-label={title || 'Панель настроек'}
			tabindex="-1"
			class="font-sans-premium fixed top-0 right-0 z-210 flex h-full w-[88vw] max-w-sm flex-col border-l border-on-dark/10 bg-ink-950/95 shadow-2xl backdrop-blur-2xl"
			transition:fly={{ x: 420, duration: 350, opacity: 1 }}
		>
			<header class="flex items-center justify-between gap-3 border-b border-on-dark/10 px-5 py-4">
				<div class="flex min-w-0 flex-col">
					{#if titleContent}
						{@render titleContent()}
					{:else}
						<h3 class="truncate text-base text-on-dark">{title}</h3>
					{/if}
				</div>
				<button
					type="button"
					class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-on-dark/10 bg-on-dark/3 text-on-dark/60 transition-all duration-300 hover:bg-on-dark/10 hover:text-on-dark active:scale-95"
					onclick={close}
					aria-label="Закрыть"
				>
					<svg
						class="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
					</svg>
				</button>
			</header>

			<div class="flex-1 overflow-y-auto px-5 py-5">
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}
