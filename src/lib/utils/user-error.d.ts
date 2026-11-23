export class UserError extends Error {
	constructor(message: string, options?: ErrorOptions & { code?: string });
	code?: string;
}

export function requestError(status: number, code?: unknown): Error & {
	status: number;
	code?: unknown;
};

export function graphQLError(
	status: number,
	errors?: { extensions?: { code?: string; category?: string; validation?: unknown } }[]
): ReturnType<typeof requestError>;

export function isCancelled(error: unknown): boolean;
export function userErrorMessage(error: unknown, action?: string): string;
export function storageUploadError(failure: 'network' | 'timeout' | number): Error;
