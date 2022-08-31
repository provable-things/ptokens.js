import { pTokensEosioAssetBuilder, pTokensEosioProvider } from '../src'
import { Blockchain, ChainId, Network } from 'ptokens-entities'

describe('EOSIO asset', () => {
  test('Should create an EOSIO asset without provider', () => {
    const builder = new pTokensEosioAssetBuilder()
    builder.setBlockchain(ChainId.EthereumMainnet)
    builder.setSymbol('SYM')
    const asset = builder.build()
    expect(asset.blockchain).toStrictEqual(Blockchain.Ethereum)
    expect(asset.network).toStrictEqual(Network.Mainnet)
    expect(asset.chainId).toStrictEqual(ChainId.EthereumMainnet)
    expect(asset.weight).toEqual(1)
  })

  test('Should create an EOSIO asset with provider', () => {
    const provider = new pTokensEosioProvider('eos-rpc-endpoint')
    provider.setPrivateKey('5K7ZPXDP5ptRZHF3DptSy7C7Quq7D78X82jQwBG8JVgnY3N4irG')
    const builder = new pTokensEosioAssetBuilder()
    builder.setBlockchain(ChainId.EthereumMainnet)
    builder.setSymbol('SYM')
    builder.setProvider(provider)
    const asset = builder.build()
    expect(asset.blockchain).toStrictEqual(Blockchain.Ethereum)
    expect(asset.network).toStrictEqual(Network.Mainnet)
    expect(asset.chainId).toStrictEqual(ChainId.EthereumMainnet)
    expect(asset.weight).toEqual(1)
    expect(asset['provider']).toEqual(provider)
  })

  test('Should not create an EOSIO asset without blockchain data', () => {
    const builder = new pTokensEosioAssetBuilder()
    try {
      builder.build()
      fail()
    } catch (err) {
      expect(err.message).toStrictEqual('Missing chain ID')
    }
  })

  test('Should not create an EOSIO asset without symbol', () => {
    const builder = new pTokensEosioAssetBuilder()
    try {
      builder.setBlockchain(ChainId.EthereumMainnet)
      builder.build()
      fail()
    } catch (err) {
      expect(err.message).toStrictEqual('Missing symbol')
    }
  })
})
