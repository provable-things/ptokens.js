import { pTokensSwapBuilder } from '../src/index'
import { pTokensEvmAsset } from 'ptokens-assets-evm'
import { NetworkId } from 'ptokens-constants'

describe('pTokensSwapBuilder', () => {
  test('Should build a swap', () => {
    const builder = new pTokensSwapBuilder()
    const originatingToken = new pTokensEvmAsset({
      assetInfo: {
        networkId: NetworkId.SepoliaTestnet,
        symbol: 'A',
        assetTokenAddress: 'token-contract-address',
        decimals: 18,
        underlyingAssetDecimals: 18,
        underlyingAssetNetworkId: NetworkId.SepoliaTestnet,
        underlyingAssetSymbol: 'SYM',
        underlyingAssetName: 'Symbol',
        underlyingAssetTokenAddress: 'underlying-asset-token-address',
      },
    })
    const destinationToken = new pTokensEvmAsset({
      assetInfo: {
        networkId: NetworkId.SepoliaTestnet,
        symbol: 'B',
        assetTokenAddress: 'token-contract-address',
        decimals: 18,
        underlyingAssetDecimals: 18,
        underlyingAssetNetworkId: NetworkId.SepoliaTestnet,
        underlyingAssetSymbol: 'SYM',
        underlyingAssetName: 'Symbol',
        underlyingAssetTokenAddress: 'underlying-asset-token-address',
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
    expect(builder.routerAddress).toStrictEqual('0x009B71922e2d52CE013df4a380B29A33aF7B3894')
    expect(builder.destinationAssets).toEqual([destinationToken])
    expect(builder.amount).toEqual('1000')
    expect(swap.expectedOutputAmount).toEqual('1000')
    expect(swap.amount).toBe('1000')
    expect(swap.sourceAsset).toStrictEqual(originatingToken)
    expect(swap.destinationAssets).toStrictEqual([destinationToken])
  })

  test('Should build a swap with a custom routerAddress', () => {
    const builder = new pTokensSwapBuilder()
    const routerAddress = '0xaBcC0E8E185E2D7338FB4EC283f198C7a0AC39D4'
    const originatingToken = new pTokensEvmAsset({
      assetInfo: {
        networkId: NetworkId.SepoliaTestnet,
        symbol: 'A',
        assetTokenAddress: 'token-contract-address',
        decimals: 18,
        underlyingAssetDecimals: 18,
        underlyingAssetNetworkId: NetworkId.SepoliaTestnet,
        underlyingAssetSymbol: 'SYM',
        underlyingAssetName: 'Symbol',
        underlyingAssetTokenAddress: 'underlying-asset-token-address',
      },
    })
    const destinationToken = new pTokensEvmAsset({
      assetInfo: {
        networkId: NetworkId.SepoliaTestnet,
        symbol: 'B',
        assetTokenAddress: 'token-contract-address',
        decimals: 18,
        underlyingAssetDecimals: 18,
        underlyingAssetNetworkId: NetworkId.SepoliaTestnet,
        underlyingAssetSymbol: 'SYM',
        underlyingAssetName: 'Symbol',
        underlyingAssetTokenAddress: 'underlying-asset-token-address',
      },
    })
    builder.setRouterAddress(routerAddress)
    builder.setSourceAsset(originatingToken)
    builder.addDestinationAsset(
      destinationToken,
      '0x28B2A40b6046850a569843cF740f15CF29792Ac2',
      Buffer.from('user-data')
    )
    builder.setAmount(1000)
    const swap = builder.build()
    expect(builder.routerAddress).toStrictEqual(routerAddress)
    expect(builder.destinationAssets).toEqual([destinationToken])
    expect(builder.amount).toEqual('1000')
    expect(swap.expectedOutputAmount).toEqual('1000')
    expect(swap.amount).toBe('1000')
    expect(swap.sourceAsset).toStrictEqual(originatingToken)
    expect(swap.destinationAssets).toStrictEqual([destinationToken])
  })

  test('Should not build a swap if destination address is not valid', () => {
    const builder = new pTokensSwapBuilder()
    const originatingToken = new pTokensEvmAsset({
      assetInfo: {
        networkId: NetworkId.SepoliaTestnet,
        symbol: 'A',
        assetTokenAddress: 'token-contract-address',
        decimals: 18,
        underlyingAssetDecimals: 18,
        underlyingAssetNetworkId: NetworkId.SepoliaTestnet,
        underlyingAssetSymbol: 'SYM',
        underlyingAssetName: 'Symbol',
        underlyingAssetTokenAddress: 'underlying-asset-token-address',
      },
    })
    const destinationToken = new pTokensEvmAsset({
      assetInfo: {
        networkId: NetworkId.SepoliaTestnet,
        symbol: 'B',
        assetTokenAddress: 'token-contract-address',
        decimals: 18,
        underlyingAssetDecimals: 18,
        underlyingAssetNetworkId: NetworkId.SepoliaTestnet,
        underlyingAssetSymbol: 'SYM',
        underlyingAssetName: 'Symbol',
        underlyingAssetTokenAddress: 'underlying-asset-token-address',
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
    const builder = new pTokensSwapBuilder()
    const routerAddress = '0xF4F5C35D50b788AF5Ae74584628b45F302Cd81e7'
    const destinationToken = new pTokensEvmAsset({
      assetInfo: {
        networkId: NetworkId.SepoliaTestnet,
        symbol: 'B',
        assetTokenAddress: 'token-contract-address',
        decimals: 18,
        underlyingAssetDecimals: 18,
        underlyingAssetNetworkId: NetworkId.SepoliaTestnet,
        underlyingAssetSymbol: 'SYM',
        underlyingAssetName: 'Symbol',
        underlyingAssetTokenAddress: 'underlying-asset-token-address',
      },
    })
    builder.setRouterAddress(routerAddress)
    builder.addDestinationAsset(destinationToken, '0x28B2A40b6046850a569843cF740f15CF29792Ac2')
    builder.setAmount(1000)
    try {
      builder.build()
      fail()
    } catch (err) {
      expect(err.message).toBe('Missing source asset')
    }
  })

  test('Should not build a swap if router address is invalid', () => {
    const builder = new pTokensSwapBuilder()
    const routerAddress = 'invalid-router-address'
    const originatingToken = new pTokensEvmAsset({
      assetInfo: {
        networkId: NetworkId.SepoliaTestnet,
        symbol: 'A',
        assetTokenAddress: 'token-contract-address',
        decimals: 18,
        underlyingAssetDecimals: 18,
        underlyingAssetNetworkId: NetworkId.SepoliaTestnet,
        underlyingAssetSymbol: 'SYM',
        underlyingAssetName: 'Symbol',
        underlyingAssetTokenAddress: 'underlying-asset-token-address',
      },
    })
    const destinationToken = new pTokensEvmAsset({
      assetInfo: {
        networkId: NetworkId.SepoliaTestnet,
        symbol: 'B',
        assetTokenAddress: 'token-contract-address',
        decimals: 18,
        underlyingAssetDecimals: 18,
        underlyingAssetNetworkId: NetworkId.SepoliaTestnet,
        underlyingAssetSymbol: 'SYM',
        underlyingAssetName: 'Symbol',
        underlyingAssetTokenAddress: 'underlying-asset-token-address',
      },
    })
    builder.setRouterAddress(routerAddress)
    builder.setSourceAsset(originatingToken)
    builder.addDestinationAsset(destinationToken, '0x28B2A40b6046850a569843cF740f15CF29792Ac2')
    builder.setAmount(1000)
    try {
      builder.build()
      fail()
    } catch (err) {
      expect(err.message).toBe('Invalid router address')
    }
  })

  test('Should not build a swap if amount is missing', () => {
    const builder = new pTokensSwapBuilder()
    const routerAddress = '0xF4F5C35D50b788AF5Ae74584628b45F302Cd81e7'
    const originatingToken = new pTokensEvmAsset({
      assetInfo: {
        networkId: NetworkId.SepoliaTestnet,
        symbol: 'A',
        assetTokenAddress: 'token-contract-address',
        decimals: 18,
        underlyingAssetDecimals: 18,
        underlyingAssetNetworkId: NetworkId.SepoliaTestnet,
        underlyingAssetSymbol: 'SYM',
        underlyingAssetName: 'Symbol',
        underlyingAssetTokenAddress: 'underlying-asset-token-address',
      },
    })
    const destinationToken = new pTokensEvmAsset({
      assetInfo: {
        networkId: NetworkId.SepoliaTestnet,
        symbol: 'B',
        assetTokenAddress: 'token-contract-address',
        decimals: 18,
        underlyingAssetDecimals: 18,
        underlyingAssetNetworkId: NetworkId.SepoliaTestnet,
        underlyingAssetSymbol: 'SYM',
        underlyingAssetName: 'Symbol',
        underlyingAssetTokenAddress: 'underlying-asset-token-address',
      },
    })
    builder.setRouterAddress(routerAddress)
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
    const builder = new pTokensSwapBuilder()
    const routerAddress = '0xF4F5C35D50b788AF5Ae74584628b45F302Cd81e7'
    const originatingToken = new pTokensEvmAsset({
      assetInfo: {
        networkId: NetworkId.SepoliaTestnet,
        symbol: 'A',
        assetTokenAddress: 'token-contract-address',
        decimals: 18,
        underlyingAssetDecimals: 18,
        underlyingAssetNetworkId: NetworkId.SepoliaTestnet,
        underlyingAssetSymbol: 'SYM',
        underlyingAssetName: 'Symbol',
        underlyingAssetTokenAddress: 'underlying-asset-token-address',
      },
    })
    builder.setRouterAddress(routerAddress)
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
