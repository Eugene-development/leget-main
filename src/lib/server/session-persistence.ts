/** Only an explicit, server-confirmed choice creates a persistent cookie. */
export function sessionPersistence(expiresIn: unknown, remember: unknown): { maxAge?: number } {
	return remember === true &&
		typeof expiresIn === 'number' &&
		Number.isSafeInteger(expiresIn) &&
		expiresIn > 0
		? { maxAge: expiresIn }
		: {};
}

/** Read persistence only after leget-auth has validated this exact token. */
export function validatedTokenPersistence(token: string): { maxAge?: number } {
	try {
		const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
		const remaining =
			typeof payload.exp === 'number' ? payload.exp - Math.ceil(Date.now() / 1000) : 0;
		return sessionPersistence(remaining, payload.remember);
	} catch {
		return {};
	}
}
