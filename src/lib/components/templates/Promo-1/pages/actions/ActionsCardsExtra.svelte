<script lang="ts">
	// Артикул: 1.4.3.1 — см. docs/architecture/component-articles-map.md
	import RichText from '$lib/components/RichText.svelte';
	import ActionIconPicker from './ActionIconPicker.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { isLightBlock } from '$lib/utils/block-theme';
	import {
		actionCompanies,
		defaultExtraCards,
		type ActionCompany,
		type ExtraCard
	} from './actionCardsExtra';
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

	const isLight = $derived(isLightBlock(data, 'light'));
	const companies = $derived(actionCompanies(data));
	let saving = $state(false);
	let saveError = $state('');
	let deletedCompanies = $state<ActionCompany[] | null>(null);

	async function saveCompanies(next: ActionCompany[]) {
		if (saving) throw new Error('Дождитесь сохранения изменений.');
		saving = true;
		saveError = '';
		const { cards: _legacyCards, ...rest } = data;
		const updated = { ...rest, companies: next };
		try {
			if (editContext) await saveComponentData(editContext, 'ActionsCardsExtra', updated);
			data = updated;
			deletedCompanies = null;
		} catch (error) {
			saveError = 'Не удалось сохранить изменения. Повторите действие.';
			throw error;
		} finally {
			saving = false;
		}
	}

	// Button errors stay visible here; EditableField forwards rejections to its editor.
	function changeCompanies(next: ActionCompany[]) {
		void saveCompanies(next).catch(() => {});
	}

	function updateCompany(index: number, patch: Partial<ActionCompany>) {
		return saveCompanies(
			companies.map((company, i) => (i === index ? { ...company, ...patch } : company))
		);
	}

	function updateCardField(
		companyIndex: number,
		index: number,
		field: keyof ExtraCard,
		value: string | boolean
	) {
		return updateCompany(companyIndex, {
			cards: companies[companyIndex].cards.map((card, i) =>
				i === index ? { ...card, [field]: value } : card
			)
		});
	}

	function toggleCard(companyIndex: number, index: number, enabled: boolean) {
		void updateCardField(companyIndex, index, 'enabled', enabled).catch(() => {});
	}

	function addCompany() {
		changeCompanies([
			...companies,
			{ id: crypto.randomUUID(), name: 'Название компании', cards: [] }
		]);
	}

	function addCard(index: number) {
		void updateCompany(index, {
			cards: [
				...companies[index].cards,
				{
					id: crypto.randomUUID(),
					title: 'Новая акция',
					description: '',
					badge: '',
					icon: defaultExtraCards[0].icon
				}
			]
		}).catch(() => {});
	}

	function removeCard(companyIndex: number, index: number) {
		const previous = companies;
		void updateCompany(companyIndex, {
			cards: companies[companyIndex].cards.filter((_, i) => i !== index)
		})
			.then(() => {
				deletedCompanies = previous;
			})
			.catch(() => {});
	}

	function removeCompany(index: number) {
		const previous = companies;
		void saveCompanies(companies.filter((_, i) => i !== index))
			.then(() => {
				deletedCompanies = previous;
			})
			.catch(() => {});
	}

	function undoDelete() {
		if (!deletedCompanies) return;
		void saveCompanies(deletedCompanies)
			.then(() => {
				deletedCompanies = null;
			})
			.catch(() => {});
	}

	function moveCompany(index: number, direction: -1 | 1) {
		const next = [...companies];
		const target = index + direction;
		if (target < 0 || target >= next.length) return;
		[next[index], next[target]] = [next[target], next[index]];
		changeCompanies(next);
	}
</script>

