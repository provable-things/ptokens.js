import { pTokensNode, pTokensNodeProvider, Status } from 'ptokens-node'
import { DepositAddress } from 'ptokens-deposit-address'
import { pTokensSwap, pTokensSwapBuilder } from '../src/index'
import { pTokenAssetMock } from './mocks/ptoken-asset'
import PromiEvent from 'promievent'

jest.mock('ptokens-node')
// jest.mock('ptokens-deposit-address')
jest.setTimeout(10000)

describe('pTokensSwap', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('Should swap native asset without user data ', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfo').mockImplementation(() => {
      return Promise.resolve({
        chainId: 'originating-chain-id',
        isNative: true,
        tokenAddress: '',
      })
    })
    const getTransactionStatusSpy = jest.spyOn(pTokensNode.prototype, 'getTransactionStatus')
    getTransactionStatusSpy.mockResolvedValue({ inputs: [], outputs: [] })
    getTransactionStatusSpy
      .mockResolvedValueOnce({
        inputs: [],
        outputs: [{ tx_hash: 'tx-hash', chain_id: 'chain-id', status: Status.BROADCASTED }],
      })
      .mockResolvedValueOnce({
        inputs: [],
        outputs: [{ tx_hash: 'tx-hash', chain_id: 'chain-id', status: Status.BROADCASTED }],
      })
      .mockResolvedValue({
        inputs: [],
        outputs: [{ tx_hash: 'tx-hash', chain_id: 'chain-id', status: Status.CONFIRMED }],
      })

    const builder = new pTokensSwapBuilder(node)
    const sourceAsset = new pTokenAssetMock({
      symbol: 'SOURCE',
      chainId: 'originating-chain-id',
      blockchain: 'source-blockchain',
      network: 'source-network',
    })
    const destinationAsset = new pTokenAssetMock({
      symbol: 'DESTINATION',
      chainId: 'destination-chain-id',
      blockchain: 'destination-blockchain',
      network: 'destination-network',
    })
    const nativeToInterimSpy = jest.spyOn(sourceAsset, 'nativeToInterim')
    const hostToInterimSpy = jest.spyOn(sourceAsset, 'hostToInterim')
    const swap = new pTokensSwap(
      node,
      sourceAsset,
      [{ asset: destinationAsset, destinationAddress: 'destination-address' }],
      10
    )
    const promi = swap.execute()
    let inputTxDetected = false,
      inputTxProcessed = false,
      outputTxDetected = false,
      outputTxProcessed = false
    let inputTxDetectedObj, inputTxProcessedObj, outputTxDetectedObj, outputTxProcessedObj
    await promi
      .on('inputTxDetected', (obj) => {
        inputTxDetectedObj = obj
        inputTxDetected = true
      })
      .on('inputTxProcessed', (obj) => {
        inputTxProcessedObj = obj
        inputTxProcessed = true
      })
      .on('outputTxDetected', (obj) => {
        outputTxDetectedObj = obj
        outputTxDetected = true
      })
      .on('outputTxProcessed', (obj) => {
        outputTxProcessedObj = obj
        outputTxProcessed = true
      })
    expect(getAssetInfoSpy).toHaveBeenCalledWith('SOURCE', 'originating-chain-id')
    expect(nativeToInterimSpy).toHaveBeenNthCalledWith(
      1,
      node,
      'destination-address',
      'destination-chain-id',
      undefined
    )
    expect(hostToInterimSpy).toHaveBeenCalledTimes(0)
    expect(inputTxDetected).toBeTruthy()
    expect(inputTxDetectedObj).toBe('originating-tx-hash')
    expect(inputTxProcessed).toBeTruthy()
    expect(inputTxProcessedObj).toBe('originating-tx-hash')
    expect(outputTxDetected).toBeTruthy()
    expect(outputTxDetectedObj).toStrictEqual([{ chain_id: 'chain-id', status: 1, tx_hash: 'tx-hash' }])
    expect(outputTxProcessed).toBeTruthy()
    expect(outputTxProcessedObj).toStrictEqual([{ chain_id: 'chain-id', status: 2, tx_hash: 'tx-hash' }])
  })

  it('Should swap native asset with user data ', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfo').mockImplementation(() => {
      return Promise.resolve({
        chainId: 'originating-chain-id',
        isNative: true,
        tokenAddress: '',
      })
    })
    const getTransactionStatusSpy = jest.spyOn(pTokensNode.prototype, 'getTransactionStatus')
    getTransactionStatusSpy.mockResolvedValue({ inputs: [], outputs: [] })
    getTransactionStatusSpy
      .mockResolvedValueOnce({
        inputs: [],
        outputs: [{ tx_hash: 'tx-hash', chain_id: 'chain-id', status: Status.BROADCASTED }],
      })
      .mockResolvedValueOnce({
        inputs: [],
        outputs: [{ tx_hash: 'tx-hash', chain_id: 'chain-id', status: Status.BROADCASTED }],
      })
      .mockResolvedValue({
        inputs: [],
        outputs: [{ tx_hash: 'tx-hash', chain_id: 'chain-id', status: Status.CONFIRMED }],
      })

    const builder = new pTokensSwapBuilder(node)
    const sourceAsset = new pTokenAssetMock({
      symbol: 'SOURCE',
      chainId: 'originating-chain-id',
      blockchain: 'source-blockchain',
      network: 'source-network',
    })
    const destinationAsset = new pTokenAssetMock({
      symbol: 'DESTINATION',
      chainId: 'destination-chain-id',
      blockchain: 'destination-blockchain',
      network: 'destiination-network',
    })
    const nativeToInterimSpy = jest.spyOn(sourceAsset, 'nativeToInterim')
    const hostToInterimSpy = jest.spyOn(sourceAsset, 'hostToInterim')
    builder
      .setAmount(1)
      .setSourceAsset(sourceAsset)
      .addDestinationAsset(destinationAsset, 'destination-address', Buffer.from('user-data'))
    const swap = builder.build()
    const promi = swap.execute()
    let inputTxDetected = false,
      inputTxProcessed = false,
      outputTxDetected = false,
      outputTxProcessed = false
    let inputTxDetectedObj, inputTxProcessedObj, outputTxDetectedObj, outputTxProcessedObj
    await promi
      .on('inputTxDetected', (obj) => {
        inputTxDetectedObj = obj
        inputTxDetected = true
      })
      .on('inputTxProcessed', (obj) => {
        inputTxProcessedObj = obj
        inputTxProcessed = true
      })
      .on('outputTxDetected', (obj) => {
        outputTxDetectedObj = obj
        outputTxDetected = true
      })
      .on('outputTxProcessed', (obj) => {
        outputTxProcessedObj = obj
        outputTxProcessed = true
      })
    expect(getAssetInfoSpy).toHaveBeenCalledWith('SOURCE', 'originating-chain-id')
    expect(nativeToInterimSpy).toHaveBeenNthCalledWith(
      1,
      node,
      'destination-address',
      'destination-chain-id',
      Buffer.from('user-data')
    )
    expect(hostToInterimSpy).toHaveBeenCalledTimes(0)
    expect(inputTxDetected).toBeTruthy()
    expect(inputTxDetectedObj).toBe('originating-tx-hash')
    expect(inputTxProcessed).toBeTruthy()
    expect(inputTxProcessedObj).toBe('originating-tx-hash')
    expect(outputTxDetected).toBeTruthy()
    expect(outputTxDetectedObj).toStrictEqual([{ chain_id: 'chain-id', status: 1, tx_hash: 'tx-hash' }])
    expect(outputTxProcessed).toBeTruthy()
    expect(outputTxProcessedObj).toStrictEqual([{ chain_id: 'chain-id', status: 2, tx_hash: 'tx-hash' }])
  })

  it('Should swap host asset without user data ', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfo').mockImplementation(() => {
      return Promise.resolve({
        chainId: 'originating-chain-id',
        isNative: false,
        tokenAddress: '',
      })
    })
    const getTransactionStatusSpy = jest.spyOn(pTokensNode.prototype, 'getTransactionStatus')
    getTransactionStatusSpy.mockResolvedValue({ inputs: [], outputs: [] })
    getTransactionStatusSpy
      .mockResolvedValueOnce({
        inputs: [],
        outputs: [{ tx_hash: 'tx-hash', chain_id: 'chain-id', status: Status.BROADCASTED }],
      })
      .mockResolvedValueOnce({
        inputs: [],
        outputs: [{ tx_hash: 'tx-hash', chain_id: 'chain-id', status: Status.BROADCASTED }],
      })
      .mockResolvedValue({
        inputs: [],
        outputs: [{ tx_hash: 'tx-hash', chain_id: 'chain-id', status: Status.CONFIRMED }],
      })

    const builder = new pTokensSwapBuilder(node)
    const sourceAsset = new pTokenAssetMock({
      symbol: 'SOURCE',
      chainId: 'originating-chain-id',
      blockchain: 'source-blockchain',
      network: 'source-network',
    })
    const destinationAsset = new pTokenAssetMock({
      symbol: 'DESTINATION',
      chainId: 'destination-chain-id',
      blockchain: 'destination-blockchain',
      network: 'destiination-network',
    })
    const nativeToInterimSpy = jest.spyOn(sourceAsset, 'nativeToInterim')
    const hostToInterimSpy = jest.spyOn(sourceAsset, 'hostToInterim')
    builder.setAmount(1).setSourceAsset(sourceAsset).addDestinationAsset(destinationAsset, 'destination-address')
    const swap = builder.build()
    const promi = swap.execute()
    let inputTxDetected = false,
      inputTxProcessed = false,
      outputTxDetected = false,
      outputTxProcessed = false
    let inputTxDetectedObj, inputTxProcessedObj, outputTxDetectedObj, outputTxProcessedObj
    await promi
      .on('inputTxDetected', (obj) => {
        inputTxDetectedObj = obj
        inputTxDetected = true
      })
      .on('inputTxProcessed', (obj) => {
        inputTxProcessedObj = obj
        inputTxProcessed = true
      })
      .on('outputTxDetected', (obj) => {
        outputTxDetectedObj = obj
        outputTxDetected = true
      })
      .on('outputTxProcessed', (obj) => {
        outputTxProcessedObj = obj
        outputTxProcessed = true
      })
    expect(getAssetInfoSpy).toHaveBeenCalledWith('SOURCE', 'originating-chain-id')
    expect(hostToInterimSpy).toHaveBeenNthCalledWith(1, node, 'destination-address', 'destination-chain-id', undefined)
    expect(nativeToInterimSpy).toHaveBeenCalledTimes(0)
    expect(inputTxDetected).toBeTruthy()
    expect(inputTxDetectedObj).toBe('originating-tx-hash')
    expect(inputTxProcessed).toBeTruthy()
    expect(inputTxProcessedObj).toBe('originating-tx-hash')
    expect(outputTxDetected).toBeTruthy()
    expect(outputTxDetectedObj).toStrictEqual([{ chain_id: 'chain-id', status: 1, tx_hash: 'tx-hash' }])
    expect(outputTxProcessed).toBeTruthy()
    expect(outputTxProcessedObj).toStrictEqual([{ chain_id: 'chain-id', status: 2, tx_hash: 'tx-hash' }])
  })

  it('Should swap host asset with user data ', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfo').mockImplementation(() => {
      return Promise.resolve({
        chainId: 'originating-chain-id',
        isNative: true,
        tokenAddress: '',
      })
    })
    const getTransactionStatusSpy = jest.spyOn(pTokensNode.prototype, 'getTransactionStatus')
    getTransactionStatusSpy.mockResolvedValue({ inputs: [], outputs: [] })
    getTransactionStatusSpy
      .mockResolvedValueOnce({
        inputs: [],
        outputs: [{ tx_hash: 'tx-hash', chain_id: 'chain-id', status: Status.BROADCASTED }],
      })
      .mockResolvedValueOnce({
        inputs: [],
        outputs: [{ tx_hash: 'tx-hash', chain_id: 'chain-id', status: Status.BROADCASTED }],
      })
      .mockResolvedValue({
        inputs: [],
        outputs: [{ tx_hash: 'tx-hash', chain_id: 'chain-id', status: Status.CONFIRMED }],
      })

    const builder = new pTokensSwapBuilder(node)
    const sourceAsset = new pTokenAssetMock({
      symbol: 'SOURCE',
      chainId: 'originating-chain-id',
      blockchain: 'source-blockchain',
      network: 'source-network',
    })
    const destinationAsset = new pTokenAssetMock({
      symbol: 'DESTINATION',
      chainId: 'destination-chain-id',
      blockchain: 'destination-blockchain',
      network: 'destiination-network',
    })
    const nativeToInterimSpy = jest.spyOn(sourceAsset, 'nativeToInterim')
    const hostToInterimSpy = jest.spyOn(sourceAsset, 'hostToInterim')
    builder
      .setAmount(1)
      .setSourceAsset(sourceAsset)
      .addDestinationAsset(destinationAsset, 'destination-address', Buffer.from('user-data'))
    const swap = builder.build()
    const promi = swap.execute()
    let inputTxDetected = false,
      inputTxProcessed = false,
      outputTxDetected = false,
      outputTxProcessed = false
    let inputTxDetectedObj, inputTxProcessedObj, outputTxDetectedObj, outputTxProcessedObj
    await promi
      .on('inputTxDetected', (obj) => {
        inputTxDetectedObj = obj
        inputTxDetected = true
      })
      .on('inputTxProcessed', (obj) => {
        inputTxProcessedObj = obj
        inputTxProcessed = true
      })
      .on('outputTxDetected', (obj) => {
        outputTxDetectedObj = obj
        outputTxDetected = true
      })
      .on('outputTxProcessed', (obj) => {
        outputTxProcessedObj = obj
        outputTxProcessed = true
      })
    expect(getAssetInfoSpy).toHaveBeenCalledWith('SOURCE', 'originating-chain-id')
    expect(nativeToInterimSpy).toHaveBeenNthCalledWith(
      1,
      node,
      'destination-address',
      'destination-chain-id',
      Buffer.from('user-data')
    )
    expect(hostToInterimSpy).toHaveBeenCalledTimes(0)
    expect(inputTxDetected).toBeTruthy()
    expect(inputTxDetectedObj).toBe('originating-tx-hash')
    expect(inputTxProcessed).toBeTruthy()
    expect(inputTxProcessedObj).toBe('originating-tx-hash')
    expect(outputTxDetected).toBeTruthy()
    expect(outputTxDetectedObj).toStrictEqual([{ chain_id: 'chain-id', status: 1, tx_hash: 'tx-hash' }])
    expect(outputTxProcessed).toBeTruthy()
    expect(outputTxProcessedObj).toStrictEqual([{ chain_id: 'chain-id', status: 2, tx_hash: 'tx-hash' }])
  })
})
