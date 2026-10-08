<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import NavigationBody from '$lib/components/NavigationBody.svelte';
	import { page } from '$app/state';
	import { clientAuthModal } from '$lib/stores/client-auth.svelte';
	import { cabinetHref } from '$lib/utils/cabinet-href';
	import { afterNavigate, goto } from '$app/navigation';
	import type { Course, Attempt } from './types';
	import { lessonUrl, passes } from './navigation';
	import Icon from './StudyIcon.svelte';
	import './study.css';
	let {
		children,
		course,
		courses = [],
		attempts = [],
		title = 'Кабинет студента',
		sidebar = false
	}: {
		children: Snippet;
		course?: Course;
		courses?: Course[];
		attempts?: Attempt[];
		title?: string;
		sidebar?: boolean;
	} = $props();
	let collapsed = $state(false);
	let drawer = $state<HTMLDialogElement>();
	let siteMenu = $state<HTMLDialogElement>();
	let leaving = $state(false);
	let problem = $state('');
	const done = $derived(course ? passes(course, attempts) : new Set<string>());
	const disciplines = $derived([...new Set(courses.map((c) => c.discipline))]);
	afterNavigate(() => {
		drawer?.close();
		siteMenu?.close();
	});
	onMount(() => {
		const query = matchMedia('(min-width: 1280px)');
		const close = () => {
			if (query.matches) {
				drawer?.close();
				siteMenu?.close();
			}
		};
		query.addEventListener('change', close);
		return () => query.removeEventListener('change', close);
	});
	async function logout() {
		leaving = true;
		problem = '';
		try {
			const response = await fetch('/cabinet/session', { method: 'DELETE' });
			if (!response.ok) throw new Error();
			await goto('/university/auth', { invalidateAll: true });
		} catch {
			problem = 'Не удалось выйти. Повторите попытку.';
		} finally {
			leaving = false;
		}
	}
</script>

