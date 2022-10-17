const {
  ChainId,
  pTokensSwapBuilder,
  pTokensEvmAssetBuilder,
  pTokensNode,
  pTokensNodeProvider,
  pTokensEvmProvider,
  pTokensAlgorandAssetBuilder,
} = require('../packages/ptokens')

const PNETWORK_NODE = 'https://pnetwork-node-2a.eu.ngrok.io/v3'
const EVM_PROVIDER = 'evm-provider-url'
const PRIVATE_KEY = 'private-key'
const ALGORAND_DESTINATION_ADDRESS = 'destination-address'

async function pegOut() {
  // create a pTokensNodeProvider and pTokensNode to interact with pNetwork
  const provider = new pTokensNodeProvider(PNETWORK_NODE)
  const node = new pTokensNode(provider)

  // create builders
  const evmBuilder = new pTokensEvmAssetBuilder(node)
  const algorandBuilder = new pTokensAlgorandAssetBuilder(node)
  const swapBuilder = new pTokensSwapBuilder(node)

  // create an EVM provider
  const evmProvider = new pTokensEvmProvider(EVM_PROVIDER)
  evmProvider.setPrivateKey(PRIVATE_KEY)

  // create a UTXO asset for BTC
  evmBuilder.setBlockchain(ChainId.EthereumMainnet)
  evmBuilder.setProvider(evmProvider)
  evmBuilder.setSymbol('pbtc')
  evmBuilder.setDecimals(18)
  const evmAsset = await evmBuilder.build()

  // create an Algorand asset for pBTC on Algorand Mainnet
  algorandBuilder.setBlockchain(ChainId.AlgorandMainnet)
  algorandBuilder.setSymbol('pbtc')
  const algorandAsset = await algorandBuilder.build()

  // build the swap
  swapBuilder.setSourceAsset(evmAsset)
  swapBuilder.addDestinationAsset(algorandAsset, ALGORAND_DESTINATION_ADDRESS)
  swapBuilder.setAmount(0.000001 * 10 ** 18)
  const swap = swapBuilder.build()

  try {
    // execute the swap and listen to events
    await swap
      .execute()
      .on('inputTxDetected', (_) => console.info('inputTxDetected', _))
      .on('inputTxProcessed', (_) => console.info('inputTxProcessed', _))
      .on('outputTxDetected', (_) => console.info('outputTxDetected', _))
      .on('outputTxProcessed', (_) => console.info('outputTxProcessed', _))
  } catch (err) {
    console.info('err', err)
  }
}

void pegOut()
