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
  const provider = new pTokensNodeProvider(PNETWORK_NODE)
  const node = new pTokensNode(provider)
  const utxoBuilder = new pTokensUtxoAssetBuilder(node)
  const evmBuilder = new pTokensEvmAssetBuilder(node)
  const swapBuilder = new pTokensSwapBuilder(node)

  const utxoProvider = new pTokensBlockstreamUtxoProvider(UTXO_PROVIDER, {
    'Content-Type': 'text/plain',
  })
  utxoBuilder.setBlockchain(ChainId.BitcoinMainnet)
  utxoBuilder.setSymbol('btc')
  utxoBuilder.setProvider(utxoProvider)
  const utxoAsset = await utxoBuilder.build()

  evmBuilder.setBlockchain(ChainId.EthereumMainnet)
  evmBuilder.setSymbol('pbtc')
  evmBuilder.setDecimals(18)
  const evmAsset = await evmBuilder.build()

  swapBuilder.setSourceAsset(utxoAsset)
  swapBuilder.addDestinationAsset(evmAsset, EVM_DESTINATION_ADDRESS)
  swapBuilder.setAmount(0.001)
  const swap = swapBuilder.build()

  try {
    await swap
      .execute()
      .on('depositAddress', (_addr) => console.info('depositAddress', _addr))
      .on('inputTxDetected', (_) => console.info('inputTxDetected', _))
      .on('inputTxProcessed', (_) => console.info('inputTxProcessed', _))
      .on('outputTxDetected', (_) => console.info('outputTxDetected', _))
      .on('outputTxProcessed', (_) => console.info('outputTxProcessed', _))
  } catch (err) {
    console.info('err', err.message)
  }
}

void pegIn()
