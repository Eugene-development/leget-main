<script lang="ts">
	let { data }: { data: Record<string, unknown> } = $props();

	const siteName  = $derived(typeof data?.siteName  === 'string' ? data.siteName  : 'Компания');
	const copyright = $derived(typeof data?.copyright === 'string' ? data.copyright : `© ${new Date().getFullYear()}`);
	const links = $derived(Array.isArray(data?.links) ? (data.links as { href: string; label: string }[]) : [
		{ href: '/',        label: 'Главная'  },
		{ href: '/about',   label: 'О нас'    },
		{ href: '/contact', label: 'Контакты' },
	]);
</script>

<footer class="w-full border-t border-slate-200 bg-slate-50">
	<div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
		<span class="text-sm font-medium text-slate-700">{siteName}</span>

		<nav class="flex flex-wrap items-center gap-6">
			{#each links as link}
				<a
					href={link.href}
					class="text-sm text-slate-500 transition-colors hover:text-slate-900"
				>
					{link.label}
				</a>
			{/each}
		</nav>

		<span class="text-sm text-slate-400">{copyright}</span>
	</div>
</footer>
