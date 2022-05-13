import * as utils from '../src'
import Doge from '../src/utxo/doge'

jest.setTimeout(30000)

const UTXO = '34f0b50d64fe50998bc1dd5749a82229584fd6429c225bb1aeb8f5a24936edea'
const DOGE_TESTING_ADDRESS = 'DKs2WBbiaAEe9RGzQTmtJj1o9bqsKTUTtC'

describe('doge utils', () => {
  test('Should be a VALID DOGE mainnet address', () => {
    const dogeApi = new utils.utxo.doge()
    const result = dogeApi.isValidAddress(DOGE_TESTING_ADDRESS)
    expect(result).toBe(true)
  })

  test('Should be an INVALID DOGE address', () => {
    const dogeApi = new utils.utxo.doge()
    const result = dogeApi.isValidAddress('invalid')
    expect(result).toBe(false)
  })

  test('Should monitor a DOGE utxo given an address', async () => {
    const dogeApi = new utils.utxo.doge()
    let isDogeTxBroadcasted = 0
    let isDogeTxConfirmed = 0
    await dogeApi
      .monitorUtxoByAddress(DOGE_TESTING_ADDRESS, 500)
      .once('broadcasted', () => {
        isDogeTxBroadcasted++
      })
      .once('confirmed', () => {
        isDogeTxConfirmed++
      })

    expect(isDogeTxBroadcasted).toEqual(1)
    expect(isDogeTxConfirmed).toEqual(1)
  })

  test('Should monitor a DOGE transaction confirmation', async () => {
    const dogeApi = new utils.utxo.doge()
    const receipt = await dogeApi.waitForTransactionConfirmation(UTXO, 500)
    expect(receipt.confirmations).toBeGreaterThanOrEqual(645759)
  })

  test('Should get all DOGE utxo given an address', async () => {
    const dogeApi = new utils.utxo.doge() as Doge
    const utxos = await dogeApi.getUtxoByAddress(DOGE_TESTING_ADDRESS)
    expect(Array.isArray(utxos)).toBe(true)
  })
})
