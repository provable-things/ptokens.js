import EventEmitter from 'eventemitter3'
import polling from 'light-async-polling'
import { CallTypes, Transaction, Utxo, UtxoApi } from './api'

const DOGE_CHAIN_API = 'https://dogechain.info/api/v1'

type DogeChainUnspentResult = {
  unspent_outputs: Utxo[]
  success: boolean
  error: any
}

export class Doge extends UtxoApi {
  constructor() {
    super(DOGE_CHAIN_API)
  }

  async getUtxoByAddress(_address: string): Promise<Utxo[]> {
    const res = await this._makeApiCall<DogeChainUnspentResult>(CallTypes.CALL_GET, `/unspent/${_address}/`)
    if (res.success) return res.unspent_outputs
    throw res.error
  }

  async waitForTransactionConfirmation(_tx: string, _pollingTime: number): Promise<Transaction> {
    let transactionToReturn: Transaction = null
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await polling(async () => {
      try {
        const { transaction } = await this._makeApiCall<{ transaction: Transaction }>(
          CallTypes.CALL_GET,
          `/transaction/${_tx}/`
        )
        transactionToReturn = transaction
        return transaction.confirmations > 0
      } catch (_err) {
        return false
      }
    }, _pollingTime)
    return transactionToReturn
  }

  async monitorUtxoByAddress(
    _address: string,
    _eventEmitter: EventEmitter,
    _pollingTime: number,
    _broadcastEventName: string,
    _confirmationEventName: string,
    _confirmations = 1
  ): Promise<string> {
    let isBroadcasted = false
    let utxo: string = null
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await polling(async () => {
      const utxos = await this.getUtxoByAddress(_address)
      if (utxos.length > 0) {
        if (utxos[0].confirmations > 0) {
          if (!isBroadcasted) {
            _eventEmitter.emit(_broadcastEventName, utxos[0])
            isBroadcasted = true
          }
          if (utxos[0].confirmations >= _confirmations) {
            _eventEmitter.emit(_confirmationEventName, utxos[0])
            utxo = utxos[0].tx_hash
            return true
          }
          return false
        } else if (!isBroadcasted) {
          isBroadcasted = true
          _eventEmitter.emit(_broadcastEventName, utxos[0])
          return false
        }
      } else {
        return false
      }
    }, _pollingTime)
    return utxo.startsWith('0x') ? utxo : '0x' + utxo
  }

  isValidAddress(_address: string) {
    const res = _address.match(/D{1}[5-9A-HJ-NP-U]{1}[1-9A-HJ-NP-Za-km-z]{32}/g)
    if (!res) return false
    return res[0] === _address
  }

  broadcastTransaction(_tx: string) {
    return this._makeApiCall(CallTypes.CALL_POST, '/pushtx', {
      tx: _tx,
    })
  }
}
