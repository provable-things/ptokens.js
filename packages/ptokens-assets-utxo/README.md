This package permits to create a `pTokensUtxoAsset` object for creating a swap.

A `pTokensUtxoAsset` object can be created as follows:
```ts
const {
  ChainId,
  pTokensNode,
  pTokensNodeProvider,
  pTokensUtxoAssetBuilder,
} = require('ptokens')

const PNETWORK_NODE = 'https://pnetwork-node-2a.eu.ngrok.io/v3'

// create a pTokensNodeProvider and pTokensNode to interact with pNetwork
const provider = new pTokensNodeProvider(PNETWORK_NODE)
const node = new pTokensNode(provider)

// create builders
const utxoBuilder = new pTokensUtxoAssetBuilder(node)

// create a UTXO asset for BTC on Bitcoin Mainnet
utxoBuilder.setBlockchain(ChainId.BitcoinMainnet)
utxoBuilder.setSymbol('btc')
const utxoAsset = await utxoBuilder.build()
```

See the full documentation [here](https://pnetwork-association.github.io/ptokens.js/modules/pTokens_UTXO_asset.html).
