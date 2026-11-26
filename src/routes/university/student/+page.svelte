<script lang="ts">
	import { certificateValidity, continueUrl, dateLabel, passes } from '$lib/university/navigation';
	import Frame from '$lib/university/StudyShell.svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	const dashboard = $derived(data.dashboard);
	const started = $derived(
		dashboard.courses.filter((c) => dashboard.attempts.some((a) => a.course_slug === c.slug))
	);
	const completed = $derived(dashboard.certificates.filter((c) => c.is_valid).length);
</script>

<svelte:head
	><title>Кабинет студента — Универ</title><meta name="robots" content="noindex" /></svelte:head
>
<Frame
	><div class="study-container">
		<div class="ym-hide-content">
			<div class="study-dashboard-title">
				<div>
					<h1>Ваша зачётная книжка</h1>
					<p class="study-lead">{dashboard.student.name}</p>
					<p>{dashboard.student.email} · Студент</p>
				</div>
				<a class="study-button" href="/university/learn">Выбрать курс</a>
			</div>
			<div class="study-summary">
				<p><strong>{started.length}</strong> начато курсов</p>
				<p><strong>{completed}</strong> действующих сертификатов</p>
				<p><strong>{dashboard.attempts.length}</strong> попыток тестирования</p>
			</div>
			<section class="study-record">
				<h2>Моё обучение</h2>
				{#if !started.length}<div class="study-empty">
						<h3>Первая запись ещё впереди</h3>
						<p>
							Выберите курс и пройдите тест после первой статьи. Здесь появятся ваш прогресс и
							оценки.
						</p>
						<a class="study-link" href="/university/learn">Найти интересную тему</a>
					</div>{/if}
				{#each started as course}
					{@const cert = dashboard.certificates.find((c) => c.course_slug === course.slug)}
					{@const done = passes(course, dashboard.attempts)}
					{@const progress = course.lessons.filter((lesson) => done.has(lesson.id)).length}
					<article class="study-record-row">
						<div>
							<p class="study-fine">{course.discipline}</p>
							<h3>{course.title}</h3>
							<p>
								{progress} из {course.lessons.length} тестов сдано · {cert?.is_valid
									? `Экзамен: ${cert.score}%`
									: 'Экзамен впереди'}
							</p>
							{#if cert && !cert.is_valid}<p>Срок сертификата истёк. Сдайте курс заново.</p>{/if}
							<progress
								max={course.lessons.length}
								value={progress}
								aria-label="Прогресс курса {course.title}"
							></progress>
						</div>
						<a class="study-link" href={continueUrl(course, dashboard.attempts)}
							>{cert?.is_valid
								? 'Повторить материал'
								: cert && !progress
									? 'Пересдать курс'
									: 'Продолжить курс'}</a
						>
					</article>
				{/each}
			</section>
			<section class="study-record">
				<h2>Мои сертификаты</h2>
				<p>Сертификат действует один год с даты выдачи.</p>
				{#if !dashboard.certificates.length}<p class="study-empty">
						После успешного экзамена здесь появится сертификат. Его можно распечатать или сохранить
						в PDF.
					</p>{/if}
				{#each dashboard.certificates as certificate}<article class="study-record-row">
						<div>
							<h3>{certificate.course_title}</h3>
							<p>
								{certificate.discipline} · Выдан {dateLabel(certificate.issued_at)} · {certificate.score}%
							</p>
							<p>{certificateValidity(certificate)}</p>
						</div>
						<a class="study-link" href="/university/certificate/{certificate.id}"
							>Открыть сертификат</a
						>
					</article>{/each}
			</section>
			{#if dashboard.attempts.length}<section class="study-record">
					<h2>История оценок</h2>
					<div class="study-table-wrap">
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
	</div></Frame
>
