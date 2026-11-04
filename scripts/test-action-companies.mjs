import assert from 'node:assert/strict';
import { test } from 'node:test';
import sanitizeHtml from 'sanitize-html';
import { loadServerModule } from './test-server-module.mjs';

const cardData = loadServerModule(
	new URL(
		'../src/lib/components/templates/Promo-1/pages/actions/actionCardData.ts',
		import.meta.url
	),
	{}
);

const extra = loadServerModule(
	new URL(
		'../src/lib/components/templates/Promo-1/pages/actions/actionCardsExtra.ts',
		import.meta.url
	),
	{ 'sanitize-html': sanitizeHtml, './actionCardData': cardData }
);
const primary = loadServerModule(
	new URL('../src/lib/components/templates/Promo-1/pages/actions/actionCards.ts', import.meta.url),
	{ './actionCardsExtra': extra, './actionCardData': cardData }
);
const { activeActionCards } = primary;
const { actionIcons, matchingActionIcons } = loadServerModule(
	new URL('../src/lib/components/templates/Promo-1/pages/actions/actionIcons.ts', import.meta.url),
	{ './actionCards': primary, './actionCardsExtra': extra }
);

test('legacy cards become one company without losing text, order or disabled state', () => {
	const cards = [
		{
			id: 'custom',
			title: 'Своя акция',
			description: 'Условия',
			badge: 'Подарок',
			icon: 'path',
			enabled: false
		}
	];
	const [company] = extra.actionCompanies({ cards });
	assert.equal(company.id, 'legacy');
	assert.deepEqual(company.cards[0], cards[0]);
	assert.ok(company.cards.every((card) => card.enabled === false));
	assert.deepEqual(extra.activeExtraActionCards({ companies: [company] }), []);
	assert.equal(extra.actionCompanies({})[0].cards.length, extra.defaultExtraCards.length);
});

test('deleting the last company or card does not resurrect legacy cards or defaults', () => {
	assert.deepEqual(extra.actionCompanies({ companies: [], cards: extra.defaultExtraCards }), []);
	assert.deepEqual(extra.activeExtraActionCards({ companies: [] }), []);
	const companies = [{ id: 'one', name: 'Компания', cards: [] }];
	assert.deepEqual(extra.actionCompanies({ companies }), companies);
	assert.deepEqual(extra.activeExtraActionCards({ companies }), []);
	assert.deepEqual(extra.actionCompanies({ cards: [] })[0].cards, []);
});

test('strip keeps company order, names and unique IDs and excludes hidden companies and cards', () => {
	const card = { id: 'gift', title: 'Подарок', badge: 'Бесплатно', description: '', icon: '' };
	const companies = [
		{ id: 'one', name: 'Компания 1', cards: [card, { ...card, id: 'hidden', enabled: false }] },
		{ id: 'two', name: 'Компания 2', cards: [card] },
		{ id: 'hidden', name: 'Скрытая', enabled: false, cards: [card] },
		{ id: 'empty', name: 'Пустая', cards: [] }
	];
	const result = activeActionCards({
		primary: [{ ...card, title: 'Новострой' }],
		extra: { companies }
	});
	assert.deepEqual(
		result.map((item) => item.title),
		['Новострой', 'Компания 1: Подарок', 'Компания 2: Подарок']
	);
	assert.equal(new Set(result.map((item) => item.id)).size, 3);
	assert.deepEqual(activeActionCards({ primary: [], extra: { companies: [] } }), []);
});

test('legacy strip format remains supported', () => {
	assert.equal(extra.activeExtraActionCards(null).length, extra.defaultExtraCards.length);
	assert.deepEqual(extra.activeExtraActionCards([]), []);
	assert.deepEqual(
		extra.activeExtraActionCards([{ id: 'gift', title: 'Старая акция', badge: 'Подарок' }]),
		[{ id: 'extra-gift', title: 'Старая акция', badge: 'Подарок' }]
	);
});

