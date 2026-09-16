import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	optimizeDeps: {
		// RichTextEditor loads Tiptap only after an owner opens a text field.
		// Include it in the initial dev pre-bundle so that this first dynamic import
		// cannot invalidate the dependency bundle used by the already-open page.
		include: ['@tiptap/core', '@tiptap/starter-kit']
	},
	server: {
		// Listen on all interfaces so subdomain requests
		// (promo-1.localhost:5173, promo-2.localhost:5173) reach the dev server.
		// The hostname is forwarded as X-Forwarded-Host to leget-api,
		// which resolves the license and template by domain.
		host: '0.0.0.0'
	}
});
