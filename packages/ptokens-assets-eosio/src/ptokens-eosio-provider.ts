import PromiEvent from 'promievent'
import polling from 'light-async-polling'
import { Api, JsonRpc } from 'eosjs'
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig'
import fetch from 'node-fetch'
import { GetTransactionResult } from 'eosjs/dist/eosjs-rpc-interfaces'
import { pTokensAssetProvider } from 'ptokens-entities'

const EOS_TRANSACTION_EXECUTED = 'executed'

export type Action = {
  contractAddress: string
  method: string
  abi: any
  arguments?: any
}

export class pTokensEosioProvider implements pTokensAssetProvider {
  private _api: Api
  private _blocksBehind: number
  private _expireSeconds: number
  private _actor: string
  private _permission: string

  /**
   * Create and initialize a pTokensEosioProvider object.
   * @param _rpc - An eosjs JsonRpc object or an RPC URL to initialize it.
   * @param _signatureProvider - A JsSignatureProvider object (https://developers.eos.io/manuals/eosjs/latest/faq/what-is-a-signature-provider).
   */
  constructor(_rpc: JsonRpc | string, _signatureProvider: JsSignatureProvider = null) {
    if (!_rpc) throw new Error('Invalid RPC argument')
    this._api = new Api({
      rpc: typeof _rpc === 'string' ? new JsonRpc(_rpc, { fetch }) : _rpc,
      textDecoder: new TextDecoder(),
      textEncoder: new TextEncoder(),
      signatureProvider: _signatureProvider,
    })
    this._expireSeconds = 60
    this._blocksBehind = 3
    this._permission = 'active'
  }

  /** Return the blocksBehind set with _setBlocksBehind()_. */
  get blocksBehind() {
    return this._blocksBehind
  }

  /**
   * Set transactions blocksBehind. Defaults to 3.
   * @param _blocksBehind - The block behind.
   * @returns The same provider. This allows methods chaining.
   */
  setBlocksBehind(_blocksBehind: number) {
    if (_blocksBehind <= 0 || _blocksBehind >= 20) {
      throw new Error('Invalid blocks behind')
    }
    this._blocksBehind = _blocksBehind
    return this
  }

  /** Return the expireSeconds set with _setExpireSeconds()_. */
  get expireSeconds() {
    return this._expireSeconds
  }

  /**
   * Set transactions expireSeconds. Defaults to 60.
   * @param _expireSeconds - The expire seconds.
   * @returns The same provider. This allows methods chaining.
   */
  setExpireSeconds(_expireSeconds: number) {
    if (_expireSeconds <= 0 || _expireSeconds >= 1000) {
      throw new Error('Invalid expire seconds')
    }
    this._expireSeconds = _expireSeconds
    return this
  }

  /** Return the actor set with _setActor()_ */
  get actor(): string {
    return this._actor
  }

  /**
   * Set the actor account name that will be used to send transactions.
   * @param _actor - An actor account name.
   * @returns The same provider. This allows methods chaining.
   */
  setActor(_actor: string) {
    this._actor = _actor
    return this
  }

  /**
   * Set the permission level that will be used to send transactions.
   * @param _permission - The permission level.
   * @returns The same provider. This allows methods chaining.
   */
  setPermission(_permission: string) {
    this._permission = _permission
    return this
  }

  /**
   * Set a private key to initialize a JsSignatureProvider.
   * @param _key - A private key to sign transactions.
   * @returns The same provider. This allows methods chaining.
   */
  setPrivateKey(_key: string) {
    this._api.signatureProvider = new JsSignatureProvider([_key])
    return this
  }

  /**
   * Push on-chain an array of actions in a single transaction.
   * The function returns a PromiEvent, i.e. a Promise that can also emit events.
   * In particular, the events fired during the execution are the following:
   * * _txBroadcasted_ -\> fired with the transaction hash when the transaction is broadcasted on-chain;
   * * _txConfirmed_ -\> fired with the transaction hash when the transaction is confirmed on-chain;
   * @param _actions - The transactions to be broadcasted.
   * @returns A PromiEvent that resolves with the hash of the resulting transaction.
   */
  transact(_actions: Action[]) {
    const promi = new PromiEvent<string>(
      (resolve, reject) =>
        (async () => {
          try {
            if (!this._actor) return reject(new Error('Missing actor'))
            _actions.forEach((_action) => {
              this._api.cachedAbis.set(_action.contractAddress, {
                abi: _action.abi,
                rawAbi: null,
              })
            })
            const ret = await this._api.transact(
              {
                actions: _actions.map((_action) => ({
                  name: _action.method,
                  account: _action.contractAddress,
                  data: _action.arguments !== undefined ? _action.arguments : {},
                  authorization: [{ actor: this.actor, permission: this._permission }],
                })),
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

  async waitForTransactionConfirmation(_tx: string, _pollingTime = 1000) {
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
    return receipt.id
  }
}
