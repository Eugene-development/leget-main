<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import LoginModal from '$lib/components/LoginModal.svelte';

	let { data }: { data: Record<string, unknown> } = $props();

	let formSubmitted = $state(false);
	let testbot = $state('');
	let showLoginModal = $state(false);

	const siteName = $derived(typeof data?.siteName === 'string' ? data.siteName : 'Новострой');

	// Простая обработка формы (без backend пока)
	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		const formData = new FormData(event.target as HTMLFormElement);
		const email = formData.get('email-address');

		if (email && !testbot) {
			formSubmitted = true;
			console.log('Email submitted:', email);
		}
	}

	function handleAuthClick() {
		if ($auth.isAuthenticated) {
			auth.logout();
		} else {
			showLoginModal = true;
		}
	}
</script>

<footer class="bg-gray-900">
	<div class="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
		<div class="xl:grid xl:grid-cols-3 xl:gap-8">
			<a href="/">
				<span class="sr-only">{siteName}</span>
				<img
					class="h-14 w-auto transition delay-100 duration-500 ease-in-out hover:scale-110 sm:h-48"
					src="https://storage.yandexcloud.net/brand-logo/novostroy/logomain.png"
					alt="Логотип"
				/>
			</a>
			<div class="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
				<div class="md:grid md:grid-cols-2 md:gap-8">
					<div>
						<h3 class="text-sm/6 font-semibold text-white">Информация</h3>
						<ul role="list" class="mt-6 space-y-4">
							<li>
								<a href="/about" class="text-sm/6 text-gray-400 hover:text-white">О компании</a>
							</li>
							<li>
								<a href="/partnership" class="text-sm/6 text-gray-400 hover:text-white"
									>Партнёрство</a
								>
							</li>
							<li>
								<a href="/testimonials" class="text-sm/6 text-gray-400 hover:text-white">Отзывы</a>
							</li>
							<li>
								<a href="/contacts" class="text-sm/6 text-gray-400 hover:text-white">Контакты</a>
							</li>
						</ul>
					</div>
					<div class="mt-10 md:mt-0">
						<h3 class="text-sm/6 font-semibold text-white">Услуги</h3>
						<ul role="list" class="mt-6 space-y-4">
							<li>
								<a href="/consultation" class="text-sm/6 text-gray-400 hover:text-white"
									>Консультация</a
								>
							</li>
							<li>
								<a href="/design-project" class="text-sm/6 text-gray-400 hover:text-white"
									>Дизайн интерьера</a
								>
							</li>
							<li>
								<a href="/measurement" class="text-sm/6 text-gray-400 hover:text-white">Замер</a>
							</li>
							<li>
								<a href="/furniture-project" class="text-sm/6 text-gray-400 hover:text-white"
									>Проектирование мебели</a
								>
							</li>
							<li>
								<a href="/assembly" class="text-sm/6 text-gray-400 hover:text-white"
									>Сборка и установка</a
								>
							</li>
						</ul>
					</div>
				</div>
				<div class="md:grid md:grid-cols-2 md:gap-8">
					<div>
						<h3 class="text-sm/6 font-semibold text-white">Каталог</h3>
						<ul role="list" class="mt-6 space-y-4">
							<li>
								<a href="/mebel" class="text-sm/6 text-gray-400 hover:text-white">Мебель</a>
							</li>
							<li>
								<a href="/stoleshnica" class="text-sm/6 text-gray-400 hover:text-white"
									>Столешницы</a
								>
							</li>
							<li>
								<a href="/tehnika" class="text-sm/6 text-gray-400 hover:text-white"
									>Бытовая техника</a
								>
							</li>
							<li>
								<a href="/santehnika" class="text-sm/6 text-gray-400 hover:text-white">Сантехника</a
								>
							</li>
						</ul>
					</div>
					<div class="mt-10 md:mt-0">
						<h3 class="text-sm/6 font-semibold text-white">Вакансии</h3>
						<ul role="list" class="mt-6 space-y-4">
							<li>
								<a href="/vacancy/designer" class="text-sm/6 text-gray-400 hover:text-white"
									>Дизайнер</a
								>
							</li>
							<li>
								<a href="/vacancy/assembler" class="text-sm/6 text-gray-400 hover:text-white"
									>Сборщик</a
								>
							</li>
							<li>
								<a href="/vacancy/driver" class="text-sm/6 text-gray-400 hover:text-white"
									>Водитель</a
								>
							</li>
							<li>
								<a href="/vacancy/marketer" class="text-sm/6 text-gray-400 hover:text-white"
									>Маркетолог</a
								>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
		<div
			class="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24 lg:flex lg:items-center lg:justify-between"
		>
			<div>
				<h3 class="text-sm/6 font-semibold text-white">Подписка на новости</h3>
				<p class="mt-2 text-sm/6 text-gray-300">
					Подпишитесь на новости и будьте в курсе всех новинок и акций.
				</p>
			</div>
			{#if formSubmitted}
				<span class="text-sm/6 text-gray-300">Спасибо за подписку!</span>
			{:else}
				<form onsubmit={handleSubmit} class="mt-6 sm:flex sm:max-w-md lg:mt-0">
					<label for="email-address" class="sr-only">Адрес электронной почты</label>
					<!-- Honeypot-поле (скрытое) -->
					<div class="hidden">
						<label for="checkbot" class="block text-sm font-medium text-gray-700"
							>Оставьте это поле пустым</label
						>
						<input
							type="text"
							id="checkbot"
							name="checkbot"
							bind:value={testbot}
							tabindex="-1"
							autocomplete="off"
							class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
						/>
					</div>
					<input
						type="email"
						name="email-address"
						id="email-address"
						autocomplete="email"
						required
						class="w-full min-w-0 rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-pink-500 sm:w-56 sm:text-sm/6"
						placeholder="Введите вашу почту"
					/>
					<div class="mt-4 sm:ml-4 sm:mt-0 sm:shrink-0">
						<button
							type="submit"
							class="flex w-full items-center justify-center rounded-md bg-pink-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pink-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
							>Отправить</button
						>
					</div>
				</form>
			{/if}
		</div>
		<div class="mt-8 border-t border-white/10 pt-8 md:flex md:items-center md:justify-between">
			<div class="flex items-center gap-8 md:order-2">
				<button
					type="button"
					onclick={handleAuthClick}
					class="text-sm font-medium text-gray-400 hover:text-white transition-colors"
				>
					{$auth.isAuthenticated ? 'Выйти' : 'Личный кабинет'}
				</button>
				<iframe
					title="stars"
					src="https://yandex.ru/sprav/widget/rating-badge/75907151870?type=rating"
					width="150"
					height="50"
					style="border: none;"
				></iframe>
			</div>
			<p class="mt-8 text-sm/6 text-gray-400 md:order-1 md:mt-0">
				&copy; {new Date().getFullYear()} Компания "{siteName}". Все права защищены.
			</p>
		</div>
	</div>
</footer>

{#if showLoginModal}
	<LoginModal onClose={() => (showLoginModal = false)} />
{/if}
