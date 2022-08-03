import PromiEvent from 'promievent'
import polling from 'light-async-polling'
import { Api, JsonRpc } from 'eosjs'
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig'
import fetch from 'node-fetch'
import { GetTransactionResult } from 'eosjs/dist/eosjs-rpc-interfaces'

const EOS_TRANSACTION_EXECUTED = 'executed'

export type MakeContractSendOptions = {
  method: string
  abi: any
  contractAddress: string
  permission?: string
}

export class pTokensEosioProvider {
  private _api: Api
  private _blocksBehind: number
  private _expireSeconds: number
  private _actor: string

  constructor(_rpc: JsonRpc | string, _signatureProvider: JsSignatureProvider = null) {
    this._api = new Api({
      rpc: typeof _rpc === 'string' ? new JsonRpc(_rpc, { fetch }) : _rpc,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
      signatureProvider: _signatureProvider,
    })
    this._expireSeconds = 60
    this._blocksBehind = 3
  }

  public get blocksBehind() {
    return this._blocksBehind
  }

  public set blocksBehind(_blocksBehind: number) {
    if (_blocksBehind <= 0 || _blocksBehind >= 20) {
      throw new Error('Invalid blocks behind')
    }
    this._blocksBehind = _blocksBehind
  }

  public get expireSeconds() {
    return this._expireSeconds
  }

  public set expireSeconds(_expireSeconds: number) {
    if (_expireSeconds <= 0 || _expireSeconds >= 1000) {
      throw new Error('Invalid expire seconds')
    }
    this._expireSeconds = _expireSeconds
  }

  public get actor(): string {
    return this._actor
  }

  public set actor(_actor: string) {
    this._actor = _actor
  }

  public setPrivateKey(_key: string) {
    this._api.signatureProvider = new JsSignatureProvider([_key])
  }

  public makeContractSend = (_options: MakeContractSendOptions, _data: any = {}) => {
    const promi = new PromiEvent<string>(
      (resolve, reject) =>
        (async () => {
          try {
            if (!this._actor) return reject(new Error('Missing actor'))
            const { method, abi, contractAddress, permission } = _options
            this._api.cachedAbis.set(contractAddress, {
              abi: abi,
              rawAbi: null,
            })
            const ret = await this._api.transact(
              {
                actions: [
                  {
                    account: contractAddress,
                    name: method,
                    authorization: [
                      {
                        actor: this._actor,
                        permission: permission || 'active',
                      },
                    ],
                    data: _data,
                  },
                ],
              },
              {
                blocksBehind: this._blocksBehind,
                expireSeconds: this._expireSeconds,
              }
            )
            if ('transaction_id' in ret) {
              promi.emit('txBroadcasted', ret.transaction_id)
              await this.waitForTransactionConfirmation(ret.transaction_id)
              promi.emit('txConfirmed', ret.transaction_id)
              return resolve(ret.transaction_id)
            } else {
              return reject(new Error('Unexpected return value from transact()'))
            }
          } catch (_err) {
            return reject(_err)
          }
        })() as unknown
    )
    return promi
  }

  async waitForTransactionConfirmation(_tx: string, _pollingTime = 100) {
    let receipt: GetTransactionResult = null
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await polling(async () => {
      try {
        receipt = await this._api.rpc.history_get_transaction(_tx)
        if (receipt && receipt.trx.receipt.status === EOS_TRANSACTION_EXECUTED) return true
        else return false
      } catch (err) {
        return false
      }
    }, _pollingTime)
    return receipt
  }
}
