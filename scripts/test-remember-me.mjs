import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { beforeEach, test } from 'node:test';
import { writable } from 'svelte/store';
import ts from 'typescript';

async function load(source) {
	const { outputText } = ts.transpileModule(source, {
		compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 }
	});
	return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
const session = await load(
	readFileSync(new URL('../src/lib/utils/auth-session.ts', import.meta.url), 'utf8')
);
function storage() {
	const data = new Map();
	return {
		getItem: (key) => data.get(key) ?? null,
		setItem: (key, value) => data.set(key, String(value)),
		removeItem: (key) => data.delete(key),
		clear: () => data.clear()
	};
}
const token = (remember, expires = 3600) =>
	`header.${Buffer.from(JSON.stringify({ remember, exp: Math.floor(Date.now() / 1000) + expires })).toString('base64url')}.signature`;
const result = (remember = false, id = 1) => ({
	token: token(remember),
	remember,
	user: { id, name: 'Test', email: 'test@example.test' },
	email_verified: true
});
let calls;
beforeEach(() => {
	globalThis.localStorage = storage();
	globalThis.sessionStorage = storage();
	calls = [];
	globalThis.fetch = async (url, options) => {
		calls.push({ url, options });
		return Response.json({});
	};
});
async function store() {
	globalThis.rememberTestDeps = {
		...session,
		writable,
		browser: true,
		getAuthApiUrl: () => 'https://auth.test/api'
	};
	let source = readFileSync(new URL('../src/lib/stores/auth.ts', import.meta.url), 'utf8');
	source = source.replace(/^import[\s\S]*?from ['"][^'"]+['"];\n/gm, '');
	return (
		await load(
			`const { writable, browser, getAuthApiUrl, clearAuthSession, getAuthToken, getAuthUserId, saveAuthSession, setAuthUserId } = globalThis.rememberTestDeps;\n${source}\n// load ${Math.random()}`
		)
	).auth;
}
test('unchecked login survives reload but ends with the tab session', () => {
	const login = result();
	session.saveAuthSession(login);
	assert.equal(localStorage.getItem('auth_token'), null);
	assert.equal(session.getAuthToken(), login.token);
	assert.equal(session.getAuthUserId(), 1);
	sessionStorage.clear();
	assert.equal(session.getAuthToken(), null);
});
test('remembered login survives tab close with matching metadata', () => {
	const login = result(true);
	session.saveAuthSession(login);
	assert.equal(sessionStorage.getItem('auth_token'), null);
	sessionStorage.clear();
	assert.equal(session.getAuthToken(), login.token);
	assert.equal(session.getAuthUserId(), 1);
	assert.equal(localStorage.getItem('email_verified'), '1');
});
test('switching account and persistence cannot restore a previous account', () => {
	session.saveAuthSession(result(true));
	session.saveAuthSession(result(false, 2));
	assert.equal(localStorage.getItem('auth_token'), null);
	assert.equal(session.getAuthUserId(), 2);
	sessionStorage.clear();
	assert.equal(session.getAuthToken(), null);
	session.saveAuthSession(result(false, 3));
	session.saveAuthSession(result(true, 4));
	assert.equal(sessionStorage.getItem('auth_user_id'), null);
	assert.equal(session.getAuthUserId(), 4);
});
test('legacy unconditional persistence becomes temporary', () => {
	const legacy = token(undefined);
	localStorage.setItem('auth_token', legacy);
	localStorage.setItem('auth_user_id', '7');
	assert.equal(session.getAuthToken(), legacy);
	assert.equal(localStorage.getItem('auth_token'), null);
	assert.equal(session.getAuthUserId(), 7);
});
test('expired and corrupt tokens clear cached identity', () => {
	for (const invalid of [token(true, -1), 'broken', 'header.bnVsbA.signature']) {
		localStorage.setItem('auth_token', invalid);
		localStorage.setItem('auth_user_id', '7');
		assert.equal(session.getAuthToken(), null);
		assert.equal(session.getAuthUserId(), null);
		assert.equal(localStorage.getItem('auth_user_id'), null);
	}
});
test('password login sends both checkbox values and follows server persistence', async () => {
	const auth = await store();
	for (const remember of [true, false]) {
		const login = result(remember);
		globalThis.fetch = async (url, options) => {
			assert.equal(url, 'https://auth.test/api/auth/login');
			assert.equal(JSON.parse(options.body).remember, remember);
			return Response.json({ success: true, ...login });
		};
		await auth.login('USER@EXAMPLE.TEST', 'password', null, remember);
		assert.equal(session.getAuthToken(), login.token);
		assert.equal(!!localStorage.getItem('auth_token'), remember);
	}
});
test('failed login preserves an existing remembered session', async () => {
	const login = result(true);
	session.saveAuthSession(login);
	const auth = await store();
	globalThis.fetch = async () => Response.json({ message: 'Invalid credentials' }, { status: 401 });
	await assert.rejects(auth.login('user@example.test', 'incorrect', null, false));
	assert.equal(session.getAuthToken(), login.token);
});
test('SMS, profile restoration and logout share the temporary session', async () => {
	const login = result(false, 8);
	let auth = await store();
	auth.acceptLogin(login);
	auth = await store();
	globalThis.fetch = async (url, options) => {
		calls.push({ url, options });
		return Response.json({ user: login.user });
	};
	await auth.init();
	let snapshot;
	const unsubscribe = auth.subscribe((value) => (snapshot = value));
	assert.equal(snapshot.isAuthenticated, true);
	assert.equal(snapshot.userId, 8);
	assert.equal(calls[0].options.headers.Authorization, `Bearer ${login.token}`);
	auth.logout();
	assert.equal(session.getAuthToken(), null);
	assert.equal(snapshot.isAuthenticated, false);
	assert.equal(calls.length, 3);
	unsubscribe();
});

