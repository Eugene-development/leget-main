<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount, tick } from 'svelte';
	import { editStore } from '$lib/stores/edit.svelte';

	/**
	 * EditableField — обёртка для поля с поддержкой inline-редактирования.
	 *
	 * При isEditable=true показывает иконку карандаша при наведении.
	 * Клик открывает EditModal (глобальный, в левом нижнем углу).
	 * Пока модалка открыта для этого поля — отображает draft вместо value (live preview).
	 */

	interface Props {
		/** Уникальный ключ поля (например "Hero.title") */
		fieldKey: string;
		/** Человекочитаемое название поля для заголовка модалки */
		label: string;
		/** Текущее сохранённое значение */
		value: string;
		/** Разрешено ли редактирование */
		isEditable?: boolean;
		/** Многострочное поле */
		multiline?: boolean;
		/** Отображать как инлайновый элемент */
		inline?: boolean;
		/** Callback сохранения */
		onSave: (value: string) => Promise<void>;
		/** CSS-класс для контейнера */
		class?: string;
		/**
		 * Snippet для отображения контента.
		 * Получает текущее отображаемое значение (draft или value).
		 */
		children: Snippet<[string]>;
	}

	let {
		fieldKey,
		label,
		value,
		isEditable = false,
		multiline = false,
		inline = false,
		onSave,
		class: className = '',
		children
	}: Props = $props();

	let hovered = $state(false);
	let wrapperEl: HTMLElement | null = $state(null);
	let pencilAlign: 'left' | 'center' | 'right' = $state('center');

	// Это поле активно в модалке?
	const isActive = $derived(editStore.activeField?.key === fieldKey);

	// Модалка открыта для любого поля — скрываем все карандаши
	const anyActive = $derived(editStore.activeField !== null);

	// Отображаемое значение: draft (live preview) когда активно, иначе сохранённое
	const displayValue = $derived(isActive ? (editStore.activeField?.draft ?? value) : value);
	const pencilPositionClass = $derived.by(() => {
		if (pencilAlign === 'left') return 'left-0 -translate-x-0';
		if (pencilAlign === 'right') return 'right-0 translate-x-0';
		return 'left-1/2 -translate-x-1/2';
	});

	async function updatePencilAlignment() {
		await tick();
		if (!wrapperEl) return;
		const textAlign = getComputedStyle(wrapperEl).textAlign;
		if (textAlign === 'center') {
			pencilAlign = 'center';
			return;
		}
		if (textAlign === 'right' || textAlign === 'end') {
			pencilAlign = 'right';
			return;
		}
		pencilAlign = 'left';
	}

	function openModal() {
		editStore.open({
			key: fieldKey,
			label,
			value,
			multiline,
			onSave
		});
	}

	onMount(() => {
		updatePencilAlignment();
		const onResize = () => updatePencilAlignment();
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	});

	$effect(() => {
		className;
		inline;
		updatePencilAlignment();
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<svelte:element
	this={inline ? 'span' : 'div'}
	class="editable-field-wrapper relative {inline ? 'inline-block' : 'block'} {className}"
	bind:this={wrapperEl}
	role="group"
	onmouseenter={() => {
		hovered = true;
	}}
	onmouseleave={() => {
		hovered = false;
	}}
>
	<!-- Иконка карандаша — скрыта когда любая модалка открыта -->
	{#if isEditable && !anyActive}
		<button
			type="button"
			onclick={openModal}
			class="absolute -top-3 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow-md ring-1 transition-all hover:bg-indigo-50 hover:ring-indigo-400 {pencilPositionClass}"
			class:ring-indigo-400={isActive}
			class:bg-indigo-50={isActive}
			class:ring-gray-200={!isActive}
			style="opacity: {hovered || isActive ? 1 : 0}; pointer-events: {hovered || isActive
				? 'auto'
				: 'none'};"
			title="Редактировать: {label}"
			aria-label="Редактировать: {label}"
			aria-pressed={isActive}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-3.5 w-3.5 transition-colors"
				class:text-indigo-600={isActive}
				class:text-gray-500={!isActive}
				viewBox="0 0 20 20"
				fill="currentColor"
				aria-hidden="true"
			>
				<path
					d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
				/>
			</svg>
		</button>
	{/if}

	<!-- Контент: передаём displayValue в snippet -->
	{@render children(displayValue)}
</svelte:element>
