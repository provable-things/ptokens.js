import { pTokensNode, pTokensNodeProvider } from '../src/index'

jest.mock('ptokens-helpers')
import { http } from 'ptokens-helpers'

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
      const fetchJsonByPostMock = http.fetchJsonByPost as jest.MockedFunction<typeof http.fetchJsonByPost>
      expect(fetchJsonByPostMock.mock.calls[0][0]).toStrictEqual('a-url')
      expect(fetchJsonByPostMock.mock.calls[0][1]).toEqual({
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
      const fetchJsonByPostMock = http.fetchJsonByPost as jest.MockedFunction<typeof http.fetchJsonByPost>
      expect(fetchJsonByPostMock.mock.calls[0][0]).toStrictEqual('a-url')
      expect(fetchJsonByPostMock.mock.calls[0][1]).toEqual({
        id: 1,
        jsonrpc: '2.0',
        method: 'app_getAssetInfo',
        params: ['a-token'],
      })
    }))
  describe('getNativeDepositAddress', () =>
    it('Should return the provider set when calling contructor', async () => {
      const provider = new pTokensNodeProvider('a-url')
      const node = new pTokensNode(provider)
      await node.getNativeDepositAddress('originating-chain-id', 'address', 'destination-chain-id')
      const fetchJsonByPostMock = http.fetchJsonByPost as jest.MockedFunction<typeof http.fetchJsonByPost>
      expect(fetchJsonByPostMock.mock.calls[0][0]).toStrictEqual('a-url')
      expect(fetchJsonByPostMock.mock.calls[0][1]).toEqual({
        id: 1,
        jsonrpc: '2.0',
        method: 'app_getNativeDepositAddress',
        params: ['originating-chain-id', 'address', 'destination-chain-id'],
      })
    }))
})
