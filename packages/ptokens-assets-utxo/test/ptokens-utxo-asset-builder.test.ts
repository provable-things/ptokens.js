import { pTokensUtxoAssetBuilder, pTokensBlockstreamUtxoProvider } from '../src'
import { Blockchain, ChainId, Network } from 'ptokens-constants'
import { pTokensNode, pTokensNodeProvider } from 'ptokens-node'

const nativeToXFees = {
  networkFee: 1e18,
  minNodeOperatorFee: 2e18,
  basisPoints: {
    nativeToHost: 30,
    nativeToNative: 40,
  },
}

describe('UTXO asset', () => {
  test('Should create an UTXO asset without provider', async () => {
    const assetInfo = {
      chainId: ChainId.BitcoinMainnet,
      isNative: true,
      tokenAddress: '123456789',
      tokenReference: 'token-internal-address',
      fees: nativeToXFees,
    }
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfoByChainId').mockResolvedValue(assetInfo)
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const builder = new pTokensUtxoAssetBuilder(node)
    builder.setBlockchain(ChainId.BitcoinMainnet)
    builder.setSymbol('BTC')
    const asset = await builder.build()
    expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'BTC', ChainId.BitcoinMainnet)
    expect(asset.blockchain).toStrictEqual(Blockchain.Bitcoin)
    expect(asset.network).toStrictEqual(Network.Mainnet)
    expect(asset.chainId).toStrictEqual(ChainId.BitcoinMainnet)
    expect(asset.weight).toEqual(1)
    expect(asset.provider).toEqual(undefined)
  })

  test('Should create an UTXO asset with Blockstream provider', async () => {
    const assetInfo = {
      chainId: ChainId.BitcoinMainnet,
      isNative: true,
      tokenAddress: '123456789',
      tokenReference: 'token-internal-address',
      fees: nativeToXFees,
    }
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfoByChainId').mockResolvedValue(assetInfo)
    const provider = new pTokensBlockstreamUtxoProvider('blockstream-provider')
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const builder = new pTokensUtxoAssetBuilder(node)
    builder.setBlockchain(ChainId.BitcoinMainnet)
    builder.setSymbol('BTC')
    builder.setProvider(provider)
    const asset = await builder.build()
    expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'BTC', ChainId.BitcoinMainnet)
    expect(asset.blockchain).toStrictEqual(Blockchain.Bitcoin)
    expect(asset.network).toStrictEqual(Network.Mainnet)
    expect(asset.chainId).toStrictEqual(ChainId.BitcoinMainnet)
    expect(asset.weight).toEqual(1)
    expect(asset.provider).toEqual(provider)
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
