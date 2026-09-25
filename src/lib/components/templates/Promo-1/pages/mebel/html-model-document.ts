// HTML model files are documents, never markup injected into the parent page.
export const HTML_MODEL_LIMIT = 5 * 1024 * 1024;
export function isolatedModelDocument(html: string): string {
	// This policy precedes ALL supplied markup. Subsequent policies cannot relax it.
	const policy =
		"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; connect-src 'none'; font-src 'none'; media-src 'none'; object-src 'none'; frame-src 'none'; worker-src 'none'; base-uri 'none'; form-action 'none'";
	return `<!doctype html><meta http-equiv="Content-Security-Policy" content="${policy}"><meta name="referrer" content="no-referrer"><script>
		addEventListener('error',()=>parent.postMessage({type:'leget-model-error'},'*'));
		addEventListener('unhandledrejection',()=>parent.postMessage({type:'leget-model-error'},'*'));
		addEventListener('load',()=>queueMicrotask(()=>parent.postMessage({type:'leget-model-ready'},'*')));
	</script>${html}`;
}

export async function readHtmlModel(response: Response): Promise<string> {
	if (
		!response.ok ||
		!response.body ||
		Number(response.headers.get('Content-Length')) > HTML_MODEL_LIMIT
	)
		throw new Error('HTML model unavailable');
	const reader = response.body.getReader();
	const decoder = new TextDecoder('utf-8', { fatal: true });
	let bytes = 0,
		html = '';
	try {
		while (true) {
			const chunk = await reader.read();
			if (chunk.done) break;
			bytes += chunk.value.byteLength;
			if (bytes > HTML_MODEL_LIMIT) throw new Error('HTML model too large');
			html += decoder.decode(chunk.value, { stream: true });
		}
		html += decoder.decode();
		if (!/<html\b/i.test(html)) throw new Error('Invalid HTML model');
		return html;
	} finally {
		await reader.cancel();
		reader.releaseLock();
	}
}
