/**
 * Видимость строк контактов в футере — единый источник правды для v1/v2/v3.
 *
 * Не всем клиентам нужны все четыре строки: бизнес без офиса прячет адрес,
 * круглосуточный — график. Настройка общая для всех вариантов футера: клиент
 * отключил адрес и переключил вариант — адрес остаётся отключённым.
 *
 * Храним СКРЫТЫЕ ключи, а не видимые: контакт, добавленный в будущем, тогда
 * по умолчанию покажется, а не исчезнет молча у всех существующих сайтов.
 *
 * Общий модуль (как `catalogItems.ts`), а не копия в каждой версии: ключ
 * хранения и семантика обязаны совпадать, иначе переключение варианта теряло
 * бы настройку.
 */
import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

export const CONTACT_KEYS = ['phone', 'email', 'address', 'hours'] as const;
export type ContactKey = (typeof CONTACT_KEYS)[number];

/** Ключ в data компонента Footer. Общий для всех вариантов. */
export const HIDDEN_CONTACTS_KEY = 'hiddenContacts';

/** Винительный падеж для подписи переключателя: «Скрыть адрес». */
const CONTACT_LABEL: Record<ContactKey, string> = {
	phone: 'телефон',
	email: 'почту',
	address: 'адрес',
	hours: 'график'
};

function readHidden(data: Record<string, unknown> | undefined): string[] {
	const raw = data?.[HIDDEN_CONTACTS_KEY];
	return Array.isArray(raw) ? [...(raw as string[])] : [];
}

export interface ContactVisibility {
	readonly hidden: string[];
	/** Показывается ли строка обычному посетителю. */
	isVisible(key: ContactKey): boolean;
	/** Есть ли хоть одна видимая строка — блок контактов целиком может быть пуст. */
	readonly hasVisible: boolean;
	label(key: ContactKey): string;
	toggle(key: ContactKey, e: Event): Promise<void>;
}

/**
 * Вызывать при инициализации компонента (внутри `<script>`), а не в обработчике:
 * внутри заводится `$effect`, которому нужен контекст компонента.
 */
export function createContactVisibility(opts: {
	getData: () => Record<string, unknown>;
	setData: (next: Record<string, unknown>) => void;
	getEditContext: () => EditContext | null;
}): ContactVisibility {
	// Зеркало пропса инициализируем сразу из data: пустой $state + $effect
	// выкинул бы контакты из SSR — эффекты на сервере не выполняются.
	let hidden = $state<string[]>(readHidden(opts.getData()));

	// data приходит в версии без bind: — синхронизируем зеркало на случай
	// внешнего обновления (сброс контента футера, invalidateAll).
	$effect(() => {
		const next = readHidden(opts.getData());
		if ([...next].sort().join('') !== [...hidden].sort().join('')) {
			hidden = next;
		}
	});

	return {
		get hidden() {
			return hidden;
		},
		isVisible: (key) => !hidden.includes(key),
		get hasVisible() {
			return CONTACT_KEYS.some((key) => !hidden.includes(key));
		},
		label: (key) => CONTACT_LABEL[key],
		async toggle(key, e) {
			e.preventDefault();
			e.stopPropagation();

			const wasVisible = !hidden.includes(key);
			// Оптимистично: переключатель отвечает мгновенно.
			hidden = wasVisible ? [...hidden, key] : hidden.filter((k) => k !== key);

			// data обновляем ДО проверки editContext: иначе синхронизирующий
			// $effect увидел бы расхождение с пропсом и откатил переключатель
			// везде, где editContext нет (каталог, превью).
			const updated = { ...opts.getData(), [HIDDEN_CONTACTS_KEY]: hidden };
			opts.setData(updated);

			const editContext = opts.getEditContext();
			if (!editContext) return;

			try {
				await saveComponentData(editContext, 'Footer', updated);
			} catch (err) {
				hidden = wasVisible ? hidden.filter((k) => k !== key) : [...hidden, key];
				opts.setData({ ...opts.getData(), [HIDDEN_CONTACTS_KEY]: hidden });
				console.error('Не удалось сохранить видимость контакта:', err);
				alert(err instanceof Error ? err.message : 'Не удалось сохранить настройку');
			}
		}
	};
}
