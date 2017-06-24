import test from 'ava';
import execa from 'execa';
import m from '.';

console.log(m);

const npm = args => execa.stdout('npm', args);

test('npm.prefix', async t => {
	t.is(m.npm.prefix, await npm(['prefix', '--global']));
});

test('npm.packages', async t => {
	t.is(m.npm.packages, await npm(['root', '--global']));
});

test('npm.binaries', async t => {
	t.is(m.npm.binaries, await npm(['bin', '--global']));
});

test('yarn', async t => {
	await npm(['install', '--global', 'yarn']);
	t.truthy(m.yarn);
	t.truthy(m.yarn.prefix);
	t.truthy(m.yarn.packages);
	t.truthy(m.yarn.binaries);
});
