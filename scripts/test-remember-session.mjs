import assert from 'node:assert/strict';
import { json, fail } from '@sveltejs/kit';
import { loadServerModule } from './test-server-module.mjs';

const month = 30 * 24 * 60 * 60;
let result;
let status;
const calls = [];
const backend = async (path, init = {}) => {
	calls.push({ path, ...init, body: init.body ? JSON.parse(init.body) : undefined });
	return new Response(JSON.stringify(result), { status });
};
const dependencies = {
	'$app/environment': { dev: false },
	'@sveltejs/kit': { json, fail },
	'$lib/server/admin-api': {
		authApi: backend,
		adminAuthApi: backend,
		adminApi: backend,
		readApiJson: (response) => response.json()
	},
	'$lib/server/attribution': { claimAttribution: async () => {} }
};
const load = (path) => loadServerModule(new URL(`../src/${path}`, import.meta.url), dependencies);
const cabinet = load('routes/cabinet/session/+server.ts');
const university = load('routes/university/api/[...path]/+server.ts');
const sms = load('routes/sms/[action]/+server.ts');
const admin = load('routes/admin/+page.server.ts');
const activate = load('routes/cabinet/activate/+server.ts');
const goals = load('routes/goals/session/+server.ts');
const settings = load('routes/site-settings/session/+server.ts');
function cookies(initial = {}) {
	const values = new Map(Object.entries(initial));
	const writes = [],
		deletes = [];
	return {
		values,
		writes,
		deletes,
		get: (name) => values.get(name),
		set(name, value, options) {
			values.set(name, value);
			writes.push({ name, value, options });
		},
		delete(name, options) {
			values.delete(name);
			deletes.push({ name, options });
		}
	};
}
function event(path, body = {}, jar = cookies(), headers = {}) {
	const url = new URL(`https://tenant.test${path}`);
	return {
		url,
		cookies: jar,
		getClientAddress: () => '127.0.0.1',
		params: {},
		request: new Request(url, {
			method: 'POST',
			headers: { origin: url.origin, 'Content-Type': 'application/json', ...headers },
			body: JSON.stringify(body)
		})
	};
}
function success(role, remember) {
	status = 200;
	result = {
		success: true,
		token: 'server-only-jwt',
		role,
		user: { id: 1, role },
		...(remember === undefined ? {} : { remember }),
		expires_in: remember === true ? month : 3600
	};
	calls.length = 0;
}
function checkCookie(jar, remember, name = 'leget_client_jwt', path = '/', maxAge = month) {
	assert.equal(jar.writes.length, 1);
	const cookie = jar.writes[0];
	assert.equal(cookie.name, name);
	assert.equal(cookie.value, 'server-only-jwt');
	assert.equal(cookie.options.path, path);
	assert.equal(cookie.options.httpOnly, true);
	assert.equal(cookie.options.secure, true);
	assert.equal(cookie.options.sameSite, path === '/' ? 'lax' : 'strict');
	assert.equal(Object.hasOwn(cookie.options, 'expires'), false);
	assert.equal(Object.hasOwn(cookie.options, 'maxAge'), remember === true);
	if (remember === true) assert.equal(cookie.options.maxAge, maxAge);
}
async function privateResponse(response) {
	assert.equal(response.status, 200);
	assert.equal((await response.json()).token, undefined, 'JWT must stay server-side');
}
const loginRoutes = [
	[cabinet.POST, '/cabinet/session', {}],
	[university.POST, '/university/api/login', { path: 'login' }]
];
// All role-specific cabinets and University preserve the same login choice.
for (const role of ['client', 'admin', 'superadmin', 'manager', 'partner', 'curator', 'student']) {
	for (const remember of [undefined, false, true]) {
		for (const [handler, path, params] of loginRoutes) {
			success(role, remember);
			const request = event(path, { email: 'user@example.test', password: 'password', remember });
			request.params = params;
			await privateResponse(await handler(request));
			assert.equal(calls[0].body.remember, remember);
			checkCookie(request.cookies, remember);
		}
	}
}
// FormData checked value is converted explicitly, never using string truthiness.
for (const remember of [false, true]) {
	success('superadmin', remember);
	const form = new FormData();
	form.set('email', 'admin@example.test');
	form.set('password', 'password');
	if (remember) form.set('remember', '1');
	const jar = cookies();
	const response = await admin.actions.login({
		request: new Request('https://tenant.test/admin?/login', { method: 'POST', body: form }),
		cookies: jar
	});
	assert.equal(response.success, true);
	assert.equal(calls[0].body.remember, remember);
	checkCookie(jar, remember, 'leget_admin_jwt', '/admin');
}
for (const context of ['client', 'admin', 'university']) {
	for (const remember of [undefined, false, true]) {
		success('superadmin', remember);
		const request = event('/sms/verify', { context, remember, code: '123456' });
		request.params.action = 'verify';
		await privateResponse(await sms.POST(request));
		assert.equal(calls[0].body.remember, remember);
		checkCookie(
			request.cookies,
			remember,
			context === 'admin' ? 'leget_admin_jwt' : 'leget_client_jwt',
			context === 'admin' ? '/admin' : '/'
		);
	}
}
// Reissued tokens keep the confirmed decision and only the remaining lifetime.
for (const remember of [false, true]) {
	for (const [handler, path, params] of [
		[activate.POST, '/cabinet/activate', {}],
		[university.POST, '/university/api/enroll', { path: 'enroll' }]
	]) {
		success('client', remember);
		result.expires_in = 723;
		const request = event(path, {}, cookies({ leget_client_jwt: 'old-token' }));
		request.params = params;
		await privateResponse(await handler(request));
		assert.equal(calls[0].headers.Authorization, 'Bearer old-token');
		checkCookie(request.cookies, remember, 'leget_client_jwt', '/', 723);
	}
}
// Neither a client preference nor truthy response values can enable persistence.
for (const remember of [undefined, false, 'true', 1]) {
	success('client', remember);
	const request = event('/cabinet/session', {
		email: 'user@example.test',
		password: 'password',
		remember: true
	});
	await privateResponse(await cabinet.POST(request));
	checkCookie(request.cookies, false);
}
for (const expiresIn of [undefined, null, -1, 0, 1.5, '2592000']) {
	success('client', true);
	result.expires_in = expiresIn;
	const request = event('/cabinet/session', { email: 'user@example.test', password: 'password' });
	await privateResponse(await cabinet.POST(request));
	checkCookie(request.cookies, false);
}
// Derived editor cookies are based on signed claims only after successful validation.
for (const [handler, path, name] of [
	[goals.POST, '/goals/session', 'leget_goals_jwt'],
	[settings.POST, '/site-settings/session', 'leget_site_settings_jwt']
]) {
	for (const remember of [undefined, false, true]) {
		success('admin', remember);
		const token = `header.${Buffer.from(JSON.stringify({ remember, exp: Math.ceil(Date.now() / 1000) + 1800 })).toString('base64url')}.signature`;
		const request = event(path, {}, cookies(), { authorization: `Bearer ${token}` });
		await privateResponse(await handler(request));
		assert.equal(calls[0].path, '/auth/me');
		const cookie = request.cookies.writes[0];
		assert.equal(cookie.name, name);
		assert.equal(cookie.value, token);
		assert.equal(Object.hasOwn(cookie.options, 'maxAge'), remember === true);
		assert.equal(Object.hasOwn(cookie.options, 'expires'), false);
		assert.equal(cookie.options.httpOnly, true);
		assert.equal(cookie.options.secure, true);
		assert.equal(cookie.options.sameSite, 'strict');
		if (remember) assert.ok(cookie.options.maxAge <= 1800 && cookie.options.maxAge >= 1798);
		status = 401;
		const invalid = event(path, {}, cookies(), { authorization: `Bearer ${token}` });
		assert.equal((await handler(invalid)).status, 401);
		assert.equal(invalid.cookies.writes.length, 0);
	}
}
for (const [handler, path, params] of [
	...loginRoutes,
	[sms.POST, '/sms/verify', { action: 'verify' }]
]) {
	success('client', true);
	status = 401;
	const body = {
		email: 'user@example.test',
		password: 'password',
		context: 'client',
		remember: true
	};
	const request = event(path, body);
	request.params = params;
	assert.equal((await handler(request)).status, 401);
	assert.equal(request.cookies.writes.length, 0);
	calls.length = 0;
	const crossOrigin = event(path, body, cookies(), { origin: 'https://attacker.test' });
	crossOrigin.params = params;
	assert.equal((await handler(crossOrigin)).status, 403);
	assert.equal(calls.length, 0);
	assert.equal(crossOrigin.cookies.writes.length, 0);
}
for (const [handler, name, path] of [
	[cabinet.DELETE, 'leget_client_jwt', '/'],
	[admin.actions.logout, 'leget_admin_jwt', '/admin'],
	[goals.DELETE, 'leget_goals_jwt', '/goals'],
	[settings.DELETE, 'leget_site_settings_jwt', '/site-settings']
]) {
	const jar = cookies({ [name]: 'old-token', unrelated: 'keep' });
	await handler({ cookies: jar });
	assert.deepEqual(jar.deletes, [{ name, options: { path } }]);
	assert.equal(jar.get(name), undefined);
	assert.equal(jar.get('unrelated'), 'keep');
}
console.log(
	'PASS: password and SMS session persistence, all roles, token renewal, derived cookies, logout and rejection boundaries.'
);
