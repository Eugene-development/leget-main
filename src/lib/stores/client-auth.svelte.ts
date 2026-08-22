/**
 * Открытие модалки клиентской авторизации.
 *
 * Store нужен не ради состояния, а ради МЕСТА рендера. Кнопки живут в баннере,
 * а у баннера есть `backdrop-blur`: backdrop-filter создаёт containing block,
 * и `position: fixed` внутри него отсчитывается от полосы баннера, а не от
 * окна — модалка оказывалась расплющенной в шапке. Поэтому кнопки только
 * просят открыть форму, а сама форма рендерится один раз в корневом layout.
 */
class ClientAuthModalStore {
	mode = $state<'login' | 'register' | null>(null);

	open(mode: 'login' | 'register') {
		this.mode = mode;
	}

	close() {
		this.mode = null;
	}
}

export const clientAuthModal = new ClientAuthModalStore();
