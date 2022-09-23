import { pTokensSwapBuilder } from '../src/index'
import { pTokensNode, pTokensNodeProvider } from 'ptokens-node'
import { pTokensEvmAsset } from 'ptokens-assets-evm'
import { ChainId } from 'ptokens-entities'

jest.mock('ptokens-node')

describe('pTokensSwapBuilder', () => {
  it('Should build a swap', () => {
    const node = new pTokensNode(new pTokensNodeProvider('node-provider'))
    const builder = new pTokensSwapBuilder(node)
    const originatingToken = new pTokensEvmAsset({
      node,
      symbol: 'A',
      assetInfo: {
        chainId: ChainId.BscMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenInternalAddress: 'token-internal-address',
        isSystemToken: false,
        vaultAddress: 'vault-contract-address',
      },
    })
    const destinationToken = new pTokensEvmAsset({
      node,
      symbol: 'B',
      assetInfo: {
        chainId: ChainId.EthereumMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenInternalAddress: 'token-internal-address',
        isSystemToken: false,
        vaultAddress: 'vault-contract-address',
      },
    })
    builder.setSourceAsset(originatingToken)
    builder.addDestinationAsset(destinationToken, 'destination-address', Buffer.from('user-data'))
    builder.setAmount(1)
    const swap = builder.build()
    expect(builder.destinationAssets).toEqual([destinationToken])
    expect(builder.amount).toEqual(1)
    expect(builder.node).toStrictEqual(node)
    expect(swap.amount).toBe(1)
    expect(swap.node).toStrictEqual(node)
    expect(swap.sourceAsset).toStrictEqual(originatingToken)
    expect(swap.destinationAssets).toStrictEqual([destinationToken])
  })

  it('Should not build a swap if source asset is missing', () => {
    const node = new pTokensNode(new pTokensNodeProvider('node-provider'))
    const builder = new pTokensSwapBuilder(node)
    const destinationToken = new pTokensEvmAsset({
      node,
      symbol: 'B',
      assetInfo: {
        chainId: ChainId.EthereumMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenInternalAddress: 'token-internal-address',
        isSystemToken: false,
        vaultAddress: 'vault-contract-address',
      },
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

  it('Should not build a swap if amount is missing', () => {
    const node = new pTokensNode(new pTokensNodeProvider('node-provider'))
    const builder = new pTokensSwapBuilder(node)
    const originatingToken = new pTokensEvmAsset({
      node,
      symbol: 'A',
      assetInfo: {
        chainId: ChainId.EthereumMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenInternalAddress: 'token-internal-address',
        isSystemToken: false,
        vaultAddress: 'vault-contract-address',
      },
    })
    const destinationToken = new pTokensEvmAsset({
      node,
      symbol: 'B',
      assetInfo: {
        chainId: ChainId.EthereumMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenInternalAddress: 'token-internal-address',
        isSystemToken: false,
        vaultAddress: 'vault-contract-address',
      },
    })
    builder.setSourceAsset(originatingToken)
    builder.addDestinationAsset(destinationToken, 'destination-address')
    try {
      builder.build()
      fail()
    } catch (err) {
      expect(err.message).toBe('Missing amount')
    }
  })

  it('Should not build a swap if there are no destination assets', () => {
    const node = new pTokensNode(new pTokensNodeProvider('node-provider'))
    const builder = new pTokensSwapBuilder(node)
    const originatingToken = new pTokensEvmAsset({
      node,
      symbol: 'A',
      assetInfo: {
        chainId: ChainId.EthereumMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenInternalAddress: 'token-internal-address',
        isSystemToken: false,
        vaultAddress: 'vault-contract-address',
      },
    })
    builder.setSourceAsset(originatingToken)
    builder.setAmount(1)
    try {
      builder.build()
      fail()
    } catch (err) {
      expect(err.message).toBe('Missing destination assets')
    }
  })
})
