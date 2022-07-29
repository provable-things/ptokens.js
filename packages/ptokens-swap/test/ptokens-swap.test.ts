import { Blockchain, ChainId, Network } from 'ptokens-entities'
import { pTokensNode, pTokensNodeProvider, Status } from 'ptokens-node'
import { pTokensSwap, pTokensSwapBuilder } from '../src/index'
import { pTokenAssetMock } from './mocks/ptoken-asset'

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
        isSystemToken: false,
      })
    })
    const getTransactionStatusSpy = jest.spyOn(pTokensNode.prototype, 'getTransactionStatus')
    getTransactionStatusSpy
      .mockRejectedValueOnce(new Error('Failed to extract the json from the response:{"size":0,"timeout":0}'))
      .mockResolvedValueOnce({ inputs: [], outputs: [] })
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

    const sourceAsset = new pTokenAssetMock({
      symbol: 'SOURCE',
      chainId: ChainId.BitcoinMainnet,
      blockchain: Blockchain.Bitcoin,
      network: Network.Mainnet,
    })
    const destinationAsset = new pTokenAssetMock({
      symbol: 'DESTINATION',
      chainId: ChainId.EthereumMainnet,
      blockchain: Blockchain.Ethereum,
      network: Network.Mainnet,
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
    expect(getAssetInfoSpy).toHaveBeenCalledWith('SOURCE', ChainId.BitcoinMainnet)
    expect(nativeToInterimSpy).toHaveBeenNthCalledWith(
      1,
      node,
      10,
      'destination-address',
      ChainId.EthereumMainnet,
      undefined
    )
    expect(hostToInterimSpy).toHaveBeenCalledTimes(0)
    expect(inputTxDetected).toBeTruthy()
    expect(inputTxDetectedObj).toBe('originating-tx-hash')
    expect(inputTxProcessed).toBeTruthy()
    expect(inputTxProcessedObj).toBe('originating-tx-hash')
    expect(outputTxDetected).toBeTruthy()
    expect(outputTxDetectedObj).toStrictEqual([
      { chain_id: 'chain-id', status: Status.BROADCASTED, tx_hash: 'tx-hash' },
    ])
    expect(outputTxProcessed).toBeTruthy()
    expect(outputTxProcessedObj).toStrictEqual([{ chain_id: 'chain-id', status: Status.CONFIRMED, tx_hash: 'tx-hash' }])
  })

  it('Should reject if getAssetInfo rejects', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const getAssetInfoSpy = jest
      .spyOn(pTokensNode.prototype, 'getAssetInfo')
      .mockRejectedValue(new Error('getAssetInfo error'))
    const getTransactionStatusSpy = jest.spyOn(pTokensNode.prototype, 'getTransactionStatus')
    getTransactionStatusSpy
      .mockRejectedValueOnce(new Error('Failed to extract the json from the response:{"size":0,"timeout":0}'))
      .mockResolvedValueOnce({ inputs: [], outputs: [] })
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

    const sourceAsset = new pTokenAssetMock({
      symbol: 'SOURCE',
      chainId: ChainId.BitcoinMainnet,
      blockchain: Blockchain.Bitcoin,
      network: Network.Mainnet,
    })
    const destinationAsset = new pTokenAssetMock({
      symbol: 'DESTINATION',
      chainId: ChainId.EthereumMainnet,
      blockchain: Blockchain.Ethereum,
      network: Network.Mainnet,
    })
    const swap = new pTokensSwap(
      node,
      sourceAsset,
      [{ asset: destinationAsset, destinationAddress: 'destination-address' }],
      10
    )
    try {
      await swap.execute()
      fail()
    } catch (err) {
      expect(err.message).toEqual('getAssetInfo error')
      expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SOURCE', ChainId.BitcoinMainnet)
    }
  })

  it('Should swap native asset with user data ', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfo').mockImplementation(() => {
      return Promise.resolve({
        chainId: 'originating-chain-id',
        isNative: true,
        tokenAddress: '',
        isSystemToken: false,
      })
    })
    const getTransactionStatusSpy = jest.spyOn(pTokensNode.prototype, 'getTransactionStatus')
    getTransactionStatusSpy
      .mockRejectedValueOnce(new Error('Failed to extract the json from the response:{"size":0,"timeout":0}'))
      .mockResolvedValueOnce({ inputs: [], outputs: [] })
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
      chainId: ChainId.BitcoinMainnet,
      blockchain: Blockchain.Bitcoin,
      network: Network.Mainnet,
    })
    const destinationAsset = new pTokenAssetMock({
      symbol: 'DESTINATION',
      chainId: ChainId.EthereumMainnet,
      blockchain: Blockchain.Ethereum,
      network: Network.Mainnet,
    })
    const nativeToInterimSpy = jest.spyOn(sourceAsset, 'nativeToInterim')
    const hostToInterimSpy = jest.spyOn(sourceAsset, 'hostToInterim')
    builder
      .setAmount(123.456)
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
    expect(getAssetInfoSpy).toHaveBeenCalledWith('SOURCE', ChainId.BitcoinMainnet)
    expect(nativeToInterimSpy).toHaveBeenNthCalledWith(
      1,
      node,
      123.456,
      'destination-address',
      ChainId.EthereumMainnet,
      Buffer.from('user-data')
    )
    expect(hostToInterimSpy).toHaveBeenCalledTimes(0)
    expect(inputTxDetected).toBeTruthy()
    expect(inputTxDetectedObj).toBe('originating-tx-hash')
    expect(inputTxProcessed).toBeTruthy()
    expect(inputTxProcessedObj).toBe('originating-tx-hash')
    expect(outputTxDetected).toBeTruthy()
    expect(outputTxDetectedObj).toStrictEqual([
      { chain_id: 'chain-id', status: Status.BROADCASTED, tx_hash: 'tx-hash' },
    ])
    expect(outputTxProcessed).toBeTruthy()
    expect(outputTxProcessedObj).toStrictEqual([{ chain_id: 'chain-id', status: Status.CONFIRMED, tx_hash: 'tx-hash' }])
  })

  it('Should swap host asset without user data ', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfo').mockImplementation(() => {
      return Promise.resolve({
        chainId: 'originating-chain-id',
        isNative: false,
        tokenAddress: '',
        isSystemToken: false,
      })
    })
    const getTransactionStatusSpy = jest.spyOn(pTokensNode.prototype, 'getTransactionStatus')
    getTransactionStatusSpy
      .mockRejectedValueOnce(new Error('Failed to extract the json from the response:{"size":0,"timeout":0}'))
      .mockResolvedValueOnce({ inputs: [], outputs: [] })
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
      chainId: ChainId.BitcoinMainnet,
      blockchain: Blockchain.Bitcoin,
      network: Network.Mainnet,
    })
    const destinationAsset = new pTokenAssetMock({
      symbol: 'DESTINATION',
      chainId: ChainId.EthereumMainnet,
      blockchain: Blockchain.Ethereum,
      network: Network.Mainnet,
    })
    const nativeToInterimSpy = jest.spyOn(sourceAsset, 'nativeToInterim')
    const hostToInterimSpy = jest.spyOn(sourceAsset, 'hostToInterim')
    builder.setAmount(123.456).setSourceAsset(sourceAsset).addDestinationAsset(destinationAsset, 'destination-address')
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
    expect(getAssetInfoSpy).toHaveBeenCalledWith('SOURCE', ChainId.BitcoinMainnet)
    expect(hostToInterimSpy).toHaveBeenNthCalledWith(
      1,
      node,
      123.456,
      'destination-address',
      ChainId.EthereumMainnet,
      undefined
    )
    expect(nativeToInterimSpy).toHaveBeenCalledTimes(0)
    expect(inputTxDetected).toBeTruthy()
    expect(inputTxDetectedObj).toBe('originating-tx-hash')
    expect(inputTxProcessed).toBeTruthy()
    expect(inputTxProcessedObj).toBe('originating-tx-hash')
    expect(outputTxDetected).toBeTruthy()
    expect(outputTxDetectedObj).toStrictEqual([
      { chain_id: 'chain-id', status: Status.BROADCASTED, tx_hash: 'tx-hash' },
    ])
    expect(outputTxProcessed).toBeTruthy()
    expect(outputTxProcessedObj).toStrictEqual([{ chain_id: 'chain-id', status: Status.CONFIRMED, tx_hash: 'tx-hash' }])
  })

  it('Should swap host asset with user data ', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfo').mockImplementation(() => {
      return Promise.resolve({
        chainId: 'originating-chain-id',
        isNative: true,
        tokenAddress: '',
        isSystemToken: false,
      })
    })
    const getTransactionStatusSpy = jest.spyOn(pTokensNode.prototype, 'getTransactionStatus')
    getTransactionStatusSpy
      .mockRejectedValueOnce(new Error('Failed to extract the json from the response:{"size":0,"timeout":0}'))
      .mockResolvedValueOnce({ inputs: [], outputs: [] })
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
      chainId: ChainId.BitcoinMainnet,
      blockchain: Blockchain.Bitcoin,
      network: Network.Mainnet,
    })
    const destinationAsset = new pTokenAssetMock({
      symbol: 'DESTINATION',
      chainId: ChainId.EthereumMainnet,
      blockchain: Blockchain.Ethereum,
      network: Network.Mainnet,
    })
    const nativeToInterimSpy = jest.spyOn(sourceAsset, 'nativeToInterim')
    const hostToInterimSpy = jest.spyOn(sourceAsset, 'hostToInterim')
    builder
      .setAmount(123.456)
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
    expect(getAssetInfoSpy).toHaveBeenCalledWith('SOURCE', ChainId.BitcoinMainnet)
    expect(nativeToInterimSpy).toHaveBeenNthCalledWith(
      1,
      node,
      123.456,
      'destination-address',
      ChainId.EthereumMainnet,
      Buffer.from('user-data')
    )
    expect(hostToInterimSpy).toHaveBeenCalledTimes(0)
    expect(inputTxDetected).toBeTruthy()
    expect(inputTxDetectedObj).toBe('originating-tx-hash')
    expect(inputTxProcessed).toBeTruthy()
    expect(inputTxProcessedObj).toBe('originating-tx-hash')
    expect(outputTxDetected).toBeTruthy()
    expect(outputTxDetectedObj).toStrictEqual([
      { chain_id: 'chain-id', status: Status.BROADCASTED, tx_hash: 'tx-hash' },
    ])
    expect(outputTxProcessed).toBeTruthy()
    expect(outputTxProcessedObj).toStrictEqual([{ chain_id: 'chain-id', status: Status.CONFIRMED, tx_hash: 'tx-hash' }])
  })
})