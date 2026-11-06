<script lang="ts">
	import SideDrawer from '$lib/components/SideDrawer.svelte';
	import ArticleBadge from '$lib/components/ArticleBadge.svelte';
	import { getLayoutComponentArticle, saveLayoutData } from '$lib/utils/page-edit';
	import type { PageComponentProps } from '$lib/components/templates/types';
	import {
		topBarPhone,
		topBarEmail,
		topBarLinks,
		topBarVersion,
		isTopBarHref,
		type TopBarLink
	} from '../top-bar';

	import TopBarV1 from './v1/TopBar.svelte';
	import TopBarV2 from './v2/TopBar.svelte';

	let {
		data = $bindable(),
		height = $bindable(40),
		editContext = null,
		isEditable = false
	}: PageComponentProps & { height?: number } = $props();
	const phone = $derived(topBarPhone(data));
	const email = $derived(topBarEmail(data));
	const topLinks = $derived(topBarLinks(data));
	const version = $derived(topBarVersion(data));
	const View = $derived(version === 'v2' ? TopBarV2 : TopBarV1);
	const article = $derived(
		getLayoutComponentArticle(editContext?.templateId ?? 2, 'TopBar', version === 'v2' ? 2 : 1)
	);
	let open = $state(false);
	let saving = $state(false);
	let error = $state('');
	let draftVersion = $state<'v1' | 'v2'>('v1');
	let draftPhone = $state('');
	let draftEmail = $state('');
	let links = $state<TopBarLink[]>([]);

	function openSettings() {
		draftVersion = version;
		draftPhone = phone;
		draftEmail = email;
		links = topLinks.map((link) => ({ ...link }));
		error = '';
		open = true;
	}

	async function save() {
		if (!editContext || saving) return;
		error = '';
		const nextLinks = links.map((link) => ({ label: link.label.trim(), href: link.href.trim() }));
		if (nextLinks.some((link) => !link.label || !isTopBarHref(link.href))) {
			error = 'Укажите название и адрес каждой ссылки: /страница, #раздел или https://сайт.';
			return;
		}
		if (draftEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draftEmail.trim())) {
			error = 'Проверьте адрес электронной почты.';
			return;
		}
		const fields = {
			topBarVersion: draftVersion,
			topLinks: nextLinks,
			phone: draftPhone.trim(),
			email: draftEmail.trim()
		};
		saving = true;
		try {
			await saveLayoutData(editContext, 'Header', { ...data, ...fields });
			data = { ...data, ...fields };
			open = false;
		} catch {
			error = 'Не удалось сохранить верхнюю панель. Повторите попытку.';
		} finally {
			saving = false;
		}
	}
</script>

<div
	bind:clientHeight={height}
	class="relative {isEditable ? 'block' : 'hidden lg:block'}"
	data-field-toolbar-scope
>
	<View {data} {isEditable} />
	{#if isEditable && editContext}
		<button
			type="button"
			onclick={openSettings}
			data-field-toolbar-anchor
			data-goal-ignore="Настройки верхней панели владельцем"
			aria-label="Настройки верхней панели"
			title="Настройки верхней панели"
			class="absolute top-1.5 right-1.5 z-[100] flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-on-dark/10 bg-ink-950/80 text-on-dark shadow-lg"
		>
			<svg
				class="h-3.5 w-3.5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
				aria-hidden="true"
				><path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16" /><circle
					cx="9"
					cy="6"
					r="2"
					fill="currentColor"
				/><circle cx="15" cy="12" r="2" fill="currentColor" /><circle
					cx="8"
					cy="18"
					r="2"
					fill="currentColor"
				/></svg
			>
		</button>
	{/if}
</div>

{#if isEditable && editContext}
	<SideDrawer bind:open title="Верхняя панель">
		<div class="flex flex-col gap-6">
			{#if article}<ArticleBadge {article} sectionLabel="Раздел" align="left" />{/if}
			<p class="text-sm leading-relaxed text-ink-300">
				Ссылки и контакты общие для всех страниц сайта и мобильного меню. Пустой телефон или email
				скрывается.
			</p>
			<fieldset disabled={saving} class="flex min-w-0 flex-col gap-5 disabled:opacity-60">
				<label class="flex flex-col gap-2 text-sm text-on-dark"
					>Вариант дизайна
					<select bind:value={draftVersion} class="top-bar-input">
						<option value="v1">Вариант 1 — светлый</option>
						<option value="v2">Вариант 2 — тёмный, как футер</option>
					</select>
				</label>
				<label class="flex flex-col gap-2 text-sm text-on-dark"
					>Телефон
					<input type="tel" bind:value={draftPhone} class="top-bar-input" autocomplete="tel" />
				</label>
				<label class="flex flex-col gap-2 text-sm text-on-dark"
					>Электронная почта
					<input type="email" bind:value={draftEmail} class="top-bar-input" autocomplete="email" />
				</label>
				<div class="flex flex-col gap-4" role="group" aria-label="Ссылки верхней панели">
					<p class="text-sm text-on-dark">Ссылки</p>
					{#each links as link, i}
						<div class="flex flex-col gap-3 border-t border-on-dark/10 pt-4">
							<label class="flex flex-col gap-2 text-xs text-ink-300"
								>Название ссылки {i + 1}<input
									bind:value={link.label}
									class="top-bar-input"
								/></label
							>
							<label class="flex flex-col gap-2 text-xs text-ink-300"
								>Адрес ссылки {i + 1}<input
									bind:value={link.href}
									class="top-bar-input"
									placeholder="/about"
								/></label
							>
							<button
								type="button"
								onclick={() => (links = links.filter((_, index) => index !== i))}
								data-goal-ignore="Удаление ссылки владельцем"
								class="cursor-pointer self-start text-xs text-ink-300 underline underline-offset-4"
								aria-label="Удалить ссылку {i + 1}">Удалить ссылку</button
							>
						</div>
					{/each}
					<button
						type="button"
						onclick={() => (links = [...links, { label: '', href: '' }])}
						data-goal-ignore="Добавление ссылки владельцем"
						class="cursor-pointer rounded-xl border border-on-dark/20 px-4 py-3 text-sm text-on-dark hover:bg-on-dark/5"
						>Добавить ссылку</button
					>
				</div>
			</fieldset>
			{#if error}<p role="alert" class="text-sm text-on-dark">{error}</p>{/if}
			<button
				type="button"
				onclick={save}
				disabled={saving}
				data-goal-ignore="Сохранение верхней панели владельцем"
				class="cursor-pointer rounded-xl bg-link-600 px-4 py-3 text-sm font-medium text-on-dark hover:bg-link-500 disabled:cursor-wait disabled:opacity-60"
				>{saving ? 'Сохранение…' : 'Сохранить'}</button
			>
		</div>
	</SideDrawer>
{/if}

<style>
	.top-bar-input {
		width: 100%;
		min-width: 0;
		border: 1px solid var(--color-on-dark, currentColor);
		border-color: color-mix(in srgb, var(--color-on-dark) 20%, transparent);
		border-radius: var(--radius-xl);
		padding: 0.75rem;
		background: transparent;
		color: var(--color-on-dark);
	}
	.top-bar-input:focus-visible {
		outline: 2px solid var(--color-link-400);
		outline-offset: 2px;
	}
</style>
