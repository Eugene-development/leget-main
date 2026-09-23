<script lang="ts">
	import { tick } from 'svelte';
	import type { Course, Attempt, AssessmentResult } from './types';
	let { course, attempts }: { course: Course; attempts: Attempt[] } = $props();
	let selected = $state(0);
	let answers = $state<Record<string, number>>({});
	let result = $state<AssessmentResult | null>(null);
	let busy = $state(false);
	let problem = $state('');
	let requestKey = '';
	let submittedPayload = '';
	let titleElement = $state<HTMLHeadingElement>();
	let localPasses = $state<string[]>([]);
	const exam = $derived(selected === course.lessons.length);
	const lesson = $derived(course.lessons[selected]);
	const questions = $derived(exam ? course.exam : (lesson?.questions ?? []));
	const assessment = $derived(exam ? 'exam' : lesson.id);
	const passed = $derived(
		new Set([...attempts.filter((a) => a.passed).map((a) => a.assessment), ...localPasses])
	);
	const unlocked = $derived(course.lessons.every((l) => passed.has(l.id)));
	async function select(index: number) {
		selected = index;
		answers = {};
		result = null;
		problem = '';
		requestKey = '';
		submittedPayload = '';
		await tick();
		titleElement?.focus();
	}
	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (busy) return;
		busy = true;
		problem = '';
		const payload = JSON.stringify({ assessment, answers });
		if (payload !== submittedPayload) {
			requestKey = crypto.randomUUID();
			submittedPayload = payload;
		}
		try {
			const response = await fetch(`/university/api/courses/${course.slug}/assess`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ assessment, answers, request_key: requestKey })
			});
			const responseData = await response.json();
			if (!response.ok)
				throw new Error(responseData.message || 'Не удалось проверить ответы. Повторите отправку.');
			result = responseData;
			if (result?.passed) localPasses = [...localPasses, assessment];
		} catch (e) {
			problem =
				e instanceof Error
					? e.message
					: 'Связь прервалась. Повторите отправку — результат не задвоится.';
		} finally {
			busy = false;
		}
	}
</script>

<div class="academy-classroom">
	<aside class="academy-syllabus">
		<a class="academy-link" href="/university/student">Моё обучение</a>
		<h2>{course.title}</h2>
		<p>{course.discipline}</p>
		<ol>
			{#each course.lessons as item, i}<li>
					<button
						class:active={selected === i}
						aria-current={selected === i ? 'step' : undefined}
						disabled={busy}
						onclick={() => select(i)}
						data-goal-ignore="Навигация между учебными статьями"
						><span>Статья {i + 1}</span>{item.title}<small
							>{passed.has(item.id) ? 'Тест сдан' : 'Статья и тест'}</small
						></button
					>
				</li>{/each}
			<li>
				<button
					class:active={exam}
					aria-current={exam ? 'step' : undefined}
					disabled={busy || !unlocked}
					onclick={() => select(course.lessons.length)}
					data-goal-ignore="Переход к итоговому экзамену"
					><span>Итоговая работа</span>Экзамен по курсу<small
						>{unlocked ? 'Доступен' : 'Сдайте тесты статей'}</small
					></button
				>
			</li>
		</ol>
	</aside>
	<div class="academy-lesson">
		{#key selected}<div class="academy-page-turn">
				<p class="academy-fine">
					{exam ? 'Итоговый экзамен' : `Статья ${selected + 1} из ${course.lessons.length}`} · {course.discipline}
				</p>
				<h1 bind:this={titleElement} tabindex="-1">
					{exam ? 'Покажите, чему научились' : lesson.title}
				</h1>
				{#if !exam}<article>
						{#each lesson.sections ?? [] as section}<section>
								<h2>{section.title}</h2>
								<p>{section.text}</p>
							</section>{/each}
					</article>{:else}<p class="academy-lead">
						Четыре вопроса по материалам курса. Для сертификата нужно не менее 75% верных ответов.
						Количество попыток не ограничено.
					</p>{/if}
				<section class="academy-test">
					<h2>{exam ? 'Экзаменационная работа' : 'Проверим понимание'}</h2>
					<p>
						{exam
							? 'Один правильный ответ в каждом вопросе.'
							: 'Два вопроса, один правильный ответ в каждом. Для зачёта достаточно 50%. Для уверенного знания стремитесь к 100%.'}
					</p>
					<form onsubmit={submit}>
						{#each questions as question, i}<fieldset disabled={busy || !!result}>
								<legend>{i + 1}. {question.text}</legend>{#each question.options as option, j}<label
										class="academy-option"
										><input
											type="radio"
											name={question.id}
											value={j}
											bind:group={answers[question.id]}
											required
										/><span>{option}</span></label
									>{/each}
							</fieldset>{/each}
						{#if problem}<p class="academy-notice" role="alert">{problem}</p>{/if}
						{#if !result}<button
								class="academy-button"
								disabled={busy || questions.some((q) => answers[q.id] === undefined)}
								data-metrika-goal="university_assessment_submit"
								data-goal-label="Отправить учебную работу"
								data-goal-action="submit_click"
								type="submit"
								>{busy ? 'Проверяем…' : exam ? 'Завершить экзамен' : 'Проверить ответы'}</button
							>{/if}
					</form>
					{#if result}<div class="academy-result" role="status">
							<h3>{result.passed ? 'Работа зачтена' : 'Попробуйте ещё раз'}</h3>
							<p class="academy-result-score">
								{result.score}% <span>Оценка: {result.grade} из 5</span>
							</p>
							<ol>
								{#each result.feedback as feedback}<li>
										<strong>{feedback.correct ? 'Верно.' : 'Разберём ответ.'}</strong>
										{feedback.explanation}
									</li>{/each}
							</ol>
							<div class="academy-actions">
								{#if exam && result.certificate_id}<a
										class="academy-button"
										href="/university/certificate/{result.certificate_id}">Получить сертификат</a
									>{:else if result.passed}<button
										class="academy-button"
										onclick={() =>
											select(
												selected + 1 === course.lessons.length && !unlocked
													? course.lessons.findIndex((l) => !passed.has(l.id))
													: selected + 1
											)}
										data-goal-ignore="Продолжение учебного курса"
										>{selected + 1 === course.lessons.length
											? unlocked
												? 'Перейти к экзамену'
												: 'Пройти оставшиеся статьи'
											: 'Следующая статья'}</button
									>{/if}
								<button
									class="academy-link"
									onclick={() => select(selected)}
									data-metrika-goal="university_assessment_retry"
									data-goal-action="reset">Пройти ещё раз</button
								><a class="academy-link" href="/university/student">В зачётную книжку</a>
							</div>
						</div>{/if}
				</section>
			</div>{/key}
	</div>
</div>
