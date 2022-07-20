import { pTokensBlockstreamUtxoProvider } from '../src'
import axios from 'axios'

jest.mock('axios')

describe('UTXO provider', () => {
  let axiosCreateSpy

  beforeAll(() => {
    axiosCreateSpy = jest.spyOn(axios, 'create').mockReturnThis()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should create a Blockstream provider with custom headers', () => {
    new pTokensBlockstreamUtxoProvider('blockstream-endpoint-url', { 'Content-Type': 'application/text' })
    expect(axiosCreateSpy).toHaveBeenNthCalledWith(1, {
      baseURL: 'blockstream-endpoint-url',
      headers: { 'Content-Type': 'application/text' },
      timeout: 2000,
    })
  })

  test('Should create a Blockstream provider and broadcast a transaction', async () => {
    const axiosGetSpy = jest.spyOn(axios, 'get').mockResolvedValue({ data: 'get-resp' })
    const axiosPostSpy = jest.spyOn(axios, 'post').mockResolvedValue({ data: 'post-resp' })
    const provider = new pTokensBlockstreamUtxoProvider('blockstream-endpoint-url')
    const ret = await provider.broadcastTransaction('c0ffee')
    expect(axiosCreateSpy).toHaveBeenNthCalledWith(1, {
      baseURL: 'blockstream-endpoint-url',
      headers: { 'Content-Type': 'application/json' },
      timeout: 2000,
    })
    expect(ret).toEqual('post-resp')
    expect(axiosGetSpy).toHaveBeenCalledTimes(0)
    expect(axiosPostSpy).toHaveBeenNthCalledWith(1, '/tx', 'c0ffee')
  })

  test('Should create a Blockstream provider and get getTransactionHexById', async () => {
    const axiosGetSpy = jest.spyOn(axios, 'get').mockResolvedValue({ data: 'get-resp' })
    const axiosPostSpy = jest.spyOn(axios, 'post').mockResolvedValue({ data: 'post-resp' })
    // const axiosCreateSpy = jest.spyOn(axios, 'create').mockImplementation(() => ({post: postSpy, get: getSpy})
    const provider = new pTokensBlockstreamUtxoProvider('blockstream-endpoint-url')
    const ret = await provider.getTransactionHexByHash('tx-hash')
    expect(axiosCreateSpy).toHaveBeenNthCalledWith(1, {
      baseURL: 'blockstream-endpoint-url',
      headers: { 'Content-Type': 'application/json' },
      timeout: 2000,
    })
    expect(ret).toEqual('get-resp')
    expect(axiosGetSpy).toHaveBeenNthCalledWith(1, '/tx/tx-hash/hex')
    expect(axiosPostSpy).toHaveBeenCalledTimes(0)
  })

  test('Should create a Blockstream provider and get UTXOs by address', async () => {
    const axiosGetSpy = jest.spyOn(axios, 'get').mockResolvedValue({ data: 'get-resp' })
    const axiosPostSpy = jest.spyOn(axios, 'post').mockResolvedValue({ data: 'post-resp' })
    // const axiosCreateSpy = jest.spyOn(axios, 'create').mockImplementation(() => ({post: postSpy, get: getSpy})
    const provider = new pTokensBlockstreamUtxoProvider('blockstream-endpoint-url')
    const ret = await provider.getUtxoByAddress('address')
    expect(axiosCreateSpy).toHaveBeenNthCalledWith(1, {
      baseURL: 'blockstream-endpoint-url',
      headers: { 'Content-Type': 'application/json' },
      timeout: 2000,
    })
    expect(ret).toEqual('get-resp')
    expect(axiosGetSpy).toHaveBeenNthCalledWith(1, '/address/address/utxo')
    expect(axiosPostSpy).toHaveBeenCalledTimes(0)
  })

  test('Should create a Blockstream provider and monitor UTXOs by address', async () => {
    const axiosGetSpy = jest
      .spyOn(axios, 'get')
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [{ txid: 'tx-hash', status: { confirmed: false } }] })
      .mockResolvedValue({ data: [{ txid: 'tx-hash', status: { confirmed: true } }] })
    const axiosPostSpy = jest.spyOn(axios, 'post').mockResolvedValue({ data: 'post-resp' })
    // const axiosCreateSpy = jest.spyOn(axios, 'create').mockImplementation(() => ({post: postSpy, get: getSpy})
    const provider = new pTokensBlockstreamUtxoProvider('blockstream-endpoint-url')
    let txHashBroadcasted = ''
    let txHashConfirmed = ''
    const ret = await provider
      .monitorUtxoByAddress('address', 100)
      .on('txBroadcasted', (_txHash) => {
        txHashBroadcasted = _txHash
      })
      .on('txConfirmed', (_txHash) => {
        txHashConfirmed = _txHash
      })
    expect(axiosCreateSpy).toHaveBeenNthCalledWith(1, {
      baseURL: 'blockstream-endpoint-url',
      headers: { 'Content-Type': 'application/json' },
      timeout: 2000,
    })
    expect(ret).toEqual('tx-hash')
    expect(txHashBroadcasted).toEqual('tx-hash')
    expect(txHashConfirmed).toEqual('tx-hash')
    expect(axiosGetSpy).toHaveBeenCalledTimes(3)
    expect(axiosGetSpy).toHaveBeenNthCalledWith(1, '/address/address/utxo')
    expect(axiosGetSpy).toHaveBeenNthCalledWith(2, '/address/address/utxo')
    expect(axiosGetSpy).toHaveBeenNthCalledWith(3, '/address/address/utxo')
    expect(axiosPostSpy).toHaveBeenCalledTimes(0)
  })

  test('Should create a Blockstream provider and monitor already broadcasted UTXOs by address', async () => {
    const axiosGetSpy = jest
      .spyOn(axios, 'get')
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValue({ data: [{ txid: 'tx-hash', status: { confirmed: true } }] })
    const axiosPostSpy = jest.spyOn(axios, 'post').mockResolvedValue({ data: 'post-resp' })
    // const axiosCreateSpy = jest.spyOn(axios, 'create').mockImplementation(() => ({post: postSpy, get: getSpy})
    const provider = new pTokensBlockstreamUtxoProvider('blockstream-endpoint-url')
    let txHashBroadcasted = ''
    let txHashConfirmed = ''
    const ret = await provider
      .monitorUtxoByAddress('address', 100)
      .on('txBroadcasted', (_txHash) => {
        txHashBroadcasted = _txHash
      })
      .on('txConfirmed', (_txHash) => {
        txHashConfirmed = _txHash
      })
    expect(axiosCreateSpy).toHaveBeenNthCalledWith(1, {
      baseURL: 'blockstream-endpoint-url',
      headers: { 'Content-Type': 'application/json' },
      timeout: 2000,
    })
    expect(ret).toEqual('tx-hash')
    expect(txHashBroadcasted).toEqual('tx-hash')
    expect(txHashConfirmed).toEqual('tx-hash')
    expect(axiosGetSpy).toHaveBeenCalledTimes(2)
    expect(axiosGetSpy).toHaveBeenNthCalledWith(1, '/address/address/utxo')
    expect(axiosGetSpy).toHaveBeenNthCalledWith(2, '/address/address/utxo')
    expect(axiosPostSpy).toHaveBeenCalledTimes(0)
  })

  test('Should create a Blockstream provider and waitForTransactionConfirmation by address', async () => {
    const axiosGetSpy = jest
      .spyOn(axios, 'get')
      .mockRejectedValueOnce(new Error('get error'))
      .mockResolvedValueOnce({ data: undefined })
      .mockResolvedValueOnce({ data: { status: { confirmed: false } } })
      .mockResolvedValue({ data: { status: { confirmed: true } } })
    const axiosPostSpy = jest.spyOn(axios, 'post').mockResolvedValue({ data: 'post-resp' })
    // const axiosCreateSpy = jest.spyOn(axios, 'create').mockImplementation(() => ({post: postSpy, get: getSpy})
    const provider = new pTokensBlockstreamUtxoProvider('blockstream-endpoint-url')
    const ret = await provider.waitForTransactionConfirmation('tx-hash', 100)
    expect(axiosCreateSpy).toHaveBeenNthCalledWith(1, {
      baseURL: 'blockstream-endpoint-url',
      headers: { 'Content-Type': 'application/json' },
      timeout: 2000,
    })
    expect(ret).toEqual({ status: { confirmed: true } })
    expect(axiosGetSpy).toHaveBeenCalledTimes(4)
    expect(axiosGetSpy).toHaveBeenNthCalledWith(1, '/tx/tx-hash')
    expect(axiosGetSpy).toHaveBeenNthCalledWith(2, '/tx/tx-hash')
    expect(axiosGetSpy).toHaveBeenNthCalledWith(3, '/tx/tx-hash')
    expect(axiosGetSpy).toHaveBeenNthCalledWith(4, '/tx/tx-hash')
    expect(axiosPostSpy).toHaveBeenCalledTimes(0)
  })
})
