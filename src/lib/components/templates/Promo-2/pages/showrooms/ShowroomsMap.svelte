<script lang="ts">
	// Артикул: 2.11.2.1 — см. docs/architecture/component-articles-map.md
	import { onMount } from 'svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	let visible = $state(false);
	let sectionEl: HTMLElement;
	let mapContainer: HTMLElement;
	let mapInstance: any = $state(null);
	let searchQuery = $state('');
	let selectedPlace: any = $state(null);
	let selectedCity = $state('Москва и МО');

	$effect(() => {
		selectedCity;
		searchQuery;
		selectedPlace = null;
	});

	const showrooms: Record<
		string,
		Array<{
			city: string;
			places: Array<{ name?: string; address: string; hours: string; coords: [number, number] }>;
		}>
	> = {
		Беларусь: [
			{
				city: 'Гродно',
				places: [
					{
						name: 'Флагманский салон',
						address: 'ул. Индустриальная, 9',
						hours: 'Пн-Вс: 10:00 – 20:00',
						coords: [53.649, 23.823]
					}
				]
			},
			{
				city: 'Минск',
				places: [
					{
						name: 'ТЦ «Замок Home»',
						address: 'пр-т Победителей, 65, 4 этаж',
						hours: 'Пн-Вс: 10:00 – 22:00',
						coords: [53.926, 27.518]
					},
					{
						name: 'ТЦ «Камелот»',
						address: 'ул. Мазурова, 1',
						hours: 'Пн-Вс: 10:00 – 20:00',
						coords: [53.890632, 27.433431]
					}
				]
			}
		],
		Россия: [
			{
				city: 'Москва и МО',
				places: [
					{
						address: 'г. Москва, Подольское ш., д. 8, корп. 5',
						hours: 'Пн-Вс: 10:00 – 20:00',
						coords: [55.714561, 37.623834]
					},
					{
						address: 'г. Москва, Ленинградский пр-т, д. 74, корп. 1',
						hours: 'Пн-Вс: 10:00 – 20:00',
						coords: [55.805133, 37.516952]
					},
					{
						address: 'г. Москва, Тихорецкий б-р, д. 1, корп. 5, ТЦ «ЛЮБЛИНСКОЕ ПОЛЕ»',
						hours: 'Пн-Вс: 10:00 – 20:00',
						coords: [55.678763, 37.77961]
					},
					{
						address: 'г. Москва, Варшавское ш., д. 94',
						hours: 'Пн-Вс: 10:00 – 20:00',
						coords: [55.647193, 37.618659]
					},
					{
						address: 'г. Москва, ул. Ярцевская, д. 19, МФК «Кунцево Плаза»',
						hours: 'Пн-Вс: 10:00 – 20:00',
						coords: [55.738596, 37.411014]
					},
					{
						address: 'г. Москва, Рязанский пр-т, д. 2, корп. 2, ТРЦ «Город»',
						hours: 'Пн-Вс: 10:00 – 20:00',
						coords: [55.729873, 37.730437]
					},
					{
						address: 'г. Москва, Локомотивный проезд, д. 4, ТЦ «Парус»',
						hours: 'Пн-Вс: 10:00 – 20:00',
						coords: [55.838, 37.576861]
					},
					{
						address: 'г. Москва, ул. Вавилова, д. 3, ТРЦ «ГАГАРИНСКИЙ»',
						hours: 'Пн-Вс: 10:00 – 20:00',
						coords: [55.706883, 37.592096]
					},
					{
						address: 'г. Москва, МКАД, 25-й км, вл. 1, ТЦ «Конструктор», 2 этаж',
						hours: 'Пн-Вс: 10:00 – 20:00',
						coords: [55.583469, 37.711168]
					},
					{
						address: 'г. Москва, ш. Энтузиастов, д. 76/1',
						hours: 'Пн-Вс: 10:00 – 20:00',
						coords: [55.76447, 37.785971]
					},
					{
						address: 'г. Москва, Дмитровское ш., д. 73, корп. 1, ТЦ «Metromall»',
						hours: 'Пн-Вс: 10:00 – 20:00',
						coords: [55.857149, 37.558858]
					},
					{
						address: 'г. Москва, пр-т Мира, д. 33, корп. 1, ТО «OLYMPIC PLAZA»',
						hours: 'Пн-Вс: 10:00 – 20:00',
						coords: [55.780319, 37.632098]
					},
					{
						address: 'г. Москва, Комсомольский пр-т, д. 19',
						hours: 'Пн-Вс: 10:00 – 20:00',
						coords: [55.728865, 37.585538]
					},
					{
						address: 'г. Москва, ул. Таганская, д. 3, ТЦ «Таганский Пассаж»',
						hours: 'Пн-Вс: 10:00 – 20:00',
						coords: [55.741237, 37.658733]
					},
					{
						address: 'г. Москва, ул. Ленинская Слобода, д. 26, МЦ «ROOMER»',
						hours: 'Пн-Вс: 10:00 – 20:00',
						coords: [55.710129, 37.65461]
					},
					{
						address: 'г. Москва, Волоколамское ш., д. 71/22, корп. 3',
						hours: 'Пн-Вс: 10:00 – 20:00',
						coords: [55.821927, 37.438619]
					},
					{
						address: 'г. Москва, Хорошёвское ш., д. 16, стр. 3, ТЦ «На Беговой»',
						hours: 'Пн-Вс: 10:00 – 20:00',
						coords: [55.774274, 37.545932]
					},
					{
						address: 'г. Москва, Ленинградское ш., д. 25, МЦ «FAMILY ROOM»',
						hours: 'Пн-Вс: 10:00 – 20:00',
						coords: [55.828015, 37.489401]
					},
					{
						address: 'г. Москва, пр-т Мира, д. 211, корп. 2, ТРК «ЕВРОПОЛИС»',
						hours: 'Пн-Вс: 10:00 – 20:00',
						coords: [55.845855, 37.662093]
					},
					{
						address: 'г. Москва, Ходынский бульвар, д. 4, ТЦ «АВИАПАРК»',
						hours: 'Пн-Вс: 10:00 – 20:00',
						coords: [55.790231, 37.531289]
					}
				]
			},
			{
				city: 'Санкт-Петербург',
				places: [
					{
						name: 'ТЦ «Мебельный Континент»',
						address: 'ул. Варшавская, 3',
						hours: 'Пн-Вс: 10:00 – 20:00',
						coords: [59.882, 30.312]
					}
				]
			}
		]
	};

	const allCities = $derived(
		Object.values(showrooms).flatMap((cities) => cities.map((c) => c.city))
	);

	const filteredShowrooms = $derived.by(() => {
		for (const cities of Object.values(showrooms)) {
			const cityData = cities.filter((c) => c.city === selectedCity);
			if (cityData.length > 0) {
				return cityData
					.map((c) => ({
						...c,
						places: c.places.filter((p) => {
							if (!searchQuery) return true;
							const q = searchQuery.toLowerCase();
							return (
								(p.name && p.name.toLowerCase().includes(q)) || p.address.toLowerCase().includes(q)
							);
						})
					}))
					.filter((c) => c.places.length > 0);
			}
		}
		return [];
	});

	const totalPlaces = $derived(filteredShowrooms.reduce((acc, c) => acc + c.places.length, 0));

	$effect(() => {
		if (
			!mapInstance ||
			typeof window === 'undefined' ||
			typeof (window as any).ymaps === 'undefined'
		)
			return;

		const ymaps = (window as any).ymaps;
		mapInstance.geoObjects.removeAll();

		const placesToShow = selectedPlace
			? [selectedPlace]
			: filteredShowrooms.flatMap((c) => c.places);

		placesToShow.forEach((place: any) => {
			if (place.coords && place.coords.length === 2) {
				const placemark = new ymaps.Placemark(
					place.coords,
					{
						balloonContentHeader: place.name || 'Салон',
						balloonContentBody: place.address,
						balloonContentFooter: place.hours
					},
					{
						preset: 'islands#brownIcon',
						hideIconOnBalloonOpen: false,
						balloonOffset: [0, -30],
						balloonAutoPan: false
					}
				);
				mapInstance.geoObjects.add(placemark);
				if (selectedPlace) placemark.balloon.open();
			}
		});

		if (selectedPlace) {
			mapInstance.setCenter(selectedPlace.coords, 16, { duration: 400 });
		} else {
			const bounds = mapInstance.geoObjects.getBounds();
			if (bounds) {
				mapInstance
					.setBounds(bounds, { checkZoomRange: true, zoomMargin: 50, duration: 400 })
					.then(() => {
						if (mapInstance.getZoom() > 15) mapInstance.setZoom(15);
					});
			} else {
				mapInstance.setCenter([54.5, 31.0], 5);
			}
		}
	});

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) visible = true;
				});
			},
			{ threshold: 0.1 }
		);
		if (sectionEl) observer.observe(sectionEl);

		function initMap() {
			if (!mapContainer || typeof (window as any).ymaps === 'undefined') return;
			const ymaps = (window as any).ymaps;
			mapInstance = new ymaps.Map(mapContainer, {
				center: [54.5, 31.0],
				zoom: 5,
				controls: ['zoomControl', 'fullscreenControl']
			});
		}

		if (typeof window !== 'undefined') {
			if ((window as any).ymaps) {
				(window as any).ymaps.ready(initMap);
			} else {
				let script = document.querySelector(
					'script[src*="api-maps.yandex.ru"]'
				) as HTMLScriptElement | null;
				if (!script) {
					script = document.createElement('script');
					script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
					document.head.appendChild(script);
				}
				script.addEventListener('load', () => {
					(window as any).ymaps.ready(initMap);
				});
			}
		}

		return () => {
			observer.disconnect();
			if (mapInstance) mapInstance.destroy();
		};
	});
