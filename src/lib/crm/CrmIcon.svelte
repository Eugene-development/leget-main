<script lang="ts">
	let { name }: { name: string } = $props();

	const paths: Record<string, string> = {
		incoming: 'M4 13l2-7h12l2 7v5H4z M4 13h5l1 2h4l1-2h5',
		deals: 'M4 5h4v11H4z M10 5h4v7h-4z M16 5h4v14h-4z',
		clients:
			'M16 20v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M17 14a4 4 0 0 1 3 4v2 M16 4a3 3 0 0 1 0 6',
		companies: 'M5 20V5h10v15 M15 10h4v10 M3 20h18 M8 8h4 M8 11h4 M8 14h4 M9 20v-3h2v3',
		tasks: 'M8 5H5v15h14V5h-3 M9 4h6v4H9z M8 14l2 2 5-5',
		promotions: 'M3 4h8l10 10-7 7L4 11 3 4z M7 8h.01',
		insights: 'M4 4v16h16 M8 15l4-4 3 2 5-6',
		automation: 'M13 3 5 14h6l-1 7 9-12h-6z',
		orders: 'M4 8l8-4 8 4v9l-8 4-8-4z M4 8l8 4 8-4 M12 12v9 M8 6l8 4',
		calculator: 'M6 4h12v16H6z M9 8h6 M9 12h1 M14 12h1 M9 16h1 M14 16h1',
		launch: 'M12 16c4-2 7-6 7-11-5 0-9 3-11 7z M8 12l-4 1v3l4-1 M12 16l-1 4h-3l1-4 M15 9h.01',
		members: 'M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M5 20a7 7 0 0 1 14 0',
		settings: 'M4 7h16 M4 12h16 M4 17h16 M8 5v4 M16 10v4 M10 15v4',
		unassigned: 'M4 6h16v13H4z M8 6V4h8v2 M9 12h6',
		search: 'M10.5 16a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11 M15 15l4 4',
		plus: 'M12 5v14 M5 12h14',
		close: 'M6 6l12 12 M18 6 6 18',
		chevron: 'm7 10 5 5 5-5',
		back: 'M19 12H5 M11 6l-6 6 6 6',
		table: 'M4 5h16v14H4z M4 10h16 M4 15h16 M10 5v14'
	};
</script>

<svg
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.65"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	<path d={paths[name] || paths.settings} />
</svg>
