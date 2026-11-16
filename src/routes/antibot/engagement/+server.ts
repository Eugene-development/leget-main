import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { json, type RequestHandler } from '@sveltejs/kit';
import buttonGoals from '$lib/yandex-direct/button-goals.json';
import { templateGoalName } from '$lib/yandex-direct/tracking';
import { authApi } from '$lib/server/admin-api';
import { engagementSession, signEngagement } from '$lib/server/engagement';

const allowed = new Set(
	buttonGoals.flatMap((goal) =>
		goal.templates.map((template) => `${template}:${templateGoalName(template, goal.id)}`)
	)
);
const reply = (allowed: boolean, status: number) =>
	json(
		{ allowed },
		{
			status,
			headers: { 'Cache-Control': 'no-store', ...(status === 429 ? { 'Retry-After': '60' } : {}) }
		}
	);

export const POST: RequestHandler = async ({ request, url, cookies, getClientAddress }) => {
	if (request.headers.get('origin') !== url.origin) return reply(false, 403);
	if (Number(request.headers.get('content-length')) > 1024) return reply(false, 413);
	// Stream with a bound: chunked requests must not evade Content-Length checks.
	let input: { template?: unknown; goal?: unknown };
	try {
		const reader = request.body?.getReader();
		if (!reader) return reply(false, 400);
		let size = 0;
		const chunks: Uint8Array[] = [];
		while (true) {
			const { value, done } = await reader.read();
			if (done) break;
			size += value.byteLength;
			if (size > 1024) {
				await reader.cancel();
				return reply(false, 413);
			}
			chunks.push(value);
		}
		input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
	} catch {
		return reply(false, 400);
	}
	if (
		!input ||
		typeof input.template !== 'string' ||
		typeof input.goal !== 'string' ||
		!allowed.has(`${input.template}:${input.goal}`)
	)
		return reply(false, 422);
	const secret = env.FORM_CONTEXT_SECRET;
	if (!secret || secret.length < 32) return reply(false, 503);
	const domain = (env.FORM_SITE_DOMAIN || url.hostname).toLowerCase().replace(/^www\./, '');
	const session = engagementSession(cookies, domain, secret, !dev);
	const payload = Buffer.from(
		JSON.stringify({
			domain,
			session,
			goal: input.goal,
			ip: getClientAddress(),
			timestamp: Math.floor(Date.now() / 1000)
		})
	).toString('base64url');
	try {
		const response = await authApi('/track/engagement', {
			method: 'POST',
			body: '{}',
			headers: { 'X-Leget-Engagement-Context': `${payload}.${signEngagement(payload, secret)}` },
			signal: AbortSignal.timeout(1200)
		});
		if (response.status === 429) return reply(false, 429);
		if (!response.ok) return reply(false, response.status >= 500 ? 503 : 403);
		return reply((await response.json()).allowed === true, 200);
	} catch {
		return reply(false, 503);
	}
};
