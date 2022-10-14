import Web3 from 'web3'
import { getAccount, getContract } from './lib/'
import PromiEvent from 'promievent'
import { provider, TransactionReceipt } from 'web3-core'
import { AbiItem } from 'web3-utils'
import polling from 'light-async-polling'

export type MakeContractSendOptions = {
  method: string
  abi: AbiItem | AbiItem[]
  contractAddress: string
  value: number
  gasLimit?: number
}

export type MakeContractCallOptions = {
  method: string
  abi: AbiItem
  contractAddress: string
}

class SendOptions {
  from: string
  value: number
  gasPrice: number
  gas: number
  constructor(from: string, value: number) {
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

export class pTokensEvmProvider {
  private _web3: Web3
  private _gasPrice: number
  private _gasLimit: number

  constructor(_provider?: provider) {
    this._web3 = new Web3()
    if (_provider) this._web3.setProvider(_provider)
  }

  public get gasPrice() {
    return this._gasPrice
  }

  public setGasPrice(_gasPrice: number) {
    if (_gasPrice <= 0 || _gasPrice >= 1e12) {
      throw new Error('Invalid gas price')
    }
    this._gasPrice = _gasPrice
    return this
  }

  public get gasLimit() {
    return this._gasLimit
  }

  public setGasLimit(_gasLimit: number) {
    if (_gasLimit <= 0 || _gasLimit >= 10e6) {
      throw new Error('Invalid gas limit')
    }
    this._gasLimit = _gasLimit
    return this
  }

  public setPrivateKey(key: string) {
    const account = this._web3.eth.accounts.privateKeyToAccount('0x' + key)
    this._web3.eth.accounts.wallet.add(account)
    this._web3.eth.defaultAccount = account.address
    return this
  }

  public makeContractSend(_options: MakeContractSendOptions, _args: any[] = []) {
    const promi = new PromiEvent<string>(
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
              .once('receipt', (_receipt: TransactionReceipt) => promi.emit('txConfirmed', _receipt.transactionHash))
              .once('error', (_error: Error) => promi.emit('txError', _error))
            return resolve(receipt.transactionHash)
          } catch (_err) {
            reject(_err)
          }
        })() as unknown
    )
    return promi
  }

  async makeContractCall(_options: MakeContractCallOptions, _params: any[] = []): Promise<any> {
    const { method, abi, contractAddress } = _options
    const account = await getAccount(this._web3)
    const contract = getContract(this._web3, abi, contractAddress, account)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return contract.methods[method](..._params).call() as Promise<any>
  }

  async waitForTransactionConfirmation(_tx: string, _pollingTime = 5000) {
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
}
