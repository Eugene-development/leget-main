import { page } from '$app/state';
import { goto, invalidateAll } from '$app/navigation';
import { clientAuthModal } from '$lib/stores/client-auth.svelte';
import { uiStore } from '$lib/stores/ui.svelte';
import { cabinetHref, isCabinetPath } from '$lib/utils/cabinet-href';

/**
 * Состояние и действия клиентской учётной записи — один владелец на все точки
 * входа: значковые кнопки в правой зоне хэдера и строки в листе мобильного меню
 * всех четырёх версий.
 *
 * Вынесено 27.08.2026 при подгонке мобильных листов под идиому версии. До этого
 * логика жила внутри `ClientAuthButtons.svelte` вместе с разметкой, и это
 * работало ровно пока разметка была одна. Как только у каждой версии меню
 * появился свой язык — пилюли и «двойная оправа» у `1.М.1.2`, остров на
 * `alt-petrol` у `1.М.1.3`, ячейки полки у `1.М.1.4`, — выбор стал такой:
 * либо шесть вариантов в общем компоненте, который делят все шаблоны, либо
 * шесть копий одного `fetch('/cabinet/session', { method: 'DELETE' })`.
 * Ни то, ни другое: разметка уходит версии, состояние остаётся здесь.
 *
 * Модуль общий (`$lib/stores`), а не при шаблоне: `ClientAuthButtons` живёт в
 * `$lib/components` и на Promo-1 не смотрит — зависимость «общее → шаблонное»
 * была бы направлена не туда.
 *
 * Роль в claim'е cookie границей доступа не является: она решает только, какую
 * ссылку показать. Сам кабинет проверяет роль на сервере — см. cabinet-href.ts.
 */
export function createClientAccount() {
	let isLoggingOut = $state(false);

	const client = $derived(
		(page.data as { client?: { name: string; email: string; role: string } | null }).client ?? null
	);

	async function logout() {
		isLoggingOut = true;
		try {
			await fetch('/cabinet/session', { method: 'DELETE' });
		} catch {
			// Сеть не ответила — cookie осталась; состояние ниже не меняем.
		} finally {
			isLoggingOut = false;
		}
		await invalidateAll();
		if (isCabinetPath(page.url.pathname)) await goto('/');
	}

	/**
	 * Лист меню закрывается до открытия формы: модалка рисуется в корневом
	 * layout'е и стоит этажом выше, а под ней остался бы открытый лист с
	 * заблокированной прокруткой страницы. Для значковых кнопок хэдера вызов
	 * безвреден — меню там и так закрыто.
	 */
	function open(mode: 'login' | 'register') {
		uiStore.closeMenu();
		clientAuthModal.open(mode);
	}

	return {
		get client() {
			return client;
		},
		/** У партнёра кабинет свой — ссылка ведёт туда же, куда пустит сервер. */
		get cabinet() {
			return cabinetHref(client?.role);
		},
		get isLoggingOut() {
			return isLoggingOut;
		},
		logout,
		openLogin: () => open('login'),
		openRegister: () => open('register')
	};
}
