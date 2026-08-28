<script lang="ts">
	// Артикул: 1.П.1.2 — см. docs/architecture/component-articles.md
	import { isLightBlock } from '$lib/utils/block-theme';
	import type { ActiveAction } from '../../../pages/actions/actionCards';
	import '../../../theme.css';

	// Вариант 2 полосы акций — бегущая лента.
	//
	// Отличие от варианта 1 в композиции, а не в данных: акции едут
	// непрерывной строкой, поэтому их видно все сразу, а не по одной. Плата —
	// движение в самом верху страницы; наведение и `prefers-reduced-motion`
	// его останавливают.
	//
	// Световая линия сверху — та же, что у баннера v2 (`p1-accent` через
	// color-mix): полоса и баннер стоят друг на друге, и общая деталь связывает
	// их в одну шапку, а не в две независимые ленты.
	let {
		data = {},
		actions = [],
		onClose
	}: {
		data: Record<string, unknown>;
		actions: ActiveAction[];
		onClose: () => void;
	} = $props();

	const isLight = $derived(isLightBlock(data, 'dark', 'promoTheme'));

	// Скорость постоянная, а не длительность: восемь акций едут дольше двух,
	// иначе длинная лента летела бы, а короткая ползла. ~9 секунд на акцию.
	const duration = $derived(`${Math.max(actions.length, 2) * 9}s`);
</script>

<div class="promo-strip" data-p1-theme={isLight ? 'light' : 'dark'}>
	<div
		class="p1-surface p1-line relative flex h-12 items-center border-b px-4 sm:px-8 lg:h-10"
		role="complementary"
		aria-label="Акции"
	>
		<div
			aria-hidden="true"
			class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color-mix(in_oklab,var(--p1-accent)_55%,transparent)] to-transparent"
		></div>

		<span class="p1-label p1-muted hidden shrink-0 pr-3.5 whitespace-nowrap lg:inline">Акции</span>
		<span class="p1-line hidden h-3.5 shrink-0 border-l lg:block" aria-hidden="true"></span>

		<!-- Лента. Два одинаковых набора подряд, едем на -50%: когда прокрутка
		     уходит из первого набора, под курсором оказывается пиксель в пиксель
		     та же картинка — шва нет. Второй набор — копия для глаза, для
		     скринридера он скрыт. -->
		<div class="promo-marquee relative min-w-0 flex-1 overflow-hidden">
			<div class="promo-track flex w-max items-center" style="--promo-mq-duration: {duration}">
				{#each [0, 1] as set (set)}
					<div class="flex items-center" aria-hidden={set === 1 ? 'true' : undefined}>
						{#each actions as action (action.id)}
							<a href="/actions" class="flex items-center gap-2.5 px-6">
								<span class="p1-title text-xs font-semibold tracking-[0.02em] whitespace-nowrap">
									{action.badge}
								</span>
								<svg
									viewBox="0 0 2 2"
									class="p1-muted inline h-0.5 w-0.5 shrink-0 fill-current opacity-60"
									aria-hidden="true"
								>
									<circle cx={1} cy={1} r={1} />
								</svg>
								<span class="p1-body text-xs whitespace-nowrap">{action.title}</span>
							</a>
						{/each}
					</div>
				{/each}
			</div>
		</div>

		<span class="p1-line hidden h-3.5 shrink-0 border-l lg:block" aria-hidden="true"></span>

		<a
			href="/actions"
			class="p1-body p1-accent-hover hidden shrink-0 items-center gap-1.5 pl-3.5 text-xs whitespace-nowrap transition-colors lg:flex"
		>
			Все акции
			<svg
				class="h-3 w-3 [stroke-width:var(--ds-icon-stroke)]"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M5 12h14M13 6l6 6-6 6" />
			</svg>
		</a>

		<button
			type="button"
			onclick={onClose}
			class="p1-muted p1-card-hover p1-accent-hover -mr-2 ml-2 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors lg:-mr-1 lg:ml-3.5 lg:size-6"
			aria-label="Скрыть акции до конца сессии"
			title="Скрыть до конца сессии"
		>
			<svg
				class="h-3.5 w-3.5 [stroke-width:var(--ds-icon-stroke)]"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M6 6l12 12M18 6L6 18" />
			</svg>
		</button>
	</div>
</div>

<style>
	/* Края ленты гасятся в поверхность полосы, а не обрезаются: акция не должна
	   вылезать из-под разделителя половиной буквы. Маска, а не два градиента
	   сверху, — под полосой нет своего фона, `p1-surface` приходит из системы. */
	.promo-marquee {
		mask-image: linear-gradient(
			to right,
			transparent,
			#000 40px,
			#000 calc(100% - 40px),
			transparent
		);
	}

	.promo-track {
		animation: promo-marquee var(--promo-mq-duration, 30s) linear infinite;
	}

	.promo-marquee:hover .promo-track,
	.promo-marquee:focus-within .promo-track {
		animation-play-state: paused;
	}

	/* Движение по запросу системы снимается целиком: лента встаёт, а видимую
	   часть можно прокрутить рукой — иначе акции за краем стали бы недоступны. */
	@media (prefers-reduced-motion: reduce) {
		.promo-track {
			animation: none;
		}

		.promo-marquee {
			overflow-x: auto;
		}
	}

	@keyframes promo-marquee {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}
</style>
