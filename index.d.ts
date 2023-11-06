export type GlobalDirectories = {
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
};

declare const globalDirectories: {
	/**
	Get the directory of globally installed packages and binaries.

	@example
	```
	import globalDirectories from 'global-dirs';

	console.log(globalDirectories.npm.prefix);
	//=> '/usr/local'

	console.log(globalDirectories.npm.packages);
	//=> '/usr/local/lib/node_modules'
	```
	*/
	readonly npm: GlobalDirectories;

	/**
	Get the directory of globally installed packages and binaries.

	@example
	```
	import globalDirectories from 'global-dirs';

	console.log(globalDirectories.npm.binaries);
	//=> '/usr/local/bin'

	console.log(globalDirectories.yarn.packages);
	//=> '/Users/sindresorhus/.config/yarn/global/node_modules'
	```
	*/
	readonly yarn: GlobalDirectories;
};

export default globalDirectories;
