import { pTokensUtxoAssetBuilder, pTokensBlockstreamUtxoProvider } from '../src'
import { Blockchain, ChainId, Network } from 'ptokens-entities'

describe('UTXO asset', () => {
  test('Should create an UTXO asset without provider', () => {
    const builder = new pTokensUtxoAssetBuilder()
    builder.setBlockchain(ChainId.EthereumMainnet)
    builder.setSymbol('eth')
    const asset = builder.build()
    expect(asset.blockchain).toStrictEqual(Blockchain.Ethereum)
    expect(asset.network).toStrictEqual(Network.Mainnet)
    expect(asset.chainId).toStrictEqual(ChainId.EthereumMainnet)
    expect(asset.weight).toEqual(1)
  })

  test('Should create an UTXO asset with Blockstream provider', () => {
    const provider = new pTokensBlockstreamUtxoProvider('blockstream-provider')
    const builder = new pTokensUtxoAssetBuilder()
    builder.setBlockchain(ChainId.EthereumMainnet)
    builder.setSymbol('eth')
    builder.setProvider(provider)
    const asset = builder.build()
    expect(asset.blockchain).toStrictEqual(Blockchain.Ethereum)
    expect(asset.network).toStrictEqual(Network.Mainnet)
    expect(asset.chainId).toStrictEqual(ChainId.EthereumMainnet)
    expect(asset.weight).toEqual(1)
    expect(asset['provider']).toEqual(provider)
  })

  test('Should not create an UTXO asset without blockchain data', () => {
    const builder = new pTokensUtxoAssetBuilder()
    try {
      builder.build()
      fail()
    } catch (err) {
      expect(err.message).toStrictEqual('Missing chain ID')
    }
  })

  test('Should not create an UTXO asset without symbol', () => {
    const builder = new pTokensUtxoAssetBuilder()
    builder.setBlockchain(ChainId.BitcoinMainnet)
    try {
      builder.build()
      fail()
    } catch (err) {
      expect(err.message).toStrictEqual('Missing symbol')
    }
  })
})
