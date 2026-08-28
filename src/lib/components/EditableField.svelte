<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getContext, onMount, tick } from 'svelte';
	import { editStore } from '$lib/stores/edit.svelte';
	import {
		EDITABLE_VISIBILITY_CONTEXT,
		type EditableVisibility
	} from '$lib/utils/editable-visibility.svelte';

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
		/** Показывается ли часть компонента обычному посетителю. */
		visible?: boolean;
		/** Подпись для переключателя видимости в винительном падеже. */
		visibilityLabel?: string;
		/** Сохранение состояния видимости выполняется владельцем компонента. */
		onToggleVisibility?: ((event: MouseEvent) => void | Promise<void>) | null;
		/** Блокирует повторный клик, пока состояние сохраняется. */
		visibilityPending?: boolean;
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
		visible: explicitVisible,
		visibilityLabel = label,
		onToggleVisibility: explicitOnToggleVisibility = null,
		visibilityPending: explicitVisibilityPending,
		class: className = '',
		children
	}: Props = $props();

	// PageRenderer предоставляет контекст автоматически для каждого компонента.
	// Явные пропсы остаются приоритетными для составных частей, которым требуется
	// собственная структурная логика (например, логотипы партнёров в HeroMain v1).
	const visibilityContext = getContext<EditableVisibility | null>(EDITABLE_VISIBILITY_CONTEXT);
	const visibilityKey = $derived(
		fieldKey.includes('.') ? fieldKey.slice(fieldKey.indexOf('.') + 1) : fieldKey
	);
	const visible = $derived(explicitVisible ?? visibilityContext?.isVisible(visibilityKey) ?? true);
	const onToggleVisibility = $derived(
		explicitOnToggleVisibility ??
			(visibilityContext
				? (event: MouseEvent) => visibilityContext.toggle(visibilityKey, event)
				: null)
	);
	const visibilityPending = $derived(
		explicitVisibilityPending ?? visibilityContext?.isPending(visibilityKey) ?? false
	);

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
	const visibilityTitle = $derived(`${visible ? 'Скрыть' : 'Показать'} ${visibilityLabel}`);

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

{#if visible || isEditable}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<svelte:element
		this={inline ? 'span' : 'div'}
		class="editable-field-wrapper relative {inline ? 'inline-block' : 'block'} {className}"
		data-hidden={!visible}
		bind:this={wrapperEl}
		role="group"
		onmouseenter={() => {
			hovered = true;
		}}
		onmouseleave={() => {
			hovered = false;
		}}
	>
		<!-- Карандаш и тумблер составляют одну локальную панель поля. -->
		{#if isEditable && !anyActive}
			<div
				class="editable-field-controls absolute -top-3 z-20 flex h-6 items-center gap-1 transition-opacity duration-[var(--ds-motion-duration-ui)] ease-ui {pencilPositionClass}"
				style="opacity: {hovered || isActive || !visible ? 1 : 0}; pointer-events: {hovered ||
				isActive ||
				!visible
					? 'auto'
					: 'none'};"
			>
				<button
					type="button"
					onclick={openModal}
					class="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-surface-raised/90 shadow-md ring-1 transition-all duration-[var(--ds-motion-duration-ui)] ease-ui hover:bg-link-50 hover:ring-link-400 focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2 focus-visible:outline-none"
					class:ring-link-400={isActive}
					class:bg-link-50={isActive}
					class:ring-ink-200={!isActive}
					title="Редактировать: {label}"
					aria-label="Редактировать: {label}"
					aria-pressed={isActive}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-3.5 w-3.5 transition-colors"
						class:text-link-600={isActive}
						class:text-ink-500={!isActive}
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
					>
						<path
							d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
						/>
					</svg>
				</button>

				{#if onToggleVisibility}
					<button
						type="button"
						role="switch"
						aria-checked={visible}
						aria-label={visibilityTitle}
						aria-busy={visibilityPending}
						title={visibilityTitle}
						disabled={visibilityPending}
						onclick={(event) => onToggleVisibility?.(event)}
						class="relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full border-2 border-surface-raised/80 shadow-md transition-colors duration-[var(--ds-motion-duration-ui)] ease-ui focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60 {visible
							? 'bg-link-500'
							: 'bg-ink-400'}"
					>
						<span
							class="pointer-events-none inline-block size-5 rounded-full bg-surface-raised shadow-sm transition-transform duration-[var(--ds-motion-duration-ui)] ease-ui {visible
								? 'translate-x-4'
								: 'translate-x-0'}"
						></span>
					</button>
				{/if}
			</div>
		{/if}

		<!-- Контент: передаём displayValue в snippet -->
		{@render children(displayValue)}
	</svelte:element>
{/if}

<style>
	/* В режиме редактирования скрытая часть остаётся как ориентир, но локальная
	   панель управления не должна тускнеть вместе с ней: иначе включить её обратно
	   трудно и визуально, и моторно. Snippet-элемент глобальный, корень — scoped. */
	.editable-field-wrapper[data-hidden='true'] > :global(:not(.editable-field-controls)) {
		opacity: 0.45;
		filter: grayscale(1);
	}
</style>
