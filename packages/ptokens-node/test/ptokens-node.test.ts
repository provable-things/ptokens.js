import { pTokensNode, pTokensNodeProvider } from '../src/index'

jest.mock('ptokens-helpers')
import { http } from 'ptokens-helpers'

describe('pTokensNode', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('getProvider', () => {
    it('Should return the provider set when calling contructor', () => {
      const provider = new pTokensNodeProvider('a-url')
      const node = new pTokensNode(provider)
      expect(node.getProvider()).toStrictEqual(provider)
    })
  })

  describe('getTransactionStatus', () =>
    it('Should return the provider set when calling contructor', async () => {
      const fetchJsonByPostSpy = jest.spyOn(http, 'fetchJsonByPost')
      const provider = new pTokensNodeProvider('a-url')
      const node = new pTokensNode(provider)
      await node.getTransactionStatus('a-tx-hash', 'a-originating-chain-id')
      expect(fetchJsonByPostSpy).toHaveBeenNthCalledWith(1, 'a-url', {
        id: 1,
        jsonrpc: '2.0',
        method: 'node_getTransactionStatus',
        params: ['a-tx-hash', 'a-originating-chain-id'],
      })
    }))

  describe('getAssetInfo', () => {
    it('Should call fetchJsonByPost with correct arguments', async () => {
      const fetchJsonByPostSpy = jest.spyOn(http, 'fetchJsonByPost')
      const provider = new pTokensNodeProvider('a-url')
      const node = new pTokensNode(provider)
      await node.getAssetInfo('a-token')
      expect(fetchJsonByPostSpy).toHaveBeenNthCalledWith(1, 'a-url', {
        id: 1,
        jsonrpc: '2.0',
        method: 'node_getAssetInfo',
        params: ['a-token'],
      })
    })

    it('Should call fetchJsonByPost with correct arguments', async () => {
      const fetchJsonByPostSpy = jest.spyOn(http, 'fetchJsonByPost').mockResolvedValue([
        { chainId: 'first-chain-id', info: 'first-info' },
        { chainId: 'chain-id', info: 'info' },
        { chainId: 'another-chain-id', info: 'another-info' },
      ])
      const provider = new pTokensNodeProvider('a-url')
      const node = new pTokensNode(provider)
      const ret = await node.getAssetInfo('a-token', 'chain-id')
      expect(fetchJsonByPostSpy).toHaveBeenNthCalledWith(1, 'a-url', {
        id: 1,
        jsonrpc: '2.0',
        method: 'node_getAssetInfo',
        params: ['a-token', 'chain-id'],
      })
      expect(ret).toStrictEqual({ chainId: 'chain-id', info: 'info' })
    })

    it('Should throw the provider set when calling contructor', async () => {
      const fetchJsonByPostSpy = jest
        .spyOn(http, 'fetchJsonByPost')
        .mockRejectedValue(new Error('fetchJsonByPost error'))
      const provider = new pTokensNodeProvider('a-url')
      const node = new pTokensNode(provider)
      try {
        await node.getAssetInfo('a-token')
        fail()
      } catch (err) {
        expect(err.message).toEqual('fetchJsonByPost error')
        expect(fetchJsonByPostSpy).toHaveBeenNthCalledWith(1, 'a-url', {
          id: 1,
          jsonrpc: '2.0',
          method: 'node_getAssetInfo',
          params: ['a-token'],
        })
      }
    })
  })

  describe('getNativeDepositAddress', () => {
    it('Should return the provider set when calling contructor', async () => {
      const fetchJsonByPostSpy = jest.spyOn(http, 'fetchJsonByPost')
      const provider = new pTokensNodeProvider('a-url')
      const node = new pTokensNode(provider)
      await node.getNativeDepositAddress('originating-chain-id', 'address', 'destination-chain-id')
      expect(fetchJsonByPostSpy).toHaveBeenNthCalledWith(1, 'a-url', {
        id: 1,
        jsonrpc: '2.0',
        method: 'node_getNativeDepositAddress',
        params: ['originating-chain-id', 'address', 'destination-chain-id'],
      })
    })
  })
})
