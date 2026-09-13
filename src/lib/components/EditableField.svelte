<script lang="ts">
	import type { Snippet } from 'svelte';
	import FieldToolbar from './FieldToolbar.svelte';
	import FieldVisibilityToggle from './FieldVisibilityToggle.svelte';
	import { getContext } from 'svelte';
	import { editStore } from '$lib/stores/edit.svelte';
	import {
		EDITABLE_VISIBILITY_CONTEXT,
		type EditableVisibility
	} from '$lib/utils/editable-visibility.svelte';

	/**
	 * EditableField — обёртка для поля с поддержкой inline-редактирования.
	 *
	 * При isEditable=true клик по полю открывает панель действий под настройками блока.
	 * Клик открывает EditModal (глобальный, в левом нижнем углу).
	 * Пока модалка открыта для этого поля — отображает draft вместо value (live preview).
	 */

	interface Props {
		/** Уникальный ключ поля (например "Hero.title") */
		fieldKey: string;
		/** Тип содержимого определяет значок действия. */
		kind?: 'text' | 'image';
		/** Человекочитаемое название поля для заголовка модалки */
		label: string;
		/** Текущее сохранённое значение */
		value: string;
		/** Разрешено ли редактирование */
		isEditable?: boolean;
		/** Многострочное поле */
		multiline?: boolean;
		/** Disable formatting for URLs, email and other machine-readable values. */
		richText?: boolean;
		/** Existing field intentionally stored HTML before the rich-text editor. */
		legacyHtml?: boolean;
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
		kind = 'text',
		label,
		value,
		isEditable = false,
		multiline = false,
		richText = true,
		legacyHtml = false,
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

	let wrapperEl = $state<HTMLElement | null>(null);

	// Это поле активно в модалке?
	const isActive = $derived(editStore.activeField?.key === fieldKey);

	// Модалка открыта для любого поля — скрываем все карандаши
	const anyActive = $derived(editStore.activeField !== null);

	// Отображаемое значение: draft (live preview) когда активно, иначе сохранённое
	const displayValue = $derived(isActive ? (editStore.activeField?.draft ?? value) : value);

	function openModal() {
		editStore.open({
			key: fieldKey,
			kind,
			label,
			value,
			multiline,
			richText: kind === 'text' && richText,
			legacyHtml,
			onSave
		});
	}
</script>

{#snippet fieldActions()}
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
			{#if kind === 'image'}
				<path
					d="M10 4v12M4 10h12"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
				/>
			{:else}
				<path
					d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
				/>
			{/if}
		</svg>
	</button>

	{#if onToggleVisibility}
		<FieldVisibilityToggle
			{visible}
			label={visibilityLabel}
			pending={visibilityPending}
			onToggle={onToggleVisibility}
		/>
	{/if}
{/snippet}

{#if visible || isEditable}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<svelte:element
		this={inline ? 'span' : 'div'}
		class="editable-field-wrapper relative {inline ? 'inline-block' : 'block'} {className}"
		data-hidden={!visible}
		style:min-height={isEditable && !displayValue.trim() ? '1.5rem' : undefined}
		style:min-width={isEditable && !displayValue.trim() ? '1.5rem' : undefined}
		bind:this={wrapperEl}
		role="group"
	>
		{#if isEditable && !anyActive && wrapperEl}
			<FieldToolbar target={wrapperEl} {label}>
				{@render fieldActions()}
			</FieldToolbar>
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
