import { pTokensNode, pTokensNodeProvider } from '../src/index'

jest.mock('ptokens-utils')
import { http } from 'ptokens-utils'

describe('pTokensNode', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })
  describe('getProvider', () =>
    it('Should return the provider set when calling contructor', () => {
      const provider = new pTokensNodeProvider('a-url')
      const node = new pTokensNode(provider)
      expect(node.getProvider().getUrl()).toStrictEqual('a-url')
    }))
  describe('getTransactionStatus', () =>
    it('Should return the provider set when calling contructor', async () => {
      const provider = new pTokensNodeProvider('a-url')
      const node = new pTokensNode(provider)
      await node.getTransactionStatus('a-tx-hash', 'a-originating-chain-id')
      expect(http.postRequest.mock.calls[0][0]).toStrictEqual('a-url')
      expect(http.postRequest.mock.calls[0][1]).toEqual({
        id: 1,
        jsonrpc: '2.0',
        method: 'app_getTransactionStatus',
        params: ['a-tx-hash', 'a-originating-chain-id'],
      })
    }))
  describe('getAssetInfo', () =>
    it('Should return the provider set when calling contructor', async () => {
      const provider = new pTokensNodeProvider('a-url')
      const node = new pTokensNode(provider)
      await node.getAssetInfo('a-token')
      expect(http.postRequest.mock.calls[0][0]).toStrictEqual('a-url')
      expect(http.postRequest.mock.calls[0][1]).toEqual({
        id: 1,
        jsonrpc: '2.0',
        method: 'app_getAssetInfo',
        params: ['a-token'],
      })
    }))
})
