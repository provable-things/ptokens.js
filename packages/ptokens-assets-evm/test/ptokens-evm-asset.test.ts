import { pTokensEvmAssetBuilder } from '../src'

describe('UTXO asset', () => {
  test('Should create an UTXO asset', () => {
    const builder = new pTokensEvmAssetBuilder()
    builder.setChainId('chain-id').setBlockchain('btc')
    const asset = builder.build()
    expect(asset.blockchain).toStrictEqual('btc')
    expect(asset.chainId).toStrictEqual('chain-id')
    expect(asset.weight).toEqual(1)
  })
})
