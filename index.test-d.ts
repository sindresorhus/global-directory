import {expectType} from 'tsd';
import globalDirectory from './index.js';

expectType<string>(globalDirectory.npm.prefix);
expectType<string>(globalDirectory.npm.packages);
expectType<string>(globalDirectory.npm.binaries);
expectType<string>(globalDirectory.yarn.prefix);
expectType<string>(globalDirectory.yarn.packages);
expectType<string>(globalDirectory.yarn.binaries);
