import EventEmitter from 'eventemitter3'
import polling from 'light-async-polling'
import PromiEvent from 'promievent'
import { Mainnet } from '../helpers/names'
import { Transaction, Utxo, UtxoApi, CallTypes } from './api'

const LTC_PTOKENS_NODE_TESTNET_API = 'https://ltc-testnet-node-1.ptokens.io/insight-lite-api'
const LTC_PTOKENS_NODE_MAINNET_API = 'https://ltc-node-1.ptokens.io/insight-lite-api'

export default class Ltc extends UtxoApi {
  constructor(_network: string = Mainnet) {
    const endpoint = _network === Mainnet ? LTC_PTOKENS_NODE_MAINNET_API : LTC_PTOKENS_NODE_TESTNET_API
    super(endpoint)
  }

  getUtxoByAddress(_address: string) {
    return this._makeApiCall<string>(CallTypes.CALL_GET, `/addrs/${_address}/utxo`)
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
        // NOTE: an user could make 2 payments to the same depositAddress -> utxos.length could become > 0 but with a wrong utxo
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
    const res = _address.match(/(ltc1|[LM3Q2mn])[a-zA-HJ-NP-Z0-9]{26,40}/g)
    if (!res) return false
    return res[0] === _address
  }

  broadcastTransaction(_network: string, _tx: string) {
    return this._makeApiCall(CallTypes.CALL_POST, '/tx/send', {
      rawtx: _tx,
    })
  }
}
