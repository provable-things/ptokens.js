import { ChainId } from 'ptokens-constants'
import { pTokensNode, pTokensNodeProvider, Status } from 'ptokens-node'
import { pTokensSwap, pTokensSwapBuilder } from '../src/index'
import { pTokenAssetFailingMock, pTokenAssetMock, pTokensProviderMock } from './mocks/ptoken-asset'
import BigNumber from 'bignumber.js'

jest.mock('ptokens-node')
// jest.mock('ptokens-deposit-address')
jest.setTimeout(10000)

describe('pTokensSwap', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Should swap native asset without user data', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const getTransactionStatusSpy = jest.spyOn(pTokensNode.prototype, 'getTransactionStatus')
    getTransactionStatusSpy
      .mockRejectedValueOnce(new Error('Failed to extract the json from the response:{"size":0,"timeout":0}'))
      .mockResolvedValueOnce({ inputs: [], outputs: [] })
      .mockResolvedValueOnce({
        inputs: [{ txHash: 'originating-tx-hash', chainId: 'input-chain-id', status: Status.DETECTED }],
        outputs: [],
      })
      .mockResolvedValueOnce({
        inputs: [{ txHash: 'originating-tx-hash', chainId: 'input-chain-id', status: Status.DETECTED }],
        outputs: [{ txHash: 'output-tx-hash', chainId: 'output-chain-id', status: Status.DETECTED }],
      })
      .mockResolvedValue({
        inputs: [{ txHash: 'originating-tx-hash', chainId: 'input-chain-id', status: Status.DETECTED }],
        outputs: [{ txHash: 'output-tx-hash', chainId: 'output-chain-id', status: Status.BROADCASTED }],
      })

    const sourceAsset = new pTokenAssetMock({
      node,
      symbol: 'SOURCE',
      assetInfo: {
        chainId: ChainId.BscMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        vaultAddress: 'vault-contract-address',
      },
    })
    const assetProvider = new pTokensProviderMock()
    const destinationAsset = new pTokenAssetMock({
      node,
      symbol: 'DESTINATION',
      assetInfo: {
        chainId: ChainId.EthereumMainnet,
        isNative: false,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        vaultAddress: 'vault-contract-address',
      },
      provider: assetProvider,
    })
    const nativeToInterimSpy = jest.spyOn(sourceAsset, 'nativeToInterim')
    const hostToInterimSpy = jest.spyOn(sourceAsset, 'hostToInterim')
    const waitForTransactionConfirmationSpy = jest.spyOn(assetProvider, 'waitForTransactionConfirmation')
    const swap = new pTokensSwap(
      node,
      sourceAsset,
      [{ asset: destinationAsset, destinationAddress: 'destination-address' }],
      BigNumber(10)
    )
    const promi = swap.execute()
    let inputTxBroadcasted = false,
      inputTxConfirmed = false,
      inputTxDetected = false,
      outputTxDetected = false,
      outputTxBroadcasted = false,
      outputTxConfirmed = false
    let depositAddress,
      inputTxBroadcastedObj,
      inputTxConfirmedObj,
      inputTxDetectedObj,
      outputTxDetectedObj,
      outputTxBroadcastedObj,
      outputTxConfirmedObj
    const ret = await promi
      .on('depositAddress', (address) => {
        depositAddress = address
      })
      .on('inputTxBroadcasted', (obj) => {
        inputTxBroadcastedObj = obj
        inputTxBroadcasted = true
      })
      .on('inputTxConfirmed', (obj) => {
        inputTxConfirmedObj = obj
        inputTxConfirmed = true
      })
      .on('inputTxDetected', (obj) => {
        inputTxDetectedObj = obj
        inputTxDetected = true
      })
      .on('outputTxDetected', (obj) => {
        outputTxDetectedObj = obj
        outputTxDetected = true
      })
      .on('outputTxBroadcasted', (obj) => {
        outputTxBroadcastedObj = obj
        outputTxBroadcasted = true
      })
      .on('outputTxConfirmed', (obj) => {
        outputTxConfirmedObj = obj
        outputTxConfirmed = true
      })
    expect(nativeToInterimSpy).toHaveBeenNthCalledWith(
      1,
      BigNumber(10),
      'destination-address',
      ChainId.EthereumMainnet,
      undefined
    )
    expect(hostToInterimSpy).toHaveBeenCalledTimes(0)
    expect(waitForTransactionConfirmationSpy).toHaveBeenNthCalledWith(1, 'output-tx-hash')
    expect(depositAddress).toStrictEqual('deposit-address')
    expect(inputTxBroadcasted).toBeTruthy()
    expect(inputTxBroadcastedObj).toBe('originating-tx-hash')
    expect(inputTxConfirmed).toBeTruthy()
    expect(inputTxConfirmedObj).toBe('originating-tx-hash')
    expect(inputTxDetected).toBeTruthy()
    expect(inputTxDetectedObj).toStrictEqual([
      { chainId: 'input-chain-id', status: Status.DETECTED, txHash: 'originating-tx-hash' },
    ])
    expect(outputTxDetected).toBeTruthy()
    expect(outputTxDetectedObj).toStrictEqual([
      { chainId: 'output-chain-id', status: Status.DETECTED, txHash: 'output-tx-hash' },
    ])
    expect(outputTxBroadcasted).toBeTruthy()
    expect(outputTxBroadcastedObj).toStrictEqual([
      { chainId: 'output-chain-id', status: Status.BROADCASTED, txHash: 'output-tx-hash' },
    ])
    expect(outputTxConfirmed).toBeTruthy()
    expect(outputTxConfirmedObj).toStrictEqual([
      { chainId: 'output-chain-id', status: Status.BROADCASTED, txHash: 'output-tx-hash' },
    ])
    expect(ret).toStrictEqual([{ chainId: 'output-chain-id', status: Status.BROADCASTED, txHash: 'output-tx-hash' }])
  })

  test('Should swap native asset with user data', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const getTransactionStatusSpy = jest.spyOn(pTokensNode.prototype, 'getTransactionStatus')
    getTransactionStatusSpy
      .mockRejectedValueOnce(new Error('Failed to extract the json from the response:{"size":0,"timeout":0}'))
      .mockResolvedValueOnce({ inputs: [], outputs: [] })
      .mockResolvedValueOnce({
        inputs: [{ txHash: 'originating-tx-hash', chainId: 'input-chain-id', status: Status.DETECTED }],
        outputs: [],
      })
      .mockResolvedValueOnce({
        inputs: [{ txHash: 'originating-tx-hash', chainId: 'input-chain-id', status: Status.DETECTED }],
        outputs: [{ txHash: 'output-tx-hash', chainId: 'output-chain-id', status: Status.DETECTED }],
      })
      .mockRejectedValueOnce(new Error('Failed to extract the json from the response:{"size":0,"timeout":0}'))
      .mockResolvedValue({
        inputs: [{ txHash: 'originating-tx-hash', chainId: 'input-chain-id', status: Status.DETECTED }],
        outputs: [{ txHash: 'output-tx-hash', chainId: 'output-chain-id', status: Status.BROADCASTED }],
      })

    const builder = new pTokensSwapBuilder(node)
    const sourceAsset = new pTokenAssetMock({
      node,
      symbol: 'SOURCE',
      assetInfo: {
        chainId: ChainId.BscMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        vaultAddress: 'vault-contract-address',
      },
    })
    const assetProvider = new pTokensProviderMock()
    const destinationAsset = new pTokenAssetMock({
      node,
      symbol: 'DESTINATION',
      assetInfo: {
        chainId: ChainId.EthereumMainnet,
        isNative: false,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        vaultAddress: 'vault-contract-address',
      },
      provider: assetProvider,
    })
    const nativeToInterimSpy = jest.spyOn(sourceAsset, 'nativeToInterim')
    const hostToInterimSpy = jest.spyOn(sourceAsset, 'hostToInterim')
    const waitForTransactionConfirmationSpy = jest.spyOn(assetProvider, 'waitForTransactionConfirmation')
    builder
      .setAmount(123.456)
      .setSourceAsset(sourceAsset)
      .addDestinationAsset(destinationAsset, '0x28B2A40b6046850a569843cF740f15CF29792Ac2', Buffer.from('user-data'))
    const swap = builder.build()
    const promi = swap.execute()
    let inputTxBroadcasted = false,
      inputTxConfirmed = false,
      inputTxDetected = false,
      outputTxDetected = false,
      outputTxBroadcasted = false,
      outputTxConfirmed = false
    let depositAddress,
      inputTxBroadcastedObj,
      inputTxConfirmedObj,
      inputTxDetectedObj,
      outputTxDetectedObj,
      outputTxBroadcastedObj,
      outputTxConfirmedObj
    const ret = await promi
      .on('depositAddress', (address) => {
        depositAddress = address
      })
      .on('inputTxBroadcasted', (obj) => {
        inputTxBroadcastedObj = obj
        inputTxBroadcasted = true
      })
      .on('inputTxConfirmed', (obj) => {
        inputTxConfirmedObj = obj
        inputTxConfirmed = true
      })
      .on('inputTxDetected', (obj) => {
        inputTxDetectedObj = obj
        inputTxDetected = true
      })
      .on('outputTxDetected', (obj) => {
        outputTxDetectedObj = obj
        outputTxDetected = true
      })
      .on('outputTxBroadcasted', (obj) => {
        outputTxBroadcastedObj = obj
        outputTxBroadcasted = true
      })
      .on('outputTxConfirmed', (obj) => {
        outputTxConfirmedObj = obj
        outputTxConfirmed = true
      })
    expect(nativeToInterimSpy).toHaveBeenNthCalledWith(
      1,
      BigNumber(123.456),
      '0x28B2A40b6046850a569843cF740f15CF29792Ac2',
      ChainId.EthereumMainnet,
      Buffer.from('user-data')
    )
    expect(hostToInterimSpy).toHaveBeenCalledTimes(0)
    expect(waitForTransactionConfirmationSpy).toHaveBeenNthCalledWith(1, 'output-tx-hash')
    expect(depositAddress).toStrictEqual('deposit-address')
    expect(inputTxBroadcasted).toBeTruthy()
    expect(inputTxBroadcastedObj).toBe('originating-tx-hash')
    expect(inputTxConfirmed).toBeTruthy()
    expect(inputTxConfirmedObj).toBe('originating-tx-hash')
    expect(inputTxDetected).toBeTruthy()
    expect(inputTxDetectedObj).toStrictEqual([
      { chainId: 'input-chain-id', status: Status.DETECTED, txHash: 'originating-tx-hash' },
    ])
    expect(outputTxDetected).toBeTruthy()
    expect(outputTxDetectedObj).toStrictEqual([
      { chainId: 'output-chain-id', status: Status.DETECTED, txHash: 'output-tx-hash' },
    ])
    expect(outputTxBroadcasted).toBeTruthy()
    expect(outputTxBroadcastedObj).toStrictEqual([
      { chainId: 'output-chain-id', status: Status.BROADCASTED, txHash: 'output-tx-hash' },
    ])
    expect(outputTxConfirmed).toBeTruthy()
    expect(outputTxConfirmedObj).toStrictEqual([
      { chainId: 'output-chain-id', status: Status.BROADCASTED, txHash: 'output-tx-hash' },
    ])
    expect(ret).toStrictEqual([{ chainId: 'output-chain-id', status: Status.BROADCASTED, txHash: 'output-tx-hash' }])
  })

  test('Should swap host asset without user data', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const getTransactionStatusSpy = jest.spyOn(pTokensNode.prototype, 'getTransactionStatus')
    getTransactionStatusSpy
      .mockRejectedValueOnce(new Error('Failed to extract the json from the response:{"size":0,"timeout":0}'))
      .mockResolvedValueOnce({ inputs: [], outputs: [] })
      .mockResolvedValueOnce({
        inputs: [{ txHash: 'originating-tx-hash', chainId: 'input-chain-id', status: Status.DETECTED }],
        outputs: [],
      })
      .mockResolvedValueOnce({
        inputs: [],
        outputs: [{ txHash: 'output-tx-hash', chainId: 'output-chain-id', status: Status.DETECTED }],
      })
      .mockResolvedValue({
        inputs: [],
        outputs: [{ txHash: 'output-tx-hash', chainId: 'output-chain-id', status: Status.BROADCASTED }],
      })

    const builder = new pTokensSwapBuilder(node)
    const sourceAsset = new pTokenAssetMock({
      node,
      symbol: 'SOURCE',
      assetInfo: {
        chainId: ChainId.BscMainnet,
        isNative: false,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        vaultAddress: 'vault-contract-address',
      },
    })
    const assetProvider = new pTokensProviderMock()
    const destinationAsset = new pTokenAssetMock({
      node,
      symbol: 'DESTINATION',
      assetInfo: {
        chainId: ChainId.EthereumMainnet,
        isNative: false,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        vaultAddress: 'vault-contract-address',
      },
      provider: assetProvider,
    })
    const nativeToInterimSpy = jest.spyOn(sourceAsset, 'nativeToInterim')
    const hostToInterimSpy = jest.spyOn(sourceAsset, 'hostToInterim')
    const waitForTransactionConfirmationSpy = jest.spyOn(assetProvider, 'waitForTransactionConfirmation')
    builder
      .setAmount(123.456)
      .setSourceAsset(sourceAsset)
      .addDestinationAsset(destinationAsset, '0x28B2A40b6046850a569843cF740f15CF29792Ac2')
    const swap = builder.build()
    const promi = swap.execute()
    let inputTxBroadcasted = false,
      inputTxConfirmed = false,
      inputTxDetected = false,
      outputTxDetected = false,
      outputTxBroadcasted = false,
      outputTxConfirmed = false
    let inputTxBroadcastedObj,
      inputTxConfirmedObj,
      inputTxDetectedObj,
      outputTxDetectedObj,
      outputTxBroadcastedObj,
      outputTxConfirmedObj
    const ret = await promi
      .on('inputTxBroadcasted', (obj) => {
        inputTxBroadcastedObj = obj
        inputTxBroadcasted = true
      })
      .on('inputTxConfirmed', (obj) => {
        inputTxConfirmedObj = obj
        inputTxConfirmed = true
      })
      .on('inputTxDetected', (obj) => {
        inputTxDetectedObj = obj
        inputTxDetected = true
      })
      .on('outputTxDetected', (obj) => {
        outputTxDetectedObj = obj
        outputTxDetected = true
      })
      .on('outputTxBroadcasted', (obj) => {
        outputTxBroadcastedObj = obj
        outputTxBroadcasted = true
      })
      .on('outputTxConfirmed', (obj) => {
        outputTxConfirmedObj = obj
        outputTxConfirmed = true
      })
    expect(hostToInterimSpy).toHaveBeenNthCalledWith(
      1,
      BigNumber(123.456),
      '0x28B2A40b6046850a569843cF740f15CF29792Ac2',
      ChainId.EthereumMainnet,
      undefined
    )
    expect(nativeToInterimSpy).toHaveBeenCalledTimes(0)
    expect(waitForTransactionConfirmationSpy).toHaveBeenNthCalledWith(1, 'output-tx-hash')
    expect(inputTxBroadcasted).toBeTruthy()
    expect(inputTxBroadcastedObj).toBe('originating-tx-hash')
    expect(inputTxConfirmed).toBeTruthy()
    expect(inputTxConfirmedObj).toBe('originating-tx-hash')
    expect(inputTxDetected).toBeTruthy()
    expect(inputTxDetectedObj).toStrictEqual([
      { chainId: 'input-chain-id', status: Status.DETECTED, txHash: 'originating-tx-hash' },
    ])
    expect(outputTxDetected).toBeTruthy()
    expect(outputTxDetectedObj).toStrictEqual([
      { chainId: 'output-chain-id', status: Status.DETECTED, txHash: 'output-tx-hash' },
    ])
    expect(outputTxBroadcasted).toBeTruthy()
    expect(outputTxBroadcastedObj).toStrictEqual([
      { chainId: 'output-chain-id', status: Status.BROADCASTED, txHash: 'output-tx-hash' },
    ])
    expect(outputTxConfirmed).toBeTruthy()
    expect(outputTxConfirmedObj).toStrictEqual([
      { chainId: 'output-chain-id', status: Status.BROADCASTED, txHash: 'output-tx-hash' },
    ])
    expect(ret).toStrictEqual([{ chainId: 'output-chain-id', status: Status.BROADCASTED, txHash: 'output-tx-hash' }])
  })

  test('Should swap host asset with user data', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const getTransactionStatusSpy = jest.spyOn(pTokensNode.prototype, 'getTransactionStatus')
    getTransactionStatusSpy
      .mockRejectedValueOnce(new Error('Failed to extract the json from the response:{"size":0,"timeout":0}'))
      .mockResolvedValueOnce({ inputs: [], outputs: [] })
      .mockResolvedValueOnce({
        inputs: [{ txHash: 'originating-tx-hash', chainId: 'input-chain-id', status: Status.DETECTED }],
        outputs: [],
      })
      .mockResolvedValueOnce({
        inputs: [],
        outputs: [{ txHash: 'output-tx-hash', chainId: 'output-chain-id', status: Status.DETECTED }],
      })
      .mockResolvedValue({
        inputs: [],
        outputs: [{ txHash: 'output-tx-hash', chainId: 'output-chain-id', status: Status.BROADCASTED }],
      })

    const builder = new pTokensSwapBuilder(node)
    const sourceAsset = new pTokenAssetMock({
      node,
      symbol: 'SRC',
      assetInfo: {
        chainId: ChainId.EthereumMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        vaultAddress: 'vault-contract-address',
      },
    })
    const assetProvider = new pTokensProviderMock()
    const destinationAsset = new pTokenAssetMock({
      node,
      symbol: 'DST',
      assetInfo: {
        chainId: ChainId.BscMainnet,
        isNative: false,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        vaultAddress: 'vault-contract-address',
      },
      provider: assetProvider,
    })
    const nativeToInterimSpy = jest.spyOn(sourceAsset, 'nativeToInterim')
    const hostToInterimSpy = jest.spyOn(sourceAsset, 'hostToInterim')
    const waitForTransactionConfirmationSpy = jest.spyOn(assetProvider, 'waitForTransactionConfirmation')
    builder
      .setAmount(123.456)
      .setSourceAsset(sourceAsset)
      .addDestinationAsset(destinationAsset, '0xE37c0D48d68da5c5b14E5c1a9f1CFE802776D9FF', Buffer.from('user-data'))
    const swap = builder.build()
    const promi = swap.execute()
    let inputTxBroadcasted = false,
      inputTxConfirmed = false,
      inputTxDetected = false,
      outputTxDetected = false,
      outputTxBroadcasted = false,
      outputTxConfirmed = false
    let inputTxBroadcastedObj,
      inputTxConfirmedObj,
      inputTxDetectedObj,
      outputTxDetectedObj,
      outputTxBroadcastedObj,
      outputTxConfirmedObj
    const ret = await promi
      .on('inputTxBroadcasted', (obj) => {
        inputTxBroadcastedObj = obj
        inputTxBroadcasted = true
      })
      .on('inputTxConfirmed', (obj) => {
        inputTxConfirmedObj = obj
        inputTxConfirmed = true
      })
      .on('inputTxDetected', (obj) => {
        inputTxDetectedObj = obj
        inputTxDetected = true
      })
      .on('outputTxDetected', (obj) => {
        outputTxDetectedObj = obj
        outputTxDetected = true
      })
      .on('outputTxBroadcasted', (obj) => {
        outputTxBroadcastedObj = obj
        outputTxBroadcasted = true
      })
      .on('outputTxConfirmed', (obj) => {
        outputTxConfirmedObj = obj
        outputTxConfirmed = true
      })
    expect(nativeToInterimSpy).toHaveBeenNthCalledWith(
      1,
      BigNumber(123.456),
      '0xE37c0D48d68da5c5b14E5c1a9f1CFE802776D9FF',
      ChainId.BscMainnet,
      Buffer.from('user-data')
    )
    expect(hostToInterimSpy).toHaveBeenCalledTimes(0)
    expect(waitForTransactionConfirmationSpy).toHaveBeenNthCalledWith(1, 'output-tx-hash')
    expect(inputTxBroadcasted).toBeTruthy()
    expect(inputTxBroadcastedObj).toBe('originating-tx-hash')
    expect(inputTxConfirmed).toBeTruthy()
    expect(inputTxConfirmedObj).toBe('originating-tx-hash')
    expect(inputTxDetected).toBeTruthy()
    expect(inputTxDetectedObj).toStrictEqual([{ chainId: 'input-chain-id', status: 0, txHash: 'originating-tx-hash' }])
    expect(outputTxDetected).toBeTruthy()
    expect(outputTxDetectedObj).toStrictEqual([
      { chainId: 'output-chain-id', status: Status.DETECTED, txHash: 'output-tx-hash' },
    ])
    expect(outputTxBroadcasted).toBeTruthy()
    expect(outputTxBroadcastedObj).toStrictEqual([
      { chainId: 'output-chain-id', status: Status.BROADCASTED, txHash: 'output-tx-hash' },
    ])
    expect(outputTxConfirmed).toBeTruthy()
    expect(outputTxConfirmedObj).toStrictEqual([
      { chainId: 'output-chain-id', status: Status.BROADCASTED, txHash: 'output-tx-hash' },
    ])
    expect(ret).toStrictEqual([{ chainId: 'output-chain-id', status: Status.BROADCASTED, txHash: 'output-tx-hash' }])
  })

  test('Should swap to Algorand address and not call waitForTransactionConfirmation', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const getTransactionStatusSpy = jest.spyOn(pTokensNode.prototype, 'getTransactionStatus')
    getTransactionStatusSpy
      .mockRejectedValueOnce(new Error('Failed to extract the json from the response:{"size":0,"timeout":0}'))
      .mockResolvedValueOnce({ inputs: [], outputs: [] })
      .mockResolvedValueOnce({
        inputs: [{ txHash: 'originating-tx-hash', chainId: 'input-chain-id', status: Status.DETECTED }],
        outputs: [],
      })
      .mockResolvedValueOnce({
        inputs: [{ txHash: 'originating-tx-hash', chainId: 'input-chain-id', status: Status.BROADCASTED }],
        outputs: [{ txHash: 'output-group-id', chainId: '0x03c38e67', status: Status.DETECTED }],
      })
      .mockResolvedValue({
        inputs: [{ txHash: 'originating-tx-hash', chainId: 'input-chain-id', status: Status.BROADCASTED }],
        outputs: [{ txHash: 'output-group-id', chainId: '0x03c38e67', status: Status.BROADCASTED }],
      })

    const builder = new pTokensSwapBuilder(node)
    const sourceAsset = new pTokenAssetMock({
      node,
      symbol: 'SRC',
      assetInfo: {
        chainId: ChainId.EthereumMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        vaultAddress: 'vault-contract-address',
      },
    })
    const assetProvider = new pTokensProviderMock()
    const destinationAsset = new pTokenAssetFailingMock({
      node,
      symbol: 'DST',
      assetInfo: {
        chainId: ChainId.AlgorandMainnet,
        isNative: false,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        vaultAddress: 'vault-contract-address',
      },
      provider: assetProvider,
    })
    const nativeToInterimSpy = jest.spyOn(sourceAsset, 'nativeToInterim')
    const hostToInterimSpy = jest.spyOn(sourceAsset, 'hostToInterim')
    const waitForTransactionConfirmationSpy = jest.spyOn(assetProvider, 'waitForTransactionConfirmation')
    builder
      .setAmount(123.456)
      .setSourceAsset(sourceAsset)
      .addDestinationAsset(
        destinationAsset,
        'LCRDY3LYAANTVS3XRHEHWHGXRTKZYVTX55P5IA2AT5ZDJ4CWZFFZIKVHLI',
        Buffer.from('user-data')
      )
    const swap = builder.build()
    const promi = swap.execute()
    let inputTxBroadcasted = false,
      inputTxConfirmed = false,
      inputTxDetected = false,
      outputTxDetected = false,
      outputTxBroadcasted = false,
      outputTxConfirmed = false
    let inputTxBroadcastedObj,
      inputTxConfirmedObj,
      inputTxDetectedObj,
      outputTxDetectedObj,
      outputTxBroadcastedObj,
      outputTxConfirmedObj
    const ret = await promi
      .on('inputTxBroadcasted', (obj) => {
        inputTxBroadcastedObj = obj
        inputTxBroadcasted = true
      })
      .on('inputTxConfirmed', (obj) => {
        inputTxConfirmedObj = obj
        inputTxConfirmed = true
      })
      .on('inputTxDetected', (obj) => {
        inputTxDetectedObj = obj
        inputTxDetected = true
      })
      .on('outputTxDetected', (obj) => {
        outputTxDetectedObj = obj
        outputTxDetected = true
      })
      .on('outputTxBroadcasted', (obj) => {
        outputTxBroadcastedObj = obj
        outputTxBroadcasted = true
      })
      .on('outputTxConfirmed', (obj) => {
        outputTxConfirmedObj = obj
        outputTxConfirmed = true
      })
    expect(nativeToInterimSpy).toHaveBeenNthCalledWith(
      1,
      BigNumber(123.456),
      'LCRDY3LYAANTVS3XRHEHWHGXRTKZYVTX55P5IA2AT5ZDJ4CWZFFZIKVHLI',
      ChainId.AlgorandMainnet,
      Buffer.from('user-data')
    )
    expect(hostToInterimSpy).toHaveBeenCalledTimes(0)
    expect(waitForTransactionConfirmationSpy).toHaveBeenCalledTimes(0)
    expect(inputTxBroadcasted).toBeTruthy()
    expect(inputTxBroadcastedObj).toBe('originating-tx-hash')
    expect(inputTxConfirmed).toBeTruthy()
    expect(inputTxConfirmedObj).toBe('originating-tx-hash')
    expect(inputTxDetected).toBeTruthy()
    expect(inputTxDetectedObj).toStrictEqual([{ chainId: 'input-chain-id', status: 0, txHash: 'originating-tx-hash' }])
    expect(outputTxDetected).toBeTruthy()
    expect(outputTxDetectedObj).toStrictEqual([
      { chainId: ChainId.AlgorandMainnet, status: Status.DETECTED, txHash: 'output-group-id' },
    ])
    expect(outputTxBroadcasted).toBeTruthy()
    expect(outputTxBroadcastedObj).toStrictEqual([
      { chainId: ChainId.AlgorandMainnet, status: Status.BROADCASTED, txHash: 'output-group-id' },
    ])
    expect(outputTxConfirmed).toBeTruthy()
    expect(outputTxConfirmedObj).toStrictEqual([
      { chainId: ChainId.AlgorandMainnet, status: Status.BROADCASTED, txHash: 'output-group-id' },
    ])
    expect(ret).toStrictEqual([
      { chainId: ChainId.AlgorandMainnet, status: Status.BROADCASTED, txHash: 'output-group-id' },
    ])
  })

  test('Should emit all events but outputTxConfirmed if destination asset provider is missing', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const getTransactionStatusSpy = jest.spyOn(pTokensNode.prototype, 'getTransactionStatus')
    getTransactionStatusSpy
      .mockRejectedValueOnce(new Error('Failed to extract the json from the response:{"size":0,"timeout":0}'))
      .mockResolvedValueOnce({ inputs: [], outputs: [] })
      .mockResolvedValueOnce({
        inputs: [{ txHash: 'originating-tx-hash', chainId: 'input-chain-id', status: Status.DETECTED }],
        outputs: [],
      })
      .mockResolvedValueOnce({
        inputs: [],
        outputs: [{ txHash: 'output-tx-hash', chainId: 'output-chain-id', status: Status.DETECTED }],
      })
      .mockResolvedValue({
        inputs: [],
        outputs: [{ txHash: 'output-tx-hash', chainId: 'output-chain-id', status: Status.BROADCASTED }],
      })

    const builder = new pTokensSwapBuilder(node)
    const sourceAsset = new pTokenAssetMock({
      node,
      symbol: 'SRC',
      assetInfo: {
        chainId: ChainId.EthereumMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        vaultAddress: 'vault-contract-address',
      },
    })
    const destinationAsset = new pTokenAssetMock({
      node,
      symbol: 'DST',
      assetInfo: {
        chainId: ChainId.BscMainnet,
        isNative: false,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        vaultAddress: 'vault-contract-address',
      },
    })
    const nativeToInterimSpy = jest.spyOn(sourceAsset, 'nativeToInterim')
    const hostToInterimSpy = jest.spyOn(sourceAsset, 'hostToInterim')
    builder
      .setAmount(123.456)
      .setSourceAsset(sourceAsset)
      .addDestinationAsset(destinationAsset, '0xE37c0D48d68da5c5b14E5c1a9f1CFE802776D9FF', Buffer.from('user-data'))
    const swap = builder.build()
    const promi = swap.execute()
    let inputTxBroadcasted = false,
      inputTxConfirmed = false,
      inputTxDetected = false,
      outputTxDetected = false,
      outputTxBroadcasted = false,
      outputTxConfirmed = false
    let inputTxBroadcastedObj,
      inputTxConfirmedObj,
      inputTxDetectedObj,
      outputTxDetectedObj,
      outputTxBroadcastedObj,
      outputTxConfirmedObj
    const ret = await promi
      .on('inputTxBroadcasted', (obj) => {
        inputTxBroadcastedObj = obj
        inputTxBroadcasted = true
      })
      .on('inputTxConfirmed', (obj) => {
        inputTxConfirmedObj = obj
        inputTxConfirmed = true
      })
      .on('inputTxDetected', (obj) => {
        inputTxDetectedObj = obj
        inputTxDetected = true
      })
      .on('outputTxDetected', (obj) => {
        outputTxDetectedObj = obj
        outputTxDetected = true
      })
      .on('outputTxBroadcasted', (obj) => {
        outputTxBroadcastedObj = obj
        outputTxBroadcasted = true
      })
      .on('outputTxConfirmed', (obj) => {
        outputTxConfirmedObj = obj
        outputTxConfirmed = true
      })
    expect(nativeToInterimSpy).toHaveBeenNthCalledWith(
      1,
      BigNumber(123.456),
      '0xE37c0D48d68da5c5b14E5c1a9f1CFE802776D9FF',
      ChainId.BscMainnet,
      Buffer.from('user-data')
    )
    expect(hostToInterimSpy).toHaveBeenCalledTimes(0)
    expect(inputTxBroadcasted).toBeTruthy()
    expect(inputTxBroadcastedObj).toBe('originating-tx-hash')
    expect(inputTxConfirmed).toBeTruthy()
    expect(inputTxConfirmedObj).toBe('originating-tx-hash')
    expect(inputTxDetected).toBeTruthy()
    expect(inputTxDetectedObj).toStrictEqual([{ chainId: 'input-chain-id', status: 0, txHash: 'originating-tx-hash' }])
    expect(outputTxDetected).toBeTruthy()
    expect(outputTxDetectedObj).toStrictEqual([
      { chainId: 'output-chain-id', status: Status.DETECTED, txHash: 'output-tx-hash' },
    ])
    expect(outputTxBroadcasted).toBeTruthy()
    expect(outputTxBroadcastedObj).toStrictEqual([
      { chainId: 'output-chain-id', status: Status.BROADCASTED, txHash: 'output-tx-hash' },
    ])
    expect(outputTxConfirmed).toBeFalsy()
    expect(outputTxConfirmedObj).toStrictEqual(undefined)
    expect(ret).toStrictEqual([{ chainId: 'output-chain-id', status: Status.BROADCASTED, txHash: 'output-tx-hash' }])
  })

  test('Should reject if nativeToInterim fails', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const getTransactionStatusSpy = jest.spyOn(pTokensNode.prototype, 'getTransactionStatus')
    getTransactionStatusSpy
      .mockRejectedValueOnce(new Error('Failed to extract the json from the response:{"size":0,"timeout":0}'))
      .mockResolvedValueOnce({ inputs: [], outputs: [] })
      .mockResolvedValueOnce({
        inputs: [{ txHash: 'originating-tx-hash', chainId: 'input-chain-id', status: Status.DETECTED }],
        outputs: [],
      })
      .mockResolvedValueOnce({
        inputs: [],
        outputs: [{ txHash: 'output-tx-hash', chainId: 'output-chain-id', status: Status.DETECTED }],
      })
      .mockResolvedValue({
        inputs: [],
        outputs: [{ txHash: 'output-tx-hash', chainId: 'output-chain-id', status: Status.BROADCASTED }],
      })

    const builder = new pTokensSwapBuilder(node)
    const sourceAsset = new pTokenAssetFailingMock({
      node,
      symbol: 'SRC',
      assetInfo: {
        chainId: ChainId.AlgorandMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        vaultAddress: 'vault-contract-address',
      },
    })
    const assetProvider = new pTokensProviderMock()
    const destinationAsset = new pTokenAssetMock({
      node,
      symbol: 'DST',
      assetInfo: {
        chainId: ChainId.BscMainnet,
        isNative: false,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        vaultAddress: 'vault-contract-address',
      },
      provider: assetProvider,
    })
    const nativeToInterimSpy = jest.spyOn(sourceAsset, 'nativeToInterim')
    const hostToInterimSpy = jest.spyOn(sourceAsset, 'hostToInterim')
    const waitForTransactionConfirmationSpy = jest.spyOn(assetProvider, 'waitForTransactionConfirmation')
    builder
      .setAmount(123.456)
      .setSourceAsset(sourceAsset)
      .addDestinationAsset(destinationAsset, '0xE37c0D48d68da5c5b14E5c1a9f1CFE802776D9FF', Buffer.from('user-data'))
    const swap = builder.build()
    try {
      await swap.execute()
    } catch (_err) {
      expect(_err.message).toStrictEqual('nativeToInterim error')
      expect(nativeToInterimSpy).toHaveBeenNthCalledWith(
        1,
        BigNumber(123.456),
        '0xE37c0D48d68da5c5b14E5c1a9f1CFE802776D9FF',
        ChainId.BscMainnet,
        Buffer.from('user-data')
      )
      expect(hostToInterimSpy).toHaveBeenCalledTimes(0)
      expect(waitForTransactionConfirmationSpy).toHaveBeenCalledTimes(0)
    }
  })

  test('Should reject if hostToInterim fails', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const getTransactionStatusSpy = jest.spyOn(pTokensNode.prototype, 'getTransactionStatus')
    getTransactionStatusSpy
      .mockRejectedValueOnce(new Error('Failed to extract the json from the response:{"size":0,"timeout":0}'))
      .mockResolvedValueOnce({ inputs: [], outputs: [] })
      .mockResolvedValueOnce({
        inputs: [{ txHash: 'originating-tx-hash', chainId: 'input-chain-id', status: Status.DETECTED }],
        outputs: [],
      })
      .mockResolvedValueOnce({
        inputs: [],
        outputs: [{ txHash: 'output-tx-hash', chainId: 'output-chain-id', status: Status.DETECTED }],
      })
      .mockResolvedValue({
        inputs: [],
        outputs: [{ txHash: 'output-tx-hash', chainId: 'output-chain-id', status: Status.BROADCASTED }],
      })

    const builder = new pTokensSwapBuilder(node)
    const sourceAsset = new pTokenAssetFailingMock({
      node,
      symbol: 'SRC',
      assetInfo: {
        chainId: ChainId.AlgorandMainnet,
        isNative: false,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        vaultAddress: 'vault-contract-address',
      },
    })
    const assetProvider = new pTokensProviderMock()
    const destinationAsset = new pTokenAssetMock({
      node,
      symbol: 'DST',
      assetInfo: {
        chainId: ChainId.BscMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        vaultAddress: 'vault-contract-address',
      },
      provider: assetProvider,
    })
    const nativeToInterimSpy = jest.spyOn(sourceAsset, 'nativeToInterim')
    const hostToInterimSpy = jest.spyOn(sourceAsset, 'hostToInterim')
    const waitForTransactionConfirmationSpy = jest.spyOn(assetProvider, 'waitForTransactionConfirmation')
    builder
      .setAmount(123.456)
      .setSourceAsset(sourceAsset)
      .addDestinationAsset(destinationAsset, '0xE37c0D48d68da5c5b14E5c1a9f1CFE802776D9FF', Buffer.from('user-data'))
    const swap = builder.build()
    try {
      await swap.execute()
    } catch (_err) {
      expect(_err.message).toStrictEqual('hostToInterim error')
      expect(hostToInterimSpy).toHaveBeenNthCalledWith(
        1,
        BigNumber(123.456),
        '0xE37c0D48d68da5c5b14E5c1a9f1CFE802776D9FF',
        ChainId.BscMainnet,
        Buffer.from('user-data')
      )
      expect(nativeToInterimSpy).toHaveBeenCalledTimes(0)
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
  //         chainId: ChainId.BitcoinMainnet,
  //         isNative: false,
  //         tokenAddress: '',
  //         isSystemToken: false,
  //       },
  //       {
  //         chainId: ChainId.EthereumMainnet,
  //         isNative: false,
  //         tokenAddress: '',
  //         isSystemToken: false,
  //       },
  //     ])
  //   })
  //   const getTransactionStatusSpy = jest.spyOn(pTokensNode.prototype, 'getTransactionStatus')
  //   getTransactionStatusSpy.mockResolvedValue({ inputs: [], outputs: [] })

  //   const builder = new pTokensSwapBuilder(node)
  //   const sourceAsset = new pTokenAssetMock({
  //     symbol: 'SOURCE',
  //     chainId: ChainId.BitcoinMainnet,
  //     blockchain: Blockchain.Bitcoin,
  //     network: Network.Mainnet,
  //   })
  //   const destinationAsset = new pTokenAssetMock({
  //     symbol: 'DESTINATION',
  //     chainId: ChainId.EthereumMainnet,
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
