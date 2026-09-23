<script lang="ts">
	import Frame from '$lib/university/Frame.svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	const dashboard = $derived(data.dashboard);
	const started = $derived(
		dashboard.courses.filter((c) => dashboard.attempts.some((a) => a.course_slug === c.slug))
	);
	const completed = $derived(dashboard.certificates.length);
	function progress(slug: string) {
		return new Set(
			dashboard.attempts
				.filter((a) => a.course_slug === slug && a.passed && a.assessment !== 'exam')
				.map((a) => a.assessment)
		).size;
	}
</script>

<svelte:head
	><title>Кабинет студента — Универ</title><meta name="robots" content="noindex" /></svelte:head
>
<Frame>
	<div class="ym-hide-content">
		<div class="academy-dashboard-title">
			<div>
				<h1>Ваша зачётная книжка</h1>
				<p class="academy-lead">{dashboard.student.name}</p>
				<p>{dashboard.student.email} · Студент</p>
			</div>
			<a class="academy-button" href="/university#university-program">Выбрать курс</a>
		</div>
		<div class="academy-summary">
			<p><strong>{started.length}</strong> начато курсов</p>
			<p><strong>{completed}</strong> завершено</p>
			<p><strong>{dashboard.attempts.length}</strong> попыток тестирования</p>
		</div>
		<section class="academy-record">
			<h2>Моё обучение</h2>
			{#if !started.length}<div class="academy-empty">
					<h3>Первая запись ещё впереди</h3>
					<p>
						Выберите курс и пройдите тест после первой статьи. Здесь появятся ваш прогресс и оценки.
					</p>
					<a class="academy-link" href="/university#university-program">Найти интересную тему</a>
				</div>{/if}
			{#each started as course}
				{@const cert = dashboard.certificates.find((c) => c.course_slug === course.slug)}
				<article class="academy-record-row">
					<div>
						<p class="academy-fine">{course.discipline}</p>
						<h3>{course.title}</h3>
						<p>
							{progress(course.slug)} из {course.lessons.length} тестов сдано · {cert
								? `Экзамен: ${cert.score}%`
								: 'Экзамен впереди'}
						</p>
						<progress
							max={course.lessons.length}
							value={progress(course.slug)}
							aria-label="Прогресс курса {course.title}"
						></progress>
					</div>
					<a class="academy-link" href="/university/learn/{course.slug}"
						>{cert ? 'Повторить материал' : 'Продолжить курс'}</a
					>
				</article>
			{/each}
		</section>
		<section class="academy-record">
			<h2>Мои сертификаты</h2>
			<p>Именное подтверждение прохождения курса и итогового экзамена.</p>
			{#if !completed}<p class="academy-empty">
					После успешного экзамена здесь появится сертификат. Его можно распечатать или сохранить в
					PDF.
				</p>{/if}
			{#each dashboard.certificates as certificate}<article class="academy-record-row">
					<div>
						<h3>{certificate.course_title}</h3>
						<p>
							{certificate.discipline} · {certificate.issued_at.slice(0, 10)} · {certificate.score}%
						</p>
					</div>
					<a class="academy-link" href="/university/certificate/{certificate.id}"
						>Открыть сертификат</a
					>
				</article>{/each}
		</section>
		{#if dashboard.attempts.length}<section class="academy-record">
				<h2>История оценок</h2>
				<div class="academy-table-wrap">
					<table>
						<thead><tr><th>Курс и работа</th><th>Результат</th><th>Дата</th></tr></thead><tbody
							>{#each dashboard.attempts as attempt}{@const course = dashboard.courses.find(
									(c) => c.slug === attempt.course_slug
								)}<tr
									><td
										>{course?.title}<small
											>{attempt.assessment === 'exam'
												? 'Итоговый экзамен'
												: course?.lessons.find((l) => l.id === attempt.assessment)?.title}</small
										></td
									><td
										>{attempt.grade}/5 · {attempt.score}% · {attempt.passed
											? 'Зачтено'
											: 'Повторить'}</td
									><td>{attempt.created_at.slice(0, 10)}</td></tr
								>{/each}</tbody
						>
					</table>
				</div>
			</section>{/if}
	</div>
</Frame>
