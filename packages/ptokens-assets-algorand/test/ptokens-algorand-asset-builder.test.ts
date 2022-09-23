import { pTokensAlgorandAssetBuilder } from '../src'
import { Blockchain, ChainId, Network } from 'ptokens-entities'
import { pTokensNode, pTokensNodeProvider } from 'ptokens-node'

describe('Algorand asset', () => {
  test('Should create an Algorand asset without provider', async () => {
    const assetInfo = {
      chainId: ChainId.AlgorandMainnet,
      isNative: false,
      tokenAddress: '123456789',
      tokenInternalAddress: 'token-internal-address',
      isSystemToken: false,
    }
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfoByChainId').mockResolvedValue(assetInfo)
    const node = new pTokensNode(new pTokensNodeProvider('node-provider-url'))
    const builder = new pTokensAlgorandAssetBuilder(node)
    builder.setBlockchain(ChainId.AlgorandMainnet)
    builder.setSymbol('SYM')
    const asset = await builder.build()
    expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', ChainId.AlgorandMainnet)
    expect(asset.blockchain).toStrictEqual(Blockchain.Algorand)
    expect(asset.network).toStrictEqual(Network.Mainnet)
    expect(asset.chainId).toStrictEqual(ChainId.AlgorandMainnet)
    expect(asset.weight).toEqual(1)
    expect(asset.assetInfo).toStrictEqual(assetInfo)
  })

  // test('Should create an Algorand asset with provider', () => {
  //   const provider = new pTokensAlgorandProvider('eos-rpc-endpoint')
  //   provider.setPrivateKey('5K7ZPXDP5ptRZHF3DptSy7C7Quq7D78X82jQwBG8JVgnY3N4irG')
  //   const builder = new pTokensAlgorandAssetBuilder()
  //   builder.setBlockchain(ChainId.EthereumMainnet)
  //   builder.setSymbol('SYM')
  //   builder.setProvider(provider)
  //   const asset = builder.build()
  //   expect(asset.blockchain).toStrictEqual(Blockchain.Ethereum)
  //   expect(asset.network).toStrictEqual(Network.Mainnet)
  //   expect(asset.chainId).toStrictEqual(ChainId.EthereumMainnet)
  //   expect(asset.weight).toEqual(1)
  //   expect(asset['provider']).toEqual(provider)
  // })

  test('Should not create an Algorand asset without blockchain data', async () => {
    const nodeProvider = new pTokensNodeProvider('node-provider-url')
    const node = new pTokensNode(nodeProvider)
    const builder = new pTokensAlgorandAssetBuilder(node)
    try {
      await builder.build()
      fail()
    } catch (err) {
      expect(err.message).toStrictEqual('Missing chain ID')
    }
  })

  test('Should not create an Algorand asset without symbol', async () => {
    const nodeProvider = new pTokensNodeProvider('node-provider-url')
    const node = new pTokensNode(nodeProvider)
    const builder = new pTokensAlgorandAssetBuilder(node)
    try {
      builder.setBlockchain(ChainId.AlgorandMainnet)
      await builder.build()
      fail()
    } catch (err) {
      expect(err.message).toStrictEqual('Missing symbol')
    }
  })
})
