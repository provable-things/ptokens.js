import BigNumber from 'bignumber.js'
import polling from 'light-async-polling'
import PromiEvent from 'promievent'
import { pTokensAssetProvider } from 'ptokens-entities'
import { stringUtils } from 'ptokens-helpers'
import Web3 from 'web3'
import { Log, provider, TransactionReceipt } from 'web3-core'
import { AbiItem } from 'web3-utils'

import { EVENT_NAMES, eventNameToSignatureMap, getAccount, getContract, getOperationIdFromLog } from './lib/'

export type MakeContractSendOptions = {
  /** The method to be called. */
  method: string
  /** The contract ABI. */
  abi: AbiItem | AbiItem[]
  /** The contract address. */
  contractAddress: string
  /** The value being sent with the transaction. */
  value: BigNumber
  /** The gas limit for the transaction. */
  gasLimit?: number
}

export type MakeContractCallOptions = {
  /** The method to be called. */
  method: string
  /** The contract ABI. */
  abi: AbiItem
  /** The contract address. */
  contractAddress: string
}

class SendOptions {
  from: string
  value: BigNumber
  gasPrice: number
  gas: number
  constructor(from: string, value: BigNumber) {
    this.from = from
    this.value = value
  }
  maybeSetGasPrice(gasPrice: number) {
    if (gasPrice) this.gasPrice = gasPrice
    return this
  }
  maybeSetGasLimit(gasLimit: number) {
    if (gasLimit) this.gas = gasLimit
    return this
  }
}

export class pTokensEvmProvider implements pTokensAssetProvider {
  private _web3: Web3
  private _gasPrice: number
  private _gasLimit: number

  /**
   * Create and initialize a pTokensEvmProvider object.
   * @param _provider - A web3.js provider (refer to https://web3js.readthedocs.io/en/v1.8.0/web3.html#setprovider).
   */
  constructor(_provider?: provider) {
    this._web3 = new Web3()
    if (_provider) this._web3.setProvider(_provider)
  }

  /**
   * Return the gasPrice set with _setGasPrice()_.
   */
  get gasPrice() {
    return this._gasPrice
  }

  /**
   * Set transactions gas price.
   * @param _gasPrice - The desired gas price to be used when sending transactions.
   * @returns The same provider. This allows methods chaining.
   */
  setGasPrice(_gasPrice: number) {
    if (_gasPrice <= 0 || _gasPrice >= 1e12) {
      throw new Error('Invalid gas price')
    }
    this._gasPrice = _gasPrice
    return this
  }

  /**
   * Return the gasLimit set with _setGasLimit()_.
   */
  get gasLimit() {
    return this._gasLimit
  }

  /**
   * Set transactions gas limit.
   * @param _gasPrice - The desired gas limit to be used when sending transactions.
   * @returns The same provider. This allows methods chaining.
   */
  setGasLimit(_gasLimit: number) {
    if (_gasLimit <= 0 || _gasLimit >= 10e6) {
      throw new Error('Invalid gas limit')
    }
    this._gasLimit = _gasLimit
    return this
  }

  /**
   * Set a private key to sign transactions.
   * @param _key - A private key to sign transactions.
   * @returns The same provider. This allows methods chaining.
   */
  setPrivateKey(_key: string) {
    const account = this._web3.eth.accounts.privateKeyToAccount(stringUtils.addHexPrefix(_key))
    this._web3.eth.accounts.wallet.add(account)
    this._web3.eth.defaultAccount = account.address
    return this
  }

