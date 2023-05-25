import { pTokensSwapBuilder } from '../src/index'
import { pTokensNode, pTokensNodeProvider } from 'ptokens-node'
import { pTokensEvmAsset } from 'ptokens-assets-evm'
import { ChainId } from 'ptokens-constants'

jest.mock('ptokens-node')

const NATIVE_TO_X_FEES = {
  networkFee: 1e18,
  minNodeOperatorFee: 2e18,
  basisPoints: {
    nativeToHost: 30,
    nativeToNative: 40,
  },
}

const HOST_TO_X_FEES = {
  networkFee: 5e18,
  minNodeOperatorFee: 6e18,
  basisPoints: {
    hostToHost: 70,
    hostToNative: 80,
  },
}

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
        fees: NATIVE_TO_X_FEES,
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
        fees: HOST_TO_X_FEES,
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
    expect(builder.networkFees).toStrictEqual('5')
    expect(builder.protocolFees).toEqual('4')
    expect(builder.expectedOutputAmount).toEqual('991')
    expect(builder.isAmountSufficient()).toBeTruthy()
    expect(builder.destinationAssets).toEqual([destinationToken])
    expect(builder.amount).toEqual('1000')
    expect(builder.node).toStrictEqual(node)
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
        fees: NATIVE_TO_X_FEES,
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
        fees: HOST_TO_X_FEES,
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
    expect(builder.networkFees).toStrictEqual('5')
    expect(builder.protocolFees).toEqual('3')
    expect(builder.expectedOutputAmount).toEqual('992')
    expect(builder.isAmountSufficient()).toBeTruthy()
    expect(builder.destinationAssets).toEqual([destinationToken])
    expect(builder.amount).toEqual('1000')
    expect(builder.node).toStrictEqual(node)
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
        fees: HOST_TO_X_FEES,
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
        fees: HOST_TO_X_FEES,
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
    expect(builder.networkFees).toStrictEqual('5')
    expect(builder.protocolFees).toEqual('8')
    expect(builder.expectedOutputAmount).toEqual('987')
    expect(builder.isAmountSufficient()).toBeTruthy()
    expect(builder.destinationAssets).toEqual([destinationToken])
    expect(builder.amount).toEqual('1000')
    expect(builder.node).toStrictEqual(node)
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
        fees: HOST_TO_X_FEES,
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
        fees: HOST_TO_X_FEES,
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
    expect(builder.networkFees).toStrictEqual('5')
    expect(builder.protocolFees).toEqual('7')
    expect(builder.expectedOutputAmount).toEqual('988')
    expect(builder.isAmountSufficient()).toBeTruthy()
    expect(builder.destinationAssets).toEqual([destinationToken])
    expect(builder.amount).toEqual('1000')
    expect(builder.node).toStrictEqual(node)
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
        fees: NATIVE_TO_X_FEES,
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
        fees: HOST_TO_X_FEES,
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
    expect(builder.networkFees).toStrictEqual('5')
    expect(builder.protocolFees).toEqual('2')
    expect(builder.expectedOutputAmount).toEqual('93')
    expect(builder.isAmountSufficient()).toBeTruthy()
    expect(builder.destinationAssets).toEqual([destinationToken])
    expect(builder.amount).toEqual('100')
    expect(builder.node).toStrictEqual(node)
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
        fees: HOST_TO_X_FEES, // wrong on purpose
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
        fees: NATIVE_TO_X_FEES,
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
        fees: NATIVE_TO_X_FEES,
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
        fees: NATIVE_TO_X_FEES,
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
        fees: NATIVE_TO_X_FEES,
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
        fees: NATIVE_TO_X_FEES,
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
        fees: NATIVE_TO_X_FEES,
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
        fees: NATIVE_TO_X_FEES,
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
        fees: NATIVE_TO_X_FEES,
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
        fees: NATIVE_TO_X_FEES,
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
        fees: NATIVE_TO_X_FEES,
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
