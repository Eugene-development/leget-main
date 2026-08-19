<script lang="ts">
	/**
	 * Переключатель видимости одной строки контактов. Виден только в режиме
	 * редактирования — обычному посетителю отключённая строка просто не приходит.
	 *
	 * Отдельный компонент, а не сниппет в каждой версии: три варианта футера
	 * обязаны выглядеть и вести себя одинаково в редакторе, иначе владелец сайта
	 * при смене варианта видит разный интерфейс у одной и той же настройки.
	 * Внешний вид — общий для платформы (тот же, что у рубрик каталога в шапке).
	 */
	import type { ContactKey, ContactVisibility } from './contacts.svelte';

	let {
		contacts,
		contactKey,
		class: className = ''
	}: {
		contacts: ContactVisibility;
		contactKey: ContactKey;
		class?: string;
	} = $props();

	const visible = $derived(contacts.isVisible(contactKey));
	const title = $derived(
		`${visible ? 'Скрыть' : 'Показать'} ${contacts.label(contactKey)} в футере`
	);
</script>

<button
	type="button"
	role="switch"
	aria-checked={visible}
	aria-label={title}
	{title}
	onclick={(e) => contacts.toggle(contactKey, e)}
	class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-link-500 focus:ring-offset-2 focus:outline-none {visible
		? 'bg-link-500'
		: 'bg-ink-300'} {className}"
>
	<span
		class="pointer-events-none relative inline-block h-4 w-4 transform rounded-full bg-surface-raised shadow-sm ring-0 transition duration-200 ease-in-out {visible
			? 'translate-x-4'
			: 'translate-x-0'}"
	></span>
</button>
