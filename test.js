import test from 'ava';
import execa from 'execa';
import globalDirs from '.';

console.log(globalDirs);

const npm = arguments_ => execa.stdout('npm', arguments_);

test('npm.prefix', async t => {
	t.is(globalDirs.npm.prefix, await npm(['prefix', '--global']));
});

test('npm.packages', async t => {
	t.is(globalDirs.npm.packages, await npm(['root', '--global']));
});

test('npm.binaries', async t => {
	t.is(globalDirs.npm.binaries, await npm(['bin', '--global']));
});

test('yarn', async t => {
	await npm(['install', '--global', 'yarn']);
	t.truthy(globalDirs.yarn);
	t.truthy(globalDirs.yarn.prefix);
	t.truthy(globalDirs.yarn.packages);
	t.truthy(globalDirs.yarn.binaries);
});
