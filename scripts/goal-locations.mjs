import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { parse } from 'svelte/compiler';

/** Canonical articles, including the owning component of nested/shared forms. */
export function goalLocations(root, write = false) {
	const base = join(root, 'src/lib/components');
	const map = join(root, '../../docs/architecture/component-articles-map.md');
	const snapshot = join(root, 'scripts/goal-articles.json');
	const rows = existsSync(map)
		? readFileSync(map, 'utf8')
				.split('\n')
				.flatMap((line) => {
					const match = line.match(
						/^\| `([^`]+)` \| ([^|]+) \| `([^`]+)` \| [^|]+ \| [^|]+ \| \[ms\/leget-main\/src\/lib\/components\/([^\]]+)\]/
					);
					return match
						? [{ article: match[1], template: match[2].trim(), page: match[3], source: match[4] }]
						: [];
				})
		: JSON.parse(readFileSync(snapshot, 'utf8'));
	const serialized = JSON.stringify(rows, null, '\t') + '\n';
	if (write) writeFileSync(snapshot, serialized);
	else if (existsSync(map) && readFileSync(snapshot, 'utf8') !== serialized)
		throw new Error('Обновите артикулы целей: npm run goals:generate');
	const parents = new Map();
	const sources = new Map();
	function scan(directory) {
		for (const item of readdirSync(directory, { withFileTypes: true })) {
			const file = join(directory, item.name);
			if (item.isDirectory()) {
				scan(file);
				continue;
			}
			if (!item.name.endsWith('.svelte')) continue;
			const source = readFileSync(file, 'utf8');
			const path = relative(base, file);
			sources.set(path, source);
			const ast = parse(source, { modern: true });
			for (const node of ast.instance?.content?.body ?? []) {
				if (node.type !== 'ImportDeclaration') continue;
				const specifier = node.source.value;
				if (!specifier.endsWith('.svelte')) continue;
				const target = specifier.startsWith('$lib/components/')
					? specifier.slice('$lib/components/'.length)
					: specifier.startsWith('.')
						? relative(base, resolve(dirname(file), specifier))
						: null;
				if (target) {
					if (!parents.has(target)) parents.set(target, []);
					parents.get(target).push(path);
				}
			}
		}
	}
	scan(base);
	function owners(path, seen = new Set()) {
		if (seen.has(path)) return [];
		seen.add(path);
		const menuVersion = path.match(
			/^templates\/Promo-1\/layout\/Menu\/v(\d+)\/MobileMenu\.svelte$/
		)?.[1];
		const canonical =
			path === 'templates/Promo-1/layout/Header.svelte' || menuVersion
				? 'templates/Promo-1/layout/Menu/index.svelte'
				: path;
		const direct = rows.filter(
			(row) => row.source === canonical && (!menuVersion || row.article.endsWith('.' + menuVersion))
		);
		return direct.length
			? direct
			: (parents.get(path) ?? []).flatMap((parent) => owners(parent, seen));
	}
	return (button) => {
		let locations;
		if (button.source === 'ServiceOrderIsland.svelte')
			locations = [...sources]
				.filter(
					([, text]) =>
						text.includes('serviceOrderStore.open(') &&
						(!button.serviceType ||
							text.includes(`serviceOrderStore.open('${button.serviceType}')`) ||
							(button.serviceType === 'consultation' &&
								text.includes('serviceOrderStore.open(ctaContent.serviceType)')))
				)
				.flatMap(([path]) => owners(path));
		else if (button.source === 'ClientAuthModal.svelte')
			locations = [...sources]
				.filter(([, text]) => /clientAuthModal\.open\(|account\.open(?:Login|Register)/.test(text))
				.flatMap(([path]) => owners(path));
		else if (button.id.startsWith('partnership_drawer_'))
			locations = owners('templates/Promo-1/pages/partnership/PartnershipDrawer.svelte');
		else if (button.id.startsWith('guarantees_warranty_drawer_'))
			locations = owners('templates/Promo-1/pages/guarantees/WarrantyRequestDrawer.svelte');
		else if (button.source.startsWith('../university/'))
			locations = [
				{
					template: 'Promo-1',
					page: button.source.includes('Admission')
						? '/university/auth'
						: button.source.includes('Classroom')
							? '/university/learn/[slug]'
							: '/university',
					article: ''
				}
			];
		else locations = owners(button.source);
		if (button.variant && button.route)
			locations = locations.filter(
				(row) => row.page === button.route || row.page.startsWith(button.route + '/')
			);
		return [
			...new Map(
				locations
					.filter((row) => button.templates.includes(row.template))
					.map(({ template, page, article }) => [
						`${template}:${page}:${article}`,
						{ template, page, article }
					])
			).values()
		];
	};
}
