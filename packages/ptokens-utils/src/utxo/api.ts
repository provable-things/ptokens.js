import axios, { AxiosInstance, AxiosResponse } from 'axios'
import EventEmitter from 'eventemitter3'

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

function getApi(_endpoint: string, _headers = {}): AxiosInstance {
  if (Object.keys(_headers).length === 0) _headers = { 'Content-Type': 'application/json' }
  return axios.create({
    baseURL: _endpoint,
    timeout: 2000,
    headers: _headers,
  })
}

export abstract class UtxoApi {
  api: AxiosInstance
  endpoint: string

  constructor(_endpoint: string, _headers = {}) {
    this.api = getApi(_endpoint, _headers)
    this.endpoint = _endpoint
  }

  async _makeApiCall<T>(_callType: CallTypes, _apiPath: string, _params?: any): Promise<T> {
    let res: Promise<AxiosResponse<T>>
    switch (_callType) {
      case CallTypes.CALL_GET:
        res = this.api.get(_apiPath)
        break
      case CallTypes.CALL_POST:
        res = this.api.post(_apiPath, _params)
    }
    return (await res).data
  }

  abstract waitForTransactionConfirmation(_tx: string, _pollingTime: number): Promise<Transaction>

  abstract monitorUtxoByAddress(
    _address: string,
    _eventEmitter: EventEmitter,
    _pollingTime: number,
    _broadcastEventName: string,
    _confirmationEventName: string
  ): Promise<string>

  abstract isValidAddress(_address: string): boolean

  abstract broadcastTransaction(_network: string, _tx: string)
}
