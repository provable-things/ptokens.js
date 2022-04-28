import utils from '../src'
import EventEmitter from 'eventemitter3'

jest.setTimeout(30000)

const UTXO = '02aa5b687d4ea0d5d2bce9801d525692322e0e4ed073a82001f2e3f8b6fb1a05'
const BTC_TESTING_ADDRESS = 'mk8aUY9DgFMx7VfDck5oQ7FjJNhn8u3snP'

describe('btc utils', () => {
  test('Should be a VALID BTC address', () => {
    const btcApi = new utils.btc.Btc()
    const validBtcAddress = BTC_TESTING_ADDRESS
    const result = btcApi.isValidAddress(validBtcAddress)
    expect(result).toBe(true)
  })

  test('Should be an INVALID BTC address', () => {
    const btcApi = new utils.btc.Btc()
    const invalidBtcAddress = 'invalid'
    const result = btcApi.isValidAddress(invalidBtcAddress)
    expect(result).toBe(false)
  })

  test('Should monitor a BTC utxo given an address', async () => {
    const eventEmitter = new EventEmitter()
    const pollingTime = 200
    const network = 'testnet'
    const broadcastEventName = 'nativeTxBroadcasted'
    const confirmationEventName = 'nativeTxConfirmed'

    const btcApi = new utils.btc.Btc(network)
    let btcTxBroadcasted = 0
    let btcTxConfirmed = 0
    const start = async () => {
      eventEmitter.once(broadcastEventName, () => {
        btcTxBroadcasted += 1
      })
      eventEmitter.once(confirmationEventName, () => {
        btcTxConfirmed += 1
      })

      await btcApi.monitorUtxoByAddress(
        BTC_TESTING_ADDRESS,
        eventEmitter,
        pollingTime,
        broadcastEventName,
        confirmationEventName
      )
    }

    await start()

    expect(btcTxBroadcasted).toEqual(1)
    expect(btcTxConfirmed).toEqual(1)
  })

  test('Should monitor a BTC transaction confirmation', async () => {
    const pollingTime = 200
    const network = 'testnet'

    const btcApi = new utils.btc.Btc(network)

    const receipt = await btcApi.waitForTransactionConfirmation(UTXO, pollingTime)

    expect(receipt.status.confirmed).toBe(true)
  })

  test('Should get all BTC utxo given an address', async () => {
    const network = 'testnet'
    const btcApi = new utils.btc.Btc(network)
    const utxos = await btcApi.getUtxoByAddress(BTC_TESTING_ADDRESS)
    expect(Array.isArray(utxos)).toBe(true)
  })

  test('Should get a BTC tx in hex format', async () => {
    const network = 'testnet'
    const btcApi = new utils.btc.Btc(network)
    const hex = await btcApi.getTransactionHexById(UTXO)
    expect(hex).toStrictEqual(
      '0100000001b419016328e5100e4e6c38ab814a2d31080912c7f9806d8387ef5329e754b26f000000008f483045022100cb9d42781ca9d5d588c5660fa9ba29824fb3936fa8b452e65319091ed7795d1f022060244e704a6457240a49bc2d02b1691080ac83b4881f6fe4d040fa55e02a4677014520c6cabe8d2b4c8a6e5ab63e3ca6ba496a687e321d4790cfcabb416eb76264e3a77521038198d8e373c837832c8c719900ea7f5273af16e838c2bbb383f391833d73d6d7acffffffff02e8030000000000001976a914329d43938a947149be392f93f152da34ef32a49a88acd5110000000000001976a914d1efcba75230f22b2195050a32db40ae5de1bd5e88ac00000000'
    )
  })
})
