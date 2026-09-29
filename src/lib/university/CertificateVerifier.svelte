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
	const fieldId = $props.id();
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

<section
	class="certificate-verifier"
	id="university-verification"
	aria-labelledby="{fieldId}-heading"
>
	<div class="verification-intro">
		<h2 id="{fieldId}-heading" class="p1-title">Проверка дизайнера</h2>
		<p class="p1-body">
			Проверьте сертификат специалиста, которому собираетесь доверить свой проект. По номеру записи
			вы увидите имя получателя и все его сертификаты Универа.
		</p>
		<p class="verification-note p1-body">Вход и регистрация не нужны.</p>
	</div>
	<div class="verification-content">
		<form onsubmit={verify} class="ym-hide-content" aria-busy={busy}>
			<label for="{fieldId}-certificate">ID записи сертификата</label>
			<div class="verification-controls">
				<input
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
					type="submit"
					disabled={busy}
					data-metrika-goal="university_certificate_verify_submit"
					data-goal-action="submit_click"
					data-goal-label="Проверить сертификат дизайнера"
					>{busy ? 'Проверяем…' : 'Проверить'}</button
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
					<h3 class="p1-title">{result.designer_name}</h3>
					<p class="verification-note p1-body">Имя получателя в указанном сертификате.</p>
					<h4 class="verification-list-title p1-title-sub">
						Сертификаты получателя · {result.certificates.length}
					</h4>
					<ul>
						{#each result.certificates as certificate (certificate.id)}
							<li class:verification-match={certificate.id === result.matched_certificate_id}>
								<div class="verification-row-heading">
									<h5 class="p1-title-sub">{certificate.course_title}</h5>
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
	</div>
</section>

<style>
	.certificate-verifier {
		display: grid;
		grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
		gap: clamp(32px, 5vw, 80px);
		border-top: 1px solid var(--p1-border);
		padding: 64px 0 24px;
		margin-top: 56px;
		scroll-margin-top: calc(var(--header-h, 100px) + 24px);
		color: var(--p1-title);
	}
	.verification-intro h2 {
		font-family: var(--ds-font-university);
		font-size: clamp(32px, 3.8vw, 48px);
		line-height: 1.12;
		margin: 0 0 22px;
	}
	.verification-intro > p {
		max-width: 46ch;
		font-size: 16px;
		line-height: 1.7;
	}
	.verification-intro .verification-note {
		font-size: 14px;
		margin-top: 18px;
	}
	.verification-content {
		min-width: 0;
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
		font: inherit;
		font-size: 16px;
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
	button {
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
		font-size: 13px;
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
		font-size: clamp(28px, 3vw, 38px);
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
	.verification-row-heading h5 {
		font-size: 17px;
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
	@media (max-width: 850px) {
		.certificate-verifier {
			grid-template-columns: 1fr;
			gap: 28px;
			padding-top: 40px;
			margin-top: 40px;
		}
		.verification-intro > p {
			max-width: 65ch;
		}
	}
	@media (max-width: 450px) {
		.verification-controls {
			flex-direction: column;
		}
		button {
			min-height: 48px;
		}
	}
</style>
