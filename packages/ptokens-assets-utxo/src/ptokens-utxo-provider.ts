import axios, { AxiosInstance, AxiosResponse } from 'axios'
import PromiEvent from 'promievent'
import polling from 'light-async-polling'
import { pTokensAssetProvider } from 'ptokens-entities'

export type Transaction = {
  /** Status of the transaction. */
  status?: {
    /** Flag indicating if the transaction has been confirmed. */
    confirmed: boolean
  }
  /** Number of confirmations. */
  confirmations?: number
}

export type Utxo = {
  /** Transaction hash if tx_hash is not available */
  txid?: string
  /** Transaction hash if txid is not available */
  tx_hash?: string
  /** Number of confirmations. */
  confirmations?: number
  /** Status of the transaction. */
  status?: {
    /** Flag indicating if the transaction has been confirmed. */
    confirmed: boolean
  }
}

export enum CallTypes {
  /** GET request */
  CALL_GET,
  /** POST request */
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

export abstract class pTokensUtxoProvider implements pTokensAssetProvider {
  private _api: AxiosInstance

  /**
   * Create and initialize a pTokensUtxoProvider object.
   * @param _endpoint The provider endpoint URL.
   * @param _headers The headers to be used when sending requests to the endpoint.
   */
  constructor(_endpoint: string, _headers = {}) {
    this._api = getApi(_endpoint, _headers)
  }

  protected async _makeApiCall<T>(_callType: CallTypes, _apiPath: string, _params?: any): Promise<T> {
    let res: AxiosResponse<T>
    switch (_callType) {
      case CallTypes.CALL_GET:
        res = await this._api.get(_apiPath)
        break
      case CallTypes.CALL_POST:
        res = await this._api.post(_apiPath, _params)
    }
    return res.data
  }

  abstract waitForTransactionConfirmation(_txHash: string, _pollingTime?: number): Promise<string>

  /**
   * Monitor an address for unspent UTXOs
   * @param _address The address.
   * @param _pollingTime The polling period.
   * @param _confirmations The number of confirmations.
   */
  abstract monitorUtxoByAddress(_address: string, _pollingTime: number, _confirmations?: number): PromiEvent<string>

  /**
   * Broadcast a raw transaction.
   * @param _tx The raw transactions in hex string.
   */
  abstract broadcastTransaction(_tx: string)
}

export class pTokensBlockstreamUtxoProvider extends pTokensUtxoProvider {
  broadcastTransaction(_tx: string) {
    return this._makeApiCall(CallTypes.CALL_POST, '/tx', _tx)
  }

  /**
   * Get unspent UTXOs for a specified address.
   * @param _address The address.
   * @returns An Promise that resolves with an array of unspent Utxo objects.
   */
  getUtxoByAddress(_address: string) {
    return this._makeApiCall<Utxo[]>(CallTypes.CALL_GET, `/address/${_address}/utxo`)
  }

  /**
   * Get transaction hex for from a transaction hash.
   * @param _txHash The transaction hash.
   * @returns A Promise that resolves with the transaction hex.
   */
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
            try {
              utxos = await this.getUtxoByAddress(_address)
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
            } catch (err) {
              return false
            }
          }, _pollingTime)
          return resolve(utxos[0].txid)
        })() as unknown
    )
    return promi
  }

  async waitForTransactionConfirmation(_txHash: string, _pollingTime = 1000) {
    let transaction: Transaction = null
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await polling(async () => {
      try {
        transaction = await this._makeApiCall(CallTypes.CALL_GET, `/tx/${_txHash}`)
        if (!transaction || !transaction.status) return false
        return transaction.status.confirmed
      } catch (err) {
        return false
      }
    }, _pollingTime)
    return _txHash
  }
}
