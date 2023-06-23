This package permits to create a `pTokensEvmAsset` object for creating a swap.

A `pTokensEvmAsset` object can be created as follows:
```ts
const {
  NetworkId,
  pTokensNode,
  pTokensNodeProvider,
  pTokensEvmAssetBuilder,
} = require('ptokens')

const PNETWORK_NODE = 'https://pnetwork-node-2a.eu.ngrok.io/v3'

// create a pTokensNodeProvider and pTokensNode to interact with pNetwork
const provider = new pTokensNodeProvider(PNETWORK_NODE)
const node = new pTokensNode(provider)

// create builders
const evmBuilder = new pTokensEvmAssetBuilder(node)

// create an EVM asset for pBTC on Sepolia Testnet
evmBuilder.setBlockchain(NetworkId.EthereumMainnet)
evmBuilder.setSymbol('pbtc')
const evmAsset = await evmBuilder.build()
```

See the full documentation [here](https://pnetwork-association.github.io/ptokens.js/modules/pTokens_EVM_asset.html).
