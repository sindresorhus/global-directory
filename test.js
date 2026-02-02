import process from 'node:process';
import os from 'node:os';
import path from 'node:path';
import test from 'ava';
import {execa} from 'execa';

const importFresh = async moduleName => import(`${moduleName}?${Date.now()}`);

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

test.serial('reload package and get npm.prefix with env', async t => {
	// eslint-disable-next-line camelcase
	process.env.npm_config_PREFIX = '/usr/local/lib';
	const {default: globalDirectory} = await importFresh('./index.js');
	t.is(globalDirectory.npm.prefix, '/usr/local/lib');
	delete process.env.npm_config_PREFIX;
});
