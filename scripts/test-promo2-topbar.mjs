import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
	isTopBarHref,
	topBarLinks,
	topBarPhone,
	topBarEmail
} from '../src/lib/components/templates/Promo-2/layout/top-bar.ts';

test('existing header data remains the source for desktop and mobile contacts', () => {
	const data = {
		phone: ' +7 (999) 123-45-67 ',
		email: ' factory@example.com ',
		topLinks: [{ label: 'Каталог', href: '/kitchens' }]
	};
	assert.equal(topBarPhone(data), '+7 (999) 123-45-67');
	assert.equal(topBarEmail(data), 'factory@example.com');
	assert.deepEqual(topBarLinks(data), data.topLinks);
});

test('missing data uses defaults while deliberately emptied data stays empty', () => {
	assert.ok(topBarPhone({}));
	assert.ok(topBarEmail({}));
	assert.equal(topBarLinks({}).length, 5);
	assert.equal(topBarPhone({ phone: ' ' }), '');
	assert.equal(topBarEmail({ email: '' }), '');
	assert.equal(topBarPhone({ phone: null }), '');
	assert.equal(topBarEmail({ email: null }), '');
	assert.deepEqual(topBarLinks({ topLinks: [] }), []);
});

test('edited navigation accepts site pages and web URLs and rejects executable links', () => {
	for (const href of [
		'/about',
		'/showrooms?city=moscow',
		'#contacts',
		'https://example.com',
		'http://example.com'
	])
		assert.equal(isTopBarHref(href), true, href);
	for (const href of [
		'',
		'javascript:alert(1)',
		'data:text/html,test',
		'//example.com',
		'/\\example.com',
		'/\n/evil.com'
	])
		assert.equal(isTopBarHref(href), false, href);
	assert.deepEqual(
		topBarLinks({
			topLinks: [
				null,
				{},
				{ label: 'Bad', href: 'javascript:alert(1)' },
				{ label: 'Новости', href: '/news' }
			]
		}),
		[{ label: 'Новости', href: '/news' }]
	);
});
