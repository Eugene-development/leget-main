export type HeroBackground = { url: string; enabled: boolean };

const DEFAULT_BACKGROUNDS = [
	'https://storage.yandexcloud.net/novostroy/bg/hero-2.jpg',
	'https://storage.yandexcloud.net/novostroy/bg/hero-1.jpg',
	'https://storage.yandexcloud.net/leget-main/templates/promo-1/hero-interior-3-20260908.webp',
	'https://storage.yandexcloud.net/leget-main/templates/promo-1/hero-interior-4-neoclassic-20260909.webp',
	'https://storage.yandexcloud.net/leget-main/templates/promo-1/hero-interior-5-user-20260910.webp'
];

export function getHeroBackgrounds(data: Record<string, unknown>): HeroBackground[] {
	const enabled = Array.isArray(data.bgImagesEnabledV1) ? data.bgImagesEnabledV1 : [];
	const toBackground = (url: string, index: number): HeroBackground => ({
		url,
		enabled: enabled[index] !== false
	});
	if (Array.isArray(data.bgImagesV1)) {
		const stored = data.bgImagesV1.flatMap((url, index) =>
			typeof url === 'string' && url.trim() !== '' ? [toBackground(url, index)] : []
		);
		if (stored.length > 0) return stored;
	}
	const legacy = [data.bgImageV1, data.bgImage].find(
		(value): value is string => typeof value === 'string' && value.trim() !== ''
	);
	return (legacy ? [legacy] : DEFAULT_BACKGROUNDS).map(toBackground);
}

// Keep each switch attached to its image when adding, replacing or removing entries.
export function backgroundFields(backgrounds: HeroBackground[]) {
	return {
		bgImagesV1: backgrounds.map(({ url }) => url),
		bgImagesEnabledV1: backgrounds.map(({ enabled }) => enabled)
	};
}
