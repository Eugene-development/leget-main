<script lang="ts">
	interface Verification {
		designer_name: string;
		matched_certificate_id: string;
		certificates: { id: string; course_title: string; discipline: string; issued_at: string }[];
	}
	let certificateId = $state('');
	let busy = $state(false);
	let problem = $state('');
	let invalidId = $state(false);
	let result = $state<Verification | null>(null);
	let dialog: HTMLDialogElement;
	const fieldId = $props.id();
	export function open() {
		dialog.showModal();
	}

	function clearResult() {
		result = null;
		problem = '';
		invalidId = false;
	}
	function dateLabel(date: string) {
		const [year, month, day] = date.slice(0, 10).split('-');
		return `${day}.${month}.${year}`;
	}
	async function verify(event: SubmitEvent) {
		event.preventDefault();
		if (busy) return;
		clearResult();
		const id = certificateId.trim().toLowerCase();
		if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) {
			invalidId = true;
			problem = 'Введите полный ID записи из сертификата — все группы символов через дефис.';
			return;
		}
		certificateId = id;
		busy = true;
		try {
			const response = await fetch('/university/api/verify-certificate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ certificate_id: id }),
				signal: AbortSignal.timeout(15_000)
			});
			const data = await response.json();
			if (!response.ok) {
				invalidId = response.status === 404 || response.status === 422;
				problem = data.message || 'Не удалось проверить сертификат. Попробуйте ещё раз.';
				return;
			}
			result = data;
		} catch {
			problem = 'Не удалось связаться с университетом. Проверьте соединение и попробуйте ещё раз.';
		} finally {
			busy = false;
		}
	}
</script>

<dialog
	bind:this={dialog}
	class="certificate-verifier"
	aria-labelledby="{fieldId}-dialog-heading"
	aria-describedby="{fieldId}-description"
