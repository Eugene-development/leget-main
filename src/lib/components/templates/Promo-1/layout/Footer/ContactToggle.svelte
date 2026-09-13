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
	import FieldToolbar from '$lib/components/FieldToolbar.svelte';
	import FieldVisibilityToggle from '$lib/components/FieldVisibilityToggle.svelte';
	import type { ContactKey, ContactVisibility } from './contacts.svelte';

	let {
		contacts,
		contactKey
	}: {
		contacts: ContactVisibility;
		contactKey: ContactKey;
		class?: string;
	} = $props();

	let marker = $state<HTMLSpanElement>();
	const visible = $derived(contacts.isVisible(contactKey));
</script>

<span bind:this={marker} hidden></span>
{#if marker?.parentElement}
	<FieldToolbar target={marker.parentElement} label={contacts.label(contactKey)}>
		<FieldVisibilityToggle
			{visible}
			label={contacts.label(contactKey) + ' в футере'}
			onToggle={(event) => contacts.toggle(contactKey, event)}
		/>
	</FieldToolbar>
{/if}
