const {
  ChainId,
  pTokensSwapBuilder,
  pTokensEvmAssetBuilder,
  pTokensNode,
  pTokensNodeProvider,
  pTokensEvmProvider,
  pTokensUtxoAssetBuilder,
} = require('../packages/ptokens')

const PNETWORK_NODE = 'https://pnetwork-node-2a.eu.ngrok.io/v3'
const EVM_PROVIDER = 'evm-provider-url'
const PRIVATE_KEY = 'private-key'
const UTXO_DESTINATION_ADDRESS = 'destination-address'

async function pegOut() {
  // create a pTokensNodeProvider and pTokensNode to interact with pNetwork
  const provider = new pTokensNodeProvider(PNETWORK_NODE)
  const node = new pTokensNode(provider)

  // create builders
  const evmBuilder = new pTokensEvmAssetBuilder(node)
  const utxoBuilder = new pTokensUtxoAssetBuilder(node)
  const swapBuilder = new pTokensSwapBuilder(node)

  // create an EVM provider
  const evmProvider = new pTokensEvmProvider(EVM_PROVIDER)
  evmProvider.setPrivateKey(PRIVATE_KEY)

  // create an EVM asset for pBTC on Ethereum Mainnet
  evmBuilder.setBlockchain(ChainId.EthereumMainnet)
  evmBuilder.setProvider(evmProvider)
  evmBuilder.setSymbol('pbtc')
  evmBuilder.setDecimals(18)
  const evmAsset = await evmBuilder.build()

  // create a UTXO asset for BTC
  utxoBuilder.setBlockchain(ChainId.BitcoinMainnet)
  utxoBuilder.setSymbol('btc')
  const utxoAsset = await evmBuilder.build()

  // build the swap
  swapBuilder.setSourceAsset(evmAsset)
  swapBuilder.addDestinationAsset(utxoAsset, UTXO_DESTINATION_ADDRESS)
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
}

void pegOut()
