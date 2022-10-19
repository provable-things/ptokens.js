This package permits to build a `pTokensSwap` from a `pTokensSwapBuilder` instance. The created `pTokensSwap` object can be called with a specific method `execute()` to initiate the swap: the method return a [PromiEvent](https://www.npmjs.com/package/promievent), a particular Promise that can also emit events that can be listened.

In particular, given two pTokens Assets already build, the swap takes place as follows:
```ts
const PNETWORK_NODE = 'https://pnetwork-node-2a.eu.ngrok.io/v3'
const DESTINATION_ADDRESS: 'destination-address'

// create a pTokensNodeProvider and pTokensNode to interact with pNetwork
const provider = new pTokensNodeProvider(PNETWORK_NODE)
const node = new pTokensNode(provider)

// create swap builder
const swapBuilder = new pTokensSwapBuilder(node)

// create assets
let sourceAsset: pTokensAsset
let destinationAsset: pTokensAsset

// ...

// build the swap
swapBuilder.setSourceAsset(sourceAsset)
swapBuilder.addDestinationAsset(destinationAsset, DESTINATION_ADDRESS)
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
```

See the full documentation [here](https://provable-things.github.io/ptokens.js/modules/pTokens_Swap.html).
