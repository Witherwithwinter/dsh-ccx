import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const devMode = process.argv.includes('--dev');

const hostOut = path.join(rootDir, 'lib', 'index.js');
const clientOut = path.join(rootDir, 'lib', 'client.js');

async function buildHost() {
	await esbuild.build({
		entryPoints: [path.join(rootDir, 'src', 'host', 'index.ts')],
		outfile: hostOut,
		bundle: true,
		format: 'esm',
		platform: 'node',
		target: 'node18',
		external: ['electron', 'node:*'],
		minify: false,
		sourcemap: devMode ? 'inline' : false,
		legalComments: 'none',
		banner: {
			js: '// Built from src/host/index.ts — do not edit lib/index.js directly.\n',
		},
	});
}

async function buildClient() {
	const result = await esbuild.build({
		entryPoints: [path.join(rootDir, 'src', 'client', 'index.ts')],
		outfile: clientOut,
		write: false,
		bundle: true,
		format: 'cjs',
		platform: 'browser',
		target: 'es2021',
		minify: !devMode,
		sourcemap: devMode ? 'inline' : false,
		legalComments: 'none',
	});

	const compiled = result.outputFiles[0].text;
	const wrapped =
		'window.__ModuleLoader__.load({\n' +
		'\tid: "dsh-ccx",\n' +
		'\tfactory: function (require) {\n' +
		'\t\tvar module = { exports: {} };\n' +
		'\t\tvar exports = module.exports;\n' +
		compiled +
		'\n\t\treturn module.exports;\n' +
		'\t}\n' +
		'});\n';

	fs.writeFileSync(clientOut, wrapped, 'utf8');
}

async function main() {
	await Promise.all([buildHost(), buildClient()]);
	execFileSync(process.execPath, ['--check', hostOut], { stdio: 'inherit' });
	execFileSync(process.execPath, ['--check', clientOut], { stdio: 'inherit' });
	const hostSize = (fs.statSync(hostOut).size / 1024).toFixed(1);
	const clientSize = (fs.statSync(clientOut).size / 1024).toFixed(1);
	console.log(`dsh-ccx build complete (${devMode ? 'dev' : 'prod'}): lib/index.js ${hostSize}KB, lib/client.js ${clientSize}KB`);
}

main().catch((err) => {
	console.error(err);
	process.exitCode = 1;
});
