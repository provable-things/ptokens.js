import validate from 'bitcoin-address-validation'
import PromiEvent from 'promievent'
import polling from 'light-async-polling'
import { Mainnet } from '../helpers/names'
import { Transaction, UtxoApi, CallTypes, Utxo } from './api'

const BLOCKSTREAM_BASE_TESTNET_ENDPOINT = 'https://blockstream.info/testnet/api/'
const BLOCKSTREAM_BASE_MAINNET_ENDPOINT = 'https://blockstream.info/api/'

export default class Btc extends UtxoApi {
  constructor(_network: string = Mainnet) {
    const endpoint = _network === Mainnet ? BLOCKSTREAM_BASE_MAINNET_ENDPOINT : BLOCKSTREAM_BASE_TESTNET_ENDPOINT
    super(endpoint, { 'Content-Type': 'text/plain' })
  }

  broadcastTransaction(_tx: string) {
    return this._makeApiCall(CallTypes.CALL_POST, '/tx', _tx)
  }

  getUtxoByAddress(_address: string) {
    return this._makeApiCall<Utxo[]>(CallTypes.CALL_GET, `/address/${_address}/utxo`)
  }

  getTransactionHexById(_txId: string) {
    return this._makeApiCall(CallTypes.CALL_GET, `/tx/${_txId}/hex`)
  }

  isValidAddress(_address: string) {
    return Boolean(validate(_address))
  }

  monitorUtxoByAddress(_address: string, _pollingTime: number, _maxRetries = 5): PromiEvent<string> {
    let isBroadcasted = false
    let utxos: Utxo[] = []
    let retries = 0
    const promi = new PromiEvent<string>((resolve) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
      polling(async () => {
        // NOTE: an user could make 2 payments to the same depositAddress -> utxos.length could become > 0 but with a wrong utxo
        try {
          utxos = await this._makeApiCall<Utxo[]>(CallTypes.CALL_GET, `/address/${_address}/utxo`)
          if (utxos.length > 0) {
            if (utxos[0].status.confirmed) {
              if (!isBroadcasted) {
                promi.emit('broadcasted', utxos[0].txid)
              }
              promi.emit('confirmed', utxos[0].txid)
              return true
            } else if (!isBroadcasted) {
              isBroadcasted = true
              promi.emit('broadcasted', utxos[0].txid)
              return false
            }
          } else {
            return false
          }
        } catch (_err) {
          if (retries >= _maxRetries) throw _err
          retries += 1
          return false
        }
      }, _pollingTime).then(resolve)
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
