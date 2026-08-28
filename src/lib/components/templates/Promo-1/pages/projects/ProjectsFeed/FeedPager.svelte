<script lang="ts">
	// Пагинация ленты. Общая для обеих версий блока 1.26.2: номер страницы —
	// свойство данных, а не композиции, и две реализации разошлись бы в
	// поведении, оставшись одинаковыми на вид.
	//
	// Роли токенные, а не захардкоженные, в отличие от сетки проектов рубрики
	// (`MebelProjectsGrid`, 1.17.3.1), где активная страница набрана `bg-link-500`
	// напрямую. Заливка берётся у `--ds-accent-surface` — роли «акцентная
	// поверхность», заведённой в пару к `--ds-on-accent`: на «Охре» её значение
	// золотое по тёмно-коричневому, а `link-500` там ржавый и от неактивной
	// кнопки почти не отличался (1,2:1 против 7,8:1 у роли).
	import { pageNumbers } from './data';
	import '../../../theme.css';

	let {
		page = $bindable(),
		total
	}: {
		page: number;
		/** Всего работ в ленте, а не страниц: число страниц считает `pageNumbers`. */
		total: number;
	} = $props();

	const pages = $derived(pageNumbers(total));
	const last = $derived(pages.length);

	/**
	 * Смена страницы уводит к началу страницы.
	 *
	 * Пагинация стоит под последней карточкой, то есть в момент нажатия
	 * посетитель находится в самом низу: без прокрутки он получил бы новую
	 * страницу списка, показанную с конца, и решил бы, что ничего не произошло.
	 *
	 * Прокрутка живёт здесь, а не в версиях блока, по той же причине, что и сам
	 * номер страницы: это поведение пагинации, и разъехаться между вариантами
	 * оно не должно.
	 */
	function goTo(next: number) {
		// Нажатие на текущую страницу ничего не меняет — и прокручивать в этом
		// случае нечего: список остался тем же, а экран бы дёрнулся.
		if (next === page) return;

		page = next;

		// `behavior: smooth` не переопределяется медиазапросом, поэтому уважение
		// к prefers-reduced-motion приходится выражать явно: тем, кто просил
		// меньше движения, страница переставляется мгновенно.
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
	}
</script>

{#if pages.length > 1}
	<nav aria-label="Страницы ленты проектов" class="mt-11 flex items-center justify-center gap-2">
		<button
			type="button"
			class="p1-card p1-border flex size-11 cursor-pointer items-center justify-center rounded-lg border transition-[background-color,border-color,opacity] duration-[var(--ds-motion-duration-ui)] ease-ui disabled:cursor-default disabled:opacity-30"
			disabled={page === 1}
			onclick={() => goTo(Math.max(1, page - 1))}
			aria-label="Предыдущая страница"
		>
			<svg
				class="p1-body size-5 [stroke-width:var(--ds-icon-stroke-bold)]"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				aria-hidden="true"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
			</svg>
		</button>

		<div class="flex gap-1.5">
			{#each pages as n (n)}
				<button
					type="button"
					class="p1-numeric flex size-11 cursor-pointer items-center justify-center rounded-lg border text-sm transition-[background-color,border-color,color] duration-[var(--ds-motion-duration-ui)] ease-ui {page ===
					n
						? 'border-transparent bg-accent-surface text-on-accent shadow-sm'
						: 'p1-card p1-border p1-body p1-card-hover'}"
					aria-current={page === n ? 'page' : undefined}
					aria-label="Страница {n}"
					onclick={() => goTo(n)}
				>
					{n}
				</button>
			{/each}
		</div>

		<button
			type="button"
			class="p1-card p1-border flex size-11 cursor-pointer items-center justify-center rounded-lg border transition-[background-color,border-color,opacity] duration-[var(--ds-motion-duration-ui)] ease-ui disabled:cursor-default disabled:opacity-30"
			disabled={page === last}
			onclick={() => goTo(Math.min(last, page + 1))}
			aria-label="Следующая страница"
		>
			<svg
				class="p1-body size-5 [stroke-width:var(--ds-icon-stroke-bold)]"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				aria-hidden="true"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
			</svg>
		</button>
	</nav>
{/if}
