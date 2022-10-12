import { pTokensSwapBuilder } from '../src/index'
import { pTokensNode, pTokensNodeProvider } from 'ptokens-node'
import { pTokensEvmAsset } from 'ptokens-assets-evm'
import { ChainId } from 'ptokens-constants'

jest.mock('ptokens-node')

describe('pTokensSwapBuilder', () => {
  test('Should build a swap', () => {
    const node = new pTokensNode(new pTokensNodeProvider('node-provider'))
    const builder = new pTokensSwapBuilder(node)
    const originatingToken = new pTokensEvmAsset({
      node,
      symbol: 'A',
      assetInfo: {
        chainId: ChainId.BscMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        decimals: 18,
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
        tokenReference: 'token-internal-address',
        decimals: 18,
        vaultAddress: 'vault-contract-address',
      },
    })
    builder.setSourceAsset(originatingToken)
    builder.addDestinationAsset(
      destinationToken,
      '0x28B2A40b6046850a569843cF740f15CF29792Ac2',
      Buffer.from('user-data')
    )
    builder.setAmount(1)
    const swap = builder.build()
    expect(builder.destinationAssets).toEqual([destinationToken])
    expect(builder.amount).toEqual('1')
    expect(builder.node).toStrictEqual(node)
    expect(swap.amount).toBe('1')
    expect(swap.node).toStrictEqual(node)
    expect(swap.sourceAsset).toStrictEqual(originatingToken)
    expect(swap.destinationAssets).toStrictEqual([destinationToken])
  })

  test('Should not build a swap for uncorrelated tokens', () => {
    const node = new pTokensNode(new pTokensNodeProvider('node-provider'))
    const builder = new pTokensSwapBuilder(node)
    const originatingToken = new pTokensEvmAsset({
      node,
      symbol: 'A',
      assetInfo: {
        chainId: ChainId.BscMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address-a',
        decimals: 18,
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
        tokenReference: 'token-internal-address-b',
        decimals: 18,
        vaultAddress: 'vault-contract-address',
      },
    })
    builder.setSourceAsset(originatingToken)
    builder.addDestinationAsset(
      destinationToken,
      '0x28B2A40b6046850a569843cF740f15CF29792Ac2',
      Buffer.from('user-data')
    )
    builder.setAmount(1)
    try {
      builder.build()
      fail()
    } catch (err) {
      expect(err.message).toBe('Invalid swap')
    }
  })

  test('Should not build a swap if destination address is not valid', () => {
    const node = new pTokensNode(new pTokensNodeProvider('node-provider'))
    const builder = new pTokensSwapBuilder(node)
    const originatingToken = new pTokensEvmAsset({
      node,
      symbol: 'A',
      assetInfo: {
        chainId: ChainId.BscMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        decimals: 18,
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
        tokenReference: 'token-internal-address',
        decimals: 18,
        vaultAddress: 'vault-contract-address',
      },
    })
    builder.setSourceAsset(originatingToken)
    try {
      builder.addDestinationAsset(destinationToken, 'invalid-eth-address', Buffer.from('user-data'))
      fail()
    } catch (err) {
      expect(err.message).toBe('Invalid destination address')
    }
  })

  test('Should not build a swap if source asset is missing', () => {
    const node = new pTokensNode(new pTokensNodeProvider('node-provider'))
    const builder = new pTokensSwapBuilder(node)
    const destinationToken = new pTokensEvmAsset({
      node,
      symbol: 'B',
      assetInfo: {
        chainId: ChainId.EthereumMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        decimals: 18,
        vaultAddress: 'vault-contract-address',
      },
    })
    builder.addDestinationAsset(destinationToken, '0x28B2A40b6046850a569843cF740f15CF29792Ac2')
    builder.setAmount(1)
    try {
      builder.build()
      fail()
    } catch (err) {
      expect(err.message).toBe('Missing source asset')
    }
  })

  test('Should not build a swap if amount is missing', () => {
    const node = new pTokensNode(new pTokensNodeProvider('node-provider'))
    const builder = new pTokensSwapBuilder(node)
    const originatingToken = new pTokensEvmAsset({
      node,
      symbol: 'A',
      assetInfo: {
        chainId: ChainId.EthereumMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        decimals: 18,
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
        tokenReference: 'token-internal-address',
        decimals: 18,
        vaultAddress: 'vault-contract-address',
      },
    })
    builder.setSourceAsset(originatingToken)
    builder.addDestinationAsset(destinationToken, '0x28B2A40b6046850a569843cF740f15CF29792Ac2')
    try {
      builder.build()
      fail()
    } catch (err) {
      expect(err.message).toBe('Missing amount')
    }
  })

  test('Should not build a swap if there are no destination assets', () => {
    const node = new pTokensNode(new pTokensNodeProvider('node-provider'))
    const builder = new pTokensSwapBuilder(node)
    const originatingToken = new pTokensEvmAsset({
      node,
      symbol: 'A',
      assetInfo: {
        chainId: ChainId.EthereumMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        decimals: 18,
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
