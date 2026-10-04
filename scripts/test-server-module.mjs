import { readFileSync } from 'node:fs';
import ts from 'typescript';

/** Load the real server handlers and helpers with only external services replaced. */
export function loadServerModule(url, dependencies) {
	const modules = new Map();
	function load(file) {
		if (modules.has(file.href)) return modules.get(file.href).exports;
		const module = { exports: {} };
		modules.set(file.href, module);
		const { outputText } = ts.transpileModule(readFileSync(file, 'utf8'), {
			compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS }
		});
		const require = (name) => {
			if (Object.hasOwn(dependencies, name)) return dependencies[name];
			if (name.startsWith('$lib/'))
				return load(new URL(`../src/lib/${name.slice(5)}.ts`, import.meta.url));
			throw new Error(`Missing test dependency: ${name}`);
		};
		new Function('module', 'exports', 'require', outputText)(module, module.exports, require);
		return module.exports;
	}
	return load(url);
}
