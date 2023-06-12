import { pTokensSwapBuilder } from '../src/index'
import { pTokensNode, pTokensNodeProvider } from 'ptokens-node'
import { pTokensEvmAsset } from 'ptokens-assets-evm'
import { ChainId } from 'ptokens-constants'

const nativeToXFees = {
  networkFee: 1e18,
  minNodeOperatorFee: 2e18,
  basisPoints: {
    nativeToHost: 30,
    nativeToNative: 40,
  },
}

const hostToXFees = {
  networkFee: 5e18,
  minNodeOperatorFee: 6e18,
  basisPoints: {
    hostToHost: 70,
    hostToNative: 80,
  },
}

jest.mock('ptokens-node')

describe('pTokensSwapBuilder', () => {
  test('Should build a native to native swap charging proportional protocol fees', () => {
    const node = new pTokensNode(new pTokensNodeProvider('node-provider'))
    const builder = new pTokensSwapBuilder(node)
    const originatingToken = new pTokensEvmAsset({
      node,
      symbol: 'A',
      assetInfo: {
        chainId: ChainId.BscMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenReference: '0XC0FFEE',
        decimals: 18,
        vaultAddress: 'vault-contract-address',
        fees: nativeToXFees,
      },
    })
    const destinationToken = new pTokensEvmAsset({
      node,
      symbol: 'B',
      assetInfo: {
        chainId: ChainId.EthereumMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenReference: 'c0ffee',
        decimals: 18,
        vaultAddress: 'vault-contract-address',
        fees: hostToXFees,
      },
    })
    builder.setSourceAsset(originatingToken)
    builder.addDestinationAsset(
      destinationToken,
      '0x28B2A40b6046850a569843cF740f15CF29792Ac2',
      Buffer.from('user-data')
    )
    builder.setAmount(1000)
    const swap = builder.build()
    expect(builder.destinationAssets).toEqual([destinationToken])
    expect(builder.amount).toEqual('1000')
    expect(builder.node).toStrictEqual(node)
    expect(swap.networkFees).toStrictEqual('5')
    expect(swap.protocolFees).toEqual('4')
    expect(swap.expectedOutputAmount).toEqual('991')
    expect(swap.amount).toBe('1000')
    expect(swap.node).toStrictEqual(node)
    expect(swap.sourceAsset).toStrictEqual(originatingToken)
    expect(swap.destinationAssets).toStrictEqual([destinationToken])
  })

  test('Should build a native to host swap charging proportional protocol fees', () => {
    const node = new pTokensNode(new pTokensNodeProvider('node-provider'))
    const builder = new pTokensSwapBuilder(node)
    const originatingToken = new pTokensEvmAsset({
      node,
      symbol: 'A',
      assetInfo: {
        chainId: ChainId.BscMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenReference: '0XC0FFEE',
        decimals: 18,
        vaultAddress: 'vault-contract-address',
        fees: nativeToXFees,
      },
    })
    const destinationToken = new pTokensEvmAsset({
      node,
      symbol: 'B',
      assetInfo: {
        chainId: ChainId.EthereumMainnet,
        isNative: false,
        tokenAddress: 'token-contract-address',
        tokenReference: 'c0ffee',
        decimals: 18,
        vaultAddress: 'vault-contract-address',
        fees: hostToXFees,
      },
    })
    builder.setSourceAsset(originatingToken)
    builder.addDestinationAsset(
      destinationToken,
      '0x28B2A40b6046850a569843cF740f15CF29792Ac2',
      Buffer.from('user-data')
    )
    builder.setAmount(1000)
    const swap = builder.build()
    expect(builder.destinationAssets).toEqual([destinationToken])
    expect(builder.amount).toEqual('1000')
    expect(builder.node).toStrictEqual(node)
    expect(swap.networkFees).toStrictEqual('5')
    expect(swap.protocolFees).toEqual('3')
    expect(swap.expectedOutputAmount).toEqual('992')
    expect(swap.amount).toBe('1000')
    expect(swap.node).toStrictEqual(node)
    expect(swap.sourceAsset).toStrictEqual(originatingToken)
    expect(swap.destinationAssets).toStrictEqual([destinationToken])
  })

  test('Should build a host to native swap charging proportional protocol fees', () => {
    const node = new pTokensNode(new pTokensNodeProvider('node-provider'))
    const builder = new pTokensSwapBuilder(node)
    const originatingToken = new pTokensEvmAsset({
      node,
      symbol: 'A',
      assetInfo: {
        chainId: ChainId.BscMainnet,
        isNative: false,
        tokenAddress: 'token-contract-address',
        tokenReference: '0XC0FFEE',
        decimals: 18,
        vaultAddress: 'vault-contract-address',
        fees: hostToXFees,
      },
    })
    const destinationToken = new pTokensEvmAsset({
      node,
      symbol: 'B',
      assetInfo: {
        chainId: ChainId.EthereumMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenReference: 'c0ffee',
        decimals: 18,
        vaultAddress: 'vault-contract-address',
        fees: hostToXFees,
      },
    })
    builder.setSourceAsset(originatingToken)
    builder.addDestinationAsset(
      destinationToken,
      '0x28B2A40b6046850a569843cF740f15CF29792Ac2',
      Buffer.from('user-data')
    )
    builder.setAmount(1000)
    const swap = builder.build()
    expect(builder.destinationAssets).toEqual([destinationToken])
    expect(builder.amount).toEqual('1000')
    expect(builder.node).toStrictEqual(node)
    expect(swap.networkFees).toStrictEqual('5')
    expect(swap.protocolFees).toEqual('8')
    expect(swap.expectedOutputAmount).toEqual('987')
    expect(swap.amount).toBe('1000')
    expect(swap.node).toStrictEqual(node)
    expect(swap.sourceAsset).toStrictEqual(originatingToken)
    expect(swap.destinationAssets).toStrictEqual([destinationToken])
  })

  test('Should build a host to host swap charging proportional protocol fees', () => {
    const node = new pTokensNode(new pTokensNodeProvider('node-provider'))
    const builder = new pTokensSwapBuilder(node)
    const originatingToken = new pTokensEvmAsset({
      node,
      symbol: 'A',
      assetInfo: {
        chainId: ChainId.BscMainnet,
        isNative: false,
        tokenAddress: 'token-contract-address',
        tokenReference: '0XC0FFEE',
        decimals: 18,
        vaultAddress: 'vault-contract-address',
        fees: hostToXFees,
      },
    })
    const destinationToken = new pTokensEvmAsset({
      node,
      symbol: 'B',
      assetInfo: {
        chainId: ChainId.EthereumMainnet,
        isNative: false,
        tokenAddress: 'token-contract-address',
        tokenReference: 'c0ffee',
        decimals: 18,
        vaultAddress: 'vault-contract-address',
        fees: hostToXFees,
      },
    })
    builder.setSourceAsset(originatingToken)
    builder.addDestinationAsset(
      destinationToken,
      '0x28B2A40b6046850a569843cF740f15CF29792Ac2',
      Buffer.from('user-data')
    )
    builder.setAmount(1000)
    const swap = builder.build()
    expect(builder.destinationAssets).toEqual([destinationToken])
    expect(builder.amount).toEqual('1000')
    expect(builder.node).toStrictEqual(node)
    expect(swap.networkFees).toStrictEqual('5')
    expect(swap.protocolFees).toEqual('7')
    expect(swap.expectedOutputAmount).toEqual('988')
    expect(swap.amount).toBe('1000')
    expect(swap.node).toStrictEqual(node)
    expect(swap.sourceAsset).toStrictEqual(originatingToken)
    expect(swap.destinationAssets).toStrictEqual([destinationToken])
  })

  test('Should build a native to native swap charging minimum protocol fees', () => {
    const node = new pTokensNode(new pTokensNodeProvider('node-provider'))
    const builder = new pTokensSwapBuilder(node)
    const originatingToken = new pTokensEvmAsset({
      node,
      symbol: 'A',
      assetInfo: {
        chainId: ChainId.BscMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenReference: '0XC0FFEE',
        decimals: 18,
        vaultAddress: 'vault-contract-address',
        fees: nativeToXFees,
      },
    })
    const destinationToken = new pTokensEvmAsset({
      node,
      symbol: 'B',
      assetInfo: {
        chainId: ChainId.EthereumMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenReference: 'c0ffee',
        decimals: 18,
        vaultAddress: 'vault-contract-address',
        fees: hostToXFees,
      },
    })
    builder.setSourceAsset(originatingToken)
    builder.addDestinationAsset(
      destinationToken,
      '0x28B2A40b6046850a569843cF740f15CF29792Ac2',
      Buffer.from('user-data')
    )
    builder.setAmount(100)
    const swap = builder.build()
    expect(builder.destinationAssets).toEqual([destinationToken])
    expect(builder.amount).toEqual('100')
    expect(builder.node).toStrictEqual(node)
    expect(swap.networkFees).toStrictEqual('5')
    expect(swap.protocolFees).toEqual('2')
    expect(swap.expectedOutputAmount).toEqual('93')
    expect(swap.amount).toBe('100')
    expect(swap.node).toStrictEqual(node)
    expect(swap.sourceAsset).toStrictEqual(originatingToken)
    expect(swap.destinationAssets).toStrictEqual([destinationToken])
  })

  test('Should not build a swap if fees schema is wrong', () => {
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
        fees: hostToXFees, // wrong on purpose
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
        fees: {
          networkFee: 1e18,
          minNodeOperatorFee: 3e18,
          basisPoints: {
            nativeToHost: 10,
            nativeToNative: 20,
          },
        },
      },
    })
    builder.setSourceAsset(originatingToken)
    builder.addDestinationAsset(
      destinationToken,
      '0x28B2A40b6046850a569843cF740f15CF29792Ac2',
      Buffer.from('user-data')
    )
    builder.setAmount(1000)
    try {
      builder.build()
      fail()
    } catch (err) {
      expect(err.message).toBe('Invalid basis points')
    }
  })

  test('Should not build a swap if the amount is unsufficient to cover fees', () => {
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
        fees: nativeToXFees,
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
        fees: nativeToXFees,
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
      expect(err.message).toBe('Insufficient amount to cover fees')
    }
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
        fees: nativeToXFees,
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
        fees: nativeToXFees,
      },
    })
    builder.setSourceAsset(originatingToken)
    builder.addDestinationAsset(
      destinationToken,
      '0x28B2A40b6046850a569843cF740f15CF29792Ac2',
      Buffer.from('user-data')
    )
    builder.setAmount(1000)
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
        fees: nativeToXFees,
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
        fees: nativeToXFees,
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

  test('Should not build a swap for a pegout of PTLOS to BSC', () => {
    const node = new pTokensNode(new pTokensNodeProvider('node-provider'))
    const builder = new pTokensSwapBuilder(node)
    const originatingToken = new pTokensEvmAsset({
      node,
      symbol: 'PTLOS',
      assetInfo: {
        chainId: ChainId.BscMainnet,
        isNative: false,
        tokenAddress: '0x7825e833d495f3d1c28872415a4aee339d26ac88',
        tokenReference: 'token-internal-address',
        decimals: 18,
        vaultAddress: 'vault-contract-address',
        fees: hostToXFees,
      },
    })
    const destinationToken = new pTokensEvmAsset({
      node,
      symbol: 'PTLOS',
      assetInfo: {
        chainId: ChainId.BscMainnet,
        isNative: false,
        tokenAddress: 'ptoken-contract-address',
        tokenReference: 'token-internal-address',
        decimals: 18,
        vaultAddress: 'vault-contract-address',
        fees: hostToXFees,
      },
    })
    builder.setSourceAsset(originatingToken)
    try {
      builder.setAmount('10')
      builder.addDestinationAsset(
        destinationToken,
        '0x28B2A40b6046850a569843cF740f15CF29792Ac2',
        Buffer.from('user-data')
      )
      builder.build()
      fail()
    } catch (err) {
      expect(err.message).toBe('Invalid swap')
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
        fees: nativeToXFees,
      },
    })
    builder.addDestinationAsset(destinationToken, '0x28B2A40b6046850a569843cF740f15CF29792Ac2')
    builder.setAmount(1000)
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
        fees: nativeToXFees,
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
        fees: nativeToXFees,
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
        fees: nativeToXFees,
      },
    })
    builder.setSourceAsset(originatingToken)
    builder.setAmount(1000)
    try {
      builder.build()
      fail()
    } catch (err) {
      expect(err.message).toBe('Missing destination assets')
    }
  })
})