</script>

<section
	bind:this={sectionEl}
	class="relative scroll-mt-20 bg-surface py-section-sm lg:scroll-mt-24 lg:py-section"
	id="network-section"
>
	<div class="mx-auto max-w-screen-xl px-6 xl:px-1">
		<div class="grid items-start gap-16 lg:grid-cols-12 lg:gap-12">
			<!-- Left Column: Locations List -->
			<div class="flex flex-col opacity-0 lg:col-span-5" class:animate-fade-up={visible}>
				<h2 class="text-3xl text-primary lg:text-4xl" style="font-family: var(--font-heading);">
					Дилерская сеть салонов
				</h2>

				<div
					class="mt-8 flex flex-col items-start gap-4 border-b border-border-light pb-6 sm:flex-row sm:items-center"
				>
					<!-- City selector -->
					<div class="relative">
						<select
							bind:value={selectedCity}
							class="h-12 cursor-pointer appearance-none rounded-sm border border-border-medium bg-white pr-10 pl-4 text-xs tracking-[0.1em] text-primary transition-all duration-300 hover:border-secondary focus:border-secondary focus:outline-none"
						>
							{#each allCities as city}
								<option value={city}>{city}</option>
							{/each}
						</select>
						<div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
							<svg
								class="h-4 w-4 text-muted"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="1.5"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M19.5 8.25l-7.5 7.5-7.5-7.5"
								/>
							</svg>
						</div>
					</div>

					<!-- Search -->
					<div class="relative w-full max-w-sm">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
							<svg
								class="h-4 w-4 text-muted"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="1.5"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
								/>
							</svg>
						</div>
						<input
							type="text"
							bind:value={searchQuery}
							placeholder="Поиск по адресу..."
							class="h-12 w-full rounded-sm border border-border-medium bg-transparent pr-4 pl-10 text-sm text-primary transition-all duration-300 placeholder:text-muted focus:border-secondary focus:outline-none"
						/>
					</div>
				</div>

				<!-- Cities List -->
				<div class="relative -mx-2 mt-8 px-2">
					<div
						class="flex flex-col gap-10 {totalPlaces > 3
							? 'max-h-[400px] overflow-y-auto pr-4 pb-10 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border-light/80 [&::-webkit-scrollbar-track]:bg-transparent'
							: ''}"
					>
						{#each filteredShowrooms as cityData (cityData.city)}
							<div>
								<h3
									class="flex items-center gap-3 text-xl text-primary"
									style="font-family: var(--font-heading);"
								>
									<svg
										class="h-5 w-5 text-secondary"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="1.5"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
										/>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
										/>
									</svg>
									{cityData.city}
								</h3>

								<div class="mt-6 flex flex-col gap-6">
									{#each cityData.places as place, i ((place.name ?? place.address) + i)}
										<button
											class="group block w-full cursor-pointer border-l-2 border-border-light pl-6 text-left transition-colors duration-300 hover:border-secondary"
											class:!border-secondary={selectedPlace === place}
											onclick={() => {
												selectedPlace = selectedPlace === place ? null : place;
											}}
										>
											{#if place.name}
												<h4 class="text-base text-primary">{place.name}</h4>
											{/if}
											<p class="{place.name ? 'mt-2' : ''} text-sm text-secondary">
												{place.address}
											</p>
											<div class="mt-4 flex flex-col gap-1.5 text-xs text-muted">
												<div class="flex items-center gap-2">
													<svg
														class="h-3.5 w-3.5"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
														stroke-width="1.5"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
														/>
													</svg>
													{place.hours}
												</div>
											</div>
										</button>
									{/each}
								</div>
							</div>
						{/each}

						{#if filteredShowrooms.length === 0}
							<div class="flex flex-col items-center py-12 text-center">
								<svg
									class="h-10 w-10 text-border-medium"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									stroke-width="1.5"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
									/>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
									/>
								</svg>
								<p class="mt-4 text-sm text-secondary">
									В выбранном городе пока нет наших фирменных салонов.
								</p>
								<p class="mt-2 text-xs text-muted">Вы можете оформить заявку на выездной расчет.</p>
							</div>
						{/if}
					</div>
					{#if totalPlaces > 3}
						<div
							class="pointer-events-none absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-surface to-transparent"
						></div>
					{/if}
				</div>

				<div class="mt-10 flex">
					<a
						href="/contact"
						class="group inline-flex items-center gap-3 rounded-sm border border-border-medium px-6 py-3 text-xs tracking-[0.15em] text-primary uppercase transition-all duration-500 hover:border-secondary hover:text-secondary"
					>
						Запись в салон
						<svg
							class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="1.5"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
							/>
						</svg>
					</a>
				</div>
			</div>

			<!-- Right Column: Yandex Map -->
			<div
				class="sticky top-32 h-[600px] opacity-0 lg:col-span-7 lg:h-[750px]"
				class:animate-fade-up={visible}
				style="animation-delay: 0.3s"
			>
				<div class="relative h-full w-full overflow-hidden bg-surface-warm shadow-soft">
					<div bind:this={mapContainer} class="absolute inset-0 transition-all duration-1000"></div>
				</div>
			</div>
		</div>
	</div>
</section>
