import { pTokensNodeProvider } from '../src/index'
jest.mock('ptokens-helpers')
import { http } from 'ptokens-helpers'

describe('pTokensSwapBuilder', () => {
  describe('getUrl', () =>
    it('Should return the URL set when calling constructor', () => {
      const provider = new pTokensNodeProvider('a-url')
      expect(provider.getUrl()).toStrictEqual('a-url')
    }))
  describe('sendRpcRequest', () =>
    it('Should call fetch with correct parameters', async () => {
      const provider = new pTokensNodeProvider('http://test-node.p.tokens')
      await provider.sendRpcRequest(1, 'method', ['param', 1])
      const postRequestMock = http.postRequest as jest.MockedFunction<typeof http.postRequest>
      expect(postRequestMock.mock.calls[0][0]).toStrictEqual('http://test-node.p.tokens')
      expect(postRequestMock.mock.calls[0][1]).toEqual({
        jsonrpc: '2.0',
        id: 1,
        method: 'method',
        params: ['param', 1],
      })
    }))
})