>
	<header class="verification-dialog-header">
		<h2 id="{fieldId}-dialog-heading" class="p1-title">Проверка дизайнера</h2>
		<button
			class="verification-close"
			type="button"
			aria-label="Закрыть проверку дизайнера"
			data-metrika-goal="university_certificate_verify_close"
			data-goal-action="close"
			onclick={() => dialog.close()}
		>
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.5" />
			</svg>
		</button>
	</header>
	<p id="{fieldId}-description" class="verification-description p1-body text-sm">
		По ID записи вы увидите имя получателя и все его сертификаты Универа. Вход и регистрация не
		нужны.
	</p>
	<form onsubmit={verify} class="ym-hide-content" aria-busy={busy}>
		<label for="{fieldId}-certificate">ID записи сертификата</label>
		<div class="verification-controls">
			<input
				class="text-base"
				id="{fieldId}-certificate"
				name="certificate_id"
				type="text"
				bind:value={certificateId}
				oninput={clearResult}
				disabled={busy}
				maxlength="80"
				required
				autocomplete="off"
				autocapitalize="none"
				spellcheck="false"
				placeholder="Введите номер записи"
				aria-describedby="{fieldId}-hint"
				aria-invalid={invalidId}
			/>
			<button
				class="verification-action bg-link-500"
				type="submit"
				disabled={busy}
				data-metrika-goal="university_certificate_verify_submit"
				data-goal-action="submit_click"
				data-goal-label="Проверить сертификат дизайнера">{busy ? 'Проверяем…' : 'Проверить'}</button
			>
		</div>
		<p id="{fieldId}-hint" class="verification-note p1-body">
			Номер записи указан в нижней части сертификата.
		</p>
	</form>
	{#if problem}<p class="verification-problem" role="alert">{problem}</p>{/if}
	<div aria-live="polite" aria-atomic="true" class="ym-hide-content">
		{#if result}
			<div class="verification-result">
				<p class="verification-confirmed">Сертификат подтверждён</p>
				<h3 class="p1-title text-3xl md:text-4xl">{result.designer_name}</h3>
				<p class="verification-note p1-body">Имя получателя в указанном сертификате.</p>
				<h4 class="verification-list-title p1-title-sub">
					Сертификаты получателя · {result.certificates.length}
				</h4>
				<ul>
					{#each result.certificates as certificate (certificate.id)}
						<li class:verification-match={certificate.id === result.matched_certificate_id}>
							<div class="verification-row-heading">
								<h5 class="p1-title-sub text-base">{certificate.course_title}</h5>
								{#if certificate.id === result.matched_certificate_id}<span
										>Указанный сертификат</span
									>{/if}
							</div>
							<p class="p1-body">
								{certificate.discipline} · Выдан {dateLabel(certificate.issued_at)}
							</p>
							<p class="verification-record p1-body">ID записи: <code>{certificate.id}</code></p>
						</li>
					{/each}
				</ul>
				<p class="verification-note p1-body">
					Сертификаты подтверждают прохождение внутренних курсов Универа.
				</p>
			</div>
		{/if}
	</div>
</dialog>

<style>
	dialog {
		box-sizing: border-box;
		width: min(40rem, calc(100% - 2rem));
		max-height: calc(100dvh - 2rem);
		margin: auto;
		padding: clamp(20px, 5vw, 36px);
		overflow: auto;
		overscroll-behavior: contain;
		border: 1px solid var(--p1-border);
		border-radius: var(--ds-radius-sm);
		background: var(--p1-surface-paper);
		color: var(--p1-title);
		box-shadow: 0 24px 72px color-mix(in oklab, var(--ds-scrim) 20%, transparent);
	}
	dialog::backdrop {
		background: color-mix(in oklab, var(--ds-scrim) 55%, transparent);
	}
	:global(html):has(.certificate-verifier[open]) {
		overflow: hidden;
	}
	.verification-dialog-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 16px;
	}
	.verification-dialog-header h2 {
		margin: 0;
		font-family: var(--ds-font-university);
		font-size: 1.5rem;
		line-height: 1.15;
	}
	.verification-close {
		display: grid;
		flex: 0 0 44px;
		place-items: center;
		height: 44px;
		padding: 0;
		border: 1px solid var(--p1-border);
		border-radius: var(--ds-radius-sm);
		background: var(--p1-card);
		color: var(--p1-title);
		cursor: pointer;
	}
	.verification-description {
		margin: 0 0 24px;
	}
	form label {
		display: block;
		font-size: 14px;
		margin-bottom: 10px;
	}
	.verification-controls {
		display: flex;
		gap: 10px;
		align-items: stretch;
	}
	input {
		min-width: 0;
		flex: 1;
		border: 1px solid var(--p1-border);
		border-radius: var(--ds-radius-sm);
		background: var(--p1-card);
		color: var(--p1-title);
		padding: 13px 15px;
		font-family: inherit;
		caret-color: var(--p1-accent);
	}
	input::placeholder {
		color: var(--p1-body);
		opacity: 0.8;
	}
	input:focus-visible,
	button:focus-visible {
		outline: 2px solid var(--p1-accent);
		outline-offset: 4px;
	}
	.verification-action {
		background: var(--p1-accent);
		color: var(--ds-on-accent);
		border: 0;
		border-radius: var(--ds-radius-sm);
		padding: 13px 22px;
		font: inherit;
		font-size: 14px;
		cursor: pointer;
		white-space: nowrap;
	}
	button:hover:not(:disabled) {
		filter: brightness(0.95);
	}
	button:disabled,
	input:disabled {
		opacity: 0.65;
		cursor: wait;
	}
	.verification-note {
		font-size: 0.875rem;
		line-height: 1.6;
		margin-top: 12px;
	}
	.verification-problem {
		margin-top: 20px;
		padding: 16px;
		border: 1px solid var(--p1-border);
		border-radius: var(--ds-radius-sm);
		line-height: 1.6;
	}
	.verification-result {
		margin-top: 32px;
		border-top: 1px solid var(--p1-border);
		padding-top: 24px;
		overflow-wrap: anywhere;
	}
	.verification-confirmed {
		font-size: 14px;
		margin-bottom: 12px;
	}
	.verification-result h3 {
		font-family: var(--ds-font-university);
		line-height: 1.2;
	}
	.verification-list-title {
		margin: 30px 0 16px;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	li {
		border-top: 1px solid var(--p1-border);
		padding: 20px 0;
	}
	li:last-child {
		border-bottom: 1px solid var(--p1-border);
	}
	.verification-row-heading {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 8px 16px;
		margin-bottom: 8px;
	}
	.verification-row-heading span {
		font-size: 11px;
		border: 1px solid var(--p1-border);
		border-radius: var(--ds-radius-sm);
		padding: 2px 8px;
	}
	li p {
		font-size: 14px;
		line-height: 1.6;
	}
	.verification-record {
		margin-top: 8px;
	}
	code {
		font-family: inherit;
		font-variant-numeric: tabular-nums;
		font-size: 12px;
		overflow-wrap: anywhere;
	}
	@media (max-width: 450px) {
		.verification-controls {
			flex-direction: column;
		}
		.verification-action {
			min-height: 48px;
		}
	}
</style>
