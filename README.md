# ptokens.js | pNetwork JavaScript API

JavaScript module for interacting with pNetwork.

## Introduction
pTokens.js is the library that allows interoperability with the pNetwork interacting with pNetwork bridges.
This library supports **only v2** bridges.

- It's entirely written in TypeScript, but there are ready-to-use bundles to integrate it into your backend/frontend application.
- It's object-oriented designed and implements the builder pattern to ease objects creation
- It permits host-to-host swaps, unleashing the pTokens to pTokens bridge feature.

## Installation
The package is published in the [npm registry](https://www.npmjs.com/package/ptokens).

Initiate your JavaScript/TypeScript project and install it as a dependency:

```shell
$ npm i ptokens
```

## Documentation

The full documentation can be found [here](https://pnetwork-association.github.io/ptokens.js/).

## Examples

Complete examples are available at [examples](https://github.com/pnetwork-association/ptokens.js/tree/master/examples).

## Development

If you wish to contribute, please open a new Pull Request.

Technically speaking, this is a monorepo containing multiple packages. These are managed using [lerna](https://github.com/lerna/lerna). TypeScript source code is transpiled and bundled using [Rollup](https://rollupjs.org/guide/en/).

### Development mode

**Rollup** has the following option available

```
-w, --watch                 Watch files in bundle and rebuild on changes
```

Every package has a dedicated `dev` script that runs **rollup** with the watch option.

These scripts can be run in parallel by executing the following command from the project root directory:

```shell
$ npm run dev
```

In this way, a developer can make adjustments to the codebase and test it on the fly, without the need to build the affected packages.

**Tip:** leave the command running on a separate shell.

### Building

To build a new version of the library, run:

```shell
$ npm run build
```

### Testing
To run tests in Node.js, run:

```shell
$ npm test
```

### Generating Documentation

To generate the documentation website, run:

```shell
$ npm run docs
```

The static website will be located in the `docs/` directory.
