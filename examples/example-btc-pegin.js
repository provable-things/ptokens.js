const {
  ChainId,
  pTokensSwapBuilder,
  pTokensEvmAssetBuilder,
  pTokensUtxoAssetBuilder,
  pTokensBlockstreamUtxoProvider,
  pTokensNode,
  pTokensNodeProvider,
} = require('../packages/ptokens')

const PNETWORK_NODE = 'https://pnetwork-node-2a.eu.ngrok.io/v3'
const UTXO_PROVIDER = 'https://blockstream.info/mainnet/api/'
const EVM_DESTINATION_ADDRESS = 'destination-address'

async function pegIn() {
  // create a pTokensNodeProvider and pTokensNode to interact with pNetwork
  const provider = new pTokensNodeProvider(PNETWORK_NODE)
  const node = new pTokensNode(provider)

  // create builders
  const utxoBuilder = new pTokensUtxoAssetBuilder(node)
  const evmBuilder = new pTokensEvmAssetBuilder(node)
  const swapBuilder = new pTokensSwapBuilder(node)

  // create a UTXO provider
  const utxoProvider = new pTokensBlockstreamUtxoProvider(UTXO_PROVIDER, {
    'Content-Type': 'text/plain',
  })

  // create a UTXO asset for BTC
  utxoBuilder.setBlockchain(ChainId.BitcoinMainnet)
  utxoBuilder.setSymbol('btc')
  utxoBuilder.setProvider(utxoProvider)
  const utxoAsset = await utxoBuilder.build()

  // create an EVM asset for pBTC on Ethereum Mainnet
  evmBuilder.setBlockchain(ChainId.EthereumMainnet)
  evmBuilder.setSymbol('pbtc')
  evmBuilder.setDecimals(18)
  const evmAsset = await evmBuilder.build()

  // build the swap
  swapBuilder.setSourceAsset(utxoAsset)
  swapBuilder.addDestinationAsset(evmAsset, EVM_DESTINATION_ADDRESS)
  swapBuilder.setAmount(0.001)
  const swap = swapBuilder.build()

  try {
    // execute the swap and listen to events
    await swap
      .execute()
      .on('depositAddress', (_addr) => console.info('depositAddress', _addr))
      .on('inputTxBroadcasted', (_) => console.info('inputTxBroadcasted', _))
      .on('inputTxConfirmed', (_) => console.info('inputTxConfirmed', _))
      .on('inputTxDetected', (_) => console.info('inputTxDetected', _))
      .on('outputTxDetected', (_) => console.info('outputTxDetected', _))
      .on('outputTxBroadcasted', (_) => console.info('outputTxBroadcasted', _))
      .on('outputTxConfirmed', (_) => console.info('outputTxConfirmed', _))
  } catch (err) {
    console.info('err', err.message)
  }
}

void pegIn()
