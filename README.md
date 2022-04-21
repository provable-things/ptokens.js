# ptokens.js-new
New ptokens.js implementation supporting host-to-host swaps

## Development mode
Rollup has the following option available
```
-w, --watch                 Watch files in bundle and rebuild on changes
```
Every package has a dedicated `dev` script which runs **rollup** with the watch option.

These scripts can be run in parallel by executing the following command from the project root directory:
```shell
$ npm run dev
```
In this way, a developer can make adjustments to the codebase and test it on the fly, without the need to build the affected packages.

**Tip:** leave the command running on a separated shell. 