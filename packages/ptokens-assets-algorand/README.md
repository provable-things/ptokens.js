This package permits to create a `pTokensAlgorandAsset` object for creating a swap.

A `pTokensAlgorandAsset` object can be created as follows:
```ts
const {
  ChainId,
  pTokensNode,
  pTokensNodeProvider,
  pTokensAlgorandAssetBuilder,
} = require('ptokens')

const PNETWORK_NODE = 'https://pnetwork-node-2a.eu.ngrok.io/v3'

// create a pTokensNodeProvider and pTokensNode to interact with pNetwork
const provider = new pTokensNodeProvider(PNETWORK_NODE)
const node = new pTokensNode(provider)

// create builder
const algorandBuilder = new pTokensAlgorandAssetBuilder(node)

// create an Algorand asset for pBTC on Algorand Mainnet
algorandBuilder.setBlockchain(ChainId.AlgorandMainnet)
algorandBuilder.setSymbol('pbtc')
const algorandAsset = await algorandBuilder.build()
```

See the full documentation [here](https://pnetwork-association.github.io/ptokens.js/modules/pTokens_Algorand_Asset.html).
