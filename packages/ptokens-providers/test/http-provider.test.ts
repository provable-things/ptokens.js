import { Axios } from 'axios'
import { createServer, Server } from 'http'
import { HttpProvider, CallTypes } from '../src/ptokens-http-provider'

const ENDPOINT = 'http://127.0.0.1:3001'

describe('HTTP Provider', () => {
  let server: Server
  const getSpy: jest.SpyInstance = jest.spyOn(Axios.prototype, 'get')
  const postSpy: jest.SpyInstance = jest.spyOn(Axios.prototype, 'post')

  beforeAll(() => {
    server = createServer((_req, _res) => {
      _res.statusCode = 200
      if (_req.url.includes('timeout')) {
        _res.write('first')
        setTimeout(() => _res.end('timeout'), 200)
      } else if (_req.url.includes('headers')) _res.end(JSON.stringify(_req.headers))
      else if (_req.url.includes('drop')) _res.destroy()
      else _res.end(JSON.stringify('data'))
    })
    server.listen(3001, '127.0.0.1')
  })

  afterAll(() => {
    server.close()
  })

  beforeEach(() => jest.clearAllMocks())

  test('Should make a GET call', async () => {
    const provider = new HttpProvider(ENDPOINT)
    const res = await provider.call(CallTypes.CALL_GET, '/peers')
    expect(getSpy.mock.calls[0][0]).toStrictEqual('/peers')
    expect(res).toStrictEqual('data')
  })

  test('Should make a GET call with timeout error', async () => {
    const provider = new HttpProvider(ENDPOINT)
    try {
      await provider.call(CallTypes.CALL_GET, '/timeout', [], 100)
      fail()
    } catch (err) {
      expect(err.message).toStrictEqual('Timeout!')
      expect(getSpy.mock.calls[0][0]).toStrictEqual('/timeout')
    }
  })

  test('Should make a GET call with custom header', async () => {
    const provider = new HttpProvider(ENDPOINT, {
      'Access-Control-Allow-Methods': 'GET',
      'Content-Type': 'application/json',
      'Test-Header-Entry': 'Test-Header-Entry',
    })
    const res = await provider.call(CallTypes.CALL_GET, '/headers')
    expect(res['access-control-allow-methods']).toStrictEqual('GET')
    expect(res['test-header-entry']).toStrictEqual('Test-Header-Entry')
    expect(getSpy.mock.calls[0][0]).toStrictEqual('/headers')
  })

  test('Should make a POST call', async () => {
    const provider = new HttpProvider(ENDPOINT)
    const res = await provider.call(CallTypes.CALL_POST, '/peers', { data: 3 })
    expect(postSpy.mock.calls[0][0]).toStrictEqual('/peers')
    expect(postSpy.mock.calls[0][1]).toStrictEqual({ data: 3 })
    expect(res).toStrictEqual('data')
  })

  test('Should make a POST call with timeout error', async () => {
    const provider = new HttpProvider(ENDPOINT)
    try {
      await provider.call(CallTypes.CALL_POST, '/timeout', { data: 3 }, 100)
      fail()
    } catch (err) {
      expect(err.message).toStrictEqual('Timeout!')
      expect(postSpy.mock.calls[0][0]).toStrictEqual('/timeout')
      expect(postSpy.mock.calls[0][1]).toStrictEqual({ data: 3 })
    }
  })

  test('Should make a POST call with custom header', async () => {
    const provider = new HttpProvider(ENDPOINT, {
      'Access-Control-Allow-Methods': 'POST',
      'Content-Type': 'application/json',
      'Test-Header-Entry': 'Test-Header-Entry',
    })
    const res = await provider.call(CallTypes.CALL_POST, '/headers', { data: 3 })
    expect(res['access-control-allow-methods']).toStrictEqual('POST')
    expect(res['test-header-entry']).toStrictEqual('Test-Header-Entry')
    expect(postSpy.mock.calls[0][0]).toStrictEqual('/headers')
    expect(postSpy.mock.calls[0][1]).toStrictEqual({ data: 3 })
  })

  test('Should set endpoint', () => {
    const provider = new HttpProvider(ENDPOINT, {
      'Access-Control-Allow-Methods': 'POST',
      'Content-Type': 'application/json',
      'Test-Header-Entry': 'Test-Header-Entry',
    })
    provider.setEndpoint('new-endpoint')
    expect(provider.endpoint).toStrictEqual('new-endpoint')
  })

  test('Should set headers', () => {
    const provider = new HttpProvider(ENDPOINT, {
      'Access-Control-Allow-Methods': 'POST',
      'Content-Type': 'application/json',
      'Test-Header-Entry': 'Test-Header-Entry',
    })
    provider.setHeaders({ 'new-header': 'new-header' })
    expect(provider.headers).toStrictEqual({ 'new-header': 'new-header' })
  })

  test('Should throw with invalid call type', async () => {
    const provider = new HttpProvider(ENDPOINT, {
      'Access-Control-Allow-Methods': 'GET',
      'Content-Type': 'application/json',
      'Test-Header-Entry': 'Test-Header-Entry',
    })
    try {
      await provider.call(2, '/headers')
      fail()
    } catch (err) {
      expect(err.message).toStrictEqual('Unsupported call type')
    }
  })

  test('Should throw when socket hungs up', async () => {
    const provider = new HttpProvider(ENDPOINT)
    try {
      await provider.call(CallTypes.CALL_GET, '/drop')
      fail()
    } catch (err) {
      expect(getSpy.mock.calls[0][0]).toStrictEqual('/drop')
      expect(err.message).toStrictEqual('socket hang up')
    }
  })
})
