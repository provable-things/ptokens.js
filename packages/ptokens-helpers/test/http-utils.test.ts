import { createServer, Server } from 'http'

import { http, errors } from '../src/'

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

    test('Should reject when timeout expires', async () => {
      try {
        await http.getRequest('http://localhost:3000/golong', {}, 100)
        fail()
      } catch (err) {
        expect(err.message).toStrictEqual(errors.ERROR_TIMEOUT)
      }
    })

    test('Should not reject fetching the correct data', async () => {
      const result = await http.getRequest('http://localhost:3000', {}, 400)
      const data = await result.text()
      expect(data).toStrictEqual('data')
    })

    test('Should reject when timeout expires', async () => {
      try {
        await http.postRequest('http://localhost:3000/golong', {}, {}, 100)
        fail()
      } catch (err) {
        expect(err.message).toStrictEqual(errors.ERROR_TIMEOUT)
      }
    })

    test('Should throw when URL is empty', async () => {
      try {
        await http.postRequest('', {}, {}, 100)
        fail()
      } catch (err) {
        expect(err.message).toStrictEqual('Only absolute URLs are supported')
      }
    })

    test('Should not reject fetching the correct data', async () => {
      const result = await http.postRequest('http://localhost:3000', {}, {}, 400)
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
        else if (_req.url.includes('error')) {
          _res.statusCode = 500
          _res.end('{"incorrect": json}')
        } else _res.end('{"Hello": "World"}')
      })
      server.listen(3000, '127.0.0.1')
    })

    afterAll(() => {
      server.close()
    })

    test('Should not reject performing a GET request', async () => {
      const result = await http.fetchJsonByGet('http://localhost:3000')
      const expected = { Hello: 'World' }
      expect(result).toStrictEqual(expected)
    })

    test('Should reject performing a GET request', async () => {
      try {
        await http.fetchJsonByGet('http://localhost:3000/incorrect')
        fail()
      } catch (err) {
        expect(err.message).toStrictEqual('Failed to extract the json from the response:{"size":0,"timeout":0}')
      }
    })

    test('Should reject performing a GET request', async () => {
      try {
        await http.fetchJsonByGet('http://localhost:3000/error')
        fail()
      } catch (err) {
        expect(err.message).toStrictEqual("Unexpected HTTP status - '500 Internal Server Error'")
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
            else if (body.includes('error')) {
              _res.statusCode = 500
              _res.end('{"incorrect": json}')
            } else _res.end(body)
          })
        }
      })
      server.listen(3000, '127.0.0.1')
    })

    afterAll(() => {
      server.close()
    })

    test('Should not reject returning the correct response', async () => {
      const body = { hello: 'world' }
      const result = await http.fetchJsonByPost('http://localhost:3000', body)
      expect(result).toStrictEqual(body)
    })

    test('Should reject with incorrect output', async () => {
      const body = { hello: 'incorrect' }
      try {
        await http.fetchJsonByPost('http://localhost:3000', body)
        fail()
      } catch (err) {
        expect(err.message).toStrictEqual('Failed to extract the json from the response:{"size":0,"timeout":0}')
      }
    })

    test('Should reject with incorrect output', async () => {
      const body = { hello: 'error' }
      try {
        await http.fetchJsonByPost('http://localhost:3000', body)
        fail()
      } catch (err) {
        expect(err.message).toStrictEqual("Unexpected HTTP status - '500 Internal Server Error'")
      }
    })

    test('Should reject with incorrect URL', async () => {
      const body = { hello: 'world' }
      try {
        await http.fetchJsonByPost('', body)
        fail()
      } catch (err) {
        expect(err.message).toStrictEqual('Only absolute URLs are supported')
      }
    })
  })
})
