// See https://svelte.dev/docs/kit/types#app.d.ts

declare global {
	namespace App {
		interface Locals {
			pageData: {
				site: {
					name: string | null;
					metaDescription: string | null;
				};
				page: {
					slug: string;
					componentsData: unknown[];
				};
			};
		}
	}
}

export {};
