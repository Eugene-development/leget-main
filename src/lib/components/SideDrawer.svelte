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
		eyebrow = 'Компонент',
		children
	}: {
		open?: boolean;
		title?: string;
		eyebrow?: string | null;
		children?: Snippet;
	} = $props();

	function close() {
		open = false;
	}

	function onKeydown(event: KeyboardEvent) {
		if (open && event.key === 'Escape') close();
	}

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
			class="fixed inset-0 z-200 h-full w-full cursor-default border-none bg-slate-950/55 backdrop-blur-[2px] outline-none"
			onclick={close}
			aria-label="Закрыть панель"
			transition:fade={{ duration: 200 }}
		></button>

		<!-- Панель справа -->
		<aside
			class="font-sans-premium fixed top-0 right-0 z-210 flex h-full w-[88vw] max-w-sm flex-col border-l border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-2xl"
			transition:fly={{ x: 420, duration: 350, opacity: 1 }}
		>
			<header class="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
				<div class="flex min-w-0 flex-col">
					{#if eyebrow}
						<span class="text-[10px] font-medium tracking-[0.2em] text-white/40 uppercase"
							>{eyebrow}</span
						>
					{/if}
					<h3 class="truncate text-base text-white">{title}</h3>
				</div>
				<button
					type="button"
					class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/3 text-white/60 transition-all duration-300 hover:bg-white/10 hover:text-white active:scale-95"
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
		</aside>
	</div>
{/if}
