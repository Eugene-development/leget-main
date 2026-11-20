/** Общие фоны Stage v1; выбранный URL хранится в page_components.data.bgImage. */
const prefix = 'https://storage.yandexcloud.net/leget-main/templates/promo-1/';
export const stageBackgrounds = [
	{ label: 'Абстракция', url: `${prefix}stage-1.1.5.1-abstract-20261106.webp` },
	{ label: 'Тёплая архитектура', url: `${prefix}stage-1.1.5.1-warm-20261117.webp` },
	{ label: 'Графитовые волны', url: `${prefix}stage-1.1.5.1-graphite-20261117.webp` },
	{ label: 'Зелёное стекло', url: `${prefix}stage-1.1.5.1-sage-20261117.webp` }
] as const;
export const defaultStageBackground = stageBackgrounds[0].url;
