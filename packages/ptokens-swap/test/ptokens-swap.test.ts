import { BlockchainType, ChainId } from 'ptokens-entities'
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

  test('Should swap native asset without user data ', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const getTransactionStatusSpy = jest.spyOn(pTokensNode.prototype, 'getTransactionStatus')
    getTransactionStatusSpy
      .mockRejectedValueOnce(new Error('Failed to extract the json from the response:{"size":0,"timeout":0}'))
      .mockResolvedValueOnce({ inputs: [], outputs: [] })
      .mockResolvedValueOnce({
        inputs: [{ tx_hash: 'originating-tx-hash', chain_id: 'input-chain-id', status: Status.BROADCASTED }],
        outputs: [],
      })
      .mockResolvedValueOnce({
        inputs: [{ tx_hash: 'originating-tx-hash', chain_id: 'input-chain-id', status: Status.BROADCASTED }],
        outputs: [{ tx_hash: 'output-tx-hash', chain_id: 'output-chain-id', status: Status.BROADCASTED }],
      })
      .mockResolvedValue({
        inputs: [{ tx_hash: 'originating-tx-hash', chain_id: 'input-chain-id', status: Status.BROADCASTED }],
        outputs: [{ tx_hash: 'output-tx-hash', chain_id: 'output-chain-id', status: Status.CONFIRMED }],
      })

    const sourceAsset = new pTokenAssetMock(
      {
        node,
        symbol: 'SOURCE',
        assetInfo: {
          chainId: ChainId.BitcoinMainnet,
          isNative: true,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          vaultAddress: 'vault-contract-address',
        },
      },
      BlockchainType.UTXO
    )
    const destinationAsset = new pTokenAssetMock(
      {
        node,
        symbol: 'DESTINATION',
        assetInfo: {
          chainId: ChainId.EthereumMainnet,
          isNative: false,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          vaultAddress: 'vault-contract-address',
        },
      },
      BlockchainType.EVM
    )
    const nativeToInterimSpy = jest.spyOn(sourceAsset, 'nativeToInterim')
    const hostToInterimSpy = jest.spyOn(sourceAsset, 'hostToInterim')
    const swap = new pTokensSwap(
      node,
      sourceAsset,
      [{ asset: destinationAsset, destinationAddress: 'destination-address' }],
      10
    )
    const promi = swap.execute()
    let inputTxBroadcasted = false,
      inputTxConfirmed = false,
      inputTxDetected = false,
      outputTxDetected = false,
      outputTxProcessed = false
    let depositAddress,
      inputTxBroadcastedObj,
      inputTxConfirmedObj,
      inputTxDetectedObj,
      outputTxDetectedObj,
      outputTxProcessedObj
    await promi
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
      .on('outputTxProcessed', (obj) => {
        outputTxProcessedObj = obj
        outputTxProcessed = true
      })
    expect(nativeToInterimSpy).toHaveBeenNthCalledWith(1, 10, 'destination-address', ChainId.EthereumMainnet, undefined)
    expect(hostToInterimSpy).toHaveBeenCalledTimes(0)
    expect(depositAddress).toStrictEqual('deposit-address')
    expect(inputTxBroadcasted).toBeTruthy()
    expect(inputTxBroadcastedObj).toBe('originating-tx-hash')
    expect(inputTxConfirmed).toBeTruthy()
    expect(inputTxConfirmedObj).toBe('originating-tx-hash')
    expect(inputTxDetected).toBeTruthy()
    expect(inputTxDetectedObj).toStrictEqual([
      { chain_id: 'input-chain-id', status: Status.BROADCASTED, tx_hash: 'originating-tx-hash' },
    ])
    expect(outputTxDetected).toBeTruthy()
    expect(outputTxDetectedObj).toStrictEqual([
      { chain_id: 'output-chain-id', status: Status.BROADCASTED, tx_hash: 'output-tx-hash' },
    ])
    expect(outputTxProcessed).toBeTruthy()
    expect(outputTxProcessedObj).toStrictEqual([
      { chain_id: 'output-chain-id', status: Status.CONFIRMED, tx_hash: 'output-tx-hash' },
    ])
  })

  test('Should swap native asset with user data ', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const getTransactionStatusSpy = jest.spyOn(pTokensNode.prototype, 'getTransactionStatus')
    getTransactionStatusSpy
      .mockRejectedValueOnce(new Error('Failed to extract the json from the response:{"size":0,"timeout":0}'))
      .mockResolvedValueOnce({ inputs: [], outputs: [] })
      .mockResolvedValueOnce({
        inputs: [{ tx_hash: 'originating-tx-hash', chain_id: 'input-chain-id', status: Status.BROADCASTED }],
        outputs: [],
      })
      .mockResolvedValueOnce({
        inputs: [{ tx_hash: 'originating-tx-hash', chain_id: 'input-chain-id', status: Status.BROADCASTED }],
        outputs: [{ tx_hash: 'output-tx-hash', chain_id: 'output-chain-id', status: Status.BROADCASTED }],
      })
      .mockRejectedValueOnce(new Error('Failed to extract the json from the response:{"size":0,"timeout":0}'))
      .mockResolvedValue({
        inputs: [{ tx_hash: 'originating-tx-hash', chain_id: 'input-chain-id', status: Status.BROADCASTED }],
        outputs: [{ tx_hash: 'output-tx-hash', chain_id: 'output-chain-id', status: Status.CONFIRMED }],
      })

    const builder = new pTokensSwapBuilder(node)
    const sourceAsset = new pTokenAssetMock(
      {
        node,
        symbol: 'SOURCE',
        assetInfo: {
          chainId: ChainId.BitcoinMainnet,
          isNative: true,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          vaultAddress: 'vault-contract-address',
        },
      },
      BlockchainType.UTXO
    )
    const destinationAsset = new pTokenAssetMock(
      {
        node,
        symbol: 'DESTINATION',
        assetInfo: {
          chainId: ChainId.EthereumMainnet,
          isNative: false,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          vaultAddress: 'vault-contract-address',
        },
      },
      BlockchainType.EVM
    )
    const nativeToInterimSpy = jest.spyOn(sourceAsset, 'nativeToInterim')
    const hostToInterimSpy = jest.spyOn(sourceAsset, 'hostToInterim')
    builder
      .setAmount(123.456)
      .setSourceAsset(sourceAsset)
      .addDestinationAsset(destinationAsset, 'destination-address', Buffer.from('user-data'))
    const swap = builder.build()
    const promi = swap.execute()
    let inputTxBroadcasted = false,
      inputTxConfirmed = false,
      inputTxDetected = false,
      outputTxDetected = false,
      outputTxProcessed = false
    let depositAddress,
      inputTxBroadcastedObj,
      inputTxConfirmedObj,
      inputTxDetectedObj,
      outputTxDetectedObj,
      outputTxProcessedObj
    await promi
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
      .on('outputTxProcessed', (obj) => {
        outputTxProcessedObj = obj
        outputTxProcessed = true
      })
    expect(nativeToInterimSpy).toHaveBeenNthCalledWith(
      1,
      123.456,
      'destination-address',
      ChainId.EthereumMainnet,
      Buffer.from('user-data')
    )
    expect(hostToInterimSpy).toHaveBeenCalledTimes(0)
    expect(depositAddress).toStrictEqual('deposit-address')
    expect(inputTxBroadcasted).toBeTruthy()
    expect(inputTxBroadcastedObj).toBe('originating-tx-hash')
    expect(inputTxConfirmed).toBeTruthy()
    expect(inputTxConfirmedObj).toBe('originating-tx-hash')
    expect(inputTxDetected).toBeTruthy()
    expect(inputTxDetectedObj).toStrictEqual([
      { chain_id: 'input-chain-id', status: Status.BROADCASTED, tx_hash: 'originating-tx-hash' },
    ])
    expect(outputTxDetected).toBeTruthy()
    expect(outputTxDetectedObj).toStrictEqual([
      { chain_id: 'output-chain-id', status: Status.BROADCASTED, tx_hash: 'output-tx-hash' },
    ])
    expect(outputTxProcessed).toBeTruthy()
    expect(outputTxProcessedObj).toStrictEqual([
      { chain_id: 'output-chain-id', status: Status.CONFIRMED, tx_hash: 'output-tx-hash' },
    ])
  })

  test('Should swap host asset without user data ', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const getTransactionStatusSpy = jest.spyOn(pTokensNode.prototype, 'getTransactionStatus')
    getTransactionStatusSpy
      .mockRejectedValueOnce(new Error('Failed to extract the json from the response:{"size":0,"timeout":0}'))
      .mockResolvedValueOnce({ inputs: [], outputs: [] })
      .mockResolvedValueOnce({
        inputs: [{ tx_hash: 'originating-tx-hash', chain_id: 'input-chain-id', status: Status.BROADCASTED }],
        outputs: [],
      })
      .mockResolvedValueOnce({
        inputs: [],
        outputs: [{ tx_hash: 'output-tx-hash', chain_id: 'output-chain-id', status: Status.BROADCASTED }],
      })
      .mockResolvedValue({
        inputs: [],
        outputs: [{ tx_hash: 'output-tx-hash', chain_id: 'output-chain-id', status: Status.CONFIRMED }],
      })

    const builder = new pTokensSwapBuilder(node)
    const sourceAsset = new pTokenAssetMock(
      {
        node,
        symbol: 'SOURCE',
        assetInfo: {
          chainId: ChainId.BitcoinMainnet,
          isNative: false,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          vaultAddress: 'vault-contract-address',
        },
      },
      BlockchainType.UTXO
    )
    const destinationAsset = new pTokenAssetMock(
      {
        node,
        symbol: 'DESTINATION',
        assetInfo: {
          chainId: ChainId.EthereumMainnet,
          isNative: false,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          vaultAddress: 'vault-contract-address',
        },
      },
      BlockchainType.EVM
    )
    const nativeToInterimSpy = jest.spyOn(sourceAsset, 'nativeToInterim')
    const hostToInterimSpy = jest.spyOn(sourceAsset, 'hostToInterim')
    builder.setAmount(123.456).setSourceAsset(sourceAsset).addDestinationAsset(destinationAsset, 'destination-address')
    const swap = builder.build()
    const promi = swap.execute()
    let inputTxBroadcasted = false,
      inputTxConfirmed = false,
      inputTxDetected = false,
      outputTxDetected = false,
      outputTxProcessed = false
    let inputTxBroadcastedObj, inputTxConfirmedObj, inputTxDetectedObj, outputTxDetectedObj, outputTxProcessedObj
    await promi
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
      .on('outputTxProcessed', (obj) => {
        outputTxProcessedObj = obj
        outputTxProcessed = true
      })
    expect(hostToInterimSpy).toHaveBeenNthCalledWith(
      1,
      123.456,
      'destination-address',
      ChainId.EthereumMainnet,
      undefined
    )
    expect(nativeToInterimSpy).toHaveBeenCalledTimes(0)
    expect(inputTxBroadcasted).toBeTruthy()
    expect(inputTxBroadcastedObj).toBe('originating-tx-hash')
    expect(inputTxConfirmed).toBeTruthy()
    expect(inputTxConfirmedObj).toBe('originating-tx-hash')
    expect(inputTxDetected).toBeTruthy()
    expect(inputTxDetectedObj).toStrictEqual([
      { chain_id: 'input-chain-id', status: Status.BROADCASTED, tx_hash: 'originating-tx-hash' },
    ])
    expect(outputTxDetected).toBeTruthy()
    expect(outputTxDetectedObj).toStrictEqual([
      { chain_id: 'output-chain-id', status: Status.BROADCASTED, tx_hash: 'output-tx-hash' },
    ])
    expect(outputTxProcessed).toBeTruthy()
    expect(outputTxProcessedObj).toStrictEqual([
      { chain_id: 'output-chain-id', status: Status.CONFIRMED, tx_hash: 'output-tx-hash' },
    ])
  })

  test('Should swap host asset with user data ', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const getTransactionStatusSpy = jest.spyOn(pTokensNode.prototype, 'getTransactionStatus')
    getTransactionStatusSpy
      .mockRejectedValueOnce(new Error('Failed to extract the json from the response:{"size":0,"timeout":0}'))
      .mockResolvedValueOnce({ inputs: [], outputs: [] })
      .mockResolvedValueOnce({
        inputs: [{ tx_hash: 'originating-tx-hash', chain_id: 'input-chain-id', status: Status.BROADCASTED }],
        outputs: [],
      })
      .mockResolvedValueOnce({
        inputs: [],
        outputs: [{ tx_hash: 'output-tx-hash', chain_id: 'output-chain-id', status: Status.BROADCASTED }],
      })
      .mockResolvedValue({
        inputs: [],
        outputs: [{ tx_hash: 'output-tx-hash', chain_id: 'output-chain-id', status: Status.CONFIRMED }],
      })

    const builder = new pTokensSwapBuilder(node)
    const sourceAsset = new pTokenAssetMock(
      {
        node,
        symbol: 'SRC',
        assetInfo: {
          chainId: ChainId.EthereumMainnet,
          isNative: true,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          vaultAddress: 'vault-contract-address',
        },
      },
      BlockchainType.EVM
    )
    const destinationAsset = new pTokenAssetMock(
      {
        node,
        symbol: 'DST',
        assetInfo: {
          chainId: ChainId.BitcoinMainnet,
          isNative: false,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          vaultAddress: 'vault-contract-address',
        },
      },
      BlockchainType.UTXO
    )
    const nativeToInterimSpy = jest.spyOn(sourceAsset, 'nativeToInterim')
    const hostToInterimSpy = jest.spyOn(sourceAsset, 'hostToInterim')
    builder
      .setAmount(123.456)
      .setSourceAsset(sourceAsset)
      .addDestinationAsset(destinationAsset, 'destination-address', Buffer.from('user-data'))
    const swap = builder.build()
    const promi = swap.execute()
    let inputTxBroadcasted = false,
      inputTxConfirmed = false,
      inputTxDetected = false,
      outputTxDetected = false,
      outputTxProcessed = false
    let inputTxBroadcastedObj, inputTxConfirmedObj, inputTxDetectedObj, outputTxDetectedObj, outputTxProcessedObj
    await promi
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
      .on('outputTxProcessed', (obj) => {
        outputTxProcessedObj = obj
        outputTxProcessed = true
      })
    expect(nativeToInterimSpy).toHaveBeenNthCalledWith(
      1,
      123.456,
      'destination-address',
      ChainId.BitcoinMainnet,
      Buffer.from('user-data')
    )
    expect(hostToInterimSpy).toHaveBeenCalledTimes(0)
    expect(inputTxBroadcasted).toBeTruthy()
    expect(inputTxBroadcastedObj).toBe('originating-tx-hash')
    expect(inputTxConfirmed).toBeTruthy()
    expect(inputTxConfirmedObj).toBe('originating-tx-hash')
    expect(inputTxDetected).toBeTruthy()
    expect(inputTxDetectedObj).toStrictEqual([
      { chain_id: 'input-chain-id', status: 0, tx_hash: 'originating-tx-hash' },
    ])
    expect(outputTxDetected).toBeTruthy()
    expect(outputTxDetectedObj).toStrictEqual([
      { chain_id: 'output-chain-id', status: Status.BROADCASTED, tx_hash: 'output-tx-hash' },
    ])
    expect(outputTxProcessed).toBeTruthy()
    expect(outputTxProcessedObj).toStrictEqual([
      { chain_id: 'output-chain-id', status: Status.CONFIRMED, tx_hash: 'output-tx-hash' },
    ])
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
