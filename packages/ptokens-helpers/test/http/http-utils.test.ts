import * as errors from '../../src/errors'
import * as httpUtilsModule from '../../src/http'
import { createServer, Server } from 'http'

describe('Http general tests', () => {
  describe('getRequest/postRequest (timeouts)', () => {
    let server: Server

    beforeAll(() => {
      server = createServer((_req, _res) => {
        _res.statusCode = 200
        if (_req.url.includes('golong')) setTimeout(() => _res.end('data'), 500)
        else _res.end('data')
      })
      server.listen(3000, '127.0.0.1')
    })

    afterAll(() => {
      server.close()
    })

    it('Should reject when timeout expires', async () => {
      try {
        await httpUtilsModule.getRequest('http://localhost:3000/golong', {}, 100)
        fail()
      } catch (err) {
        expect(err.message).toStrictEqual(errors.ERROR_TIMEOUT)
      }
    })

    it('Should not reject fetching the correct data', async () => {
      const result = await httpUtilsModule.getRequest('http://localhost:3000', {}, 400)
      const data = await result.text()
      expect(data).toStrictEqual('data')
    })

    it('Should reject when timeout expires', async () => {
      try {
        await httpUtilsModule.postRequest('http://localhost:3000/golong', {}, {}, 100)
        fail()
      } catch (err) {
        expect(err.message).toStrictEqual(errors.ERROR_TIMEOUT)
      }
    })

    it('Should not reject fetching the correct data', async () => {
      const result = await httpUtilsModule.postRequest('http://localhost:3000', {}, {}, 400)
      const data = await result.text()
      expect(data).toStrictEqual('data')
    })
  })

  describe('fetchJsonByGet', () => {
    let server: Server

    beforeAll(() => {
      server = createServer((_req, _res) => {
        _res.statusCode = 200
        _res.setHeader('Content-Type', 'application/json')
        if (_req.url.includes('incorrect')) _res.end('{"incorrect": json}')
        else _res.end('{"Hello": "World"}')
      })
      server.listen(3000, '127.0.0.1')
    })

    afterAll(() => {
      server.close()
    })

    it('Should not reject performing a GET request', async () => {
      const result = await httpUtilsModule.fetchJsonByGet('http://localhost:3000')
      const expected = { Hello: 'World' }
      expect(result).toStrictEqual(expected)
    })

    it('Should reject performing a GET request', async () => {
      try {
        await httpUtilsModule.fetchJsonByGet('http://localhost:3000/incorrect')
        fail()
      } catch (err) {
        expect(err.message).toStrictEqual('Failed to extract the json from the response:{"size":0,"timeout":0}')
      }
    })
  })

  describe('fetchJsonByPost', () => {
    let server: Server

    beforeAll(() => {
      server = createServer((_req, _res) => {
        if (_req.method === 'POST' && _req.url === '/') {
          let body = ''
          _req.on('data', (chunk) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            body += chunk.toString()
          })
          _req.on('end', () => {
            _res.statusCode = 200
            _res.setHeader('Content-Type', 'application/json')
            if (body.includes('incorrect')) _res.end('{"incorrect": json}')
            else _res.end(body)
          })
        }
      })
      server.listen(3000, '127.0.0.1')
    })

    afterAll(() => {
      server.close()
    })

    it('Should not reject returning the correct response', async () => {
      const body = { hello: 'world' }
      const result = await httpUtilsModule.fetchJsonByPost('http://localhost:3000', body)
      expect(result).toStrictEqual(body)
    })

    it('Should reject with incorrect output', async () => {
      const body = { hello: 'incorrect' }
      try {
        await httpUtilsModule.fetchJsonByPost('http://localhost:3000', body)
        fail()
      } catch (err) {
        expect(err.message).toStrictEqual('Failed to extract the json from the response:{"size":0,"timeout":0}')
      }
    })
  })
})
