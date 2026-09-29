<script lang="ts">
	import Shell from '$lib/university/StudyShell.svelte';
	import Icon from '$lib/university/StudyIcon.svelte';
	import { resourceCategories, resourceUrl } from '$lib/university/navigation';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>Ресурсы — Универ</title><meta name="robots" content="noindex" /></svelte:head>
<Shell title="Ресурсы"
	><div class="study-container">
		<div class="study-intro">
			<h1>Ресурсы</h1>
			<p>
				Материалы, к которым удобно возвращаться: статьи, записи, книги и инструменты для работы над
				своим домом.
			</p>
		</div>
		{#if !data.resources.length}<div class="study-empty">
				<h2>Библиотека собирается</h2>
				<p>Опубликованные материалы появятся здесь. Учебные статьи уже доступны внутри курсов.</p>
				<a class="study-link" href="/university/learn">Выбрать курс</a>
			</div>{/if}{#each Object.entries(resourceCategories) as [category, label]}{@const items =
				data.resources.filter((r) => r.category === category)}{#if items.length}<section
					class="study-section"
				>
					<h2>{label}</h2>
					<div
						class={category === 'books'
							? 'study-books'
							: category === 'media'
								? 'study-media-grid'
								: 'study-list'}
					>
						{#each items as item}<a
								class={category === 'media'
									? 'study-media-card'
									: category === 'books'
										? ''
										: 'study-list-item'}
								href={resourceUrl(item)}
								target={item.url ? '_blank' : undefined}
								rel={item.url ? 'noopener noreferrer' : undefined}
								>{#if item.cover_id && ['books', 'media'].includes(category)}<img
										src="/university/media/{item.cover_id}"
										alt={item.title}
										loading="lazy"
									/>{:else if !['books', 'media'].includes(category)}<span class="study-list-icon"
										><Icon name="file" size={17} /></span
									>{/if}
								<div>
									<h3>{item.title}</h3>
									<p>{item.description}</p>
									{#if item.author}<p>{item.author}</p>{/if}
								</div></a
							>{/each}
					</div>
				</section>{/if}{/each}
	</div></Shell
>
