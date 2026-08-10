import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter(),
		prerender: {
			/**
			 * Каталог дизайн-системы (/_ds) монтирует каждый блок в одиночку, поэтому
			 * якоря на соседние блоки страницы там принципиально недостижимы: например
			 * Hero шаблона Promo-2 ссылается на #styles-grid, который живёт в блоке
			 * StylesGrid. Это не ошибка вёрстки, а следствие изоляции — для /_ds молчим,
			 * везде остаётся прежнее поведение (падать).
			 */
			handleMissingId: ({ path, id, referrers, message }) => {
				if (path.startsWith('/_ds')) return;

				throw new Error(`${message}\n  id: ${id}\n  ссылаются: ${referrers.join(', ')}`);
			},

			/**
			 * По той же причине блок может ссылаться на страницу сайта, которой в
			 * пререндере каталога нет: сам сайт рендерится на лету из данных лицензии
			 * и пререндеру не подлежит.
			 */
			handleHttpError: ({ path, referrer, message }) => {
				if (referrer?.startsWith('/_ds')) return;

				throw new Error(`${message}\n  путь: ${path}`);
			}
		}
	}
};

export default config;
