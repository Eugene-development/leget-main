<script lang="ts">
	let {
		name = 'book',
		size = 20
	}: {
		name?:
			| 'book'
			| 'nav'
			| 'chevron'
			| 'up'
			| 'down'
			| 'menu'
			| 'arrow'
			| 'play'
			| 'check'
			| 'close'
			| 'file'
			| 'clock';
		size?: number;
	} = $props();
	const paths = {
		nav: 'M4 6h16M4 12h16M4 18h16',
		chevron: 'm7 10 5 5 5-5',
		up: 'm6 14 6-6 6 6',
		down: 'm6 10 6 6 6-6',
		book: 'M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15',
		menu: 'M4 4h16v16H4zM9 4v16',
		arrow: 'M4 12h16m-6-6 6 6-6 6',
		play: 'm9 6 10 6-10 6Z',
		check: 'm5 12 4 4L19 6',
		close: 'm6 6 12 12M6 18 18 6',
		file: 'M6 3h8l4 4v14H6ZM14 3v5h4M9 12h6M9 16h6',
		clock: 'M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
	};
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.5"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"><path d={paths[name]} /></svg
>
