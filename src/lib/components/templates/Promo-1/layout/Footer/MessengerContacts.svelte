<script lang="ts">
	import { getContext } from 'svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { editableText } from '$lib/utils/editable-text';
	import {
		EDITABLE_VISIBILITY_CONTEXT,
		type EditableVisibility
	} from '$lib/utils/editable-visibility.svelte';

	const messengers = [
		{ key: 'telegram', name: 'Telegram', protocol: 'tg:' },
		{ key: 'whatsapp', name: 'WhatsApp', protocol: 'whatsapp:' },
		{ key: 'max', name: 'MAX' }
	] as const;
	type Messenger = (typeof messengers)[number];

	let {
		data,
		saveField,
		isEditable,
		groupClass,
		linkClass,
		showNames = false
	}: {
		data: Record<string, unknown>;
		saveField: (key: Messenger['key'], value: string) => Promise<void>;
		isEditable: boolean;
		groupClass: string;
		linkClass: string;
		showNames?: boolean;
	} = $props();

	const visibility = getContext<EditableVisibility | undefined>(EDITABLE_VISIBILITY_CONTEXT);

	function contactHref(value: string, messenger: Messenger): string {
		try {
			const url = new URL(value.trim());
			if (url.protocol === 'https:' || url.protocol === 'http:') return url.href;
			return 'protocol' in messenger && url.protocol === messenger.protocol ? url.href : '';
		} catch {
			return '';
		}
	}

	async function saveContact(value: string, messenger: Messenger) {
		const href = contactHref(value, messenger);
		if (value.trim() && !href) {
			throw new Error(`Укажите корректную ссылку для ${messenger.name}`);
		}
		await saveField(messenger.key, href);
	}

	const contacts = $derived(
		messengers
			.map((messenger) => ({ messenger, value: editableText(data[messenger.key]) }))
			.filter(
				({ messenger, value }) =>
					isEditable ||
					(visibility?.isVisible(messenger.key) !== false && contactHref(value, messenger))
			)
	);
</script>

{#snippet mark(messenger: Messenger)}
	{#if showNames}
		{messenger.name}
		<svg
			class="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			aria-hidden="true"
		>
			<path d="M4 12 12 4M6 4h6v6" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	{:else if messenger.key === 'max'}
		<span class="text-xs font-semibold">MAX</span>
	{:else}
		<svg class="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
			{#if messenger.key === 'telegram'}
				<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.35-.49.97-.74 3.79-1.65 6.32-2.74 7.59-3.27 3.61-1.5 4.36-1.76 4.85-1.77.11 0 .35.03.5.15.13.1.17.24.18.33.01.06.02.19.01.29z" />
			{:else}
				<path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.758.459 3.473 1.332 4.984L2 22l5.201-1.365a9.927 9.927 0 004.811 1.253h.005c5.505 0 9.988-4.482 9.988-9.988C22 6.482 17.518 2 12.012 2zm6.275 13.99c-.258.724-1.25 1.328-1.725 1.402-.455.07-1.018.106-2.905-.678-2.42-.999-3.992-3.463-4.113-3.624-.121-.161-.99-1.317-.99-2.51 0-1.192.624-1.778.845-2.02.221-.241.483-.301.644-.301.161 0 .322.002.462.008.148.006.347-.056.544.422.201.489.684 1.667.745 1.788.06.121.101.262.02.423-.08.161-.121.262-.241.402-.121.141-.254.314-.362.422-.121.121-.248.254-.108.496.141.242.624 1.026 1.339 1.663.921.821 1.699 1.074 1.94 1.195.242.121.382.101.524-.06.141-.161.604-.704.765-.946.161-.242.322-.201.544-.121.221.08 1.402.663 1.644.784.242.121.402.181.463.282.06.1.06.583-.198 1.308z" />
			{/if}
		</svg>
	{/if}
{/snippet}

{#if contacts.length}
	<div class={groupClass}>
		{#each contacts as { messenger, value } (messenger.key)}
			<EditableField
				richText={false}
				fieldKey={`Footer.${messenger.key}`}
				label={`${messenger.name} (ссылка)`}
				{value}
				onSave={(next) => saveContact(next, messenger)}
				{isEditable}
			>
				{#snippet children(displayValue)}
					{@const href = contactHref(displayValue, messenger)}
					{#if href}
						<a
							{href}
							target="_blank"
							rel="noopener noreferrer"
							class={linkClass}
							title={messenger.name}
							aria-label={messenger.name}
						>
							{@render mark(messenger)}
						</a>
					{:else if isEditable}
						<span class={linkClass} title={messenger.name} aria-label={messenger.name}>
							{@render mark(messenger)}
						</span>
					{/if}
				{/snippet}
			</EditableField>
		{/each}
	</div>
{/if}
