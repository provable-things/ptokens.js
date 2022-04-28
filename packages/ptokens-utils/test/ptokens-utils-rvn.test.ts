import utils from '../src'
import EventEmitter from 'eventemitter3'

jest.setTimeout(30000)

const UTXO = '30d9446c57e6871d5adfd9efe79531584f060bb194bdbb19cb7ae23786a622fc'
const RVN_TESTING_ADDRESS = 'RTpp8G7Y5f9HZ1iGNz1gtbWazwnHvoHCxK'

describe('rvn utils', () => {
  test('Should be a VALID RVN address', () => {
    const rvnApi = new utils.rvn.Rvn()
    const validRvnAddress = RVN_TESTING_ADDRESS
    const result = rvnApi.isValidAddress(validRvnAddress)
    expect(result).toBe(true)
  })

  test('Should be an INVALID RVN address', () => {
    const rvnApi = new utils.rvn.Rvn()
    const invalidRvnAddress = 'invalid'
    const result = rvnApi.isValidAddress(invalidRvnAddress)
    expect(result).toBe(false)
  })

  test('Should monitor a RVN utxo given an address', async () => {
    const eventEmitter = new EventEmitter()
    const pollingTime = 200
    const broadcastEventName = 'nativeTxBroadcasted'
    const confirmationEventName = 'nativeTxConfirmed'

    const rvnApi = new utils.rvn.Rvn()
    let rvnTxBroadcasted = 0
    let rvnTxConfirmed = 0
    const start = async () => {
      eventEmitter.once(broadcastEventName, () => {
        rvnTxBroadcasted += 1
      })
      eventEmitter.once(confirmationEventName, () => {
        rvnTxConfirmed += 1
      })

      await rvnApi.monitorUtxoByAddress(
        RVN_TESTING_ADDRESS,
        eventEmitter,
        pollingTime,
        broadcastEventName,
        confirmationEventName
      )
    }

    await start()

    expect(rvnTxBroadcasted).toEqual(1)
    expect(rvnTxConfirmed).toEqual(1)
  })

  test('Should monitor a RVN transaction confirmation', async () => {
    const pollingTime = 200
    const rvnApi = new utils.rvn.Rvn()
    const receipt = await rvnApi.waitForTransactionConfirmation(UTXO, pollingTime)
    expect(receipt.confirmations).toBeGreaterThanOrEqual(5)
  })

  test('Should get all RVN utxo given an address', async () => {
    const rvnApi = new utils.rvn.Rvn()
    const utxos = await rvnApi.getUtxoByAddress(RVN_TESTING_ADDRESS)
    expect(Array.isArray(utxos)).toBe(true)
  })

  test('Should get a RVN tx in hex format', async () => {
    const rvnApi = new utils.rvn.Rvn()
    const hex = await rvnApi.getTransactionHexById(UTXO)
    expect(hex.rawtx).toStrictEqual(
      '010000000001010000000000000000000000000000000000000000000000000000000000000000ffffffff1203206022002f666c79706f6f6c2e6f72672fffffffff02004429353a0000001976a914cb6d3fedc3b50d5936a36601710c6008ff783fd188ac0000000000000000266a24aa21a9ede2f61c3f71d1defd3fa999dfa36953755c690689799962b48bebd836974e8cf90120000000000000000000000000000000000000000000000000000000000000000000000000'
    )
  })
})
