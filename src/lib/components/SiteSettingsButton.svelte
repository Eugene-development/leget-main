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

	let isOwner = $state(false);

	$effect(() => {
		isOwner = false;
		if (!browser || !isEditable || !licenseId) return;

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
					isOwner = result?.data?.myLicenses?.some(
						(license: { id?: string | number }) => String(license.id) === String(licenseId)
					);
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
