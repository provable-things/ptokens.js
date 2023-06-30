import { pTokensEvmAsset } from 'ptokens-assets-evm'
import { NetworkId } from 'ptokens-constants'

import { pTokensSwapBuilder } from '../src/index'

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
      routerAddress: 'router-address',
      stateManagerAddress: 'state-manager-address',
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
      routerAddress: 'router-address',
      stateManagerAddress: 'state-manager-address',
    })
    builder.setSourceAsset(originatingToken)
    builder.addDestinationAsset(
      destinationToken,
      '0x28B2A40b6046850a569843cF740f15CF29792Ac2',
      Buffer.from('user-data').toString('hex')
    )
    builder.setAmount(1000)
    const swap = builder.build()
    expect(builder.destinationAssets).toEqual([destinationToken])
    expect(builder.amount).toEqual('1000')
    expect(swap.expectedOutputAmount).toEqual('1000')
    expect(swap.amount).toBe('1000')
    expect(swap.sourceAsset).toStrictEqual(originatingToken)
    expect(swap.destinationAssets).toStrictEqual([destinationToken])
  })

  test('Should build a swap with a custom routerAddress', () => {
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
      routerAddress: 'router-address',
      stateManagerAddress: 'state-manager-address',
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
      routerAddress: 'router-address',
      stateManagerAddress: 'state-manager-address',
    })
    builder.setSourceAsset(originatingToken)
    builder.addDestinationAsset(
      destinationToken,
      '0x28B2A40b6046850a569843cF740f15CF29792Ac2',
      Buffer.from('user-data').toString('hex')
    )
    builder.setAmount(1000)
    const swap = builder.build()
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
      routerAddress: 'router-address',
      stateManagerAddress: 'state-manager-address',
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
      routerAddress: 'router-address',
      stateManagerAddress: 'state-manager-address',
    })
    builder.setSourceAsset(originatingToken)
    try {
      builder.addDestinationAsset(destinationToken, 'invalid-eth-address', Buffer.from('user-data').toString('hex'))
      fail()
    } catch (err) {
      expect(err.message).toBe('Invalid destination address')
    }
  })

  test('Should not build a swap if source asset is missing', () => {
    const builder = new pTokensSwapBuilder()
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
      routerAddress: 'router-address',
      stateManagerAddress: 'state-manager-address',
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
      routerAddress: 'router-address',
      stateManagerAddress: 'state-manager-address',
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
      routerAddress: 'router-address',
      stateManagerAddress: 'state-manager-address',
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
      routerAddress: 'router-address',
      stateManagerAddress: 'state-manager-address',
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
