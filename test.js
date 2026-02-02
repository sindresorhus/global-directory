import process from 'node:process';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import test from 'ava';
import {execa} from 'execa';

let importCounter = 0;
const importFresh = async moduleName => import(`${moduleName}?${++importCounter}`);

const {default: globalDirectory} = await importFresh('./index.js');

console.log(globalDirectory);

const npm = async arguments_ => {
	const {stdout} = await execa('npm', arguments_);
	return stdout;
};

test('npm.prefix', async t => {
	t.is(globalDirectory.npm.prefix, await npm(['prefix', '--global']));
});

test('npm.packages', async t => {
	t.is(globalDirectory.npm.packages, await npm(['root', '--global']));
});

test('npm.binaries', async t => {
	t.is(globalDirectory.npm.binaries, path.join(await npm(['prefix', '--global']), 'bin'));
});

test('yarn', async t => {
	await npm(['install', '--global', 'yarn']);
	t.truthy(globalDirectory.yarn);
	t.truthy(globalDirectory.yarn.prefix);
	t.truthy(globalDirectory.yarn.packages);
	t.truthy(globalDirectory.yarn.binaries);
});

test('yarn.packages is inside prefix', t => {
	t.true(globalDirectory.yarn.packages.startsWith(globalDirectory.yarn.prefix));
	t.true(globalDirectory.yarn.packages.endsWith('/global/node_modules'));
});

test('yarn.binaries ends with /bin', t => {
	t.true(globalDirectory.yarn.binaries.endsWith('/bin'));
});

test.serial('yarn with XDG_DATA_HOME', async t => {
	process.env.XDG_DATA_HOME = '/tmp/xdg-test';
	const {default: globalDirectory} = await importFresh('./index.js');
	t.is(globalDirectory.yarn.prefix, '/tmp/xdg-test/yarn');
	t.is(globalDirectory.yarn.packages, '/tmp/xdg-test/yarn/global/node_modules');
	delete process.env.XDG_DATA_HOME;
});

test.serial('yarn with PREFIX', async t => {
	process.env.PREFIX = '/custom/prefix';
	const {default: globalDirectory} = await importFresh('./index.js');
	t.is(globalDirectory.yarn.binaries, '/custom/prefix/bin');
	// PREFIX should not affect the data directory
	t.is(globalDirectory.yarn.prefix, path.join(os.homedir(), '.config/yarn'));
	delete process.env.PREFIX;
});

test('pnpm', t => {
	t.truthy(globalDirectory.pnpm);
	t.truthy(globalDirectory.pnpm.prefix);
	t.truthy(globalDirectory.pnpm.packages);
	t.truthy(globalDirectory.pnpm.binaries);
});

test('pnpm.packages is inside prefix', t => {
	t.true(globalDirectory.pnpm.packages.startsWith(globalDirectory.pnpm.prefix));
	t.true(globalDirectory.pnpm.packages.endsWith('/global/5/node_modules') || globalDirectory.pnpm.packages.endsWith(String.raw`\global\5\node_modules`));
});

test.serial('pnpm with PNPM_HOME', async t => {
	process.env.PNPM_HOME = '/custom/pnpm-home';
	const {default: globalDirectory} = await importFresh('./index.js');
	t.is(globalDirectory.pnpm.prefix, '/custom/pnpm-home');
	t.is(globalDirectory.pnpm.packages, '/custom/pnpm-home/global/5/node_modules');
	t.is(globalDirectory.pnpm.binaries, '/custom/pnpm-home');
	delete process.env.PNPM_HOME;
});

test.serial('pnpm with NPM_CONFIG_GLOBAL_DIR', async t => {
	const savedGlobalDirectory = process.env.NPM_CONFIG_GLOBAL_DIR;
	process.env.NPM_CONFIG_GLOBAL_DIR = '/custom/pnpm-global';
	const {default: globalDirectory} = await importFresh('./index.js');
	t.is(globalDirectory.pnpm.packages, path.join('/custom/pnpm-global', '5/node_modules'));

	if (savedGlobalDirectory === undefined) {
		delete process.env.NPM_CONFIG_GLOBAL_DIR;
	} else {
		process.env.NPM_CONFIG_GLOBAL_DIR = savedGlobalDirectory;
	}
});

