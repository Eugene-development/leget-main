<script lang="ts">
	import Icon from '../StudyIcon.svelte';
	import RichTextEditor from '$lib/components/RichTextEditor.svelte';
	import MediaUpload from './MediaUpload.svelte';
	import QuestionsEditor from './QuestionsEditor.svelte';
	import { resourceCategories } from '../navigation';
	import type { EditorItem, Kind } from './types';
	let {
		item = $bindable(),
		kind,
		courses = [],
		disabled = false
	}: { item: EditorItem; kind: Kind; courses?: EditorItem[]; disabled?: boolean } = $props();
	let activeLesson = $state(0);
	const lesson = $derived(item.curriculum?.lessons[activeLesson]);
	function addLesson() {
		item.curriculum?.lessons.push({
			id: `lesson-${crypto.randomUUID()}`,
			title: 'Новый урок',
			sections: [],
			practice: '',
			questions: [],
			video_id: null
		});
		activeLesson = (item.curriculum?.lessons.length ?? 1) - 1;
	}
	function move(index: number, direction: number) {
		const lessons = item.curriculum?.lessons;
		if (!lessons || index + direction < 0 || index + direction >= lessons.length) return;
		[lessons[index], lessons[index + direction]] = [lessons[index + direction], lessons[index]];
		activeLesson = index + direction;
	}
</script>