  async getLatestBlockNumber() {
    const block = await this._web3.eth.getBlock('latest')
    return block.number
  }
  /**
   * Send a transaction to the smart contract and execute its method.
   * Note this can alter the smart contract state.
   * The function returns a PromiEvent, i.e. a Promise that can also emit events.
   * In particular, the events fired during the execution are the following:
   * * _txBroadcasted_ -\> fired with the transactions hash when the transaction is broadcasted on-chain;
   * * _txConfirmed_ -\> fired with the transactions hash when the transaction is confirmed on-chain;
   * * _txError -\> fired whenever an error occurs during the transaction execution;
   * @param _options - An object specifying the contract interaction.
   * @param _args - The arguments to be passed to the contract method being called.
   * @returns A PromiEvent that resolves with the hash of the resulting transaction.
   */
  makeContractSend(_options: MakeContractSendOptions, _args: any[] = []) {
    const promi = new PromiEvent<TransactionReceipt>(
      (resolve, reject) =>
        (async () => {
          try {
            const { method, abi, contractAddress, value, gasLimit } = _options
            const account = await getAccount(this._web3)
            const contract = getContract(this._web3, abi, contractAddress, account)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            const receipt: TransactionReceipt = await contract.methods[method](..._args)
              .send(
                new SendOptions(account, value)
                  .maybeSetGasLimit(gasLimit || this.gasLimit)
                  .maybeSetGasPrice(this.gasPrice)
              )
              .once('transactionHash', (_hash: string) => promi.emit('txBroadcasted', _hash))
              .once('receipt', (_receipt: TransactionReceipt) => promi.emit('txConfirmed', _receipt))
              .once('error', (_error: Error) => promi.emit('txError', _error))
            return resolve(receipt)
          } catch (_err) {
            return reject(_err)
          }
        })() as unknown
    )
    return promi
  }

  /**
   * Call a “constant” method and execute its smart contract method in the EVM without sending any transaction.
   * Note calling cannot alter the smart contract state.
   * @param _options - An object specifying the contract interaction.
   * @param _args - The arguments to be passed to the contract method being called.
   * @returns A Promise that resolves with the return value(s) of the smart contract method.
   */
  async makeContractCall(_options: MakeContractCallOptions, _args: any[] = []): Promise<any> {
    const { method, abi, contractAddress } = _options
    const account = await getAccount(this._web3)
    const contract = getContract(this._web3, abi, contractAddress, account)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return contract.methods[method](..._args).call() as Promise<any>
  }

  async waitForTransactionConfirmation(_tx: string, _pollingTime = 1000) {
    let receipt: TransactionReceipt = null
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await polling(async () => {
      try {
        receipt = await this._web3.eth.getTransactionReceipt(_tx)
        if (!receipt) return false
        else if (receipt.status) return true
        else return false
      } catch (_err) {
        return false
      }
    }, _pollingTime)
    return receipt.transactionHash
  }

  protected async _pollForStateManagerOperation(
    _stateManagerAddress: string,
    _eventName: EVENT_NAMES,
    _fromBlock: number,
    _operationId: string,
    _pollingTime = 1000
  ) {
    let log: Log
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await polling(async () => {
      try {
        const logs = await this._web3.eth.getPastLogs({
          fromBlock: _fromBlock,
          address: _stateManagerAddress,
          topics: [eventNameToSignatureMap.get(_eventName)],
        })
        log = logs.find((_log) => getOperationIdFromLog(_log) === _operationId)
        if (log) return true
        return false
      } catch (_err) {
        return false
      }
    }, _pollingTime)
    return log
  }

  monitorCrossChainOperations(_stateManagerAddress: string, _operationId: string) {
    const promi = new PromiEvent<string>(
      (resolve, reject) =>
        (async () => {
          try {
            const latestBlockNumber = await this.getLatestBlockNumber()
            await this._pollForStateManagerOperation(
              _stateManagerAddress,
              EVENT_NAMES.OPERATION_QUEUED,
              latestBlockNumber,
              _operationId
            ).then((_log) => {
              promi.emit('operationQueued', _log.transactionHash)
              return _log
            })
            const finalTxLog = await Promise.any([
              this._pollForStateManagerOperation(
                _stateManagerAddress,
                EVENT_NAMES.OPERATION_EXECUTED,
                latestBlockNumber,
                _operationId
              ).then((_log) => {
                promi.emit('operationExecuted', _log.transactionHash)
                return _log
              }),
              this._pollForStateManagerOperation(
                _stateManagerAddress,
                EVENT_NAMES.OPERATION_CANCELLED,
                latestBlockNumber,
                _operationId
              ).then((_log) => {
                promi.emit('operationCancelled', _log.transactionHash)
                return _log
              }),
            ])
            return resolve(finalTxLog.transactionHash)
          } catch (_err) {
            return reject(_err)
          }
        })() as unknown
    )
    return promi
  }
}
