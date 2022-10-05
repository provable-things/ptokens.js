import { pTokensNode, pTokensNodeProvider } from 'ptokens-node'
import { pTokensUtxoAsset, pTokensBlockstreamUtxoProvider } from '../src'
import { pTokensDepositAddress } from '../src/ptokens-deposit-address'
import PromiEvent from 'promievent'
import { Blockchain, ChainId, Network } from 'ptokens-entities'

jest.mock('ptokens-node')

describe('UTXO asset', () => {
  let depositAddressGenerateSpy
  let monitorUtxoByAddressSpy

  beforeAll(() => {
    depositAddressGenerateSpy = jest.spyOn(pTokensDepositAddress.prototype, 'generate').mockImplementation(() => {
      return Promise.resolve('deposit-address')
    })
    monitorUtxoByAddressSpy = jest
      .spyOn(pTokensBlockstreamUtxoProvider.prototype, 'monitorUtxoByAddress')
      .mockImplementation(() => {
        const promi = new PromiEvent<string>((resolve) =>
          setImmediate(() => {
            promi.emit('txBroadcasted', 'tx-hash')
            promi.emit('txConfirmed', 'tx-hash')
            return resolve('tx-hash')
          })
        )
        return promi
      })
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should create an UTXO asset from constructor', () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const asset = new pTokensUtxoAsset({
      node,
      symbol: 'SYM',
      assetInfo: {
        chainId: ChainId.BitcoinMainnet,
        isNative: false,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        vaultAddress: 'vault-contract-address',
      },
    })
    expect(asset.symbol).toStrictEqual('SYM')
    expect(asset.chainId).toStrictEqual(ChainId.BitcoinMainnet)
    expect(asset.blockchain).toStrictEqual(Blockchain.Bitcoin)
    expect(asset.network).toStrictEqual(Network.Mainnet)
    expect(asset.weight).toEqual(1)
  })

  test('Should not call nativeToInterim if provider is missing', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const asset = new pTokensUtxoAsset({
      node,
      symbol: 'SYM',
      assetInfo: {
        chainId: ChainId.BitcoinMainnet,
        isNative: false,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        vaultAddress: 'vault-contract-address',
      },
    })
    try {
      await asset.nativeToInterim(1, 'destination-address', 'destination-chain-id')
      fail()
    } catch (err) {
      expect(err.message).toEqual('Missing provider')
    }
  })

  test('Should not call nativeToInterim for non-native tokens', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const provider = new pTokensBlockstreamUtxoProvider('insight-endpoint-url')
    const asset = new pTokensUtxoAsset({
      node,
      symbol: 'SYM',
      provider: provider,
      assetInfo: {
        chainId: ChainId.BitcoinMainnet,
        isNative: false,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        vaultAddress: 'vault-contract-address',
      },
    })
    try {
      await asset.nativeToInterim(1, 'destination-address', 'destination-chain-id')
      fail()
    } catch (err) {
      expect(err.message).toEqual('Invalid call to nativeToInterim() for non-native token')
    }
  })

  test('Should wait for deposit', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const provider = new pTokensBlockstreamUtxoProvider('insight-endpoint-url')
    const asset = new pTokensUtxoAsset({
      node,
      symbol: 'SYM',
      provider: provider,
      assetInfo: {
        chainId: ChainId.BitcoinMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        vaultAddress: 'vault-contract-address',
      },
    })
    let txHashBroadcasted = ''
    let txHashConfirmed = ''
    let depositAddress
    const ret = await asset
      .nativeToInterim(1, 'destination-address', 'destination-chain-id')
      .on('depositAddress', (_address) => {
        depositAddress = _address
      })
      .on('txBroadcasted', (_txHash) => {
        txHashBroadcasted = _txHash
      })
      .on('txConfirmed', (_txHash) => {
        txHashConfirmed = _txHash
      })
    expect(depositAddress).toEqual('deposit-address')
    expect(txHashBroadcasted).toEqual('tx-hash')
    expect(txHashConfirmed).toEqual('tx-hash')
    expect(ret).toEqual('tx-hash')
    expect(monitorUtxoByAddressSpy).toHaveBeenNthCalledWith(1, 'deposit-address', 3000, 1)
    expect(depositAddressGenerateSpy).toHaveBeenNthCalledWith(
      1,
      'destination-address',
      ChainId.BitcoinMainnet,
      'destination-chain-id'
    )
  })

  test('Should not call nativeToInterim for non-native tokens', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const provider = new pTokensBlockstreamUtxoProvider('insight-endpoint-url')
    const asset = new pTokensUtxoAsset({
      node,
      symbol: 'SYM',
      provider: provider,
      assetInfo: {
        chainId: ChainId.BitcoinMainnet,
        isNative: false,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        vaultAddress: 'vault-contract-address',
      },
    })
    try {
      await asset.nativeToInterim(1, 'destination-address', 'destination-chain-id')
      fail()
    } catch (err) {
      expect(err.message).toEqual('Invalid call to nativeToInterim() for non-native token')
    }
  })

  test('Should not call hostToInterim if provider is missing', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const asset = new pTokensUtxoAsset({
      node,
      symbol: 'SYM',
      assetInfo: {
        chainId: ChainId.BitcoinMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        vaultAddress: 'vault-contract-address',
      },
    })
    try {
      await asset.hostToInterim()
      fail()
    } catch (err) {
      expect(err.message).toEqual('No ptokens in a UTXO blockchain')
    }
  })

  test('Should reject when erroring address generation', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const provider = new pTokensBlockstreamUtxoProvider('insight-endpoint-url')
    depositAddressGenerateSpy = jest.spyOn(pTokensDepositAddress.prototype, 'generate').mockImplementation(() => {
      throw new Error('Address generation error')
    })
    const asset = new pTokensUtxoAsset({
      node,
      symbol: 'SYM',
      provider: provider,
      assetInfo: {
        chainId: ChainId.BitcoinMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        vaultAddress: 'vault-contract-address',
      },
    })
    try {
      await asset.nativeToInterim(1, 'destination-address', 'destination-chain-id')
    } catch (err) {
      expect(err.message).toStrictEqual('Address generation error')
      expect(monitorUtxoByAddressSpy).toHaveBeenCalledTimes(0)
      expect(depositAddressGenerateSpy).toHaveBeenNthCalledWith(
        1,
        'destination-address',
        ChainId.BitcoinMainnet,
        'destination-chain-id'
      )
    }
  })

  test('Should reject if chain id is not specified', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const provider = new pTokensBlockstreamUtxoProvider('insight-endpoint-url')
    const asset = new pTokensUtxoAsset({
      node,
      symbol: 'SYM',
      provider: provider,
      assetInfo: {
        chainId: ChainId.BitcoinMainnet,
        isNative: true,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        vaultAddress: 'vault-contract-address',
      },
    })
    try {
      await asset.nativeToInterim(1, 'destination-address', undefined)
    } catch (err) {
      expect(err.message).toStrictEqual('Undefined chain ID')
      expect(monitorUtxoByAddressSpy).toHaveBeenCalledTimes(0)
      expect(depositAddressGenerateSpy).toHaveBeenCalledTimes(0)
    }
  })
})
