<script lang="ts">
	import { onMount } from 'svelte';
	import type { Editor } from '@tiptap/core';
	import { editorContent, serializeRichText } from '$lib/utils/rich-text';

	let {
		value,
		label,
		legacyHtml = false,
		disabled = false,
		onchange
	}: {
		value: string;
		label: string;
		legacyHtml?: boolean;
		disabled?: boolean;
		onchange: (value: string) => void;
	} = $props();
	let element: HTMLDivElement;
	let editor = $state.raw<Editor | null>(null);
	let revision = $state(0);
	let loadError = $state('');
	const tools = [
		{ label: 'Жирный', type: 'bold', icon: 'M6 4h7a4 4 0 0 1 0 8H6zm0 8h8a4 4 0 0 1 0 8H6z' },
		{ label: 'Курсив', type: 'italic', icon: 'M10 4h9M5 20h9M15 4 9 20' },
		{ label: 'Подчёркнутый', type: 'underline', icon: 'M6 3v7a6 6 0 0 0 12 0V3M4 21h16' },
		{
			label: 'Зачёркнутый',
			type: 'strike',
			icon: 'M17 5c-1-2-9-3-10 2-1 5 12 5 10 10-1 4-9 4-11 1M3 12h18'
		},
		{
			label: 'Маркированный список',
			type: 'bulletList',
			icon: 'M9 5h12M9 12h12M9 19h12M3 5h.01M3 12h.01M3 19h.01'
		},
		{
			label: 'Нумерованный список',
			type: 'orderedList',
			icon: 'M10 5h11M10 12h11M10 19h11M3 3h1v5M3 12c0-2 3-2 3 0 0 1-3 2-3 4h3M3 19h3l-2 2h2'
		},
		{
			label: 'Цитата',
			type: 'blockquote',
			icon: 'M10 11H4V5h6v8c0 3-2 5-5 6M21 11h-6V5h6v8c0 3-2 5-5 6'
		},
		{
			label: 'Убрать форматирование',
			type: 'clear',
			icon: 'm15 3 6 6-10 11H5l-3-3L15 3ZM9 9l6 6M13 21h8'
		},
		{ label: 'Отменить действие', type: 'undo', icon: 'm8 4-5 5 5 5M3 9h11a7 7 0 0 1 0 14' },
		{ label: 'Повторить действие', type: 'redo', icon: 'm16 4 5 5-5 5M21 9H10a7 7 0 0 0 0 14' }
	];
	const states = $derived.by(() => {
		revision;
		return tools.map((tool) => ({
			...tool,
			active: editor?.isActive(tool.type) ?? false,
			unavailable:
				!editor ||
				disabled ||
				(tool.type === 'undo' && !editor.can().undo()) ||
				(tool.type === 'redo' && !editor.can().redo())
		}));
	});

	function apply(type: string) {
		if (!editor || disabled) return;
		const chain = editor.chain().focus();
		switch (type) {
			case 'bold':
				chain.toggleBold().run();
				break;
			case 'italic':
				chain.toggleItalic().run();
				break;
			case 'underline':
				chain.toggleUnderline().run();
				break;
			case 'strike':
				chain.toggleStrike().run();
				break;
			case 'bulletList':
				chain.toggleBulletList().run();
				break;
			case 'orderedList':
				chain.toggleOrderedList().run();
				break;
			case 'blockquote':
				chain.toggleBlockquote().run();
				break;
			case 'clear':
				chain.unsetAllMarks().clearNodes().run();
				break;
			case 'undo':
				chain.undo().run();
				break;
			case 'redo':
				chain.redo().run();
				break;
		}
	}

	onMount(() => {
		let disposed = false;
		// Load only when an owner opens a text field, never in the visitor's initial bundle.
		Promise.all([import('@tiptap/core'), import('@tiptap/starter-kit')])
			.then(([{ Editor }, { StarterKit }]) => {
				if (disposed) return;
				editor = new Editor({
					element,
					extensions: [
						StarterKit.configure({
							heading: false,
							code: false,
							codeBlock: false,
							horizontalRule: false,
							link: false,
							trailingNode: false
						})
					],
					content: editorContent(value, legacyHtml),
					editable: !disabled,
					editorProps: {
						attributes: {
							role: 'textbox',
							'aria-label': label,
							'aria-multiline': 'true',
							class: 'rich-text-input',
							spellcheck: 'true'
						}
					},
					onTransaction: () => revision++,
					onUpdate: ({ editor }) => onchange(serializeRichText(editor.getHTML()))
				});
				editor.commands.focus('end');
			})
			.catch((error: unknown) => {
				console.error('Failed to initialize the rich text editor.', error);
				if (!disposed)
					loadError = 'Не удалось загрузить редактор. Закройте окно и попробуйте ещё раз.';
			});
		return () => {
			disposed = true;
			editor?.destroy();
		};
	});

	$effect(() => {
		editor?.setEditable(!disabled, false);
	});
</script>

<div
	class="overflow-hidden rounded-xl border border-ink-200 bg-surface-raised focus-within:border-link-500 focus-within:ring-2 focus-within:ring-link-100"
>
	<div
		role="group"
		aria-label="Форматирование текста"
		class="flex flex-wrap gap-1 border-b border-ink-200 bg-ink-50 p-2"
	>
		{#each states as tool}
			<button
				type="button"
				title={tool.label}
				aria-label={tool.label}
				aria-pressed={['clear', 'undo', 'redo'].includes(tool.type) ? undefined : tool.active}
				disabled={tool.unavailable}
				onmousedown={(event) => event.preventDefault()}
				onclick={() => apply(tool.type)}
				class="flex size-10 shrink-0 items-center justify-center rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-link-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-35 {tool.active
					? 'border-link-300 bg-link-100 text-link-800'
					: 'border-transparent text-ink-700 hover:border-ink-200 hover:bg-ink-100'}"
			>
				<svg
					width="19"
					height="19"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.7"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"><path d={tool.icon} /></svg
				>
			</button>
		{/each}
	</div>
	{#if loadError}<p class="p-4 text-sm text-cat-6-600" role="alert">{loadError}</p>
	{:else if !editor}<p class="p-4 text-sm text-ink-500" role="status">Загрузка редактора…</p>{/if}
	<div bind:this={element} class="text-base text-ink-900"></div>
</div>
<p class="mt-2 text-xs text-ink-500">
	Выделите текст и выберите формат. Enter — абзац, Shift+Enter — новая строка.
</p>

<style>
	:global(.rich-text-input) {
		min-height: 220px;
		max-height: 42dvh;
		overflow-y: auto;
		padding: 1rem;
		outline: none;
		overflow-wrap: anywhere;
		line-height: 1.6;
		caret-color: var(--color-link-600);
	}
	:global(.rich-text-input p + p) {
		margin-top: 0.65em;
	}
	:global(.rich-text-input ul),
	:global(.rich-text-input ol) {
		padding-inline-start: 1.6em;
		margin-block: 0.65em;
	}
	:global(.rich-text-input ul) {
		list-style-type: disc;
	}
	:global(.rich-text-input ol) {
		list-style-type: decimal;
	}
	:global(.rich-text-input li + li) {
		margin-top: 0.25em;
	}
	:global(.rich-text-input blockquote) {
		margin-block: 0.65em;
		padding-inline: 1em;
		border-inline-start: 1px solid currentColor;
		font-style: italic;
	}
	@media (max-width: 640px) {
		:global(.rich-text-input) {
			min-height: 160px;
			max-height: 36dvh;
		}
	}
</style>
