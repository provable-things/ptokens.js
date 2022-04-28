import utils from '../src'
import EventEmitter from 'eventemitter3'

jest.setTimeout(30000)

const UTXO = '50c5ccf3b3720e95ea06c3c9f7d3cb9125747731b30a8555bbfb71b53661c3f8'
const LTC_TESTING_ADDRESS = 'LfmssDyX6iZvbVqHv6t9P6JWXia2JG7mdb'

describe('ltc utils', () => {
  test('Should be a VALID LTC testnet address', () => {
    const ltcApi = new utils.ltc.Ltc()
    const validLtcTestnetAddress = LTC_TESTING_ADDRESS
    const result = ltcApi.isValidAddress(validLtcTestnetAddress)
    expect(result).toBe(true)
  })

  test('Should be a VALID LTC mainnet address', () => {
    const ltcApi = new utils.ltc.Ltc()
    const validLtcMainnetAddress = 'MTvnA4CN73ry7c65wEuTSaKzb2pNKHB4n1'
    const result = ltcApi.isValidAddress(validLtcMainnetAddress)
    expect(result).toBe(true)
  })

  test('Should be a VALID LTC Segwit bech32 mainnet address', () => {
    const ltcApi = new utils.ltc.Ltc()
    const validLtcMainnetAddress = 'ltc1qqgytgeu96lc76v3yyvmyqrm6ru680k0tjayaca'
    const result = ltcApi.isValidAddress(validLtcMainnetAddress)
    expect(result).toBe(true)
  })

  test('Should be an INVALID LTC address', () => {
    const ltcApi = new utils.ltc.Ltc()
    const invalidLtcAddress = 'invalid'
    const result = ltcApi.isValidAddress(invalidLtcAddress)
    expect(result).toBe(false)
  })

  test('Should monitor a LTC utxo given an address', async () => {
    const eventEmitter = new EventEmitter()
    const pollingTime = 500
    const ltcApi = new utils.ltc.Ltc()

    let isLtcTxBroadcasted = 0
    let isLtcTxConfirmed = 0
    const start = async () => {
      eventEmitter.once('onLtcTxBroadcasted', () => {
        isLtcTxBroadcasted++
      })
      eventEmitter.once('onLtcTxConfirmed', () => {
        isLtcTxConfirmed++
      })

      await ltcApi.monitorUtxoByAddress(
        LTC_TESTING_ADDRESS,
        eventEmitter,
        pollingTime,
        'onLtcTxBroadcasted',
        'onLtcTxConfirmed'
      )
    }

    await start()

    expect(isLtcTxBroadcasted).toEqual(1)
    expect(isLtcTxConfirmed).toEqual(1)
  })

  test('Should monitor a LTC transaction confirmation', async () => {
    const pollingTime = 200
    const ltcApi = new utils.ltc.Ltc()

    const receipt = await ltcApi.waitForTransactionConfirmation(UTXO, pollingTime)

    expect(receipt.confirmations).toBeGreaterThanOrEqual(2)
  })

  test('Should get all LTC utxo given an address', async () => {
    const ltcApi = new utils.ltc.Ltc()
    const utxos = await ltcApi.getUtxoByAddress(LTC_TESTING_ADDRESS)
    expect(Array.isArray(utxos)).toBe(true)
  })

  test('Should get a LTC tx in hex format', async () => {
    const ltcApi = new utils.ltc.Ltc()
    const res = await ltcApi.getTransactionHexById(UTXO)
    expect(res.rawtx).toStrictEqual(
      '010000000001010000000000000000000000000000000000000000000000000000000000000000ffffffff6203f662221b2f5669614254432f4d696e656420627920626974636f696e6b7a2f2cfabe6d6d1edf8b262952bbeb30bb50ffb2a846ecaaf2878c9591cbdfd0097e664ed5063b100000000000000010b63e6600bd65e7511edc7c5b0600000000000000ffffffff02c563184b000000001976a914e16c28146ed4869c190b3f0bdc18d80d45f9213488ac0000000000000000266a24aa21a9edf340f750fb48e434b58801ffa83823813d9142e5cada660491447261631c3b330120000000000000000000000000000000000000000000000000000000000000000000000000'
    )
  })
})