test('formatted company names and card text become readable strip labels', () => {
	const result = extra.activeExtraActionCards({
		companies: [
			{
				id: 'one',
				name: '<!--leget-rich-text:v1--><p><strong>Компания</strong></p>',
				cards: [
					{
						id: 'card',
						title: '<!--leget-rich-text:v1--><p>Акция</p>',
						badge: '<!--leget-rich-text:v1--><p>Подарок</p>'
					}
				]
			}
		]
	});
	assert.equal(result[0].title, 'Компания: Акция');
	assert.equal(result[0].badge, 'Подарок');
});

test('icon collection has 24 distinct labelled paths and includes existing card icons', () => {
	assert.equal(actionIcons.length, 24);
	assert.equal(new Set(actionIcons.map((icon) => icon.id)).size, 24);
	assert.equal(new Set(actionIcons.map((icon) => icon.path)).size, 24);
	for (const icon of actionIcons) {
		assert.ok(icon.label.trim());
		assert.match(icon.path, /^[Mm][0-9 .a-zA-Z,\-]+$/);
	}
	for (const card of [...primary.defaultActionCards, ...extra.defaultExtraCards])
		assert.ok(actionIcons.some((icon) => icon.path === card.icon));
	assert.deepEqual(
		matchingActionIcons('  пОДАРОК  ').map((icon) => icon.id),
		['gift']
	);
	assert.deepEqual(matchingActionIcons('нет такого значка'), []);
	assert.equal(matchingActionIcons('').length, 24);
});

test('changing a saved icon survives legacy merging and keeps card content and visibility', () => {
	const icon = actionIcons.find((icon) => icon.id === 'shield').path;
	const primaryCard = { ...primary.defaultActionCards[0], icon, enabled: false };
	const extraCard = { ...extra.defaultExtraCards[0], icon, enabled: false };
	assert.deepEqual(primary.mergeActionCards([primaryCard])[0], primaryCard);
	assert.deepEqual(extra.actionCompanies({ cards: [extraCard] })[0].cards[0], extraCard);
	const companies = [
		{ id: 'one', name: 'Компания 1', cards: [extraCard] },
		{ id: 'two', name: 'Компания 2', cards: [extra.defaultExtraCards[0]] }
	];
	assert.equal(extra.actionCompanies({ companies })[0].cards[0].icon, icon);
	assert.equal(
		extra.actionCompanies({ companies })[1].cards[0].icon,
		extra.defaultExtraCards[0].icon
	);
});

test('nullable API fields in new action cards are safe for public SSR and inline editing', () => {
	const saved = {
		id: 'new',
		title: 'Новая акция',
		description: null,
		badge: null,
		icon: null,
		enabled: false
	};
	for (const card of [
		primary.mergeActionCards([saved])[0],
		extra.mergeExtraCards([saved])[0],
		extra.actionCompanies({ companies: [{ id: 'company', name: null, cards: [saved] }] })[0]
			.cards[0]
	]) {
		assert.equal(card.title, 'Новая акция');
		assert.equal(card.description, '');
		assert.equal(card.badge, '');
		assert.equal(card.icon, '');
		assert.equal(card.enabled, false);
		assert.doesNotThrow(() => card.description.trim());
	}
	assert.equal(
		extra.actionCompanies({ companies: [{ id: 'company', name: null, cards: [] }] })[0].name,
		''
	);
	assert.equal(saved.description, null);
	assert.equal(saved.badge, null);
});

test('normalization retains rich text, existing icons and arbitrary saved card fields', () => {
	const card = {
		id: 'offer',
		title: '<!--leget-rich-text:v1--><p>Акция</p>',
		description: 'Условия',
		badge: 'Подарок',
		icon: 'M3 3h7',
		enabled: true,
		custom: 'Keep'
	};
	assert.deepEqual(cardData.normalizeActionCard(card), card);
	assert.equal(cardData.normalizeActionCard({ title: null }).title, '');
});
