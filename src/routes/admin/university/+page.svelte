<script lang="ts">
	import { setContext, untrack } from 'svelte';
	import { beforeNavigate } from '$app/navigation';
	import ContentEditor from '$lib/university/admin/ContentEditor.svelte';
	import { api, blank, labels, type Kind, type EditorItem } from '$lib/university/admin/types';
	import '$lib/university/study.css';
	import '$lib/university/admin/editor.css';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	let catalog = $state<Record<Kind, EditorItem[]>>(untrack(() => structuredClone(data.catalog)));
	let kind = $state<Kind>('courses');
	let item = $state<EditorItem | null>(null);
	let saved = $state('');
	let busy = $state(false);
	let problem = $state('');
	let notice = $state('');
	let revisionSlug = $state('');
	let showRevision = $state(false);
	const uploads = $state({ active: 0 });
	setContext('universityUploads', uploads);
	const dirty = $derived(item !== null && JSON.stringify(item) !== saved);
	const disabled = $derived(busy || uploads.active > 0);
	beforeNavigate((navigation) => {
		if (busy) {
			navigation.cancel();
			return;
		}
		if (
			(dirty || uploads.active > 0) &&
			!confirm('Есть несохранённые изменения. Покинуть редактор?')
		)
			navigation.cancel();
	});
	function choose(next: Kind, value: EditorItem | null) {
		if (busy) return;
		if ((dirty || uploads.active > 0) && !confirm('Есть несохранённые изменения. Закрыть их?'))
			return;
		kind = next;
		item = value ? structuredClone($state.snapshot(value)) : null;
		saved = JSON.stringify(item);
		problem = '';
		notice = '';
		showRevision = false;
	}
	function update(value: EditorItem, requestKind: Kind) {
		const index = catalog[requestKind].findIndex((i) => i.slug === value.slug);
		if (index >= 0) catalog[requestKind][index] = value;
		else catalog[requestKind].push(value);
		if (kind !== requestKind) return;
		item = structuredClone(value);
		saved = JSON.stringify(item);
	}
	async function save(event: SubmitEvent) {
		event.preventDefault();
		if (!item || disabled) return;
		const requestKind = kind;
		busy = true;
		problem = '';
		notice = '';
		try {
			const result = await api<{ item: EditorItem }>(
				`${requestKind}${item.updated_at ? `/${item.slug}` : ''}`,
				item
			);
			update(result.item, requestKind);
			notice = 'Изменения сохранены.';
		} catch (e) {
			problem = e instanceof Error ? e.message : 'Не удалось сохранить.';
		} finally {
			busy = false;
		}
	}
	async function action(action: 'publish' | 'archive' | 'revision') {
		if (!item?.updated_at || disabled || dirty) return;
		const requestKind = kind;
		busy = true;
		problem = '';
		notice = '';
		try {
			const result = await api<{ item: EditorItem }>(`${requestKind}/${item.slug}/${action}`, {
				updated_at: item.updated_at,
				...(action === 'revision' ? { slug: revisionSlug } : {})
			});
			update(result.item, requestKind);
			showRevision = false;
			catalog[requestKind] = (await api<{ items: EditorItem[] }>(requestKind)).items;
			notice =
				action === 'publish'
					? 'Материал опубликован.'
					: action === 'archive'
						? 'Материал перенесён в архив.'
						: 'Создан черновик новой редакции. Прогресс исходного курса сохранён.';
		} catch (e) {
			problem = e instanceof Error ? e.message : 'Действие не выполнено.';
		} finally {
			busy = false;
		}
	}
	const statuses = { draft: 'Черновик', published: 'Опубликован', archived: 'Архив' };
</script>

<svelte:head
	><title>Универ — редактор обучения</title><meta
		name="robots"
		content="noindex,nofollow"
	/></svelte:head
