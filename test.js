import process from 'node:process';
import path from 'node:path';
import test from 'ava';
import {execa} from 'execa';

const importFresh = async moduleName => import(`${moduleName}?${Date.now()}`);

const {default: globalDirectories} = await importFresh('./index.js');

console.log(globalDirectories);

const npm = async arguments_ => {
	const {stdout} = await execa('npm', arguments_);
	return stdout;
};

test('npm.prefix', async t => {
	t.is(globalDirectories.npm.prefix, await npm(['prefix', '--global']));
});

test('npm.packages', async t => {
	t.is(globalDirectories.npm.packages, await npm(['root', '--global']));
});

test('npm.binaries', async t => {
	t.is(globalDirectories.npm.binaries, path.join(await npm(['prefix', '--global']), 'bin'));
});

test('yarn', async t => {
	await npm(['install', '--global', 'yarn']);
	t.truthy(globalDirectories.yarn);
	t.truthy(globalDirectories.yarn.prefix);
	t.truthy(globalDirectories.yarn.packages);
	t.truthy(globalDirectories.yarn.binaries);
});

test('reload package and get npm.prefix with env', async t => {
	// eslint-disable-next-line camelcase
	process.env.npm_config_PREFIX = '/usr/local/lib';
	const {default: globalDirectories} = await importFresh('./index.js');
	t.is(globalDirectories.npm.prefix, '/usr/local/lib');
});
