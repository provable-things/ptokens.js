# ptokens.js | pNetwork Javascript API

Javascript module for interacting with pNetwork.

## Introduction
pTokens.js is the library that allows interoperability with the pNetwork interacting with pNetwork bridges.
This library supports **only v2** bridges.

- It's entirely written in Typescript, but there are ready-to-use bundles to integrate it into your backend/frontend application.
- It's object-oriented designed and implements the builder pattern to ease objects creation
- It permits host-to-host swaps, unleashing the pTokens to pTokens bridge feature.

## Installation
The package is published in the [npm registry](https://www.npmjs.com/package/ptokens).

Initiate your Javascript/Typescript project and install it as a dependency:

```shell
$ npm i ptokens
```

## Documentation

The full documentation can be found [here](https://provable-things.github.io/ptokens.js/).

## Examples
This is a working example where pBTC on Ethereum tokens are pegged-out to pBTC on Algorand.

```ts
const {
  ChainId,
  pTokensSwapBuilder,
  pTokensEvmAssetBuilder,
  pTokensNode,
  pTokensNodeProvider,
  pTokensEvmProvider,
  pTokensAlgorandAssetBuilder,
} = require('ptokens')

const PNETWORK_NODE = 'https://pnetwork-node-2a.eu.ngrok.io/v3'
const EVM_PROVIDER = 'evm-provider-url'
const PRIVATE_KEY = 'private-key'
const ALGORAND_DESTINATION_ADDRESS = 'destination-address'

async function pegOut() {
  // create a pTokensNodeProvider and pTokensNode to interact with pNetwork
  const provider = new pTokensNodeProvider(PNETWORK_NODE)
  const node = new pTokensNode(provider)

  // create builders
  const evmBuilder = new pTokensEvmAssetBuilder(node)
  const algorandBuilder = new pTokensAlgorandAssetBuilder(node)
  const swapBuilder = new pTokensSwapBuilder(node)

  // create an EVM provider
  const evmProvider = new pTokensEvmProvider(EVM_PROVIDER)
  evmProvider.setPrivateKey(PRIVATE_KEY)

  // create a UTXO asset for BTC
  evmBuilder.setBlockchain(ChainId.EthereumMainnet)
  evmBuilder.setProvider(evmProvider)
  evmBuilder.setSymbol('pbtc')
  evmBuilder.setDecimals(18)
  const evmAsset = await evmBuilder.build()

  // create an Algorand asset for pBTC on Algorand Mainnet
  algorandBuilder.setBlockchain(ChainId.AlgorandMainnet)
  algorandBuilder.setProvider(evmProvider)
  algorandBuilder.setSymbol('pbtc')
  const algorandAsset = await evmBuilder.build()

  // build the swap
  swapBuilder.setSourceAsset(evmAsset)
  swapBuilder.addDestinationAsset(algorandAsset, ALGORAND_DESTINATION_ADDRESS)
  swapBuilder.setAmount(0.000001 * 10 ** 18)
  const swap = swapBuilder.build()

  try {
    // execute the swap and listen to events
    await swap
      .execute()
      .on('inputTxBroadcasted', (_) => console.info('inputTxBroadcasted', _))
      .on('inputTxConfirmed', (_) => console.info('inputTxConfirmed', _))
      .on('inputTxDetected', (_) => console.info('inputTxDetected', _))
      .on('outputTxDetected', (_) => console.info('outputTxDetected', _))
      .on('outputTxBroadcasted', (_) => console.info('outputTxBroadcasted', _))
      .on('outputTxConfirmed', (_) => console.info('outputTxConfirmed', _))
  } catch (err) {
    console.info('err', err)
  }
}

void pegOut()
```

Complete examples are available at [examples](https://github.com/provable-things/ptokens.js/tree/master/examples).

## Development

If you wish to contribute, please open a new Pull Request.

Technically speaking, this is a monorepo containing multiple packages. These are managed using [lerna](https://github.com/lerna/lerna). Typescript source code is transpiled and bundled using [Rollup](https://rollupjs.org/guide/en/).

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
