import { Api, JsonRpc } from 'eosjs'
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig'
import fetch from 'cross-fetch'
import polling from 'light-async-polling'

const EOS_TRANSACTION_EXECUTED = 'executed'

export function getApi(_privateKey: string, _rpc: JsonRpc | string, _signatureProvider: JsSignatureProvider = null) {
  const signatureProvider = _signatureProvider || _privateKey ? new JsSignatureProvider([_privateKey]) : null
  const rpc = typeof _rpc === 'string' ? new JsonRpc(_rpc, { fetch }) : _rpc
  return new Api({
    rpc,
    signatureProvider,
  })
}

export function getAmountInEosFormat(_amount: string, _decimals = 4, symbol: string) {
  return `${parseFloat(_amount).toFixed(_decimals)} ${symbol}`
}

export function isValidAccountName(_accountName: string) {
  return new RegExp('(^[a-z1-5.]{0,11}[a-z1-5]$)|(^[a-z1-5.]{12}[a-j1-5]$)').test(_accountName)
}

export async function waitForTransactionConfirmation(_api: Api, _tx: string, _pollingTime = 2000) {
  let receipt = null
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await polling(async () => {
    try {
      receipt = await _api.rpc.history_get_transaction(_tx)
      if (receipt && receipt.trx.receipt.status === EOS_TRANSACTION_EXECUTED) return true
      else return false
    } catch (err) {
      return false
    }
  }, _pollingTime)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return receipt
}