test.serial('pnpm with NPM_CONFIG_GLOBAL_BIN_DIR', async t => {
	const savedGlobalBinDirectory = process.env.NPM_CONFIG_GLOBAL_BIN_DIR;
	process.env.NPM_CONFIG_GLOBAL_BIN_DIR = '/custom/pnpm-bin';
	const {default: globalDirectory} = await importFresh('./index.js');
	t.is(globalDirectory.pnpm.binaries, '/custom/pnpm-bin');

	if (savedGlobalBinDirectory === undefined) {
		delete process.env.NPM_CONFIG_GLOBAL_BIN_DIR;
	} else {
		process.env.NPM_CONFIG_GLOBAL_BIN_DIR = savedGlobalBinDirectory;
	}
});

test.serial('pnpm with pnpm rc config', async t => {
	const savedXdgConfigHome = process.env.XDG_CONFIG_HOME;
	const temporaryDirectory = path.join(process.cwd(), 'tmp');
	fs.mkdirSync(temporaryDirectory, {recursive: true});
	const configHome = fs.mkdtempSync(path.join(temporaryDirectory, 'pnpm-config-'));
	const pnpmConfigFile = path.join(configHome, 'pnpm', 'rc');
	fs.mkdirSync(path.dirname(pnpmConfigFile), {recursive: true});
	fs.writeFileSync(pnpmConfigFile, 'global-dir=/custom/pnpm-global\nglobal-bin-dir=/custom/pnpm-bin\n');
	process.env.XDG_CONFIG_HOME = configHome;
	const {default: globalDirectory} = await importFresh('./index.js');
	t.is(globalDirectory.pnpm.packages, path.join('/custom/pnpm-global', '5/node_modules'));
	t.is(globalDirectory.pnpm.binaries, '/custom/pnpm-bin');
	fs.rmSync(configHome, {recursive: true, force: true});

	if (savedXdgConfigHome === undefined) {
		delete process.env.XDG_CONFIG_HOME;
	} else {
		process.env.XDG_CONFIG_HOME = savedXdgConfigHome;
	}
});

test.serial('pnpm with XDG_DATA_HOME', async t => {
	delete process.env.PNPM_HOME;
	process.env.XDG_DATA_HOME = '/tmp/xdg-test';
	const {default: globalDirectory} = await importFresh('./index.js');
	t.is(globalDirectory.pnpm.prefix, '/tmp/xdg-test/pnpm');
	t.is(globalDirectory.pnpm.packages, '/tmp/xdg-test/pnpm/global/5/node_modules');
	delete process.env.XDG_DATA_HOME;
});

test.serial('pnpm without PNPM_HOME uses data dir for binaries', async t => {
	delete process.env.PNPM_HOME;
	delete process.env.XDG_DATA_HOME;
	const {default: globalDirectory} = await importFresh('./index.js');
	t.is(globalDirectory.pnpm.binaries, globalDirectory.pnpm.prefix);
});

test.serial('npm.prefix expands tilde in prefix', async t => {
	const savedKeys = Object.keys(process.env).filter(name => name.toLowerCase() === 'npm_config_prefix');
	const savedValues = Object.fromEntries(savedKeys.map(key => [key, process.env[key]]));

	for (const key of savedKeys) {
		delete process.env[key];
	}

	// eslint-disable-next-line camelcase
	process.env.npm_config_prefix = '~/.npm-global';
	const {default: globalDirectory} = await importFresh('./index.js');
	t.is(globalDirectory.npm.prefix, path.join(os.homedir(), '.npm-global'));
	t.false(globalDirectory.npm.prefix.includes('~'));
	delete process.env.npm_config_prefix;

	for (const [key, value] of Object.entries(savedValues)) {
		process.env[key] = value;
	}
});

test.serial('reload package and get npm.prefix with env', async t => {
	const savedKeys = Object.keys(process.env).filter(name => name.toLowerCase() === 'npm_config_prefix');
	const savedValues = Object.fromEntries(savedKeys.map(key => [key, process.env[key]]));

	for (const key of savedKeys) {
		delete process.env[key];
	}

	// eslint-disable-next-line camelcase
	process.env.npm_config_PREFIX = '/usr/local/lib';
	const {default: globalDirectory} = await importFresh('./index.js');
	t.is(globalDirectory.npm.prefix, '/usr/local/lib');
	delete process.env.npm_config_PREFIX;

	for (const [key, value] of Object.entries(savedValues)) {
		process.env[key] = value;
	}
});
