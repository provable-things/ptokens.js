import axios, { AxiosInstance, AxiosResponse } from 'axios'
import PromiEvent from 'promievent'
import polling from 'light-async-polling'

export type Transaction = {
  status?: { confirmed: boolean }
  confirmations?: number
}

export type Utxo = {
  txid?: string
  tx_hash?: string
  confirmations?: number
  status?: { confirmed: boolean }
}

export enum CallTypes {
  CALL_GET,
  CALL_POST,
}

function getApi(_endpoint: string, _headers = {}, _timeout = 2000): AxiosInstance {
  if (Object.keys(_headers).length === 0) _headers = { 'Content-Type': 'application/json' }
  return axios.create({
    baseURL: _endpoint,
    timeout: _timeout,
    headers: _headers,
  })
}

export abstract class pTokensUtxoProvider {
  api: AxiosInstance
  endpoint: string

  constructor(_endpoint: string, _headers = {}) {
    this.api = getApi(_endpoint, _headers)
    this.endpoint = _endpoint
  }

  protected async _makeApiCall<T>(_callType: CallTypes, _apiPath: string, _params?: any): Promise<T> {
    let res: AxiosResponse<T>
    switch (_callType) {
      case CallTypes.CALL_GET:
        res = await this.api.get(_apiPath)
        break
      case CallTypes.CALL_POST:
        res = await this.api.post(_apiPath, _params)
    }
    return res.data
  }

  abstract waitForTransactionConfirmation(_tx: string, _pollingTime: number): Promise<Transaction>

  abstract monitorUtxoByAddress(_address: string, _pollingTime: number, _confirmations?: number): PromiEvent<string>

  abstract broadcastTransaction(_network: string, _tx: string)
}

export class pTokensBlockstreamUtxoProvider extends pTokensUtxoProvider {
  broadcastTransaction(_tx: string) {
    return this._makeApiCall(CallTypes.CALL_POST, '/tx', _tx)
  }

  getUtxoByAddress(_address: string) {
    return this._makeApiCall<Utxo[]>(CallTypes.CALL_GET, `/address/${_address}/utxo`)
  }

  getTransactionHexByHash(_txHash: string) {
    return this._makeApiCall(CallTypes.CALL_GET, `/tx/${_txHash}/hex`)
  }

  monitorUtxoByAddress(_address: string, _pollingTime: number): PromiEvent<string> {
    const promi = new PromiEvent<string>(
      (resolve) =>
        (async () => {
          let isBroadcasted = false
          let utxos: Utxo[] = []
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          await polling(async () => {
            utxos = await this._makeApiCall<Utxo[]>(CallTypes.CALL_GET, `/address/${_address}/utxo`)
            if (utxos.length > 0) {
              if (utxos[0].status.confirmed) {
                if (!isBroadcasted) {
                  promi.emit('txBroadcasted', utxos[0].txid)
                }
                promi.emit('txConfirmed', utxos[0].txid)
                return true
              } else if (!isBroadcasted) {
                isBroadcasted = true
                promi.emit('txBroadcasted', utxos[0].txid)
                return false
              }
            } else {
              return false
            }
          }, _pollingTime)
          return resolve(utxos[0].txid)
        })() as unknown
    )
    return promi
  }

  async waitForTransactionConfirmation(_tx: string, _pollingTime: number): Promise<Transaction> {
    let transaction: Transaction = null
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await polling(async () => {
      try {
        transaction = await this._makeApiCall(CallTypes.CALL_GET, `/tx/${_tx}`)
        if (!transaction || !transaction.status) return false
        return transaction.status.confirmed
      } catch (err) {
        return false
      }
    }, _pollingTime)
    return transaction
  }
}