<fieldset class="editor-fields" {disabled}>
	<div class="editor-columns">
		<label
			>Адрес (slug)<input
				bind:value={item.slug}
				pattern="[a-z0-9-]+"
				maxlength="80"
				required
				disabled={!!item.updated_at}
			/></label
		><label
			>Порядок<input
				type="number"
				min="0"
				max="100000"
				bind:value={item.position}
				required
			/></label
		>
	</div>
	<label>Название<input bind:value={item.title} maxlength="255" required /></label>
	<label
		>Описание<textarea bind:value={item.description} rows="3" maxlength="20000"></textarea></label
	>
	{#if kind === 'courses'}<label
			>Дисциплина<input
				bind:value={item.discipline}
				maxlength="80"
				required
				list="university-disciplines"
			/></label
		>{/if}
	<MediaUpload
		label="Обложка"
		accept="image"
		value={item.cover_id}
		onchange={(value) => (item.cover_id = value)}
		{disabled}
	/>
	{#if kind === 'courses' && item.curriculum}
		{#if item.curriculum_locked}<p class="editor-notice">
				По курсу уже есть оценки. Чтобы изменить уроки и вопросы, сохраните другие изменения и
				создайте новую редакцию.
			</p>{/if}
		<fieldset class="editor-fields" disabled={disabled || item.curriculum_locked}>
			<section class="editor-section">
				<h2>Уроки</h2>
				<div class="editor-lessons">
					{#each item.curriculum.lessons as lesson, i (lesson.id)}<div
							class:editor-selected={activeLesson === i}
						>
							<button
								type="button"
								onclick={() => (activeLesson = i)}
								data-goal-ignore="Выбор урока в редакторе">{i + 1}. {lesson.title}</button
							><button
								type="button"
								aria-label="Поднять урок"
								disabled={i === 0}
								onclick={() => move(i, -1)}
								data-goal-ignore="Изменение порядка уроков"><Icon name="up" size={16} /></button
							><button
								type="button"
								aria-label="Опустить урок"
								disabled={i === item.curriculum.lessons.length - 1}
								onclick={() => move(i, 1)}
								data-goal-ignore="Изменение порядка уроков"><Icon name="down" size={16} /></button
							>
						</div>{/each}
				</div>
				<button
					type="button"
					class="study-button study-button-secondary"
					onclick={addLesson}
					data-goal-ignore="Добавление урока">Добавить урок</button
				>
				{#if lesson}{#key lesson.id}<div class="editor-lesson">
							<label
								>Название урока<input bind:value={lesson.title} required maxlength="255" /></label
							><MediaUpload
								label="Видео урока"
								accept="video"
								value={lesson.video_id}
								onchange={(value) => (lesson.video_id = value)}
								{disabled}
							/>
							{#each lesson.sections as section, j (section)}<div class="editor-section-block">
									<label
										>Заголовок раздела<input bind:value={section.title} maxlength="255" /></label
									><RichTextEditor
										value={section.text}
										label="Текст раздела {j + 1}"
										autofocus={false}
										disabled={disabled || item.curriculum_locked}
										onchange={(value) => (section.text = value)}
									/>
									<div class="study-actions">
										<button
											type="button"
											class="study-link"
											disabled={j === 0}
											onclick={() => {
												[lesson.sections[j - 1], lesson.sections[j]] = [
													lesson.sections[j],
													lesson.sections[j - 1]
												];
											}}
											data-goal-ignore="Изменение порядка разделов урока">Поднять раздел</button
										><button
											type="button"
											class="study-link"
											onclick={() => lesson.sections.splice(j, 1)}
											data-goal-ignore="Удаление раздела урока">Удалить раздел</button
										>
									</div>
								</div>{/each}
							<button
								type="button"
								class="study-link"
								onclick={() => lesson.sections.push({ title: '', text: '' })}
								data-goal-ignore="Добавление раздела урока">Добавить раздел текста</button
							>
							<h3>Практическое задание</h3>
							<RichTextEditor
								value={lesson.practice ?? ''}
								label="Практическое задание"
								autofocus={false}
								disabled={disabled || item.curriculum_locked}
								onchange={(value) => (lesson.practice = value)}
							/>
							<QuestionsEditor bind:questions={lesson.questions} {disabled} /><button
								type="button"
								class="study-link"
								onclick={() => {
									item.curriculum?.lessons.splice(activeLesson, 1);
									activeLesson = Math.max(0, activeLesson - 1);
								}}
								data-goal-ignore="Удаление урока из редакции курса"
								>Удалить урок из этой редакции</button
							>
						</div>{/key}{/if}
			</section>
			<QuestionsEditor
				title="Итоговый экзамен"
				bind:questions={item.curriculum.exam}
				disabled={disabled || item.curriculum_locked}
			/>
		</fieldset>
	{:else if kind === 'interviews'}
		<label>Участник<input bind:value={item.speaker} required maxlength="255" /></label>
		<h3>О беседе</h3>
		<RichTextEditor
			value={item.intro ?? ''}
			label="Представление интервью"
			autofocus={false}
			{disabled}
			onchange={(value) => (item.intro = value)}
		/><MediaUpload
			label="Видео интервью"
			accept="video"
			value={item.video_id}
			onchange={(value) => (item.video_id = value)}
			{disabled}
		/>
		<section class="editor-section">
			<h3>Главы</h3>
			{#each item.chapters ?? [] as chapter, i}<div class="editor-columns">
					<label>Секунда<input type="number" min="0" bind:value={chapter.start} /></label><label
						>Название<input bind:value={chapter.title} /></label
					><button
						type="button"
						class="study-link"
						onclick={() => item.chapters?.splice(i, 1)}
						data-goal-ignore="Удаление главы интервью">Удалить</button
					>
				</div>{/each}<button
				type="button"
				class="study-link"
				onclick={() => (item.chapters ??= []).push({ start: 0, title: '' })}
				data-goal-ignore="Добавление главы интервью">Добавить главу</button
			>
		</section>
		<section class="editor-section">
			<h3>Расшифровка</h3>
			{#each item.transcript ?? [] as line, i}<div class="editor-section-block">
					<div class="editor-columns">
						<label>Секунда<input type="number" min="0" bind:value={line.start} /></label><label
							>Кто говорит<input bind:value={line.speaker} /></label
						>
					</div>
					<label>Текст<textarea bind:value={line.text} rows="4"></textarea></label><button
						type="button"
						class="study-link"
						onclick={() => item.transcript?.splice(i, 1)}
						data-goal-ignore="Удаление реплики интервью">Удалить реплику</button
					>
				</div>{/each}<button
				type="button"
				class="study-link"
				onclick={() =>
					(item.transcript ??= []).push({ start: 0, speaker: item.speaker ?? '', text: '' })}
				data-goal-ignore="Добавление реплики интервью">Добавить реплику</button
			>
		</section>
	{:else if kind === 'resources'}
		<label
			>Раздел<select bind:value={item.category}
				>{#each Object.entries(resourceCategories) as [value, label]}<option {value}>{label}</option
					>{/each}</select
			></label
		><label>Автор<input bind:value={item.author} /></label>
		<section class="editor-section">
			<h3>Назначение ресурса</h3>
			<p>Заполните одно: внешнюю ссылку, курс с уроком или файл.</p>
			<label>Внешняя ссылка<input type="url" bind:value={item.url} placeholder="https://…" /></label
			>
			<div class="editor-columns">
				<label
					>Курс<select bind:value={item.course_slug} onchange={() => (item.lesson_id = null)}
						><option value="">Не выбран</option
						>{#each courses.filter((c) => c.status !== 'draft') as course}<option
								value={course.slug}
								>{course.title}{course.status === 'archived' ? ' · Архив' : ''}</option
							>{/each}</select
					></label
				>
				<label
					>Урок<select bind:value={item.lesson_id} disabled={!item.course_slug}
						><option value="">Обзор курса</option
						>{#each courses.find((c) => c.slug === item.course_slug)?.curriculum?.lessons ?? [] as lesson}<option
								value={lesson.id}>{lesson.title}</option
							>{/each}</select
					></label
				>
			</div>
			<MediaUpload
				label="Файл ресурса"
				accept="file"
				value={item.file_id}
				onchange={(value) => (item.file_id = value)}
				{disabled}
			/>
		</section>
	{/if}
</fieldset>
