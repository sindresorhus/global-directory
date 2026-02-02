import process from 'node:process';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import ini from 'ini';

const isWindows = process.platform === 'win32';

const readRc = filePath => {
	try {
		return ini.parse(fs.readFileSync(filePath, 'utf8')).prefix;
	} catch {}
};

// TODO: Remove the `.reduce` call.
// eslint-disable-next-line unicorn/no-array-reduce
const getEnvNpmPrefix = () => Object.keys(process.env).reduce((prefix, name) => /^npm_config_prefix$/i.test(name) ? process.env[name] : prefix, undefined);

const getGlobalNpmrc = () => {
	if (isWindows && process.env.APPDATA) {
		// Hardcoded contents of `c:\Program Files\nodejs\node_modules\npm\npmrc`
		return path.join(process.env.APPDATA, '/npm/etc/npmrc');
	}

	// Homebrew special case: `$(brew --prefix)/lib/node_modules/npm/npmrc`
	if (process.execPath.includes('/Cellar/node')) {
		const homebrewPrefix = process.execPath.slice(0, process.execPath.indexOf('/Cellar/node'));
		return path.join(homebrewPrefix, '/lib/node_modules/npm/npmrc');
	}

	if (process.execPath.endsWith('/bin/node')) {
		const installDir = path.dirname(path.dirname(process.execPath));
		return path.join(installDir, '/etc/npmrc');
	}
};

const getDefaultNpmPrefix = () => {
	if (isWindows) {
		const {APPDATA} = process.env;
		// `c:\node\node.exe` → `prefix=c:\node\`
		return APPDATA ? path.join(APPDATA, 'npm') : path.dirname(process.execPath);
	}

	// `/usr/local/bin/node` → `prefix=/usr/local`
	return path.dirname(path.dirname(process.execPath));
};

const getNpmPrefix = () => {
	const envPrefix = getEnvNpmPrefix();
	if (envPrefix) {
		return envPrefix;
	}

	const homePrefix = readRc(path.join(os.homedir(), '.npmrc'));
	if (homePrefix) {
		return homePrefix;
	}

	if (process.env.PREFIX) {
		return process.env.PREFIX;
	}

	const globalPrefix = readRc(getGlobalNpmrc());
	if (globalPrefix) {
		return globalPrefix;
	}

	return getDefaultNpmPrefix();
};

const npmPrefix = path.resolve(getNpmPrefix());

const getYarnHomeDirectory = () => {
	if (process.getuid?.() === 0 && !process.env.FAKEROOTKEY) {
		return '/usr/local/share';
	}

	return os.homedir();
};

const getYarnDataDirectory = () => {
	if (isWindows) {
		return process.env.LOCALAPPDATA
			? path.join(process.env.LOCALAPPDATA, 'Yarn/Data')
			: path.join(os.homedir(), '.config/yarn');
	}

	if (process.env.XDG_DATA_HOME) {
		return path.join(process.env.XDG_DATA_HOME, 'yarn');
	}

	return path.join(getYarnHomeDirectory(), '.config/yarn');
};

const getYarnBinPrefix = () => {
	if (process.env.PREFIX) {
		return process.env.PREFIX;
	}

	if (isWindows) {
		return process.env.LOCALAPPDATA
			? path.join(process.env.LOCALAPPDATA, 'Yarn')
			: path.join(os.homedir(), '.yarn');
	}

	return `${process.env.DESTDIR ?? ''}/usr/local`;
};

const globalDirectory = {};

globalDirectory.npm = {};
globalDirectory.npm.prefix = npmPrefix;
globalDirectory.npm.packages = path.join(npmPrefix, isWindows ? 'node_modules' : 'lib/node_modules');
globalDirectory.npm.binaries = isWindows ? npmPrefix : path.join(npmPrefix, 'bin');

const yarnDataDir = path.resolve(getYarnDataDirectory());
globalDirectory.yarn = {};
globalDirectory.yarn.prefix = yarnDataDir;
globalDirectory.yarn.packages = path.join(yarnDataDir, 'global/node_modules');
globalDirectory.yarn.binaries = path.join(path.resolve(getYarnBinPrefix()), 'bin');

export default globalDirectory;
