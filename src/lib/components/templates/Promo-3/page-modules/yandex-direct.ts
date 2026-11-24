import type { ComponentMap } from '../../types';
import YandexDirectHero from '../pages/yandex-direct/Hero.svelte';
import YandexDirectUSP from '../pages/yandex-direct/USP.svelte';
import YandexDirectAdvantages from '../pages/yandex-direct/Advantages.svelte';
import YandexDirectSteps from '../pages/yandex-direct/Steps.svelte';
import YandexDirectSocialProof from '../pages/yandex-direct/SocialProof.svelte';
import YandexDirectOffer from '../pages/yandex-direct/Offer.svelte';
import YandexDirectCTA from '../pages/yandex-direct/CTA.svelte';

export default {
	Hero: YandexDirectHero,
	USP: YandexDirectUSP,
	Advantages: YandexDirectAdvantages,
	Steps: YandexDirectSteps,
	SocialProof: YandexDirectSocialProof,
	Offer: YandexDirectOffer,
	CTA: YandexDirectCTA
} satisfies ComponentMap;
