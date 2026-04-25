<script lang="ts">
	import { onMount } from 'svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { getAuthApiUrl } from '$lib/utils/config';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'CareersForm', updated);
		data = updated;
	}

	let resumeName = $state('');
	let resumePhone = $state('');
	let resumeEmail = $state('');
	let resumeMessage = $state('');
	let resumeSent = $state(false);
	let isSubmitting = $state(false);
	let errorMessage = $state('');

	async function submitResume(e: SubmitEvent) {
		e.preventDefault();
		isSubmitting = true;
		errorMessage = '';

		try {
			const sourceUrl = typeof window !== 'undefined' ? window.location.href : '';
			const authApiUrl = getAuthApiUrl();

			const response = await fetch(`${authApiUrl}/notify/service-request`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
				body: JSON.stringify({
					form_type: 'careers',
					name: resumeName.trim(),
					phone: resumePhone.trim(),
					message: resumeMessage.trim(),
					source_url: sourceUrl,
					extra: { email: resumeEmail.trim() }
				})
			});

			const result = await response.json();
			if (!response.ok || !result.success) throw new Error(result.message || 'Ошибка отправки');

			resumeSent = true;
		} catch (err) {
			console.error('CareersForm submit error:', err);
			errorMessage = 'Не удалось отправить резюме. Пожалуйста, попробуйте позже.';
		} finally {
			isSubmitting = false;
		}
	}

	let visible = $state(false);
	let sectionEl: HTMLElement;

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) visible = true;
				});
			},
			{ threshold: 0.1 }
		);
		if (sectionEl) observer.observe(sectionEl);
		return () => observer.disconnect();
	});
</script>

<section bind:this={sectionEl} class="relative overflow-hidden bg-primary py-section-sm lg:py-section" id="open-resume">
	<div class="absolute top-0 left-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 border border-white/5"></div>
	<div class="absolute right-0 bottom-0 h-80 w-80 translate-x-1/3 translate-y-1/3 border border-white/5"></div>

	<div class="relative mx-auto max-w-screen-xl px-6 xl:px-1">
		<div class="grid gap-16 lg:grid-cols-2 lg:gap-24">
			<!-- Left -->
			<div class="opacity-0 transition-all duration-700" class:animate-fade-up={visible}>
				<EditableField
					fieldKey="CareersForm.label"
					label="Лейбл"
					value={String(data?.label ?? 'Открытое резюме')}
					{isEditable}
					onSave={(v) => saveField('label', v)}
				>
					{#snippet children(displayValue)}
						<span class="text-[11px] tracking-[0.3em] text-accent uppercase">{displayValue}</span>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="CareersForm.heading"
					label="Заголовок"
					value={String(data?.heading ?? 'Отправьте ваше резюме')}
					{isEditable}
					onSave={(v) => saveField('heading', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h2
							class="mt-4 text-4xl font-light text-white lg:text-5xl"
							style="font-family: var(--font-heading);"
						>
							{displayValue}
						</h2>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="CareersForm.description"
					label="Описание"
					value={String(data?.description ?? 'Отправьте открытое резюме — мы сохраняем его в базе и свяжемся, когда появится подходящая позиция.')}
					{isEditable}
					multiline
					onSave={(v) => saveField('description', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<p class="mt-6 text-base leading-relaxed text-white/55">{displayValue}</p>
					{/snippet}
				</EditableField>

				<div class="mt-10 space-y-4">
					<div class="flex items-center gap-3">
						<div class="flex h-9 w-9 shrink-0 items-center justify-center border border-white/10">
							<svg class="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
							</svg>
						</div>
						<span class="text-sm text-white/60">{String(data?.email ?? 'info@example.com')}</span>
					</div>
					<div class="flex items-center gap-3">
						<div class="flex h-9 w-9 shrink-0 items-center justify-center border border-white/10">
							<svg class="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
							</svg>
						</div>
						<span class="text-sm text-white/60">{String(data?.phone ?? '')}</span>
					</div>
				</div>
			</div>

			<!-- Right: form -->
			<div class="opacity-0 transition-all duration-700" class:animate-fade-up={visible} style="animation-delay: 0.2s">
				{#if resumeSent}
					<div class="flex h-full flex-col items-center justify-center py-12 text-center">
						<div class="flex h-16 w-16 items-center justify-center border border-accent/30 bg-accent/10">
							<svg class="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
							</svg>
						</div>
						<h3 class="mt-6 text-2xl font-light text-white" style="font-family: var(--font-heading);">Резюме отправлено</h3>
						<p class="mt-3 max-w-xs text-sm text-white/50">Мы рассмотрим вашу кандидатуру и свяжемся при появлении подходящей вакансии.</p>
					</div>
				{:else}
					<form onsubmit={submitResume} class="border border-white/10 bg-white/5 p-8 backdrop-blur-sm lg:p-10">
						<h3 class="mb-8 text-xl font-light text-white" style="font-family: var(--font-heading);">Открытое резюме</h3>

						<div class="mb-5">
							<label for="resume-name" class="mb-2 block text-[11px] tracking-[0.2em] text-white/40 uppercase">Имя и фамилия*</label>
							<input id="resume-name" type="text" bind:value={resumeName} required placeholder="Иван Петров" class="w-full border border-white/15 bg-transparent px-4 py-3 text-sm text-white placeholder-white/25 transition-colors duration-300 outline-none focus:border-accent/60" />
						</div>

						<div class="mb-5">
							<label for="resume-phone" class="mb-2 block text-[11px] tracking-[0.2em] text-white/40 uppercase">Телефон*</label>
							<input id="resume-phone" type="tel" bind:value={resumePhone} required placeholder="+7 (900) 000-00-00" class="w-full border border-white/15 bg-transparent px-4 py-3 text-sm text-white placeholder-white/25 transition-colors duration-300 outline-none focus:border-accent/60" />
						</div>

						<div class="mb-5">
							<label for="resume-email" class="mb-2 block text-[11px] tracking-[0.2em] text-white/40 uppercase">Email*</label>
							<input id="resume-email" type="email" bind:value={resumeEmail} required placeholder="your@email.com" class="w-full border border-white/15 bg-transparent px-4 py-3 text-sm text-white placeholder-white/25 transition-colors duration-300 outline-none focus:border-accent/60" />
						</div>

						<div class="mb-8">
							<label for="resume-msg" class="mb-2 block text-[11px] tracking-[0.2em] text-white/40 uppercase">О себе / желаемая должность</label>
							<textarea id="resume-msg" bind:value={resumeMessage} rows="3" placeholder="Расскажите коротко о себе и опыте..." class="w-full resize-none border border-white/15 bg-transparent px-4 py-3 text-sm text-white placeholder-white/25 transition-colors duration-300 outline-none focus:border-accent/60"></textarea>
						</div>

						{#if errorMessage}
							<p class="mb-4 text-sm text-red-400">{errorMessage}</p>
						{/if}

						<button
							type="submit"
							disabled={isSubmitting}
							class="group flex w-full items-center justify-center gap-3 border border-accent bg-accent py-4 text-xs tracking-[0.2em] text-primary uppercase transition-all duration-500 hover:border-accent hover:bg-transparent hover:text-accent disabled:opacity-70"
						>
							{#if isSubmitting}
								<span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
								Отправка...
							{:else}
								Отправить резюме
								<svg class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
									<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
								</svg>
							{/if}
						</button>

						<p class="mt-4 text-center text-[11px] text-white/25">Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности</p>
					</form>
				{/if}
			</div>
		</div>
	</div>
</section>
