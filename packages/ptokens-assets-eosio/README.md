This package permits to create a `pTokensEosioAsset` object for creating a swap.

A `pTokensEosioAsset` object can be created as follows:
```ts
const {
  ChainId,
  pTokensNode,
  pTokensNodeProvider,
  pTokensEosioAssetBuilder,
} = require('ptokens')

const PNETWORK_NODE = 'https://pnetwork-node-2a.eu.ngrok.io/v3'

// create a pTokensNodeProvider and pTokensNode to interact with pNetwork
const provider = new pTokensNodeProvider(PNETWORK_NODE)
const node = new pTokensNode(provider)

// create builders
const eosioBuilder = new pTokensEosioAssetBuilder(node)

// create an EOSIO asset for pBTC on EOS Mainnet
eosioBuilder.setBlockchain(ChainId.EosMainnet)
eosioBuilder.setSymbol('pbtc')
const eosioAsset = await eosioBuilder.build()
```

See the full documentation [here](https://pnetwork-association.github.io/ptokens.js/modules/pTokens_EOSIO_asset.html).
