import BigNumber from 'bignumber.js'
import { NetworkId } from 'ptokens-constants'

import { pTokensSwap, pTokensSwapBuilder } from '../src/index'

import { pTokenAssetFailingMock, pTokenAssetMock, pTokensProviderMock } from './mocks/ptoken-asset'

jest.setTimeout(10000)

describe('pTokensSwap', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Should swap asset without user data', async () => {
    const sourceAsset = new pTokenAssetMock({
      assetInfo: {
        networkId: NetworkId.SepoliaTestnet,
        symbol: 'SOURCE',
        assetTokenAddress: 'token-contract-address',
        underlyingAssetDecimals: 18,
        underlyingAssetNetworkId: NetworkId.SepoliaTestnet,
        underlyingAssetSymbol: 'SYM',
        underlyingAssetName: 'Symbol',
        underlyingAssetTokenAddress: 'underlying-asset-token-address',
      },
      routerAddress: 'router-address',
      stateManagerAddress: 'state-manager-address',
    })
    const assetProvider = new pTokensProviderMock()
    const destinationAsset = new pTokenAssetMock({
      assetInfo: {
        networkId: NetworkId.GoerliTestnet,
        symbol: 'DESTINATION',
        assetTokenAddress: 'token-contract-address',
        underlyingAssetDecimals: 18,
        underlyingAssetNetworkId: NetworkId.SepoliaTestnet,
        underlyingAssetSymbol: 'SYM',
        underlyingAssetName: 'Symbol',
        underlyingAssetTokenAddress: 'underlying-asset-token-address',
      },
      provider: assetProvider,
      routerAddress: 'router-address',
      stateManagerAddress: 'state-manager-address',
    })
    const swapSpy = jest.spyOn(sourceAsset, 'swap')
    const waitForTransactionConfirmationSpy = jest.spyOn(assetProvider, 'waitForTransactionConfirmation')
    const swap = new pTokensSwap(
      sourceAsset,
      [{ asset: destinationAsset, destinationAddress: 'destination-address' }],
      BigNumber(10)
    )
    const promi = swap.execute()
    let inputTxBroadcasted = false,
      inputTxConfirmed = false,
      operationQueued = false,
      operationExecuted = false
    let inputTxBroadcastedObj, inputTxConfirmedObj, outputTxQueuedObj, outputTxExecutedObj
    const ret = await promi
      .on('inputTxBroadcasted', (obj) => {
        inputTxBroadcastedObj = obj
        inputTxBroadcasted = true
      })
      .on('inputTxConfirmed', (obj) => {
        inputTxConfirmedObj = obj
        inputTxConfirmed = true
      })
      .on('operationQueued', (obj) => {
        outputTxQueuedObj = obj
        operationQueued = true
      })
      .on('operationExecuted', (obj) => {
        outputTxExecutedObj = obj
        operationExecuted = true
      })
    expect(swapSpy).toHaveBeenNthCalledWith(1, BigNumber(10), 'destination-address', NetworkId.GoerliTestnet, undefined)
    expect(waitForTransactionConfirmationSpy).toHaveBeenNthCalledWith(1, 'operation-executed-tx-hash')
    expect(inputTxBroadcasted).toBeTruthy()
    expect(inputTxBroadcastedObj).toStrictEqual({ txHash: 'originating-tx-hash' })
    expect(inputTxConfirmed).toBeTruthy()
    expect(inputTxConfirmedObj).toStrictEqual({ operationId: 'operation-id', txHash: 'originating-tx-hash' })
    expect(operationQueued).toBeTruthy()
    expect(outputTxQueuedObj).toStrictEqual({ operationId: 'operation-id', txHash: 'operation-queued-tx-hash' })
    expect(operationExecuted).toBeTruthy()
    expect(outputTxExecutedObj).toStrictEqual({ operationId: 'operation-id', txHash: 'operation-executed-tx-hash' })
    expect(ret).toStrictEqual({ operationId: 'operation-id', txHash: 'operation-executed-tx-hash' })
  })

  test('Should swap asset with user data', async () => {
    const builder = new pTokensSwapBuilder()
    const sourceAsset = new pTokenAssetMock({
      assetInfo: {
        networkId: NetworkId.SepoliaTestnet,
        symbol: 'SOURCE',
        assetTokenAddress: 'token-contract-address',
        underlyingAssetDecimals: 18,
        underlyingAssetNetworkId: NetworkId.SepoliaTestnet,
        underlyingAssetSymbol: 'SYM',
        underlyingAssetName: 'Symbol',
        underlyingAssetTokenAddress: 'underlying-asset-token-address',
      },
      routerAddress: 'router-address',
      stateManagerAddress: 'state-manager-address',
    })
    const assetProvider = new pTokensProviderMock()
    const destinationAsset = new pTokenAssetMock({
      assetInfo: {
        networkId: NetworkId.GoerliTestnet,
        symbol: 'DESTINATION',
        assetTokenAddress: 'token-contract-address',
        underlyingAssetDecimals: 18,
        underlyingAssetNetworkId: NetworkId.SepoliaTestnet,
        underlyingAssetSymbol: 'SYM',
        underlyingAssetName: 'Symbol',
        underlyingAssetTokenAddress: 'underlying-asset-token-address',
      },
      routerAddress: 'router-address',
      stateManagerAddress: 'state-manager-address',
      provider: assetProvider,
    })
    const swapSpy = jest.spyOn(sourceAsset, 'swap')
    const waitForTransactionConfirmationSpy = jest.spyOn(assetProvider, 'waitForTransactionConfirmation')
    builder
      .setAmount(123.456)
      .setSourceAsset(sourceAsset)
      .addDestinationAsset(
        destinationAsset,
        '0x28B2A40b6046850a569843cF740f15CF29792Ac2',
        Buffer.from('user-data').toString('hex')
      )
    const swap = builder.build()
    const promi = swap.execute()
    let inputTxBroadcasted = false,
      inputTxConfirmed = false,
      operationQueued = false,
      operationExecuted = false
    let inputTxBroadcastedObj, inputTxConfirmedObj, outputTxQueuedObj, outputTxExecutedObj
    const ret = await promi
      .on('inputTxBroadcasted', (obj) => {
        inputTxBroadcastedObj = obj
        inputTxBroadcasted = true
      })
      .on('inputTxConfirmed', (obj) => {
        inputTxConfirmedObj = obj
        inputTxConfirmed = true
      })
      .on('operationQueued', (obj) => {
        outputTxQueuedObj = obj
        operationQueued = true
      })
      .on('operationExecuted', (obj) => {
        outputTxExecutedObj = obj
        operationExecuted = true
      })
    expect(swapSpy).toHaveBeenNthCalledWith(
      1,
      BigNumber(123.456),
      '0x28B2A40b6046850a569843cF740f15CF29792Ac2',
      NetworkId.GoerliTestnet,
      '757365722d64617461'
    )
    expect(waitForTransactionConfirmationSpy).toHaveBeenNthCalledWith(1, 'operation-executed-tx-hash')
    expect(inputTxBroadcasted).toBeTruthy()
    expect(inputTxBroadcastedObj).toStrictEqual({ txHash: 'originating-tx-hash' })
    expect(inputTxConfirmed).toBeTruthy()
    expect(inputTxConfirmedObj).toStrictEqual({ operationId: 'operation-id', txHash: 'originating-tx-hash' })
    expect(operationQueued).toBeTruthy()
    expect(outputTxQueuedObj).toStrictEqual({ operationId: 'operation-id', txHash: 'operation-queued-tx-hash' })
    expect(operationExecuted).toBeTruthy()
    expect(outputTxExecutedObj).toStrictEqual({ operationId: 'operation-id', txHash: 'operation-executed-tx-hash' })
    expect(ret).toStrictEqual({ operationId: 'operation-id', txHash: 'operation-executed-tx-hash' })
  })

  test('Should reject if swap fails', async () => {
    const builder = new pTokensSwapBuilder()
    const sourceAsset = new pTokenAssetFailingMock({
      assetInfo: {
        networkId: NetworkId.SepoliaTestnet,
        symbol: 'SRC',
        assetTokenAddress: 'token-contract-address',
        underlyingAssetDecimals: 18,
        underlyingAssetNetworkId: NetworkId.SepoliaTestnet,
        underlyingAssetSymbol: 'SYM',
        underlyingAssetName: 'Symbol',
        underlyingAssetTokenAddress: 'underlying-asset-token-address',
      },
      routerAddress: 'router-address',
      stateManagerAddress: 'state-manager-address',
    })
    const assetProvider = new pTokensProviderMock()
    const destinationAsset = new pTokenAssetMock({
      assetInfo: {
        networkId: NetworkId.GoerliTestnet,
        symbol: 'DST',
        assetTokenAddress: 'token-contract-address',
        underlyingAssetDecimals: 18,
        underlyingAssetNetworkId: NetworkId.SepoliaTestnet,
        underlyingAssetSymbol: 'SYM',
        underlyingAssetName: 'Symbol',
        underlyingAssetTokenAddress: 'underlying-asset-token-address',
      },
      provider: assetProvider,
      routerAddress: 'router-address',
      stateManagerAddress: 'state-manager-address',
    })
    const swapSpy = jest.spyOn(sourceAsset, 'swap')
    const waitForTransactionConfirmationSpy = jest.spyOn(assetProvider, 'waitForTransactionConfirmation')
    builder
      .setAmount(123.456)
      .setSourceAsset(sourceAsset)
      .addDestinationAsset(
        destinationAsset,
        '0xE37c0D48d68da5c5b14E5c1a9f1CFE802776D9FF',
        Buffer.from('user-data').toString('hex')
      )
    const swap = builder.build()
    try {
      await swap.execute()
    } catch (_err) {
      expect(_err.message).toStrictEqual('swap error')
      expect(swapSpy).toHaveBeenNthCalledWith(
        1,
        BigNumber(123.456),
        '0xE37c0D48d68da5c5b14E5c1a9f1CFE802776D9FF',
        NetworkId.GoerliTestnet,
        '757365722d64617461'
      )
      expect(waitForTransactionConfirmationSpy).toHaveBeenCalledTimes(0)
    }
  })

  // Note: this test causes jest to report 'A worker process has failed to exit gracefully and has been force exited.
  // // This is likely caused by tests leaking due to improper teardown. Try running with --detectOpenHandles to find leaks.
  // // Active timers can also cause this, ensure that .unref() was called on them.'
  // // This is because the polling function withing the transactions monitoring does not exit when abort is sent
  // test('Should abort a running swap', async () => {
  //   const node = new pTokensNode(new pTokensNodeProvider('test-url'))
  //   jest.spyOn(pTokensNode.prototype, 'getSupportedChainsByAsset').mockImplementation(() => {
  //     return Promise.resolve([
  //       {
  //         networkId: NetworkId.BitcoinMainnet,
  //         isNative: false,
  //         assetTokenAddress: '',
  //         isSystemToken: false,
  //       },
  //       {
  //         networkId: NetworkId.SepoliaTestnet,
  //         isNative: false,
  //         assetTokenAddress: '',
  //         isSystemToken: false,
  //       },
  //     ])
  //   })
  //   const getTransactionStatusSpy = jest.spyOn(pTokensNode.prototype, 'getTransactionStatus')
  //   getTransactionStatusSpy.mockResolvedValue({ inputs: [], outputs: [] })

  //   const builder = new pTokensSwapBuilder()
  //   const sourceAsset = new pTokenAssetMock({
  //     symbol: 'SOURCE',
  //     networkId: NetworkId.BitcoinMainnet,
  //     blockchain: Blockchain.Bitcoin,
  //     network: Network.Mainnet,
  //   })
  //   const destinationAsset = new pTokenAssetMock({
  //     symbol: 'DESTINATION',
  //     networkId: NetworkId.SepoliaTestnet,
  //     blockchain: Blockchain.Ethereum,
  //     network: Network.Mainnet,
  //   })
  //   builder.setAmount(123.456).setSourceAsset(sourceAsset).addDestinationAsset(destinationAsset, 'destination-address')
  //   const swap = builder.build()
  //   try {
  //     const promi = swap.execute()
  //     setTimeout(() => swap.abort(), 1000)
  //     await promi
  //   } catch (err) {
  //     expect(err.message).toStrictEqual('Swap aborted by user')
  //   }
  // })
})
