import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';

export const ENGAGEMENT_COOKIE = 'leget_engagement';
const TTL = 1800;
export function signEngagement(payload: string, secret: string, purpose = 'leget-engagement:v1:') {
	return createHmac('sha256', secret)
		.update(purpose + payload)
		.digest('hex');
}

/** Signed and host-bound. Clearing it still cannot bypass the server's IP quota. */
export function engagementSession(
	cookies: Cookies,
	domain: string,
	secret: string,
	secure: boolean,
	now = Math.floor(Date.now() / 1000)
) {
	const raw = cookies.get(ENGAGEMENT_COOKIE) ?? '';
	const [payload, signature = ''] = raw.split('.');
	try {
		const expected = signEngagement(payload, secret, 'leget-engagement-session:v1:');
		if (
			/^[a-f0-9]{64}$/.test(signature) &&
			timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
		) {
			const session = JSON.parse(Buffer.from(payload, 'base64url').toString());
			if (
				session.domain === domain &&
				typeof session.id === 'string' &&
				/^[a-f0-9-]{36}$/.test(session.id) &&
				Number.isInteger(session.expires) &&
				session.expires > now &&
				session.expires <= now + TTL
			)
				return session.id as string;
		}
	} catch {
		/* Replace invalid or expired cookies. */
	}
	const id = randomUUID();
	const value = Buffer.from(JSON.stringify({ id, domain, expires: now + TTL })).toString(
		'base64url'
	);
	cookies.set(
		ENGAGEMENT_COOKIE,
		`${value}.${signEngagement(value, secret, 'leget-engagement-session:v1:')}`,
		{
			path: '/antibot',
			httpOnly: true,
			sameSite: 'lax',
			secure,
			maxAge: TTL
		}
	);
	return id;
}