>
<div class="campus">
	<header class="study-header">
		<div class="study-breadcrumbs">
			<a href="/admin">Администрирование</a><span>/</span><a href="/admin/university">Универ</a>
		</div>
		<a href="/university/learn">Учебный кабинет</a>
	</header>
	<main class="editor-layout">
		<aside class="editor-navigation">
			<h1>Обучение</h1>
			<nav aria-label="Разделы редактора">
				{#each Object.entries(labels) as [key, label]}<button
						class:editor-selected={kind === key}
						disabled={busy}
						onclick={() => choose(key as Kind, null)}
						data-goal-ignore="Раздел административного редактора"
						>{label}<span>{catalog[key as Kind].length}</span></button
					>{/each}
			</nav>
			<a class="study-link" href="/admin">К панели управления</a>
		</aside>
		<div class="editor-content">
			{#if !item}<header class="editor-heading">
					<h2>{labels[kind]}</h2>
					<button
						class="study-button"
						disabled={busy}
						onclick={() => choose(kind, blank(kind))}
						data-goal-ignore="Создание учебного материала">Добавить</button
					>
				</header>
				{#if !catalog[kind].length}<div class="study-empty">
						<h3>Пока нет материалов</h3>
						<p>Создайте первый черновик. Студенты увидят его после публикации.</p>
					</div>{/if}
				<div class="editor-records">
					{#each catalog[kind] as entry}<button
							class="editor-record"
							disabled={busy}
							onclick={() => choose(kind, entry)}
							data-goal-ignore="Открыть материал в редакторе"
							><span
								><strong>{entry.title}</strong><small
									>{kind === 'courses'
										? entry.discipline
										: kind === 'interviews'
											? entry.speaker
											: entry.category}</small
								></span
							><span>{statuses[entry.status]}</span></button
						>{/each}
				</div>
			{:else}<header class="editor-heading">
					<div>
						<button
							class="study-link"
							disabled={busy}
							onclick={() => choose(kind, null)}
							data-goal-ignore="Вернуться к списку учебных материалов">{labels[kind]}</button
						>
						<h1>{item.updated_at ? item.title : 'Новый материал'}</h1>
						<p>
							{statuses[item.status]}{item.previous_slug
								? ` · Новая редакция ${item.previous_slug}`
								: ''}
						</p>
					</div>
					{#if item.updated_at}<a
							class="study-link"
							href="/admin/university/preview/{kind}/{item.slug}"
							target="_blank"
							rel="noreferrer">Предпросмотр сохранённого</a
						>{/if}
				</header>
				<form onsubmit={save}>
					{#key `${kind}/${item.updated_at ? item.slug : 'new'}`}<ContentEditor
							bind:item
							{kind}
							disabled={busy}
						/>{/key}
					<div class="editor-toolbar">
						<button class="study-button" type="submit" {disabled}
							>{busy ? 'Сохраняем…' : 'Сохранить'}</button
						>{#if item.updated_at}<button
								class="study-button study-button-secondary"
								type="button"
								disabled={disabled || dirty}
								onclick={() => action('publish')}
								data-goal-ignore="Публикация учебного материала">Опубликовать</button
							>{#if item.status === 'published'}<button
									class="study-link"
									type="button"
									disabled={disabled || dirty}
									onclick={() => action('archive')}
									data-goal-ignore="Архивирование учебного материала">В архив</button
								>{/if}{#if kind === 'courses'}<button
									class="study-link"
									type="button"
									disabled={disabled || dirty}
									onclick={() => {
										showRevision = !showRevision;
										revisionSlug = `${item?.slug?.slice(0, 65)}-new`;
									}}
									data-goal-ignore="Создание редакции курса">Создать новую редакцию</button
								>{/if}{/if}{#if dirty}<span>Есть несохранённые изменения</span
							>{/if}{#if uploads.active}<span>Дождитесь завершения загрузок</span>{/if}
					</div>
				</form>
				{#if showRevision}<form
						class="editor-revision"
						onsubmit={(e) => {
							e.preventDefault();
							void action('revision');
						}}
					>
						<h2>Новая редакция курса</h2>
						<p>
							Тексты и вопросы будут скопированы. Оценки и сертификаты останутся в исходном курсе.
						</p>
						<label
							>Новый адрес<input
								bind:value={revisionSlug}
								pattern="[a-z0-9-]+"
								maxlength="80"
								required
							/></label
						><button class="study-button" {disabled} type="submit">Создать черновик</button>
					</form>{/if}
			{/if}
			{#if problem}<p class="study-alert" role="alert">{problem}</p>{/if}{#if notice}<p
					class="editor-notice"
					role="status"
				>
					{notice}
				</p>{/if}
		</div>
	</main>
</div>
