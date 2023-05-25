import { pTokensEosioAssetBuilder, pTokensEosioProvider } from '../src'
import { Blockchain, ChainId, Network } from 'ptokens-constants'
import { pTokensNode, pTokensNodeProvider } from 'ptokens-node'

const hostToXFees = {
  networkFee: 5e18,
  minNodeOperatorFee: 6e18,
  basisPoints: {
    hostToHost: 70,
    hostToNative: 80,
  },
}

describe('EOSIO asset', () => {
  test('Should create an EOSIO asset without provider', async () => {
    const assetInfo = {
      chainId: ChainId.EosMainnet,
      isNative: false,
      tokenAddress: '123456789',
      tokenReference: 'token-internal-address',
      fees: hostToXFees,
    }
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfoByChainId').mockResolvedValue(assetInfo)
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const builder = new pTokensEosioAssetBuilder(node)
    builder.setBlockchain(ChainId.EosMainnet)
    builder.setSymbol('SYM')
    builder.setDecimals(8)
    const asset = await builder.build()
    expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', ChainId.EosMainnet)
    expect(asset.blockchain).toStrictEqual(Blockchain.Eos)
    expect(asset.network).toStrictEqual(Network.Mainnet)
    expect(asset.chainId).toStrictEqual(ChainId.EosMainnet)
    expect(asset.weight).toEqual(1)
    expect(asset.provider).toEqual(undefined)
    expect(asset['_customActions']).toStrictEqual(undefined)
  })

  test('Should create an EOSIO asset with provider', async () => {
    const assetInfo = {
      chainId: ChainId.EosMainnet,
      isNative: false,
      tokenAddress: '123456789',
      tokenReference: 'token-internal-address',
      decimals: 8,
      fees: hostToXFees,
    }
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfoByChainId').mockResolvedValue(assetInfo)
    const provider = new pTokensEosioProvider('eos-rpc-endpoint')
    provider.setPrivateKey('5K7ZPXDP5ptRZHF3DptSy7C7Quq7D78X82jQwBG8JVgnY3N4irG')
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const builder = new pTokensEosioAssetBuilder(node)
    builder.setBlockchain(ChainId.EosMainnet)
    builder.setSymbol('SYM')
    builder.setProvider(provider)
    const asset = await builder.build()
    expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', ChainId.EosMainnet)
    expect(asset.blockchain).toStrictEqual(Blockchain.Eos)
    expect(asset.network).toStrictEqual(Network.Mainnet)
    expect(asset.chainId).toStrictEqual(ChainId.EosMainnet)
    expect(asset.weight).toEqual(1)
    expect(asset.provider).toEqual(provider)
    expect(asset['_customActions']).toStrictEqual(undefined)
  })

  test('Should not create an EOSIO asset without blockchain data', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const builder = new pTokensEosioAssetBuilder(node)
    try {
      await builder.build()
      fail()
    } catch (err) {
      expect(err.message).toStrictEqual('Missing chain ID')
    }
  })

  test('Should not create an EOSIO asset without symbol', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const builder = new pTokensEosioAssetBuilder(node)
    try {
      builder.setBlockchain(ChainId.EosMainnet)
      await builder.build()
      fail()
    } catch (err) {
      expect(err.message).toStrictEqual('Missing symbol')
    }
  })
})
