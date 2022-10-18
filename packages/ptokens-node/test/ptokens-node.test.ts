import { pTokensNode, pTokensNodeProvider } from '../src/index'
import jsonrpc from 'jsonrpc-lite'

jest.mock('ptokens-helpers')
import { http } from 'ptokens-helpers'

describe('pTokensNode', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('getProvider', () => {
    test('Should return the provider set when calling constructor', () => {
      const provider = new pTokensNodeProvider('a-url')
      const node = new pTokensNode(provider)
      expect(node.provider).toStrictEqual(provider)
    })
  })

  describe('getTransactionStatus', () =>
    test('Should return the provider set when calling constructor', async () => {
      const fetchJsonByPostSpy = jest.spyOn(http, 'fetchJsonByPost').mockResolvedValue(jsonrpc.success(1, { data: 1 }))
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

  describe('getSupportedChainsByAsset', () => {
    test('Should call fetchJsonByPost with correct arguments', async () => {
      const expected = [
        { chainId: 'first-chain-id', info: 'first-info' },
        { chainId: 'chain-id', info: 'info' },
        { chainId: 'another-chain-id', info: 'another-info' },
      ]
      const fetchJsonByPostSpy = jest.spyOn(http, 'fetchJsonByPost').mockResolvedValue(jsonrpc.success(1, expected))
      const provider = new pTokensNodeProvider('a-url')
      const node = new pTokensNode(provider)
      const ret = await node.getSupportedChainsByAsset('a-token')
      expect(fetchJsonByPostSpy).toHaveBeenNthCalledWith(1, 'a-url', {
        id: 1,
        jsonrpc: '2.0',
        method: 'node_getSupportedChainsByAsset',
        params: ['a-token'],
      })
      expect(ret).toStrictEqual(expected)
    })

    test('Should call fetchJsonByPost with correct arguments', async () => {
      const fetchJsonByPostSpy = jest.spyOn(http, 'fetchJsonByPost').mockResolvedValue(
        jsonrpc.success(1, [
          { chainId: 'first-chain-id', info: 'first-info' },
          { chainId: 'chain-id', info: 'info' },
          { chainId: 'another-chain-id', info: 'another-info' },
        ])
      )
      const provider = new pTokensNodeProvider('a-url')
      const node = new pTokensNode(provider)
      const ret = await node.getAssetInfoByChainId('a-token', 'chain-id')
      expect(fetchJsonByPostSpy).toHaveBeenNthCalledWith(1, 'a-url', {
        id: 1,
        jsonrpc: '2.0',
        method: 'node_getSupportedChainsByAsset',
        params: ['a-token'],
      })
      expect(ret).toStrictEqual({ chainId: 'chain-id', info: 'info' })
    })

    test('Should call fetchJsonByPost with correct arguments', async () => {
      const fetchJsonByPostSpy = jest.spyOn(http, 'fetchJsonByPost').mockResolvedValue(
        jsonrpc.success(1, [
          { chainId: 'first-chain-id', info: 'first-info' },
          { chainId: 'another-chain-id', info: 'another-info' },
        ])
      )
      const provider = new pTokensNodeProvider('a-url')
      const node = new pTokensNode(provider)
      const ret = await node.getAssetInfoByChainId('a-token', 'chain-id')
      expect(fetchJsonByPostSpy).toHaveBeenNthCalledWith(1, 'a-url', {
        id: 1,
        jsonrpc: '2.0',
        method: 'node_getSupportedChainsByAsset',
        params: ['a-token'],
      })
      expect(ret).toStrictEqual(null)
    })

    test('Should throw the provider set when calling constructor', async () => {
      const fetchJsonByPostSpy = jest
        .spyOn(http, 'fetchJsonByPost')
        .mockRejectedValue(new Error('fetchJsonByPost error'))
      const provider = new pTokensNodeProvider('a-url')
      const node = new pTokensNode(provider)
      try {
        await node.getSupportedChainsByAsset('a-token')
        fail()
      } catch (err) {
        expect(err.message).toEqual('fetchJsonByPost error')
        expect(fetchJsonByPostSpy).toHaveBeenNthCalledWith(1, 'a-url', {
          id: 1,
          jsonrpc: '2.0',
          method: 'node_getSupportedChainsByAsset',
          params: ['a-token'],
        })
      }
    })
  })

  describe('getNativeDepositAddress', () => {
    test('Should return the provider set when calling constructor', async () => {
      const fetchJsonByPostSpy = jest
        .spyOn(http, 'fetchJsonByPost')
        .mockResolvedValue(jsonrpc.success(1, { data: 'data' }))
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
