<script lang="ts">
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { revealOnScroll } from './theme';
	import './theme.css';
	import BlockThemeToggle from '$lib/components/BlockThemeToggle.svelte';
	import { createThemeToggle, isLightBlock } from '$lib/utils/block-theme';
	import '../../theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	// Тема блока: нейтральная палитра — из классов p1-*, акценты не зависят от темы.
	const isLight = $derived(isLightBlock(data, 'light'));
	const toggleTheme = createThemeToggle({
		type: 'Text',
		fallback: 'light',
		getData: () => data,
		setData: (next) => (data = next),
		getContext: () => editContext
	});

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Text', updated);
		data = updated;
	}

	const content = $derived(String(data?.content ?? '').trim());
</script>

<!--
	ВНИМАНИЕ — стык секций: сверху в этот блок «вливается» волна из Hero,
	её заливка (`--ah-wave`, #f8fafc) должна совпадать с фоном секции, поэтому
	здесь `bg-slate-50` без градиента у верхней кромки. Тот же фон у Statistics —
	стык остаётся ровным, даже если этот блок пуст и не рисуется.

	Пустой контент больше не даёт полосу пустого фона: на публичном сайте секция
	не рендерится вовсе, а в режиме редактирования показывается всегда, иначе
	поле было бы негде заполнить.
-->
{#if content || isEditable}
	<section
		class="p1-surface-alt relative isolate overflow-hidden py-16 sm:py-20"
		data-p1-theme={isLight ? 'light' : 'dark'}
	>
		<BlockThemeToggle {isLight} onToggle={toggleTheme} {isEditable} {editContext} />

		<div class="pointer-events-none absolute inset-0" aria-hidden="true">
			<div class="ab-rules"></div>
		</div>

		<div use:revealOnScroll class="ab-reveal relative mx-auto max-w-3xl px-6 lg:px-8">
			<div
				class="ab-card p1-border p1-card relative overflow-hidden rounded-4xl border px-6 py-10 shadow-[0_30px_80px_-55px_rgba(15,23,42,0.4)] sm:px-12 sm:py-12"
			>
				<div
					class="pointer-events-none absolute inset-x-12 top-0 h-px bg-linear-to-r from-transparent via-red-500/70 to-transparent"
					aria-hidden="true"
				></div>

				<div class="relative prose prose-lg max-w-none prose-slate">
					<EditableField
						fieldKey="Text.content"
						label="Текст"
						value={String(data?.content ?? '')}
						{isEditable}
						multiline
						onSave={(v) => saveField('content', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							{@html displayValue}
						{/snippet}
					</EditableField>
				</div>
			</div>
		</div>
	</section>
{/if}
