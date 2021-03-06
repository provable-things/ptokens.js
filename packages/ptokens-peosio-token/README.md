# ptokens-peosio-token

Module for interacting only with pEosioToken.

&nbsp;

***

&nbsp;

### Installation:

```
npm install ptokens-peosio-token
```

&nbsp;

***

&nbsp;

### Usage:

```js
import { pEosioToken } from 'ptokens-peosio-token'
import { HttpProvider } from 'ptokens-providers' 
import { Node } from 'ptokens-node'

const peos = new pEosioToken({
  blockchain: 'ETH',
  network: 'testnet', // 'testnet' or 'mainnet', default 'testnet'
  pToken: 'pEOS',

  // if you want to be more detailed
  hostBlockchain: 'ETH',
  hostNetwork: 'testnet_ropsten', // possible values are testnet_jungle2, testnet_ropsten and mainnet
  nativeBlockchain: 'EOS'
  nativeNetwork: 'testnet'

  // optionals
  ethPrivateKey: 'Eth private key',
  ethProvider: 'Eth provider', // or instance of Web3 provider
  eosPrivateKey: 'Eos Private Key',
  eosRpc: 'https:/...' // or also an instance of JsonRpc
  eosSignatureProvider: '....' // instance of JsSignatureProvider
  defaultNode: new Node({
    pToken: 'pEOS',
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