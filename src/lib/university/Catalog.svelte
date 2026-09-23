<script lang="ts">
	import { onMount } from 'svelte';
	import type { Course } from './types';
	import './university.css';
	let courses = $state<Course[]>([]);
	let loading = $state(true);
	let problem = $state('');
	let selected = $state('Дизайн');
	const disciplines = $derived([...new Set(courses.map((c) => c.discipline))]);
	async function load() {
		loading = true;
		problem = '';
		try {
			const r = await fetch('/university/api/catalog');
			const result = await r.json();
			if (!r.ok) throw new Error(result.message);
			courses = result.courses;
		} catch {
			problem = 'Программа временно недоступна. Попробуйте ещё раз.';
		} finally {
			loading = false;
		}
	}
	onMount(load);
</script>

<div class="academy academy-program" id="university-program">
	<div class="academy-program-heading">
		<h2>Ваша программа обучения</h2>
		<p>Выберите дисциплину. Пройдите курсы в своём темпе.</p>
		<a
			class="academy-button"
			href="/university/auth"
			data-metrika-goal="university_register_open"
			data-goal-action="open">Стать студентом</a
		><a class="academy-link" href="/university/student">Продолжить обучение</a>
	</div>
	{#if loading}<p role="status">Загружаем учебную программу…</p>
	{:else if problem}<p role="alert">{problem}</p>
		<button
			class="academy-button"
			onclick={load}
			data-goal-ignore="Повтор загрузки учебного каталога">Повторить</button
		>
	{:else}
		<div class="academy-catalog">
			<nav class="academy-disciplines" aria-label="Дисциплины">
				{#each disciplines as discipline}<button
						aria-pressed={selected === discipline}
						class:active={selected === discipline}
						onclick={() => (selected = discipline)}
						data-goal-ignore="Выбор учебной дисциплины"
						><span>{discipline}</span><small
							>{courses.filter((c) => c.discipline === discipline).length} курса</small
						></button
					>{/each}
			</nav>
			<div class="academy-course-list" aria-live="polite">
				{#key selected}<div class="academy-page-turn">
						<h3>{selected}</h3>
						{#each courses.filter((c) => c.discipline === selected) as course, i}
							<article class="academy-course">
								<div class="academy-course-top">
									<span>Курс {i + 1}</span><span
										>{course.lessons.length} статьи · тесты · экзамен</span
									>
								</div>
								<h4>{course.title}</h4>
								<p>{course.description}</p>
								<ol>
									{#each course.lessons as lesson}<li>{lesson.title}</li>{/each}
								</ol>
								<a class="academy-link" href="/university/learn/{course.slug}"
									>Открыть курс <span aria-hidden="true">→</span></a
								>
							</article>
						{/each}
					</div>{/key}
			</div>
		</div>
	{/if}
	<div class="academy-method">
		<h3>От первой статьи<br />до сертификата</h3>
		<ol>
			<li>
				<strong>Изучите тему</strong><span>Короткая статья, пример и практическое задание.</span>
			</li>
			<li>
				<strong>Проверьте понимание</strong><span
					>Тест после статьи. Оценка и объяснение каждого ответа.</span
				>
			</li>
			<li>
				<strong>Сдайте экзамен</strong><span
					>От 75% верных ответов — сертификат в вашем кабинете.</span
				>
			</li>
		</ol>
	</div>
</div>
