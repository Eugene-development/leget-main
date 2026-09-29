<script lang="ts">
	// Артикул: 1.32.1.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { isLightBlock } from '$lib/utils/block-theme';
	import UniversityMark from './UniversityMark.svelte';
	import LearningObject from '$lib/university/LearningObject.svelte';
	import { universityHero as defaults } from './content';
	import '../../theme.css';
	import './university.css';

	let {
		data = $bindable({}),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();
	const isLight = $derived(isLightBlock(data, 'light'));
	function fieldValue(key: keyof typeof defaults) {
		const value = data[key] ?? defaults[key];
		if (key === 'brandName' && value === 'Универ') return defaults.brandName;
		if (key === 'title' && value === 'Хороший дом начинается с понимания.') return defaults.title;
		return String(value);
	}
	// Measure the actual space occupied by the promo strip and site navigation.
	function fitFirstScreen(node: HTMLElement) {
		const measure = () => {
			const top = Math.max(0, node.getBoundingClientRect().top + window.scrollY);
			node.style.setProperty('--uni-viewport-offset', `${top}px`);
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(document.body);
		window.addEventListener('resize', measure);
		return {
			destroy() {
				observer.disconnect();
				window.removeEventListener('resize', measure);
			}
		};
	}
	async function saveField(field: string, value: unknown) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'UniversityHero', updated);
		data = updated;
	}
</script>

{#snippet field(key: keyof typeof defaults, label: string)}
	<EditableField
		fieldKey="UniversityHero.{key}"
		{label}
		value={fieldValue(key)}
		{isEditable}
		inline
		onSave={(v) => saveField(key, v)}
	>
		{#snippet children(value)}<RichText {value} />{/snippet}
	</EditableField>
{/snippet}

<section
	use:fitFirstScreen
	id="university-disciplines"
	class="uni uni-hero p1-surface-paper"
	data-p1-theme={isLight ? 'light' : 'dark'}
	aria-label="Университет"
>
	<div class="uni-wrap">
		<div class="uni-masthead p1-line">
			<div class="uni-brand p1-title">
				<UniversityMark class="uni-mark" />
				<div class="uni-wordmark">{@render field('brandName', 'Название Универа')}</div>
			</div>
		</div>
		<div class="uni-intro">
			<div class="uni-intro-main">
				<h1 class="uni-headline p1-title">{@render field('title', 'Заголовок')}</h1>
				<div class="uni-intro-copy">
					<p class="p1-body">{@render field('description', 'Описание')}</p>
					<div class="uni-intro-actions">
						<a
							class="uni-primary-link"
							href="#university-program"
							aria-label={String(data.buttonText ?? defaults.buttonText).replace(/<[^>]*>/g, '')}
						>
							{@render field('buttonText', 'Текст ссылки')}
							<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"
								><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.5" /></svg
							>
						</a>
						<a class="uni-secondary-link" href="/university/student">Моё обучение</a>
						<a class="uni-secondary-link" href="#university-verification">Проверка дизайнера</a>
					</div>
				</div>
			</div>
			<LearningObject />
		</div>
	</div>
</section>
