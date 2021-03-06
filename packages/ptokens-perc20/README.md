# ptokens-perc20

It allows to easily convert any ERC20 tokens on the Ethereum blockchain into their pTokenized equivalents on the another blockchain.

&nbsp;

***

&nbsp;

### Installation:

```
npm install ptokens-perc20
```

&nbsp;

***

&nbsp;

### Usage:

```js
import { pERC20 } from 'ptokens-perc20'
import { HttpProvider } from 'ptokens-providers' 
import { Node } from 'ptokens-node'

const perc20 = new pERC20({
  blockchain: 'EOS',
  network: 'testnet', // 'testnet' or 'mainnet', default 'testnet'

  pToken: 'pWETH',
  // if you want to send ether instead of weth, you can use 'pETH'

  // if you want to be more detailed
  hostBlockchain: 'EOS',
  hostNetwork: 'mainnet',
  nativeBlockchain: 'ETH'
  nativeNetwork: 'mainnet'

  ethPrivateKey: 'Eth private key',
  ethProvider: 'Eth provider', // or instance of Web3 provider
  eosPrivateKey: 'Eos Private Key',
  eosRpc: 'https:/...' // or also an instance of JsonRpc
  eosSignatureProvider: '....' // instance of JsSignatureProvider
  defaultNode: new Node({
    pToken: 'pBTC',
    blockchain: 'ETH',
    provider: new HttpProvider(
      'node endpoint',
      {
        'Access-Control-Allow-Origin': '*',
        ...
      }
    )
  })
})
```