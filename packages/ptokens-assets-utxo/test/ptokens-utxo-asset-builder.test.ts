import { pTokensUtxoAssetBuilder, pTokensBlockstreamUtxoProvider } from '../src'
import { Blockchain, ChainId, Network } from 'ptokens-entities'
import { pTokensNode, pTokensNodeProvider } from 'ptokens-node'

describe('UTXO asset', () => {
  test('Should create an UTXO asset without provider', async () => {
    const assetInfo = {
      chainId: ChainId.EthereumMainnet,
      isNative: false,
      tokenAddress: '123456789',
      tokenInternalAddress: 'token-internal-address',
      isSystemToken: false,
    }
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfoByChainId').mockResolvedValue(assetInfo)
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const builder = new pTokensUtxoAssetBuilder(node)
    builder.setBlockchain(ChainId.EthereumMainnet)
    builder.setSymbol('eth')
    const asset = await builder.build()
    expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'eth', ChainId.EthereumMainnet)
    expect(asset.blockchain).toStrictEqual(Blockchain.Ethereum)
    expect(asset.network).toStrictEqual(Network.Mainnet)
    expect(asset.chainId).toStrictEqual(ChainId.EthereumMainnet)
    expect(asset.weight).toEqual(1)
  })

  test('Should create an UTXO asset with Blockstream provider', async () => {
    const assetInfo = {
      chainId: ChainId.AlgorandMainnet,
      isNative: false,
      tokenAddress: '123456789',
      tokenInternalAddress: 'token-internal-address',
      isSystemToken: false,
    }
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfoByChainId').mockResolvedValue(assetInfo)
    const provider = new pTokensBlockstreamUtxoProvider('blockstream-provider')
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const builder = new pTokensUtxoAssetBuilder(node)
    builder.setBlockchain(ChainId.EthereumMainnet)
    builder.setSymbol('eth')
    builder.setProvider(provider)
    const asset = await builder.build()
    expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'eth', ChainId.EthereumMainnet)
    expect(asset.blockchain).toStrictEqual(Blockchain.Ethereum)
    expect(asset.network).toStrictEqual(Network.Mainnet)
    expect(asset.chainId).toStrictEqual(ChainId.EthereumMainnet)
    expect(asset.weight).toEqual(1)
    expect(asset['provider']).toEqual(provider)
  })

  test('Should not create an UTXO asset without blockchain data', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const builder = new pTokensUtxoAssetBuilder(node)
    try {
      await builder.build()
      fail()
    } catch (err) {
      expect(err.message).toStrictEqual('Missing chain ID')
    }
  })

  test('Should not create an UTXO asset without symbol', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const builder = new pTokensUtxoAssetBuilder(node)
    builder.setBlockchain(ChainId.BitcoinMainnet)
    try {
      await builder.build()
      fail()
    } catch (err) {
      expect(err.message).toStrictEqual('Missing symbol')
    }
  })
})
