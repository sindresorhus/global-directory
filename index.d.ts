export interface GlobalDirs {
	/**
	Directory with globally installed packages.

	Equivalent to `npm root --global`.
	*/
	readonly packages: string;

	/**
	Directory with globally installed binaries.

	Equivalent to `npm bin --global`.
	*/
	readonly binaries: string;

	/**
	Directory with directories for packages and binaries. You probably want either of the above.

	Equivalent to `npm prefix --global`.
	*/
	readonly prefix: string;
}

/**
Get the directory of globally installed packages and binaries.

@example
```
import * as globalDirs from 'global-dirs';

console.log(globalDirs.npm.prefix);
//=> '/usr/local'

console.log(globalDirs.npm.packages);
//=> '/usr/local/lib/node_modules'
```
*/
export const npm: GlobalDirs;

/**
Get the directory of globally installed packages and binaries.

@example
```
import * as globalDirs from 'global-dirs';

console.log(globalDirs.npm.binaries);
//=> '/usr/local/bin'

console.log(globalDirs.yarn.packages);
//=> '/Users/sindresorhus/.config/yarn/global/node_modules'
```
*/
export const yarn: GlobalDirs;
