import EventEmitter from 'eventemitter3'
import polling from 'light-async-polling'
import PromiEvent from 'promievent'
import { CallTypes, Transaction, Utxo, UtxoApi } from './api'

const DOGE_CHAIN_API = 'https://dogechain.info/api/v1'

type DogeChainUnspentResult = {
  unspent_outputs: Utxo[]
  success: boolean
  error: any
}

export default class Doge extends UtxoApi {
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

  monitorUtxoByAddress(_address: string, _pollingTime: number, _confirmations = 1): PromiEvent<string> {
    let isBroadcasted = false
    const promi = new PromiEvent<string>((resolve) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
      polling(async () => {
        const utxos = await this.getUtxoByAddress(_address)
        if (utxos.length > 0) {
          if (utxos[0].confirmations > 0) {
            if (!isBroadcasted) {
              promi.emit('broadcasted', utxos[0])
              isBroadcasted = true
            }
            if (utxos[0].confirmations >= _confirmations) {
              promi.emit('confirmed', utxos[0])
              return true
            }
            return false
          } else if (!isBroadcasted) {
            isBroadcasted = true
            promi.emit('broadcasted', utxos[0])
            return false
          }
        } else {
          return false
        }
      }, _pollingTime).then(resolve)
    )
    return promi
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
