<script lang="ts">
	/**
	 * Значковые кнопки клиентской авторизации в правой зоне хэдера.
	 *
	 * Состояние и действия — в `createClientAccount()`; здесь только разметка.
	 * Она приходит из SSR уже в нужном виде, без мигания «Войти» у вошедшего:
	 * корневой layout кладёт имя и email из payload клиентской cookie в
	 * `page.data.client` (см. src/lib/server/client-session.ts).
	 *
	 * **Вариант остался один.** Было три. `text` — надписи в полосе баннера —
	 * умер 25.08.2026 вместе с самой полосой: мобильная строка шапки переехала
	 * в `Header.svelte`, и вход из неё ушёл в лист меню. `menu` — строки листа —
	 * прожил два дня: у каждой из четырёх версий меню свой язык, и общий
	 * компонент, который делят все шаблоны, знать про них не должен. С ними
	 * ушли пропсы `compact` и `themed`: первый прятал «Регистрацию» совсем,
	 * второй переводил кнопки на роли темы приютившего блока — здесь ни то,
	 * ни другое не нужно, зона хэдера темы не имеет.
	 *
	 * Чеканка повторяет соседей по зоне («Избранное», выбор города): та же
	 * плашка, кольцо и размер значка — разведены только цвета наведения.
	 * Сердце уходит в бренд, вход и город — в `link`: бренд в этой зоне
	 * закреплён за избранным.
	 */
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { clientAuthModal } from '$lib/stores/client-auth.svelte';
	import { createClientAccount } from '$lib/stores/client-account.svelte';
	import IconHint from '$lib/components/IconHint.svelte';

	const account = createClientAccount();

	/**
	 * `/cabinet` уводит гостя редиректом с `?auth=client-login` — по этой метке
	 * сразу открываем форму входа, чтобы человек не искал кнопку глазами.
	 * Живёт здесь, а не в `createClientAccount()`: правило нужно один раз на
	 * страницу, а компонент этот на странице один.
	 */
	onMount(() => {
		if (browser && !account.client && page.url.searchParams.get('auth') === 'client-login') {
			clientAuthModal.open('login');
		}
	});

	const iconClass =
		'group relative flex cursor-pointer items-center justify-center rounded-xl bg-linear-to-r from-ink-100/20 to-ink-50/80 p-3 ring-1 ring-ink-200/50 transition-all duration-300 hover:shadow-lg hover:shadow-link-500/10 hover:ring-link-200 disabled:cursor-default disabled:opacity-60';
	const iconGlyphClass =
		'size-5 text-ink-500 transition-all duration-300 group-hover:scale-110 group-hover:text-link-500';
</script>

{#if account.client}
	<a href={account.cabinet} class={iconClass}>
		<span class="sr-only">Личный кабинет</span>
		<IconHint text="Кабинет — {account.client.email}" />
		<svg
			class={iconGlyphClass}
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="1.8"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0"
			/>
		</svg>
	</a>
	<button type="button" onclick={account.logout} disabled={account.isLoggingOut} class={iconClass}>
		<span class="sr-only">Выйти</span>
		<IconHint text="Выйти" align="right" />
		<svg
			class={iconGlyphClass}
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="1.8"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
			/>
		</svg>
	</button>
{:else}
	<button type="button" onclick={account.openLogin} class={iconClass}>
		<span class="sr-only">Войти</span>
		<IconHint text="Войти" />
		<svg
			class={iconGlyphClass}
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="1.8"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M8.25 9V5.25A2.25 2.25 0 0110.5 3h6a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0116.5 21h-6a2.25 2.25 0 01-2.25-2.25V15m-6 0l3-3m0 0l-3-3m3 3H3.75"
			/>
		</svg>
	</button>
	<button type="button" onclick={account.openRegister} class={iconClass}>
		<span class="sr-only">Регистрация</span>
		<IconHint text="Регистрация" align="right" />
		<svg
			class={iconGlyphClass}
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="1.8"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M13.5 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM2.25 20.25a7.5 7.5 0 0115 0M18.75 8.25v6m3-3h-6"
			/>
		</svg>
	</button>
{/if}
