import test from 'ava';
import execa from 'execa';
import globalDirectories from '.';

console.log(globalDirectories);

const npm = arguments_ => execa.stdout('npm', arguments_);

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
