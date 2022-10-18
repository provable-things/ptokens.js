## Introduction
pTokens.js is the library that allows interoperability with the pNetwork interacting with pNetwork bridges.
This library supports **only v2** bridges.

- It's entirely written in Typescript, but there are ready-to-use bundles to integrate it in your backend/frontend application.

- It's object-oriented designed and implementing the builder pattern to ease objects creation
- It permits host-to-host swaps, unleashing the pTokens to pTokens bridge feature.

## Installation
The package is published in the [npm registry](https://www.npmjs.com/package/ptokens).

Initiate your Javascript/Typescript project and install is as a dependency
```shell
$ npm i ptokens
```

## Usage
This is a working example where pBTC on Ethereum are pegged-out to pBTC on Algorand.

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
      .on('inputTxDetected', (_) => console.info('inputTxDetected', _))
      .on('inputTxProcessed', (_) => console.info('inputTxProcessed', _))
      .on('outputTxDetected', (_) => console.info('outputTxDetected', _))
      .on('outputTxProcessed', (_) => console.info('outputTxProcessed', _))
  } catch (err) {
    console.info('err', err)
  }
}

void pegOut()

```
Complete examples are available at [examples](https://github.com/provable-things/ptokens.js/tree/master/examples).

The full documentation can be found [here](https://provable-things.github.io/ptokens.js/).

## Development mode
If you wish to contribute, please open a new Pull Request.

Technically speaking, this is a monorepo containing multiple packages. These are managed using [lerna](https://github.com/lerna/lerna). Typescript source code is transpiled and bundled using [Rollup](https://rollupjs.org/guide/en/).

**Rollup** has the following option available
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
