<script lang="ts">
	/**
	 * Подпись кнопки, которая по наведению подменяется другим текстом
	 * (CTA дизайн-проекта: «Дизайн-проект с расчётом стоимости» → «Это бесплатно»).
	 *
	 * Требует класс `group` на самой кнопке — подмена ловит её `:hover`.
	 *
	 * Оба варианта лежат в одной ячейке grid, поэтому кнопка не меняет габариты:
	 * её ширина всегда равна ширине более длинного текста. Фазы разведены во
	 * времени (150 мс + задержка 150 мс в противоходе), иначе в середине перехода
	 * два текста наложились бы друг на друга.
	 *
	 * `disabled` — режим редактирования: подмена выключена, чтобы `EditableField`
	 * показывал редактируемый текст, а не подставной.
	 */
	let {
		text,
		hoverText = 'Это бесплатно',
		disabled = false
	}: {
		text: string;
		hoverText?: string;
		disabled?: boolean;
	} = $props();
</script>

<span class="grid">
	<span
		class="col-start-1 row-start-1 transition-opacity duration-150 ease-out {disabled
			? ''
			: 'delay-150 group-hover:opacity-0 group-hover:delay-0'}"
	>
		{text}
	</span>
	{#if !disabled}
		<span
			aria-hidden="true"
			class="col-start-1 row-start-1 place-self-center opacity-0 transition-opacity delay-0 duration-150 ease-out group-hover:opacity-100 group-hover:delay-150"
		>
			{hoverText}
		</span>
	{/if}
</span>
