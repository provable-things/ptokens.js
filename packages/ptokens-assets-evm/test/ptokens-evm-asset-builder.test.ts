import Web3 from 'web3'
import { pTokensEvmAssetBuilder, pTokensEvmProvider } from '../src'

jest.mock('web3')

describe('UTXO asset', () => {
  test('Should create an EVM asset without provider', () => {
    const builder = new pTokensEvmAssetBuilder()
    builder.setChainId('chain-id').setBlockchain('btc')
    const asset = builder.build()
    expect(asset.blockchain).toStrictEqual('btc')
    expect(asset.chainId).toStrictEqual('chain-id')
    expect(asset.weight).toEqual(1)
  })
  test('Should create an EVM asset with provider', () => {
    const provider = new pTokensEvmProvider(new Web3())
    const builder = new pTokensEvmAssetBuilder()
    builder.setChainId('chain-id').setBlockchain('btc')
    builder.setProvider(provider)
    const asset = builder.build()
    expect(asset.blockchain).toStrictEqual('btc')
    expect(asset.chainId).toStrictEqual('chain-id')
    expect(asset.weight).toEqual(1)
    expect(asset['provider']).toEqual(provider)
  })
  test('Should not create an EVM asset without chain ID', () => {
    const builder = new pTokensEvmAssetBuilder()
    builder.setBlockchain('btc')
    try {
      builder.build()
      fail()
    } catch (err) {
      expect(err.message).toStrictEqual('Missing chain ID')
    }
  })
})
