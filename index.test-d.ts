import {expectType} from 'tsd';
import * as globalDirs from '.';

expectType<string>(globalDirs.npm.prefix);
expectType<string>(globalDirs.npm.packages);
expectType<string>(globalDirs.npm.binaries);
expectType<string>(globalDirs.yarn.prefix);
expectType<string>(globalDirs.yarn.packages);
expectType<string>(globalDirs.yarn.binaries);
