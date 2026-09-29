<script lang="ts">
	import type { EditorQuestion } from './types';
	let { questions }: { questions: EditorQuestion[] } = $props();
</script>

<section class="study-test" id="assessment">
	<h2>Предпросмотр теста</h2>
	<p>Ответы не отправляются и не создают оценок.</p>
	{#each questions as question, i}<fieldset disabled>
			<legend>{i + 1}. {question.text}</legend>{#each question.options as option, j}<label
					class="study-option"
					><input type="radio" checked={j === question.correct} /><span>{option}</span></label
				>{/each}
			<p>{question.explanation}</p>
		</fieldset>{/each}
</section>