{#each companies as company, ci (company.id)}
	{#if isEditable || (company.enabled !== false && company.cards.some((card) => card.enabled !== false))}
		<section
			class="p1-surface-alt relative py-section-sm"
			data-company-id={company.id}
			data-p1-theme={isLight ? 'light' : 'dark'}
		>
			<div class="mx-auto max-w-7xl px-6 lg:px-8">
				<div class="mb-8 flex flex-col items-start justify-between gap-4 lg:flex-row">
					<EditableField
						fieldKey="ActionsCardsExtra.companies.{company.id}.name"
						label="Название компании"
						value={company.name}
						isEditable={isEditable && !saving}
						onSave={(value) => updateCompany(ci, { name: value })}
						class="w-full min-w-0 flex-1 lg:w-auto"
					>
						{#snippet children(displayValue)}
							<h2 class="p1-title p1-title-section text-2xl break-words sm:text-3xl">
								<RichText value={displayValue} />
							</h2>
						{/snippet}
					</EditableField>
					{#if isEditable}
						<div class="flex flex-wrap items-center gap-2">
							<label class="p1-body flex min-h-11 items-center gap-2 text-sm">
								<input
									type="checkbox"
									checked={company.enabled !== false}
									disabled={saving}
									onchange={(event) =>
										changeCompanies(
											companies.map((item, i) =>
												i === ci ? { ...item, enabled: event.currentTarget.checked } : item
											)
										)}
								/>
								Показывать компанию
							</label>
							<button
								type="button"
								class="company-control"
								disabled={saving || ci === 0}
								onclick={() => moveCompany(ci, -1)}
								data-goal-ignore="Порядок компаний в редакторе сайта">Выше</button
							>
							<button
								type="button"
								class="company-control"
								disabled={saving || ci === companies.length - 1}
								onclick={() => moveCompany(ci, 1)}
								data-goal-ignore="Порядок компаний в редакторе сайта">Ниже</button
							>
							<button
								type="button"
								class="company-control"
								disabled={saving}
								onclick={() => removeCompany(ci)}
								data-goal-ignore="Удаление блока компании в редакторе сайта"
								>Удалить компанию</button
							>
						</div>
					{/if}
				</div>
				{#if isEditable && company.enabled === false}<p class="p1-muted mb-6 text-sm">
						Компания скрыта от посетителей.
					</p>{/if}
				<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
					{#each company.cards as card, i (card.id)}
						{#if isEditable || card.enabled !== false}
							<div
								class="p1-card group relative overflow-hidden rounded-2xl border p-8 transition duration-300 hover:-translate-y-2 hover:border-cat-1-500 hover:shadow-2xl {isEditable &&
								card.enabled === false
									? 'opacity-60 brightness-95 contrast-75 grayscale'
									: ''}"
							>
								<div
									class="absolute -top-4 -right-4 size-24 rounded-full bg-cat-1-500/10 transition duration-300 group-hover:scale-150"
								></div>
								<div class="relative">
									{#if isEditable}
										<div class="absolute top-0 right-0 z-10 flex flex-col items-end gap-2">
											<button
												type="button"
												class="company-control"
												disabled={saving}
												onclick={() => removeCard(ci, i)}
												data-goal-ignore="Удаление карточки акции в редакторе сайта"
												>Удалить акцию</button
											>
											<label
												class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-ink-100 bg-ink-50/95 px-2.5 py-1 shadow-sm backdrop-blur transition duration-200 hover:bg-ink-100"
											>
												<input
													type="checkbox"
													disabled={saving}
													checked={card.enabled !== false}
													onchange={(e) => toggleCard(ci, i, e.currentTarget.checked)}
													class="peer sr-only"
												/>
												<div
													class="peer relative h-4 w-7 rounded-full bg-ink-200 peer-checked:bg-cat-1-500 peer-focus-visible:ring-2 peer-focus-visible:ring-link-600 peer-focus-visible:ring-offset-2 after:absolute after:start-[2px] after:top-[2px] after:h-3 after:w-3 after:rounded-full after:border after:border-ink-300 after:bg-surface-raised after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-on-dark"
												></div>
												<span
													class="text-[10px] font-bold tracking-wider text-ink-500 uppercase select-none"
												>
													{card.enabled !== false ? 'Вкл' : 'Выкл'}
												</span>
											</label>
										</div>
									{/if}

									<ActionIconPicker
										value={card.icon}
										label={card.title}
										{isEditable}
										disabled={saving}
										accent="company"
										onSave={(path) => updateCardField(ci, i, 'icon', path)}
									/>

									<EditableField
										fieldKey="ActionsCardsExtra.companies.{company.id}.cards.{card.id}.title"
										label="Заголовок карточки"
										value={card.title}
										isEditable={isEditable && !saving}
										onSave={async (v) => {
											await updateCardField(ci, i, 'title', v);
										}}
										class="mt-6 block"
									>
										{#snippet children(displayValue)}
											<h3 class="p1-title p1-title-sub mt-6 text-xl">
												<RichText value={displayValue} />
											</h3>
										{/snippet}
									</EditableField>

									<EditableField
										fieldKey="ActionsCardsExtra.companies.{company.id}.cards.{card.id}.description"
										label="Описание"
										value={card.description}
										isEditable={isEditable && !saving}
										multiline
										onSave={async (v) => {
											await updateCardField(ci, i, 'description', v);
										}}
										class="mt-3 block"
									>
										{#snippet children(displayValue)}
											<p class="p1-body mt-3 text-base/7"><RichText value={displayValue} /></p>
										{/snippet}
									</EditableField>

									<div class="mt-6">
										<EditableField
											fieldKey="ActionsCardsExtra.companies.{company.id}.cards.{card.id}.badge"
											label="Бейдж"
											value={card.badge}
											isEditable={isEditable && !saving}
											onSave={async (v) => {
												await updateCardField(ci, i, 'badge', v);
											}}
											class="inline-block"
										>
											{#snippet children(displayValue)}
												<span
													class="inline-flex items-center rounded-full bg-cat-1-50 px-3 py-1 text-sm font-medium text-cat-1-700"
												>
													<RichText value={displayValue} />
												</span>
											{/snippet}
										</EditableField>
									</div>
								</div>
							</div>
						{/if}
					{/each}
				</div>
				{#if isEditable}
					{#if company.cards.length === 0}<p class="p1-body text-base">
							Добавьте первую акцию этой компании.
						</p>{/if}
					<button
						type="button"
						class="company-control mt-6"
						disabled={saving}
						onclick={() => addCard(ci)}
						data-goal-ignore="Добавление карточки акции в редакторе сайта">Добавить акцию</button
					>
				{/if}
			</div>
		</section>
	{/if}
{/each}

{#if isEditable}
	<div class="p1-surface px-6 py-8" data-p1-theme={isLight ? 'light' : 'dark'}>
		<div class="mx-auto max-w-7xl">
			{#if companies.length === 0}<p class="p1-body mb-4">
					Добавьте компанию, чтобы разместить её акции.
				</p>{/if}
			<button
				type="button"
				class="company-control"
				disabled={saving}
				onclick={addCompany}
				data-goal-ignore="Добавление блока компании в редакторе сайта">Добавить компанию</button
			>
			<p class="p1-muted mt-3 text-sm" role="status">{saving ? 'Сохраняем изменения…' : ''}</p>
			{#if deletedCompanies}
				<div class="p1-body mt-3 flex flex-wrap items-center gap-3 text-sm" role="status">
					<span>Удалено.</span>
					<button
						type="button"
						class="company-control"
						disabled={saving}
						onclick={undoDelete}
						data-goal-ignore="Восстановление удалённой компании или акции в редакторе сайта"
						>Отменить удаление</button
					>
				</div>
			{/if}
			{#if saveError}<p class="p1-body mt-3 text-sm" role="alert">{saveError}</p>{/if}
		</div>
	</div>
{/if}

<style>
	.company-control {
		min-height: 2.75rem;
		padding: 0.5rem 0.875rem;
		border: 1px solid currentColor;
		border-radius: var(--ds-radius-lg);
		color: var(--ds-link-700);
		font-size: 0.875rem;
		cursor: pointer;
	}
	.company-control:hover:not(:disabled) {
		background: var(--ds-link-50);
	}
	.company-control:focus-visible {
		outline: 2px solid var(--ds-link-600);
		outline-offset: 3px;
	}
	.company-control:disabled {
		opacity: 0.45;
		cursor: default;
	}
	[data-p1-theme='dark'] .company-control {
		color: var(--ds-link-300);
	}
	[data-p1-theme='dark'] .company-control:hover:not(:disabled) {
		background: var(--ds-link-950);
	}
</style>
