import { Blockchain, NetworkId, Network } from 'ptokens-constants'
import { pTokensEvmAsset, pTokensEvmProvider } from '../src'

import PromiEvent from 'promievent'
import BigNumber from 'bignumber.js'

const pRouterAbi = require('../src/abi/PRouterAbi.json')

jest.mock('web3')

describe('EVM asset', () => {
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
    })
    expect(asset.symbol).toStrictEqual('pSYM')
    expect(asset.blockchain).toStrictEqual(Blockchain.Sepolia)
    expect(asset.network).toStrictEqual(Network.Testnet)
    expect(asset.networkId).toStrictEqual(NetworkId.SepoliaTestnet)
    expect(asset.weight).toEqual(1)
  })

  describe('swap', () => {
    test('Should not call swap if provider is missing', async () => {
      const routerAddress = 'router-address'
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
      })
      try {
        await asset['swap'](routerAddress, BigNumber(123.456789), 'destination-address', 'destination-chain-id')
        fail()
      } catch (err) {
        expect(err.message).toEqual('Missing provider')
      }
    })

    test('Should call makeContractSend with userSend', async () => {
      const provider = new pTokensEvmProvider()
      const makeContractSendSpy = jest.spyOn(provider, 'makeContractSend').mockImplementation(() => {
        const promi = new PromiEvent<string>((resolve) =>
          setImmediate(() => {
            promi.emit('txBroadcasted', 'tx-hash')
            promi.emit('txConfirmed', 'tx-hash')
            return resolve('tx-hash')
          })
        )
        return promi
      })
      const routerAddress = 'router-address'
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
      })
      let txHashBroadcasted = ''
      let txHashConfirmed = ''
      const ret = await asset['swap'](
        routerAddress,
        BigNumber(123.456789),
        'destination-address',
        'destination-chain-id'
      )
        .on('txBroadcasted', (_txHash) => {
          txHashBroadcasted = _txHash
        })
        .on('txConfirmed', (_txHash) => {
          txHashConfirmed = _txHash
        })
      expect(txHashBroadcasted).toEqual('tx-hash')
      expect(txHashConfirmed).toEqual('tx-hash')
      expect(ret).toEqual('tx-hash')
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
          new Uint8Array(),
          Uint8Array.from([0, 0, 0, 0]),
        ]
      )
    })
  })
})
