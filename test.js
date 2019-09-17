import test from 'ava';
import execa from 'execa';
import importFresh from 'import-fresh';

const globalDirectories = importFresh('.');

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
	t.is(globalDirectories.npm.binaries, await npm(['bin', '--global']));
});

test('yarn', async t => {
	await npm(['install', '--global', 'yarn']);
	t.truthy(globalDirectories.yarn);
	t.truthy(globalDirectories.yarn.prefix);
	t.truthy(globalDirectories.yarn.packages);
	t.truthy(globalDirectories.yarn.binaries);
});

test('reload package and get npm.prefix with env', t => {
	// eslint-disable-next-line camelcase
	process.env.npm_config_PREFIX = '/usr/local/lib';
	const globalDirectories = importFresh('.');
	t.is(globalDirectories.npm.prefix, '/usr/local/lib');
});
