<script lang="ts">
	// Переключатель режима просмотра для посетителя: строками или плиткой.
	//
	// Тон намеренно тихий: это служебный контрол рядом со счётчиком, а не
	// призыв к действию. Активное состояние держится поверхностью карточки и
	// цветом значка, без заливки акцентом — залитая пилюля здесь спорила бы
	// с единственным акцентом секции, подписью «Смотреть проект».
	//
	// Кнопка 44px на телефоне и 32px от `sm` — редкий случай, когда контрол на
	// узком экране КРУПНЕЕ: 44px это нижний предел цели для пальца, а на
	// десктопе с мышью такой размер рядом со счётчиком в 11px читался бы как
	// главный элемент шапки, которым он не является.
	import type { FeedView } from './data';
	import '../../../theme.css';

	// Колбэк, а не `bind:`: выбор нужно не только показать, но и запомнить, а
	// запоминание — забота владельца состояния, не кнопки.
	let { view, onpick }: { view: FeedView; onpick: (next: FeedView) => void } = $props();

	const modes: { id: FeedView; label: string }[] = [
		{ id: 'list', label: 'Списком' },
		{ id: 'tiles', label: 'Плиткой' }
	];
</script>

<!--
	`aria-pressed`, а не `radiogroup`: кнопок две, они не образуют формы и не
	отправляются — это две переключаемые кнопки, и скринридер должен объявить
	их именно так.
-->
<div class="p1-border flex items-center gap-0.5 rounded-lg border p-0.5">
	{#each modes as mode (mode.id)}
		<button
			type="button"
			class="flex size-11 cursor-pointer items-center justify-center rounded-md transition-[background-color,color] duration-[var(--ds-motion-duration-ui)] ease-ui focus-visible:ring-2 focus-visible:ring-[var(--p1-field-focus)] focus-visible:outline-none sm:size-8 {view ===
			mode.id
				? 'p1-card p1-title shadow-sm'
				: 'p1-muted hover:text-[var(--p1-title)]'}"
			aria-pressed={view === mode.id}
			aria-label={mode.label}
			title={mode.label}
			onclick={() => onpick(mode.id)}
		>
			{#if mode.id === 'list'}
				<svg
					class="size-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-width="var(--ds-icon-stroke)"
						d="M3.75 6.75h3.5M3.75 12h3.5M3.75 17.25h3.5M10.75 6.75h9.5M10.75 12h9.5M10.75 17.25h9.5"
					/>
				</svg>
			{:else}
				<svg
					class="size-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path
						stroke-linejoin="round"
						stroke-width="var(--ds-icon-stroke)"
						d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z"
					/>
				</svg>
			{/if}
		</button>
	{/each}
</div>
