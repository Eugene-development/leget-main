<script lang="ts">
	/**
	 * Переключатель светлой/тёмной темы блока.
	 *
	 * Только представление: состояние и сохранение — на вызывающей стороне
	 * (оптимистичное обновление data + saveComponentData). Используется в
	 * VersionSwitcher (HeroMain) и в блоках без переключателя версий.
	 *
	 * Палитра — токены системы: нейтраль `ink`, белое `on-dark`/`surface-raised`,
	 * а два значка сидят на категориальной шкале — солнце `cat-1` (янтарь),
	 * луна `cat-4` (индиго). Это не бренд и не интерактив: значок называет тему
	 * блока, а не состояние управления, поэтому и хью взяты категориальные.
	 */
	let {
		isLight = false,
		onToggle,
		class: className = ''
	}: {
		isLight?: boolean;
		onToggle: () => void;
		class?: string;
	} = $props();
</script>

<button
	type="button"
	class="relative flex h-[38px] w-[68px] cursor-pointer items-center rounded-full border p-[3px] shadow-2xl backdrop-blur-xl transition-all duration-300 active:scale-98 {isLight
		? 'border-ink-300/80 bg-ink-200/60 hover:border-ink-400/80'
		: 'border-on-dark/10 bg-ink-950/75 hover:border-on-dark/20'} {className}"
	onclick={onToggle}
	aria-label={isLight ? 'Включить тёмную тему' : 'Включить светлую тему'}
	title={isLight ? 'Включить тёмную тему' : 'Включить светлую тему'}
>
	<!-- Подложка: значок закреплён за позицией бегунка. Левая позиция — тёмная
	     тема (луна), правая — светлая (солнце). -->
	<span class="pointer-events-none absolute left-2.5 flex items-center justify-center opacity-40">
		<!-- Луна слева: тёмная тема (позиция бегунка при isLight = false) -->
		<svg class="h-3.5 w-3.5 text-cat-4-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2.5"
				d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
			/>
		</svg>
	</span>
	<span class="pointer-events-none absolute right-2.5 flex items-center justify-center opacity-40">
		<!-- Солнце справа: светлая тема (позиция бегунка при isLight = true) -->
		<svg class="h-3.5 w-3.5 text-cat-1-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2.5"
				d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
			/>
		</svg>
	</span>

	<!-- Подвижный бегунок: несёт значок ТЕКУЩЕЙ темы — солнце в светлой, луна в тёмной. -->
	<span
		class="flex h-[30px] w-[30px] items-center justify-center rounded-full shadow-lg transition-transform duration-300 ease-out {isLight
			? 'translate-x-[30px] bg-surface-raised text-cat-1-500 shadow-cat-1-500/20'
			: 'translate-x-0 bg-ink-900 text-cat-4-400 shadow-cat-4-500/10'}"
	>
		{#if isLight}
			<!-- Солнце: активна светлая тема -->
			<svg class="h-4 w-4 text-cat-1-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2.5"
					d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
				/>
			</svg>
		{:else}
			<!-- Луна: активна тёмная тема -->
			<svg class="h-4 w-4 text-cat-4-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2.5"
					d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
				/>
			</svg>
		{/if}
	</span>
</button>
