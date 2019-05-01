import {expectType} from 'tsd';
import globalDirectories = require('.');

expectType<string>(globalDirectories.npm.prefix);
expectType<string>(globalDirectories.npm.packages);
expectType<string>(globalDirectories.npm.binaries);
expectType<string>(globalDirectories.yarn.prefix);
expectType<string>(globalDirectories.yarn.packages);
expectType<string>(globalDirectories.yarn.binaries);
