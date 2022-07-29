import Web3 from 'web3'
import { pTokensEvmAssetBuilder, pTokensEvmProvider } from '../src'
import { Blockchain, ChainId, Network } from 'ptokens-entities'

jest.mock('web3')

describe('EVM asset', () => {
  test('Should create an EVM asset without provider', () => {
    const builder = new pTokensEvmAssetBuilder()
    builder.setBlockchain(ChainId.EthereumMainnet)
    builder.setSymbol('SYM')
    const asset = builder.build()
    expect(asset.blockchain).toStrictEqual(Blockchain.Ethereum)
    expect(asset.network).toStrictEqual(Network.Mainnet)
    expect(asset.chainId).toStrictEqual(ChainId.EthereumMainnet)
    expect(asset.weight).toEqual(1)
  })

  test('Should create an EVM asset with provider', () => {
    const provider = new pTokensEvmProvider(new Web3())
    const builder = new pTokensEvmAssetBuilder()
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

  test('Should not create an EVM asset without blockchain data', () => {
    const builder = new pTokensEvmAssetBuilder()
    try {
      builder.build()
      fail()
    } catch (err) {
      expect(err.message).toStrictEqual('Missing chain ID')
    }
  })

  test('Should not create an EVM asset without symbol', () => {
    const builder = new pTokensEvmAssetBuilder()
    try {
      builder.setBlockchain(ChainId.EthereumMainnet)
      builder.build()
      fail()
    } catch (err) {
      expect(err.message).toStrictEqual('Missing symbol')
    }
  })
})
