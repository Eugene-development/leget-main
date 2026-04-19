<script>
	import { page } from '$app/stores';
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
	<div class="text-center">
		{#if $page.status === 404}
			<p class="text-6xl font-bold text-gray-300">404</p>
			<h1 class="mt-4 text-2xl font-semibold text-gray-800">Сайт не найден</h1>
			<p class="mt-2 text-gray-500">Site not found</p>
		{:else if $page.status === 403}
			<p class="text-6xl font-bold text-gray-300">403</p>
			<h1 class="mt-4 text-2xl font-semibold text-gray-800">Сайт приостановлен</h1>
			<p class="mt-2 text-gray-500">Site suspended</p>
		{:else if $page.status === 502}
			<p class="text-6xl font-bold text-gray-300">502</p>
			<h1 class="mt-4 text-2xl font-semibold text-gray-800">Ошибка сервера</h1>
			<p class="mt-2 text-gray-500">Server error</p>
		{:else}
			<p class="text-6xl font-bold text-gray-300">{$page.status}</p>
			<h1 class="mt-4 text-2xl font-semibold text-gray-800">Произошла ошибка</h1>
			<p class="mt-2 text-gray-500">{$page.error?.message ?? 'Something went wrong'}</p>
		{/if}
	</div>
</div>