{#snippet syllabus()}
	<nav aria-label="Программа обучения" class="study-syllabus">
		<a class="study-back" href="/university/learn">Все курсы</a>
		{#if course}
			<h2><a href="/university/learn/{course.slug}">{course.title}</a></h2>
			<ol>
				{#each course.lessons as lesson, i}<li>
						<a
							href={lessonUrl(course, lesson.id)}
							aria-current={page.url.pathname === lessonUrl(course, lesson.id) ? 'page' : undefined}
							><span class="study-step"
								>{#if done.has(lesson.id)}<Icon name="check" size={14} />{:else}{String(
										i + 1
									).padStart(2, '0')}{/if}</span
							><span>{lesson.title}</span></a
						>
					</li>{/each}
				<li>
					<a
						href={lessonUrl(course, 'exam')}
						aria-current={page.url.pathname.endsWith('/exam') ? 'page' : undefined}
						><span class="study-step"
							><Icon name={done.has('exam') ? 'check' : 'file'} size={14} /></span
						><span>Итоговый экзамен</span></a
					>
				</li>
			</ol>
		{:else}
			{#each disciplines as discipline}<h2>{discipline}</h2>
				<ol>
					{#each courses.filter((c) => c.discipline === discipline) as item}<li>
							<a href="/university/learn/{item.slug}">{item.title}</a>
						</li>{/each}
				</ol>{/each}
		{/if}
	</nav>
{/snippet}
<div class="campus" class:study-with-sidebar={sidebar && !collapsed}>
	{#if sidebar}
		<aside class="study-sidebar" class:study-hidden={collapsed}>
			<button
				class="study-icon-button"
				aria-label="Свернуть программу"
				onclick={() => (collapsed = true)}
				data-goal-ignore="Свернуть учебную навигацию"><Icon name="menu" /></button
			>
			{@render syllabus()}
		</aside>
		<dialog
			bind:this={drawer}
			class="study-drawer"
			onclick={(e) => {
				if (e.target === drawer) drawer?.close();
			}}
			onclose={() => {}}
			data-goal-ignore="Закрыть учебную навигацию по фону"
		>
			<button
				class="study-icon-button"
				aria-label="Закрыть программу"
				onclick={() => drawer?.close()}
				data-goal-ignore="Закрыть учебную навигацию"><Icon name="close" /></button
			>
			{@render syllabus()}
		</dialog>
	{/if}
	<div class="study-workspace">
		<dialog
			bind:this={siteMenu}
			class="study-drawer study-site-menu"
			onclick={(e) => {
				if (e.target === siteMenu) siteMenu?.close();
			}}
			data-goal-ignore="Закрыть меню университета по фону"
		>
			<button
				class="study-icon-button"
				aria-label="Закрыть меню"
				onclick={() => siteMenu?.close()}
				data-goal-ignore="Закрыть меню университета"><Icon name="close" /></button
			>
			<nav aria-label="Разделы университета">
				{#if page.data.client?.role !== 'student'}<a href={cabinetHref(page.data.client?.role)}
						>{['client', 'student'].includes(page.data.client?.role || '')
							? 'Кабинет клиента'
							: 'Личный кабинет'}</a
					>{:else}<button
						class="study-link"
						onclick={() => clientAuthModal.open('register')}
						data-metrika-goal="student_client_registration_open"
						data-goal-action="open">Стать клиентом</button
					>{/if}
				<a href="/university/learn">Курсы</a><a href="/university/interviews">Интервью</a><a
					href="/university/resources">Ресурсы</a
				><a href="/university/student">Моё обучение</a><a href="/university">О Универе</a><a
					href="/"
					data-sveltekit-reload>Вернуться на сайт</a
				><button
					class="study-link"
					disabled={leaving}
					onclick={logout}
					data-goal-ignore="Выход из учебной сессии">Выйти</button
				>
			</nav>
		</dialog>
		<header class="study-header">
			<div class="study-breadcrumbs">
				{#if sidebar}<button
						class="study-icon-button study-mobile-toggle"
						aria-label="Открыть программу"
						onclick={() => drawer?.showModal()}
						data-goal-ignore="Открыть учебную навигацию"><Icon name="menu" /></button
					>
					{#if collapsed}<button
							class="study-icon-button study-desktop-toggle"
							aria-label="Развернуть программу"
							onclick={() => (collapsed = false)}
							data-goal-ignore="Развернуть учебную навигацию"><Icon name="menu" /></button
						>{/if}{/if}
				<a href="/university/learn" class="study-wordmark">Универ</a><span aria-hidden="true"
					>/</span
				>
				{#if course && title !== course.title}<a
						class="study-crumb-course"
						href="/university/learn/{course.slug}">{course.title}</a
					><span class="study-crumb-course" aria-hidden="true">/</span>{/if}
				<span class="study-current">{title}</span>
			</div>
			<button
				class="study-icon-button study-menu-toggle"
				aria-label="Открыть меню"
				onclick={() => siteMenu?.showModal()}
				data-goal-ignore="Открыть меню университета"><Icon name="nav" /></button
			>
			<nav class="study-topnav" aria-label="Университет">
				{#if page.data.client?.role !== 'student'}<a href={cabinetHref(page.data.client?.role)}
						>{['client', 'student'].includes(page.data.client?.role || '')
							? 'Кабинет клиента'
							: 'Личный кабинет'}</a
					>{:else}<button
						class="study-link"
						onclick={() => clientAuthModal.open('register')}
						data-metrika-goal="student_client_registration_top_open"
						data-goal-action="open">Стать клиентом</button
					>{/if}
				<a
					href="/university/learn"
					aria-current={page.url.pathname.startsWith('/university/learn') ? 'page' : undefined}
					>Курсы</a
				>
				<a
					href="/university/interviews"
					aria-current={page.url.pathname.includes('/interviews') ? 'page' : undefined}>Интервью</a
				>
				<a
					href="/university/resources"
					aria-current={page.url.pathname.includes('/resources') ? 'page' : undefined}>Ресурсы</a
				>
				<details class="study-account">
					<summary>Студент <Icon name="chevron" size={12} /></summary>
					<div>
						<a href="/university/student">Моё обучение</a><a href="/university">О Универе</a><a
							href="/"
							data-sveltekit-reload>Вернуться на сайт</a
						><button disabled={leaving} onclick={logout} data-goal-ignore="Выход из учебной сессии"
							>{leaving ? 'Выходим…' : 'Выйти'}</button
						>
					</div>
				</details>
			</nav>
		</header>
		{#if problem}<p class="study-alert" role="alert">{problem}</p>{/if}
		<main class="study-main">
			<NavigationBody workspace>{@render children()}</NavigationBody>
		</main>
	</div>
</div>
