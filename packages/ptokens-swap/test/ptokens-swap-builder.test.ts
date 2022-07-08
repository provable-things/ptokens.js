import { pTokensSwapBuilder } from '../src/index'
import { pTokensNode, pTokensNodeProvider, Status } from 'ptokens-node'
import { pTokensEvmAsset } from 'ptokens-assets-evm'

jest.mock('ptokens-node')

describe('pTokensSwapBuilder', () => {
  it('Should build a swap', () => {
    const node = new pTokensNode(new pTokensNodeProvider('node-provider'))
    const builder = new pTokensSwapBuilder(node)
    const originatingToken = new pTokensEvmAsset({
      symbol: 'A',
      chainId: 'originating-chain-id',
      blockchain: 'originating-blockchain',
      network: 'originating-network',
    })
    const destinationToken = new pTokensEvmAsset({
      symbol: 'B',
      chainId: 'destination-chain-id',
      blockchain: 'destination-blockchain',
      network: 'destination-network',
    })
    builder.setSourceAsset(originatingToken)
    builder.addDestinationAsset(destinationToken, 'destination-address', Buffer.from('user-data'))
    builder.setAmount(1)
    const swap = builder.build()
    expect(swap.amount).toBe(1)
    expect(swap.node).toStrictEqual(node)
    expect(swap.sourceAsset).toStrictEqual(originatingToken)
    expect(swap.destinationAssets).toStrictEqual([destinationToken])
  })

  it('Should not build a swap if source asset is missing', () => {
    const node = new pTokensNode(new pTokensNodeProvider('node-provider'))
    const builder = new pTokensSwapBuilder(node)
    const destinationToken = new pTokensEvmAsset({
      symbol: 'B',
      chainId: 'destination-chain-id',
      blockchain: 'destination-blockchain',
      network: 'destination-network',
    })
    builder.addDestinationAsset(destinationToken, 'destination-address')
    builder.setAmount(1)
    try {
      builder.build()
      fail()
    } catch (err) {
      expect(err.message).toBe('Missing source asset')
    }
  })
})
