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

  test('Should create an EVM asset from constructor', () => {
    const asset = new pTokensUtxoAsset({
      symbol: 'SYM',
      chainId: ChainId.BitcoinMainnet,
      blockchain: Blockchain.Bitcoin,
      network: Network.Mainnet,
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
      symbol: 'SYM',
      chainId: ChainId.BitcoinMainnet,
      blockchain: Blockchain.Bitcoin,
      network: Network.Mainnet,
    })
    try {
      await asset.nativeToInterim(node, 1, 'destination-address', 'destination-chain-id')
      fail()
    } catch (err) {
      expect(err.message).toEqual('Missing provider')
    }
  })

  test('Should not call nativeToInterim for non-native tokens', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const provider = new pTokensBlockstreamUtxoProvider('insight-endpoint-url')
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfoByChainId').mockImplementation(() => {
      return Promise.resolve({
        chainId: 'originating-chain-id',
        isNative: false,
        tokenAddress: 'token-contract-address',
        isSystemToken: false,
        vaultAddress: 'vault-contract-address',
      })
    })
    const asset = new pTokensUtxoAsset({
      symbol: 'SYM',
      chainId: ChainId.BitcoinMainnet,
      blockchain: Blockchain.Bitcoin,
      network: Network.Mainnet,
      provider: provider,
    })
    try {
      await asset.nativeToInterim(node, 1, 'destination-address', 'destination-chain-id')
      fail()
    } catch (err) {
      expect(err.message).toEqual('Invalid call to nativeToInterim() for non-native token')
      expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', ChainId.BitcoinMainnet)
    }
  })

  test('Should wait for deposit', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const provider = new pTokensBlockstreamUtxoProvider('insight-endpoint-url')
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfoByChainId').mockImplementation(() => {
      return Promise.resolve({
        chainId: 'originating-chain-id',
        isNative: true,
        tokenAddress: 'token-contract-address',
        isSystemToken: false,
        vaultAddress: 'vault-contract-address',
      })
    })
    const asset = new pTokensUtxoAsset({
      symbol: 'SYM',
      chainId: ChainId.BitcoinMainnet,
      blockchain: Blockchain.Bitcoin,
      network: Network.Mainnet,
      provider: provider,
    })
    let txHashBroadcasted = ''
    let txHashConfirmed = ''
    const ret = await asset
      .nativeToInterim(node, 1, 'destination-address', 'destination-chain-id')
      .on('txBroadcasted', (_txHash) => {
        txHashBroadcasted = _txHash
      })
      .on('txConfirmed', (_txHash) => {
        txHashConfirmed = _txHash
      })
    expect(txHashBroadcasted).toEqual('tx-hash')
    expect(txHashConfirmed).toEqual('tx-hash')
    expect(ret).toEqual('tx-hash')
    expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', ChainId.BitcoinMainnet)
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
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfoByChainId').mockImplementation(() => {
      return Promise.resolve({
        chainId: 'originating-chain-id',
        isNative: false,
        tokenAddress: 'token-contract-address',
        isSystemToken: false,
        vaultAddress: 'vault-contract-address',
      })
    })
    const asset = new pTokensUtxoAsset({
      symbol: 'SYM',
      chainId: ChainId.BitcoinMainnet,
      blockchain: Blockchain.Bitcoin,
      network: Network.Mainnet,
      provider: provider,
    })
    try {
      await asset.nativeToInterim(node, 1, 'destination-address', 'destination-chain-id')
      fail()
    } catch (err) {
      expect(err.message).toEqual('Invalid call to nativeToInterim() for non-native token')
      expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', ChainId.BitcoinMainnet)
    }
  })

  test('Should not call hostToInterim if provider is missing', async () => {
    const asset = new pTokensUtxoAsset({
      symbol: 'SYM',
      chainId: ChainId.BitcoinMainnet,
      blockchain: Blockchain.Bitcoin,
      network: Network.Mainnet,
    })
    try {
      await asset.hostToInterim()
      fail()
    } catch (err) {
      expect(err.message).toEqual('No ptokens in a UTXO blockchain')
    }
  })
})
