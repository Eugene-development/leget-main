<script lang="ts">
	import { browser } from '$app/environment';
	import { getGraphQLUrl } from '$lib/utils/config';

	let {
		isEditable = false,
		triggerClass = '',
		licenseId = null
	}: {
		isEditable?: boolean;
		triggerClass?: string;
		licenseId?: string | null;
	} = $props();

	// Кэш владения в sessionStorage: ownership-запрос — сетевой раунд-трип, и без
	// кэша кнопка всегда всплывает заметно позже соседей (SEO/Директ), которые
	// рендерятся сразу по isEditable. Читаем результат прошлой проверки синхронно
	// при инициализации, чтобы на повторных заходах кнопка появлялась вместе с
	// остальными, а $effect ниже лишь тихо перепроверяет владение в фоне.
	const cacheKey = (id: string) => `site-settings-owner:${id}`;
	const readOwnerCache = (id: string | null): boolean => {
		if (!browser || !id) return false;
		try {
			return sessionStorage.getItem(cacheKey(id)) === '1';
		} catch {
			return false;
		}
	};

	let isOwner = $state(readOwnerCache(isEditable ? licenseId : null));

	$effect(() => {
		if (!browser || !isEditable || !licenseId) {
			isOwner = false;
			return;
		}

		isOwner = readOwnerCache(licenseId);

		const token = localStorage.getItem('auth_token');
		if (!token) return;
		const controller = new AbortController();

		void fetch(getGraphQLUrl(), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify({ query: 'query SiteSettingsOwnership { myLicenses { id } }' }),
			signal: controller.signal
		})
			.then((response) => (response.ok ? response.json() : null))
			.then((result) => {
				if (!result?.errors?.length) {
					const owner = Boolean(
						result?.data?.myLicenses?.some(
							(license: { id?: string | number }) => String(license.id) === String(licenseId)
						)
					);
					isOwner = owner;
					try {
						sessionStorage.setItem(cacheKey(licenseId), owner ? '1' : '0');
					} catch {
						/* приватный режим/квота — просто без кэша */
					}
				}
			})
			.catch(() => undefined);

		return () => controller.abort();
	});
</script>

{#if isEditable && isOwner}
	<a
		href="/site-settings/unlock"
		target="_blank"
		rel="noopener noreferrer"
		class="relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center transition-colors after:absolute after:-inset-1 after:content-[''] focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2 {triggerClass}"
		title="Общие настройки сайта"
		aria-label="Открыть общие настройки сайта в новой вкладке"
	>
		<svg
			class="h-[18px] w-[18px]"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			aria-hidden="true"
		>
			<path
				d="M4 7h10M18 7h2M4 17h2M10 17h10M8 4v6M8 14v6M16 4v6M16 14v6"
				stroke-linecap="round"
				stroke-linejoin="round"
				style="stroke-width: var(--ds-icon-stroke)"
			/>
			<circle cx="16" cy="7" r="2" fill="currentColor" stroke="none" />
			<circle cx="8" cy="17" r="2" fill="currentColor" stroke="none" />
		</svg>
	</a>
{/if}