test('expired temporary session does not erase a newer remembered login from another tab', () => {
	const remembered = result(true, 9);
	session.saveAuthSession(remembered);
	sessionStorage.setItem('auth_token', token(false, -1));
	sessionStorage.setItem('auth_user_id', '1');
	assert.equal(session.getAuthToken(), remembered.token);
	assert.equal(localStorage.getItem('auth_token'), remembered.token);
	assert.equal(session.getAuthUserId(), 9);
	assert.equal(sessionStorage.getItem('auth_user_id'), null);
});

test('expiry during profile request clears the optimistic authenticated/loading state', async () => {
	const realNow = Date.now;
	const startedAt = Date.now();
	session.saveAuthSession({ ...result(), token: token(false, 1) });
	const auth = await store();
	globalThis.fetch = async () => {
		Date.now = () => startedAt + 2000;
		return Response.json({ message: 'Token expired' }, { status: 401 });
	};
	try {
		await auth.init();
		let snapshot;
		const unsubscribe = auth.subscribe((value) => (snapshot = value));
		assert.equal(session.getAuthToken(), null);
		assert.equal(snapshot.isAuthenticated, false);
		assert.equal(snapshot.isLoading, false);
		unsubscribe();
	} finally {
		Date.now = realNow;
	}
});

test('a response for an old token does not clear a new login', async () => {
	session.saveAuthSession(result(false, 1));
	const auth = await store();
	const fresh = result(true, 2);
	globalThis.fetch = async () => {
		auth.acceptLogin(fresh);
		return Response.json({}, { status: 401 });
	};
	await auth.init();
	let snapshot;
	const unsubscribe = auth.subscribe((value) => (snapshot = value));
	assert.equal(session.getAuthToken(), fresh.token);
	assert.equal(snapshot.isAuthenticated, true);
	assert.equal(snapshot.userId, 2);
	assert.equal(snapshot.isLoading, false);
	unsubscribe();
});

test('fallback to another tab token during profile load cannot retain the previous identity', async () => {
	const realNow = Date.now;
	const startedAt = Date.now();
	const remembered = result(true, 9);
	session.saveAuthSession(remembered);
	sessionStorage.setItem('auth_token', token(false, 1));
	sessionStorage.setItem('auth_user_id', '1');
	const auth = await store();
	globalThis.fetch = async () => {
		Date.now = () => startedAt + 2000;
		return Response.json({}, { status: 401 });
	};
	try {
		await auth.init();
		let snapshot;
		const unsubscribe = auth.subscribe((value) => (snapshot = value));
		assert.equal(session.getAuthToken(), remembered.token);
		assert.equal(snapshot.userId, null);
		assert.equal(snapshot.isAuthenticated, false);
		assert.equal(snapshot.isLoading, false);
		unsubscribe();
	} finally {
		Date.now = realNow;
	}
});
