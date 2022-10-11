import Web3 from 'web3'
import { pTokensEvmAssetBuilder, pTokensEvmProvider } from '../src'
import { Blockchain, ChainId, Network } from 'ptokens-constants'
import { pTokensNode, pTokensNodeProvider } from 'ptokens-node'

jest.mock('web3')

describe('EVM asset', () => {
  test('Should create an EVM asset without provider', async () => {
    const assetInfo = {
      chainId: ChainId.EthereumMainnet,
      isNative: false,
      tokenAddress: '123456789',
      tokenReference: 'token-internal-address',
    }
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfoByChainId').mockResolvedValue(assetInfo)
    const node = new pTokensNode(new pTokensNodeProvider('node-provider-url'))
    const builder = new pTokensEvmAssetBuilder(node)
    builder.setBlockchain(ChainId.EthereumMainnet)
    builder.setSymbol('SYM')
    const asset = await builder.build()
    expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', ChainId.EthereumMainnet)
    expect(asset.blockchain).toStrictEqual(Blockchain.Ethereum)
    expect(asset.network).toStrictEqual(Network.Mainnet)
    expect(asset.chainId).toStrictEqual(ChainId.EthereumMainnet)
    expect(asset.weight).toEqual(1)
  })

  test('Should create an EVM asset with provider', async () => {
    const assetInfo = {
      chainId: ChainId.EthereumMainnet,
      isNative: false,
      tokenAddress: '123456789',
      tokenReference: 'token-internal-address',
    }
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfoByChainId').mockResolvedValue(assetInfo)
    const provider = new pTokensEvmProvider(new Web3())
    const node = new pTokensNode(new pTokensNodeProvider('node-provider-url'))
    const builder = new pTokensEvmAssetBuilder(node)
    builder.setBlockchain(ChainId.EthereumMainnet)
    builder.setSymbol('SYM')
    builder.setProvider(provider)
    const asset = await builder.build()
    expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', ChainId.EthereumMainnet)
    expect(asset.blockchain).toStrictEqual(Blockchain.Ethereum)
    expect(asset.network).toStrictEqual(Network.Mainnet)
    expect(asset.chainId).toStrictEqual(ChainId.EthereumMainnet)
    expect(asset.weight).toEqual(1)
    expect(asset['provider']).toEqual(provider)
  })

  test('Should not create an EVM asset without blockchain data', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('node-provider-url'))
    const builder = new pTokensEvmAssetBuilder(node)
    try {
      await builder.build()
      fail()
    } catch (err) {
      expect(err.message).toStrictEqual('Missing chain ID')
    }
  })

  test('Should not create an EVM asset without symbol', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('node-provider-url'))
    const builder = new pTokensEvmAssetBuilder(node)
    try {
      builder.setBlockchain(ChainId.EthereumMainnet)
      await builder.build()
      fail()
    } catch (err) {
      expect(err.message).toStrictEqual('Missing symbol')
    }
  })
})
