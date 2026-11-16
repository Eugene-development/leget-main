<script lang="ts">
	import { getAuthToken } from '$lib/utils/auth-session';
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

	// svelte-ignore state_referenced_locally — synchronous cache snapshot is intentional;
	// the effect below tracks both props and refreshes ownership when either changes.
	let isOwner = $state(readOwnerCache(isEditable ? licenseId : null));

	$effect(() => {
		if (!browser || !isEditable || !licenseId) {
			isOwner = false;
			return;
		}

		isOwner = readOwnerCache(licenseId);

		const token = getAuthToken();
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
		class="relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center transition-colors after:absolute after:-inset-1 after:content-[''] focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2 {triggerClass}"
		title="Общие настройки сайта"
		aria-label="Открыть общие настройки сайта"
	>
		<svg
			class="h-[18px] w-[18px]"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			aria-hidden="true"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.09a2 2 0 0 1 1 1.74v.5a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z"
				style="stroke-width: var(--ds-icon-stroke)"
			/>
			<circle cx="12" cy="12" r="3" style="stroke-width: var(--ds-icon-stroke)" />
		</svg>
	</a>
{/if}
