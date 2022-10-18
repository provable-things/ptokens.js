This package permits to create a pTokens node object for interacting with the pNetwork.

A pNetwork node can be created as follows:
```ts
const { pTokensNode, pTokensNodeProvider } = require('ptokens')
const PNETWORK_NODE = 'https://pnetwork-node-2a.eu.ngrok.io/v3'

// create a pTokensNodeProvider and pTokensNode to interact with pNetwork
const provider = new pTokensNodeProvider(PNETWORK_NODE)
const node = new pTokensNode(provider)
```

See the full documentation [here](https://provable-things.github.io/ptokens.js/modules/pTokens_Node.html).