<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { Course, Question, AssessmentResult } from './types';
	let {
		course,
		assessment,
		questions,
		next
	}: { course: Course; assessment: string; questions: Question[]; next?: string } = $props();
	let answers = $state<Record<string, number>>({});
	let result = $state<AssessmentResult | null>(null);
	let busy = $state(false);
	let problem = $state('');
	let requestKey = '';
	let submittedPayload = '';
	const exam = $derived(assessment === 'exam');
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
			const data = await response.json();
			if (!response.ok)
				throw new Error(data.message || 'Не удалось проверить ответы. Повторите отправку.');
			result = data;
			await invalidateAll();
		} catch (e) {
			problem =
				e instanceof Error
					? e.message
					: 'Связь прервалась. Повторите отправку — результат не задвоится.';
		} finally {
			busy = false;
		}
	}
	function reset() {
		answers = {};
		result = null;
		problem = '';
		requestKey = '';
		submittedPayload = '';
	}
</script>

<section class="study-test ym-hide-content" id="assessment">
	<h2>{exam ? 'Экзаменационная работа' : 'Проверим понимание'}</h2>
	<p>
		Один правильный ответ в каждом вопросе. Для зачёта нужно {exam ? '75' : '50'}%. Повторные
		попытки разрешены.
	</p>
	<form onsubmit={submit}>
		{#each questions as question, i}<fieldset disabled={busy || !!result}>
				<legend>{i + 1}. {question.text}</legend>{#each question.options as option, j}<label
						class="study-option"
						><input
							type="radio"
							name={question.id}
							value={j}
							bind:group={answers[question.id]}
							required
						/><span>{option}</span></label
					>{/each}
			</fieldset>{/each}
		{#if problem}<p class="study-alert" role="alert">{problem}</p>{/if}
		{#if !result}<button
				class="study-button"
				disabled={busy || !questions.length || questions.some((q) => answers[q.id] === undefined)}
				data-metrika-goal="university_assessment_submit"
				data-goal-label="Отправить учебную работу"
				data-goal-action="submit_click"
				type="submit"
				>{busy ? 'Проверяем…' : exam ? 'Завершить экзамен' : 'Проверить ответы'}</button
			>{/if}
	</form>
	{#if result}<div class="study-result" role="status">
			<h3>{result.passed ? 'Работа зачтена' : 'Попробуйте ещё раз'}</h3>
			<p>{result.score}% · Оценка {result.grade} из 5</p>
			<ol>
				{#each result.feedback as feedback}<li>
						<strong>{feedback.correct ? 'Верно.' : 'Разберём ответ.'}</strong>
						{feedback.explanation}
					</li>{/each}
			</ol>
			<div class="study-actions">
				{#if exam && result.certificate_id}<a
						class="study-button"
						href="/university/certificate/{result.certificate_id}">Открыть сертификат</a
					>{:else if result.passed && next}<a class="study-button" href={next}
						>Продолжить обучение</a
					>{/if}
				<button
					class="study-link"
					onclick={reset}
					data-metrika-goal="university_assessment_retry"
					data-goal-action="reset">Пройти ещё раз</button
				><a class="study-link" href="/university/student">Мои результаты</a>
			</div>
		</div>{/if}
</section>
