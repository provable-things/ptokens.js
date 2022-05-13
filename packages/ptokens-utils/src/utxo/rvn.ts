import polling from 'light-async-polling'
import PromiEvent from 'promievent'
import { CallTypes, Transaction, Utxo, UtxoApi } from './api'

const RVN_PTOKENS_NODE_MAINNET_API = 'https://corsproxy.ptokens.io/v1/?apiurl=https://api.ravencoin.org/api'

export default class Rvn extends UtxoApi {
  constructor() {
    super(RVN_PTOKENS_NODE_MAINNET_API)
  }

  getUtxoByAddress(_address: string) {
    return this._makeApiCall(CallTypes.CALL_GET, `/addrs/${_address}/utxo`)
  }

  getTransactionHexById(_txId: string) {
    return this._makeApiCall<{ rawtx: string }>(CallTypes.CALL_GET, `/rawtx/${_txId}`)
  }

  async waitForTransactionConfirmation(_tx: string, _pollingTime: number): Promise<Transaction> {
    let transaction: Transaction = null
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await polling(async () => {
      try {
        transaction = await this._makeApiCall<Transaction>(CallTypes.CALL_GET, `/tx/${_tx}/`)
        return transaction.confirmations > 0
      } catch (_err) {
        return false
      }
    }, _pollingTime)
    return transaction
  }

  monitorUtxoByAddress(_address: string, _pollingTime: number, _confirmations = 1): PromiEvent<string> {
    let isBroadcasted = false
    let utxos: Utxo[] = []
    const promi = new PromiEvent<string>((resolve) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
      polling(async () => {
        utxos = await this._makeApiCall<Utxo[]>(CallTypes.CALL_GET, `/addrs/${_address}/utxo`)
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

  isValidAddress(_address: string): boolean {
    const res = _address.match(/(r|R)[a-zA-HJ-NP-Z0-9]{26,40}/g)
    if (!res) return false
    return res[0] === _address
  }

  broadcastTransaction(_tx: string) {
    return this._makeApiCall(CallTypes.CALL_POST, '/tx/send', {
      rawtx: _tx,
    })
  }
}
