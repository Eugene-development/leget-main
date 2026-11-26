<script lang="ts">
	import { writeToClipboard } from '$lib/utils/clipboard';

	let { url }: { url: string } = $props();
	let status = $state('');

	async function copyLink(event: MouseEvent & { currentTarget: HTMLButtonElement }) {
		const dialog = event.currentTarget.closest('dialog');
		const copied = await writeToClipboard(url, dialog ?? undefined);
		status = copied ? 'Ссылка скопирована' : 'Не удалось скопировать ссылку';
	}
</script>

<button
	type="button"
	onclick={copyLink}
	data-goal-ignore="Копирование ссылки на фотографию без формы"
	class="min-h-11 rounded-full border border-border-light px-6 py-3 text-sm text-primary transition-colors hover:bg-primary hover:text-on-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
>
	Копировать ссылку
</button>
<p
	role="status"
	class={['order-last w-full text-right text-sm text-secondary', { 'sr-only': !status }]}
>
	{status}
</p>
