<script lang="ts">
	import Icon from '../StudyIcon.svelte';
	import type { EditorQuestion } from './types';
	let {
		questions = $bindable(),
		title = 'Вопросы',
		disabled = false
	}: { questions: EditorQuestion[]; title?: string; disabled?: boolean } = $props();
	const group = $props.id();
	function add() {
		questions.push({
			id: `q-${crypto.randomUUID()}`,
			text: '',
			options: ['', '', ''],
			correct: 0,
			explanation: ''
		});
	}
</script>

<section class="editor-section">
	<h3>{title}</h3>
	{#each questions as question, i (question.id)}<fieldset class="editor-question" {disabled}>
			<legend>Вопрос {i + 1}</legend><label
				>Вопрос<input bind:value={question.text} maxlength="4000" /></label
			>
			<div class="editor-options">
				{#each question.options as option, j}<div>
						<label class="editor-radio"
							><input
								type="radio"
								name={`${group}-${question.id}`}
								value={j}
								bind:group={question.correct}
							/>Верный</label
						><input
							aria-label="Вариант {j + 1} ответа на вопрос {i + 1}"
							bind:value={question.options[j]}
							maxlength="2000"
						/><button
							type="button"
							class="study-icon-button"
							aria-label="Удалить вариант {j + 1}"
							disabled={questions[i].options.length <= 2}
							onclick={() => {
								question.options.splice(j, 1);
								if (question.correct === j) question.correct = 0;
								else if (question.correct > j) question.correct--;
							}}
							data-goal-ignore="Редактирование вариантов теста"
							><Icon name="close" size={16} /></button
						>
					</div>{/each}
			</div>
			<button
				type="button"
				class="study-link"
				disabled={question.options.length >= 10}
				onclick={() => question.options.push('')}
				data-goal-ignore="Добавление варианта теста">Добавить вариант</button
			><label
				>Объяснение ответа<textarea bind:value={question.explanation} rows="3" maxlength="10000"
				></textarea></label
			><button
				type="button"
				class="study-link"
				onclick={() => questions.splice(i, 1)}
				data-goal-ignore="Удаление вопроса теста">Удалить вопрос</button
			>
		</fieldset>{/each}<button
		type="button"
		class="study-button study-button-secondary"
		{disabled}
		onclick={add}
		data-goal-ignore="Добавление вопроса теста">Добавить вопрос</button
	>
</section>
