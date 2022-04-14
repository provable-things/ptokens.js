import { pTokensNodeProvider } from '../src/index'
jest.mock('ptokens-utils')
import { http } from 'ptokens-utils'

describe('pTokensSwapBuilder', () => {
  describe('getUrl', () =>
    it('Should return the URL set when calling constructor', () => {
      const provider = new pTokensNodeProvider('a-url')
      expect(provider.getUrl()).toStrictEqual('a-url')
    }))
  describe('sendRpcRequest', () =>
    it('Should call fetch with correct parameters', () => {
      const provider = new pTokensNodeProvider('http://test-node.p.tokens')
      provider.sendRpcRequest(1, 'method', ['param', 1])
      expect(http.postRequest.mock.calls[0][0]).toStrictEqual('http://test-node.p.tokens')
      expect(http.postRequest.mock.calls[0][1]).toEqual({
        jsonrpc: '2.0',
        id: 1,
        method: 'method',
        params: ['param', 1],
      })
    }))
})
