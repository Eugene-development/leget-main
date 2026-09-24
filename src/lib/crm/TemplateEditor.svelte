<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { Editor, Node, mergeAttributes, type JSONContent } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import { crmRequest, type Row } from './api';
	let {
		base,
		site,
		item,
		onSaved
	}: { base: string; site: string; item?: Row; onSaved: () => Promise<void> } = $props();
	let element: HTMLDivElement;
	let editor: Editor | undefined;
	let fields = $state<Record<string, string>>({});
	let name = $state(untrack(() => item?.name || ''));
	let kind = $state(untrack(() => item?.kind || 'contract'));
	let field = $state('client.name');
	let message = $state('');
	let busy = $state(false);
	let currentId = $state<string | undefined>(untrack(() => item?.id));
	let currentVersion = $state<number | undefined>(untrack(() => item?.version));
	let active = $state<Record<string, boolean>>({});
	const FieldNode = Node.create({
		name: 'crmField',
		group: 'inline',
		inline: true,
		atom: true,
		addAttributes: () => ({ field: { default: 'client.name' } }),
		parseHTML: () => [{ tag: 'span[data-crm-field]' }],
		renderHTML: ({ node }) => [
			'span',
			{ 'data-crm-field': node.attrs.field, class: 'crm-field-token' },
			fields[node.attrs.field] || node.attrs.field
		]
	});
	const PageBreak = Node.create({
		name: 'pageBreak',
		group: 'block',
		atom: true,
		parseHTML: () => [{ tag: 'div[data-page-break]' }],
		renderHTML: () => ['div', { 'data-page-break': '', class: 'crm-page-break' }, 'Разрыв страницы']
	});
	const Table = Node.create({
		name: 'table',
		group: 'block',
		content: 'tableRow+',
		isolating: true,
		parseHTML: () => [{ tag: 'table' }],
		renderHTML: () => ['table', {}, ['tbody', 0]]
	});
	const TableRow = Node.create({
		name: 'tableRow',
		content: '(tableCell | tableHeader)+',
		parseHTML: () => [{ tag: 'tr' }],
		renderHTML: () => ['tr', 0]
	});
	const cell = (name: string, tag: string) =>
		Node.create({
			name,
			content: 'block+',
			isolating: true,
			parseHTML: () => [{ tag }],
			renderHTML: ({ HTMLAttributes }) => [tag, mergeAttributes(HTMLAttributes), 0]
		});
	onMount(() => {
		void crmRequest(base, `sites/${site}/document-fields`).then((v) => {
			fields = v.fields;
			if (editor && !editor.isDestroyed)
				editor.commands.setContent(editor.getJSON(), { emitUpdate: false });
		});
		editor = new Editor({
			element,
			extensions: [
				StarterKit.configure({ link: false }),
				FieldNode,
				PageBreak,
				Table,
				TableRow,
				cell('tableCell', 'td'),
				cell('tableHeader', 'th')
			],
			content: item?.content || { type: 'doc', content: [{ type: 'paragraph' }] },
			onTransaction: ({ editor: view }) => {
				active = {
					bold: view.isActive('bold'),
					italic: view.isActive('italic'),
					heading: view.isActive('heading'),
					bulletList: view.isActive('bulletList'),
					table: view.isActive('table')
				};
			},
			editorProps: {
				attributes: { 'aria-label': 'Текст шаблона', role: 'textbox', 'aria-multiline': 'true' }
			}
		});
		return () => editor?.destroy();
	});
	function insertTable() {
		const cell = (text: string): JSONContent => ({
			type: 'tableCell',
			content: [{ type: 'paragraph', content: text ? [{ type: 'text', text }] : [] }]
		});
		editor
			?.chain()
			.focus()
			.insertContent({
				type: 'table',
				content: [
					{ type: 'tableRow', content: [cell('Наименование'), cell('Значение')] },
					{ type: 'tableRow', content: [cell(''), cell('')] }
				]
			})
			.run();
	}
	function extendTable(column = false) {
		if (!editor) return;
		const selection = editor.state.selection.$from;
		let depth = selection.depth;
		while (depth > 0 && selection.node(depth).type.name !== 'table') depth--;
		if (!depth) return;
		const table = selection.node(depth),
			start = selection.before(depth),
			tr = editor.state.tr;
		const emptyCell = () => editor!.schema.nodes.tableCell.createAndFill()!;
		if (column) {
			table.forEach((row, offset) => {
				const end = start + 1 + offset + row.nodeSize - 1;
				tr.insert(tr.mapping.map(end), emptyCell());
			});
		} else {
			tr.insert(
				start + table.nodeSize - 1,
				editor.schema.nodes.tableRow.create(
					null,
					Array.from({ length: table.firstChild?.childCount || 2 }, emptyCell)
				)
			);
		}
		editor.view.dispatch(tr);
		editor.commands.focus();
	}
	async function save(publish = false) {
		if (busy) return;
		busy = true;
		message = '';
		editor?.setEditable(false);
		try {
			const saved = await crmRequest(
				base,
				`sites/${site}/templates${currentId ? '/' + currentId : ''}`,
				{
					name,
					kind,
					content: editor?.getJSON(),
					...(currentId ? { version: currentVersion } : {})
				}
			);
			currentId = saved.item.id;
			currentVersion = saved.item.version;
			if (publish) {
				const published = await crmRequest(base, `sites/${site}/templates/${currentId}/publish`, {
					version: currentVersion
				});
				currentVersion = published.item.version;
			}
			await onSaved();
		} catch (e) {
			message = e instanceof Error ? e.message : 'Ошибка сохранения';
		} finally {
			busy = false;
			if (editor && !editor.isDestroyed) editor.setEditable(true);
		}
	}
