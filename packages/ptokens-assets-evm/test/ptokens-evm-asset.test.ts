import BigNumber from 'bignumber.js'
import PromiEvent from 'promievent'
import { Blockchain, NetworkId, Network } from 'ptokens-constants'
import { TransactionReceipt } from 'web3-core'

import { pTokensEvmAsset, pTokensEvmProvider } from '../src'

import receipt from './utils/receiptUserSend.json'

const pRouterAbi = require('../src/abi/PRouterAbi.json')

describe('EVM asset', () => {
  beforeAll(() => {
    jest.restoreAllMocks()
  })
  test('Should create an EVM asset from constructor', () => {
    const asset = new pTokensEvmAsset({
      assetInfo: {
        networkId: NetworkId.SepoliaTestnet,
        symbol: 'pSYM',
        assetTokenAddress: 'token-contract-address',
        decimals: 18,
        underlyingAssetDecimals: 18,
        underlyingAssetNetworkId: NetworkId.SepoliaTestnet,
        underlyingAssetSymbol: 'SYM',
        underlyingAssetName: 'Symbol',
        underlyingAssetTokenAddress: 'underlying-asset-token-address',
      },
      routerAddress: 'router-address',
      stateManagerAddress: 'state-manager-address',
    })
    expect(asset.symbol).toStrictEqual('pSYM')
    expect(asset.blockchain).toStrictEqual(Blockchain.Sepolia)
    expect(asset.network).toStrictEqual(Network.Testnet)
    expect(asset.networkId).toStrictEqual(NetworkId.SepoliaTestnet)
    expect(asset.weight).toEqual(1)
  })

  describe('swap', () => {
    test('Should not call swap if provider is missing', async () => {
      const asset = new pTokensEvmAsset({
        assetInfo: {
          networkId: NetworkId.SepoliaTestnet,
          symbol: 'pSYM',
          assetTokenAddress: 'token-contract-address',
          decimals: 18,
          underlyingAssetDecimals: 18,
          underlyingAssetNetworkId: NetworkId.SepoliaTestnet,
          underlyingAssetSymbol: 'SYM',
          underlyingAssetName: 'Symbol',
          underlyingAssetTokenAddress: 'underlying-asset-token-address',
        },
        routerAddress: 'router-address',
        stateManagerAddress: 'state-manager-address',
      })
      try {
        await asset['swap'](BigNumber(123.456789), 'destination-address', 'destination-chain-id')
        fail()
      } catch (err) {
        expect(err.message).toEqual('Missing provider')
      }
    })

    test('Should call makeContractSend with userSend', async () => {
      const provider = new pTokensEvmProvider()
      const makeContractSendSpy = jest.spyOn(provider, 'makeContractSend').mockImplementation(() => {
        const promi = new PromiEvent<TransactionReceipt>((resolve) =>
          setImmediate(() => {
            promi.emit('txBroadcasted', 'tx-hash')
            promi.emit('txConfirmed', receipt)
            return resolve(receipt as TransactionReceipt)
          })
        )
        return promi
      })
      const asset = new pTokensEvmAsset({
        provider: provider,
        assetInfo: {
          networkId: NetworkId.SepoliaTestnet,
          symbol: 'pSYM',
          assetTokenAddress: 'asset-token-address',
          decimals: 18,
          underlyingAssetDecimals: 18,
          underlyingAssetNetworkId: 'underlying-asset-network-id',
          underlyingAssetSymbol: 'underlying-asset-symbol',
          underlyingAssetName: 'underlying-asset-name',
          underlyingAssetTokenAddress: 'underlying-asset-token-address',
        },
        routerAddress: 'router-address',
        stateManagerAddress: 'state-manager-address',
      })
      let txHashBroadcasted = ''
      let txHashConfirmed = ''
      const ret = await asset['swap'](BigNumber(123.456789), 'destination-address', 'destination-chain-id')
        .on('txBroadcasted', (_txHash) => {
          txHashBroadcasted = _txHash
        })
        .on('txConfirmed', (_txHash) => {
          txHashConfirmed = _txHash
        })
      expect(txHashBroadcasted).toEqual({ txHash: 'tx-hash' })
      expect(txHashConfirmed).toEqual({
        operationId: '0xc6cc8381b3a70dc38c587d6c5518d72edb05b4040acbd4251fe6b67acff7f986',
        txHash: '0xcd5f6d7d2aabd3af5269459b6310892f4e56aa0cfd05024ba16bcf901c9bccd2',
      })
      expect(ret).toEqual({
        operationId: '0xc6cc8381b3a70dc38c587d6c5518d72edb05b4040acbd4251fe6b67acff7f986',
        txHash: '0xcd5f6d7d2aabd3af5269459b6310892f4e56aa0cfd05024ba16bcf901c9bccd2',
      })
      expect(makeContractSendSpy).toHaveBeenNthCalledWith(
        1,
        {
          abi: pRouterAbi,
          contractAddress: 'router-address',
          method: 'userSend',
          value: BigNumber(0),
        },
        [
          'destination-address',
          'destination-chain-id',
          'underlying-asset-name',
          'underlying-asset-symbol',
          18,
          'underlying-asset-token-address',
          'underlying-asset-network-id',
          'asset-token-address',
          '123456789000000000000',
          '0x',
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        ]
      )
    })
  })
})
