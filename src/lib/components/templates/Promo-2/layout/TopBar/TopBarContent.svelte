<script lang="ts">
	import { sitePhoneHref } from '$lib/utils/site-phone';
	import { topBarPhone, topBarEmail, topBarLinks } from '../top-bar';
	import type { PageComponentProps } from '$lib/components/templates/types';
	let {
		data,
		isEditable = false,
		dark = false,
		largeText = false
	}: PageComponentProps & { dark?: boolean; largeText?: boolean } = $props();
	const phone = $derived(topBarPhone(data));
	const email = $derived(topBarEmail(data));
	const topLinks = $derived(topBarLinks(data));
</script>

<div
	class="p2-container mx-auto flex min-h-10 flex-wrap items-center justify-between gap-x-6 gap-y-3 py-2 {isEditable
		? 'pr-14 xl:pr-10'
		: ''}"
	style="font-family: var(--font-heading);"
>
	<!-- Top links -->
	<div class="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-2">
		{#each topLinks as link}
			<a
				href={link.href}
				class="{largeText
					? 'text-sm'
					: 'text-xs'} tracking-wider transition-colors duration-300 {dark
					? 'text-inverse/70 hover:text-accent-light'
					: 'text-primary hover:text-primary-light'}"
			>
				{link.label}
			</a>
		{/each}
	</div>

	<!-- Contacts -->
	<div class="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2">
		{#if phone}
			<a
				href={sitePhoneHref(phone)}
				class="flex items-center gap-1.5 {largeText
					? 'text-sm'
					: 'text-xs'} tracking-wide transition-colors duration-300 {dark
					? 'text-inverse/70 hover:text-accent-light'
					: 'text-primary hover:text-primary-light'}"
			>
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
						d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
					/>
				</svg>
				{phone}
			</a>
			{#if email}<span class="h-3 w-px {dark ? 'bg-inverse/15' : 'bg-border-medium'}"></span>{/if}
		{/if}
		{#if email}
			<a
				href="mailto:{email}"
				class="flex items-center gap-1.5 {largeText
					? 'text-sm'
					: 'text-xs'} tracking-wide transition-colors duration-300 {dark
					? 'text-inverse/70 hover:text-accent-light'
					: 'text-primary hover:text-primary-light'}"
			>
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
						d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
					/>
				</svg>
				{email}
			</a>
		{/if}
	</div>
</div>
