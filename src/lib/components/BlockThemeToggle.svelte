<script lang="ts">
	/**
	 * Тумблер темы для блоков БЕЗ переключателя версий.
	 *
	 * У блоков со свитчером тумблер живёт в панели VersionSwitcher (вверху справа),
	 * здесь же он ставится в правый нижний угол секции — вверху справа PageRenderer
	 * рисует кнопку «Сброс». Секция-родитель должна быть `relative`.
	 */
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import type { EditContext } from '$lib/utils/page-edit';

	let {
		isLight = false,
		onToggle,
		isEditable = false,
		editContext = null,
		class: className = ''
	}: {
		isLight?: boolean;
		onToggle: () => void;
		isEditable?: boolean;
		editContext?: EditContext | null;
		/** Переопределение позиции, если в углу блока уже что-то есть. */
		class?: string;
	} = $props();
</script>

{#if isEditable && editContext}
	<div class="absolute right-6 bottom-6 z-40 {className}">
		<ThemeToggle {isLight} {onToggle} />
	</div>
{/if}
