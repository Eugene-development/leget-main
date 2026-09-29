<script lang="ts">
	import { onDestroy, getContext } from 'svelte';
	import { api } from './types';
	let {
		value,
		label,
		accept,
		onchange,
		disabled = false
	}: {
		value?: string | null;
		label: string;
		accept: 'image' | 'video' | 'file';
		onchange: (value: string | null) => void;
		disabled?: boolean;
	} = $props();
	const uploads = getContext<{ active: number }>('universityUploads');
	let file = $state<File | null>(null);
	let busy = $state(false);
	let percent = $state(0);
	let problem = $state('');
	let session: { id: string; parts: number; part_size: number } | null = null;
	let completed = new Set<number>();
	let xhr: XMLHttpRequest | null = null;
	let cancelled = false;
	let input: HTMLInputElement;
	const types = $derived(
		accept === 'image'
			? 'image/jpeg,image/png,image/webp'
			: accept === 'video'
				? 'video/mp4'
				: 'application/pdf,video/mp4,image/jpeg,image/png,image/webp'
	);
	async function duration(blob: File): Promise<number | undefined> {
		if (blob.type !== 'video/mp4') return undefined;
		const url = URL.createObjectURL(blob);
		try {
			return await new Promise((resolve, reject) => {
				const video = document.createElement('video');
				const timer = setTimeout(() => {
					video.src = '';
					reject(new Error('Не удалось прочитать видео. Нужен готовый для браузера MP4.'));
				}, 15000);
				video.onloadedmetadata = () => {
					clearTimeout(timer);
					const d = video.duration;
					video.src = '';
					Number.isFinite(d) && d > 0
						? resolve(Math.ceil(d))
						: reject(new Error('Не удалось прочитать длительность видео.'));
				};
				video.onerror = () => {
					clearTimeout(timer);
					reject(new Error('Видео не поддерживается браузером.'));
				};
				video.preload = 'metadata';
				video.src = url;
			});
		} finally {
			URL.revokeObjectURL(url);
		}
	}
	function send(url: string, body: Blob, before: number, total: number) {
		return new Promise<void>((resolve, reject) => {
			const request = new XMLHttpRequest();
			xhr = request;
			request.open('PUT', url);
			request.timeout = 180000;
			request.upload.onprogress = (event) => {
				percent = Math.min(99, Math.round(((before + event.loaded) / total) * 100));
			};
			request.onload = () =>
				request.status >= 200 && request.status < 300
					? resolve()
					: reject(new Error('Не удалось загрузить часть файла.'));
			request.onerror = request.ontimeout = () =>
				reject(new Error('Соединение прервалось. Можно повторить загрузку.'));
			request.onabort = () => reject(new Error('Загрузка отменена.'));
			request.send(body);
		});
	}
	async function upload() {
		if (!file || busy) return;
		busy = true;
		problem = '';
		cancelled = false;
		if (uploads) uploads.active++;
		try {
			if (!session)
				session = await api<{ id: string; parts: number; part_size: number }>('media', {
					filename: file.name,
					mime: file.type,
					size: file.size,
					duration: await duration(file)
				});
			if (cancelled) {
				await cancel();
				throw new Error('Загрузка отменена.');
			}
			for (let number = 1; number <= session.parts; number++) {
				if (cancelled) throw new Error('Загрузка отменена.');
				if (completed.has(number)) continue;
				const start = (number - 1) * session.part_size;
				let success = false;
				for (let attempt = 0; attempt < 3 && !success && !cancelled; attempt++) {
					try {
						const signed = await api<{ url: string }>(`media/${session.id}/part`, { number });
						if (cancelled) break;
						await send(signed.url, file.slice(start, start + session.part_size), start, file.size);
						success = true;
					} catch (error) {
						if (attempt === 2 || cancelled) throw error;
					}
				}
				if (success) completed.add(number);
			}
			if (cancelled) throw new Error('Загрузка отменена.');
			await api(`media/${session.id}/complete`, {});
			if (cancelled || !session) return;
			percent = 100;
			onchange(session.id);
			session = null;
			completed.clear();
		} catch (e) {
			problem = e instanceof Error ? e.message : 'Не удалось загрузить файл.';
		} finally {
			busy = false;
			xhr = null;
			if (uploads) uploads.active--;
		}
	}
	async function cancel() {
		cancelled = true;
		xhr?.abort();
		if (session) {
			try {
				await api(`media/${session.id}/abort`, {});
				session = null;
				completed.clear();
				file = null;
				percent = 0;
			} catch (e) {
				problem = e instanceof Error ? e.message : 'Не удалось отменить загрузку.';
			}
		}
	}
	async function choose(event: Event) {
		const selected = (event.currentTarget as HTMLInputElement).files?.[0];
		if (!selected) return;
		if (session) await cancel();
		if (session) return;
		const max =
			selected.type === 'video/mp4'
				? 2147483648
				: selected.type === 'application/pdf'
					? 52428800
					: 10485760;
		if (!types.split(',').includes(selected.type) || selected.size > max || !selected.size) {
			problem = 'Проверьте формат и размер файла.';
			return;
		}
		file = selected;
		percent = 0;
		await upload();
	}
	onDestroy(() => {
		if (busy || session) void cancel();
	});
</script>

<div class="editor-upload">
	<label
		>{label}<input
			bind:this={input}
			type="file"
			accept={types}
			onchange={choose}
			disabled={disabled || busy}
		/></label
	>
	<small
		>{accept === 'video'
			? 'MP4 до 2 ГБ, готовый для воспроизведения в браузере.'
			: accept === 'image'
				? 'JPEG, PNG или WebP до 10 МБ.'
				: 'PDF до 50 МБ, изображения до 10 МБ, MP4 до 2 ГБ.'}</small
	>
	{#if value}<div class="study-actions">
			<a class="study-link" href="/admin/university/media/{value}" target="_blank" rel="noreferrer"
				>Открыть файл</a
			><button
				type="button"
				class="study-link"
				disabled={busy || disabled}
				onclick={() => onchange(null)}
				data-goal-ignore="Удалить привязку учебного файла">Убрать файл</button
			>
		</div>{/if}
	{#if busy}<progress max="100" value={percent} aria-label="Загрузка файла"></progress><span
			role="status">{percent}% · {percent >= 99 ? 'Проверяем файл…' : 'Загружаем…'}</span
		><button
			type="button"
			class="study-link"
			onclick={cancel}
			data-goal-ignore="Отмена загрузки учебного файла">Отменить загрузку</button
		>{/if}
	{#if problem}<p role="alert" class="study-alert">{problem}</p>
		{#if file && !busy}<button
				type="button"
				class="study-button study-button-secondary"
				onclick={upload}
				data-goal-ignore="Повтор загрузки учебного файла">Повторить</button
			>{/if}{/if}
	{#if percent === 100 && !busy}<p role="status">
			Файл загружен. Сохраните материал, чтобы прикрепить его.
		</p>{/if}
</div>
