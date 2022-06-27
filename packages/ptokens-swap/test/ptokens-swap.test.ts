import { pTokensNode, pTokensNodeProvider, Status } from 'ptokens-node'
import { DepositAddress } from 'ptokens-deposit-address'
import { pTokensSwapBuilder } from '../src/index'
import { pTokensUtxoAsset } from 'ptokens-assets-utxo'
import { pTokensEvmAsset } from 'ptokens-assets-evm'
import PromiEvent from 'promievent'

jest.mock('ptokens-node')
// jest.mock('ptokens-deposit-address')
jest.setTimeout(10000)

describe('pTokensSwap', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('Should swap native UTXO to EVM ', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const getNativeDepositAddressSpy = jest
      .spyOn(pTokensNode.prototype, 'getNativeDepositAddress')
      .mockImplementation(() =>
        Promise.resolve({
          nonce: 1,
          nativeDepositAddress: 'native-deposit-address',
          enclavePublicKey: 'enclave-public-key',
        })
      )
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfo').mockImplementation(() => {
      return Promise.resolve({
        chainId: 'originating-chain-id',
        isNative: true,
        tokenAddress: '',
      })
    })
    const waitForDeposit = jest.spyOn(DepositAddress.prototype, 'waitForDeposit').mockImplementation(() => {
      const promi = new PromiEvent<string>((resolve) =>
        setImmediate(() => {
          promi.emit('txBroadcasted', 'native-tx-id')
          promi.emit('txConfirmed', 'native-tx-id')
          resolve('native-tx-id')
        })
      )
      return promi
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
    const sourceAsset = new pTokensUtxoAsset({
      symbol: 'UTXO',
      chainId: 'originating-chain-id',
      blockchain: 'utxo',
      network: 'mainnet',
    })
    const destinationAsset = new pTokensEvmAsset({
      symbol: 'pUTXO',
      chainId: 'destination-chain-id',
      blockchain: 'evm',
      network: 'mainnet',
      destinationAddress: 'destination-address',
    })
    builder.setAmount(1).setSourceAsset(sourceAsset).setDestinationAssets([destinationAsset])
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
    expect(getNativeDepositAddressSpy).toHaveBeenCalledWith(
      'originating-chain-id',
      'destination-address',
      'destination-chain-id'
    )
    expect(waitForDeposit).toHaveBeenCalledTimes(1)
    expect(getAssetInfoSpy).toHaveBeenCalledWith('UTXO', 'originating-chain-id')
    expect(inputTxDetected).toBeTruthy()
    expect(inputTxDetectedObj).toBe('native-tx-id')
    expect(inputTxProcessed).toBeTruthy()
    expect(inputTxProcessedObj).toBe('native-tx-id')
    expect(outputTxDetected).toBeTruthy()
    expect(outputTxDetectedObj).toStrictEqual([{ chain_id: 'chain-id', status: 1, tx_hash: 'tx-hash' }])
    expect(outputTxProcessed).toBeTruthy()
    expect(outputTxProcessedObj).toStrictEqual([{ chain_id: 'chain-id', status: 2, tx_hash: 'tx-hash' }])
  })
})