</script>

<div class="crm-template">
	<div class="crm-fields">
		<label>Название<input bind:value={name} disabled={busy} maxlength="255" /></label><label
			>Документ<select bind:value={kind} disabled={busy}
				><option value="contract">Договор</option><option value="act">Акт</option></select
			></label
		>
	</div>
	<div class="crm-toolbar" role="toolbar" aria-label="Форматирование документа">
		<button
			aria-pressed={active.bold || false}
			disabled={busy}
			onclick={() => editor?.chain().focus().toggleBold().run()}
			data-goal-ignore="Редактор шаблона CRM">Жирный</button
		>
		<button
			aria-pressed={active.italic || false}
			disabled={busy}
			onclick={() => editor?.chain().focus().toggleItalic().run()}
			data-goal-ignore="Редактор шаблона CRM">Курсив</button
		>
		<button
			aria-pressed={active.heading || false}
			disabled={busy}
			onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
			data-goal-ignore="Редактор шаблона CRM">Заголовок</button
		>
		<button
			aria-pressed={active.bulletList || false}
			disabled={busy}
			onclick={() => editor?.chain().focus().toggleBulletList().run()}
			data-goal-ignore="Редактор шаблона CRM">Список</button
		>
		<button disabled={busy} onclick={insertTable} data-goal-ignore="Редактор шаблона CRM"
			>Таблица</button
		>
		<button
			onclick={() => editor?.chain().focus().insertContent({ type: 'pageBreak' }).run()}
			data-goal-ignore="Редактор шаблона CRM">Разрыв страницы</button
		>
		<button
			disabled={busy || !active.table}
			onclick={() => extendTable(false)}
			data-goal-ignore="Редактор таблицы CRM">Добавить строку</button
		>
		<button
			disabled={busy || !active.table}
			onclick={() => extendTable(true)}
			data-goal-ignore="Редактор таблицы CRM">Добавить столбец</button
		>
		<select bind:value={field} disabled={busy} aria-label="Поле подстановки"
			>{#each Object.entries(fields) as [key, label]}<option value={key}>{label}</option
				>{/each}</select
		>
		<button
			onclick={() =>
				editor?.chain().focus().insertContent({ type: 'crmField', attrs: { field } }).run()}
			data-goal-ignore="Редактор шаблона CRM">Вставить поле</button
		>
	</div>
	<div class="crm-editor" bind:this={element}></div>
	<p class="muted">
		Текст и юридические условия задаёт владелец. Публикация фиксирует версию для формирования
		документов.
	</p>
	<button
		class="primary"
		disabled={busy || !name.trim()}
		onclick={() => save(false)}
		data-goal-ignore="Сохранение шаблона CRM">{busy ? 'Сохраняем…' : 'Сохранить черновик'}</button
	>
	<button
		class="primary"
		disabled={busy || !name.trim()}
		onclick={() => save(true)}
		data-goal-ignore="Публикация шаблона CRM">Сохранить и опубликовать</button
	>
	<p role="alert">{message}</p>
</div>
