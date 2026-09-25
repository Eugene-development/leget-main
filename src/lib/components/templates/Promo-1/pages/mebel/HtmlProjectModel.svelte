<script lang="ts">
	import { isolatedModelDocument, readHtmlModel } from './html-model-document';
	let { url, title, onready, onerror } = $props<{
		url: string;
		title: string;
		onready: () => void;
		onerror: () => void;
	}>();
	function mount(node: HTMLDivElement) {
		const controller = new AbortController();
		let disposed = false;
		const frame = document.createElement('iframe');
		frame.title = `3D-модель: ${title}`;
		frame.setAttribute('sandbox', 'allow-scripts');
		frame.setAttribute('referrerpolicy', 'no-referrer');
		frame.setAttribute(
			'allow',
			"camera 'none'; microphone 'none'; geolocation 'none'; clipboard-read 'none'; clipboard-write 'none'"
		);
		frame.style.cssText = 'display:block;width:100%;height:100%;border:0';
		const fail = () => {
			if (!disposed) onerror();
		};
		const timer = window.setTimeout(() => {
			controller.abort();
			fail();
		}, 60000);
		function message(event: MessageEvent) {
			if (disposed || event.source !== frame.contentWindow) return;
			if (event.data?.type === 'leget-model-ready') {
				clearTimeout(timer);
				onready();
			}
			if (event.data?.type === 'leget-model-error') {
				clearTimeout(timer);
				fail();
			}
		}
		window.addEventListener('message', message);
		void fetch(url, {
			signal: controller.signal,
			credentials: 'omit',
			referrerPolicy: 'no-referrer'
		})
			.then(readHtmlModel)
			.then((html) => {
				if (disposed) return;
				frame.srcdoc = isolatedModelDocument(html);
				node.append(frame);
			})
			.catch(fail);
		return {
			destroy() {
				disposed = true;
				controller.abort();
				clearTimeout(timer);
				window.removeEventListener('message', message);
				frame.remove();
			}
		};
	}
</script>

<div class="h-full w-full" use:mount></div>
