import { Blockchain, ChainId, Network } from 'ptokens-constants'
import { pTokensNode, pTokensNodeProvider } from 'ptokens-node'
import { pTokensEosioAsset, pTokensEosioProvider } from '../src'

import PromiEvent from 'promievent'
import BigNumber from 'bignumber.js'

const tokenAbi = require('../src/abi/pTokenOnEOSContractAbiV2.json')
const vaultAbi = require('../src/abi/pTokenVaultOnEOSContractAbiV2.json')

jest.mock('ptokens-node')

describe('EOSIO asset', () => {
  test('Should create an EOSIO asset from constructor', () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const asset = new pTokensEosioAsset({
      node,
      symbol: 'SYM',
      assetInfo: {
        chainId: ChainId.EosMainnet,
        isNative: false,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        decimals: 8,
        vaultAddress: 'vault-contract-address',
      },
    })
    expect(asset.symbol).toStrictEqual('SYM')
    expect(asset.chainId).toStrictEqual(ChainId.EosMainnet)
    expect(asset.blockchain).toStrictEqual(Blockchain.Eos)
    expect(asset.network).toStrictEqual(Network.Mainnet)
    expect(asset.weight).toEqual(1)
  })
  describe('nativeToInterim', () => {
    beforeEach(() => {
      jest.resetAllMocks()
    })
    test('Should not call nativeToInterim if provider is missing', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const asset = new pTokensEosioAsset({
        node,
        symbol: 'SYM',
        assetInfo: {
          chainId: ChainId.EosMainnet,
          isNative: false,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          decimals: 8,
          vaultAddress: 'vault-contract-address',
        },
      })
      try {
        await asset.nativeToInterim(BigNumber(123.456789), 'destination-address', 'destination-chain-id')
        fail()
      } catch (err) {
        expect(err.message).toEqual('Missing provider')
      }
    })

    test('Should not call nativeToInterim for non-native tokens', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const provider = new pTokensEosioProvider('eos-rpc-endpoint')
      provider.setActor('tokenOwner')
      const transactSpy = jest.spyOn(provider, 'transact').mockImplementation(() => {
        const promi = new PromiEvent<string>((resolve) =>
          setImmediate(() => {
            promi.emit('txBroadcasted', 'tx-hash')
            promi.emit('txConfirmed', 'tx-hash')
            return resolve('tx-hash')
          })
        )
        return promi
      })
      const asset = new pTokensEosioAsset({
        node,
        symbol: 'SYM',
        provider: provider,
        assetInfo: {
          chainId: ChainId.EosMainnet,
          isNative: false,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          decimals: 8,
          vaultAddress: 'vault-contract-address',
        },
      })
      try {
        await asset.nativeToInterim(BigNumber(123.456789), 'destination-address', 'destination-chain-id')
        fail()
      } catch (err) {
        expect(err.message).toEqual('Invalid call to nativeToInterim() for non-native token')
        expect(transactSpy).toHaveBeenCalledTimes(0)
      }
    })

    test('Should not call nativeToInterim if token owner is missing', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const provider = new pTokensEosioProvider('eos-rpc-endpoint')
      const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfoByChainId')
      const transactSpy = jest.spyOn(provider, 'transact')
      const asset = new pTokensEosioAsset({
        node,
        symbol: 'SYM',
        provider: provider,
        assetInfo: {
          chainId: ChainId.EosMainnet,
          isNative: false,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          decimals: 8,
          vaultAddress: 'vault-contract-address',
        },
      })
      try {
        await asset.nativeToInterim(BigNumber(123.456789), 'destination-address', 'destination-chain-id')
        fail()
      } catch (err) {
        expect(err.message).toEqual('Missing actor')
        expect(getAssetInfoSpy).toHaveBeenCalledTimes(0)
        expect(transactSpy).toHaveBeenCalledTimes(0)
      }
    })

    test('Should call transact with transfer', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const provider = new pTokensEosioProvider('eos-rpc-endpoint')
      provider.setActor('tokenOwner')
      const transactSpy = jest.spyOn(provider, 'transact').mockImplementation(() => {
        const promi = new PromiEvent<string>((resolve) =>
          setImmediate(() => {
            promi.emit('txBroadcasted', 'tx-hash')
            promi.emit('txConfirmed', 'tx-hash')
            return resolve('tx-hash')
          })
        )
        return promi
      })
      const asset = new pTokensEosioAsset({
        node,
        symbol: 'SYM',
        provider: provider,
        assetInfo: {
          chainId: ChainId.EosMainnet,
          isNative: true,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          decimals: 8,
          vaultAddress: 'vault-contract-address',
        },
      })
      let txHash = ''
      const ret = await asset
        .nativeToInterim(BigNumber(123.456789), 'destination-address', 'destination-chain-id')
        .on('txBroadcasted', (_txHash) => {
          txHash = _txHash
        })
      expect(txHash).toEqual('tx-hash')
      expect(ret).toEqual('tx-hash')
      expect(transactSpy).toHaveBeenNthCalledWith(1, [
        {
          abi: tokenAbi,
          contractAddress: 'token-contract-address',
          method: 'transfer',
          arguments: {
            from: 'tokenOwner',
            to: 'vault-contract-address',
            quantity: '123.45678900 SYM',
            memo: 'destination-address,destination-chain-id',
          },
        },
      ])
    })

    test('Should call transact with transfer with other decimals', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const provider = new pTokensEosioProvider('eos-rpc-endpoint')
      provider.setActor('tokenOwner')
      const transactSpy = jest.spyOn(provider, 'transact').mockImplementation(() => {
        const promi = new PromiEvent<string>((resolve) =>
          setImmediate(() => {
            promi.emit('txBroadcasted', 'tx-hash')
            promi.emit('txConfirmed', 'tx-hash')
            return resolve('tx-hash')
          })
        )
        return promi
      })
      const asset = new pTokensEosioAsset({
        node,
        symbol: 'SYM',
        provider: provider,
        assetInfo: {
          chainId: ChainId.EosMainnet,
          isNative: true,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          decimals: 9,
          vaultAddress: 'vault-contract-address',
        },
      })
      let txHash = ''
      const ret = await asset
        .nativeToInterim(BigNumber(123.456789), 'destination-address', 'destination-chain-id')
        .on('txBroadcasted', (_txHash) => {
          txHash = _txHash
        })
      expect(txHash).toEqual('tx-hash')
      expect(ret).toEqual('tx-hash')
      expect(transactSpy).toHaveBeenNthCalledWith(1, [
        {
          abi: tokenAbi,
          contractAddress: 'token-contract-address',
          method: 'transfer',
          arguments: {
            from: 'tokenOwner',
            to: 'vault-contract-address',
            quantity: '123.456789000 SYM',
            memo: 'destination-address,destination-chain-id',
          },
        },
      ])
    })

    test('Should call transact with transfer and adduserdata with user data', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const provider = new pTokensEosioProvider('eos-rpc-endpoint')
      provider.setActor('tokenOwner')
      const transactSpy = jest.spyOn(provider, 'transact').mockImplementation(() => {
        const promi = new PromiEvent<string>((resolve) =>
          setImmediate(() => {
            promi.emit('txBroadcasted', 'tx-hash')
            promi.emit('txConfirmed', 'tx-hash')
            return resolve('tx-hash')
          })
        )
        return promi
      })
      const asset = new pTokensEosioAsset({
        node,
        symbol: 'SYM',
        provider: provider,
        assetInfo: {
          chainId: ChainId.EosMainnet,
          isNative: true,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          decimals: 8,
          vaultAddress: 'vault-contract-address',
        },
      })
      let txHash = ''
      const ret = await asset
        .nativeToInterim(BigNumber(123.456789), 'destination-address', 'destination-chain-id', Buffer.from('user-data'))
        .on('txBroadcasted', (_txHash) => {
          txHash = _txHash
        })
      expect(txHash).toEqual('tx-hash')
      expect(ret).toEqual('tx-hash')
      expect(transactSpy).toHaveBeenNthCalledWith(1, [
        {
          abi: tokenAbi,
          contractAddress: 'token-contract-address',
          method: 'transfer',
          arguments: {
            from: 'tokenOwner',
            to: 'vault-contract-address',
            quantity: '123.45678900 SYM',
            memo: 'destination-address,destination-chain-id,1',
          },
        },
        {
          abi: vaultAbi,
          contractAddress: 'vault-contract-address',
          method: 'adduserdata',
          arguments: { user_data: Buffer.from('user-data') },
        },
      ])
    })

    test('Should not call nativeToInterim for non-native tokens', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const provider = new pTokensEosioProvider('eos-rpc-endpoint')
      provider.setActor('tokenOwner')
      const transactSpy = jest.spyOn(provider, 'transact').mockImplementation(() => {
        const promi = new PromiEvent<string>((resolve) =>
          setImmediate(() => {
            promi.emit('txBroadcasted', 'tx-hash')
            promi.emit('txConfirmed', 'tx-hash')
            return resolve('tx-hash')
          })
        )
        return promi
      })
      const asset = new pTokensEosioAsset({
        node,
        symbol: 'SYM',
        provider: provider,
        assetInfo: {
          chainId: ChainId.EosMainnet,
          isNative: false,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          decimals: 8,
          vaultAddress: 'vault-contract-address',
        },
      })
      try {
        await asset.nativeToInterim(BigNumber(123.456789), 'destination-address', 'destination-chain-id')
        fail()
      } catch (err) {
        expect(err.message).toEqual('Invalid call to nativeToInterim() for non-native token')
        expect(transactSpy).toHaveBeenCalledTimes(0)
      }
    })
  })

  describe('hostToInterim', () => {
    beforeEach(() => {
      jest.resetAllMocks()
    })
    test('Should not call hostToInterim if provider is missing', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const asset = new pTokensEosioAsset({
        node,
        symbol: 'SYM',
        assetInfo: {
          chainId: ChainId.EosMainnet,
          isNative: true,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          decimals: 8,
          vaultAddress: 'vault-contract-address',
        },
      })
      try {
        await asset.hostToInterim(BigNumber(123.456789), 'destination-address', 'destination-chain-id')
        fail()
      } catch (err) {
        expect(err.message).toEqual('Missing provider')
      }
    })

    test('Should not call hostToInterim for native tokens', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const provider = new pTokensEosioProvider('eos-rpc-endpoint')
      provider.setActor('tokenOwner')
      const transactSpy = jest.spyOn(provider, 'transact').mockImplementation(() => {
        const promi = new PromiEvent<string>((resolve) =>
          setImmediate(() => {
            promi.emit('txBroadcasted', 'tx-hash')
            promi.emit('txConfirmed', 'tx-hash')
            return resolve('tx-hash')
          })
        )
        return promi
      })
      const asset = new pTokensEosioAsset({
        node,
        symbol: 'SYM',
        provider: provider,
        assetInfo: {
          chainId: ChainId.EosMainnet,
          isNative: true,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          decimals: 8,
          vaultAddress: 'vault-contract-address',
        },
      })
      try {
        await asset.hostToInterim(BigNumber(123.456789), 'destination-address', 'destination-chain-id')
        fail()
      } catch (err) {
        expect(err.message).toEqual('Invalid call to hostToInterim() for native token')
        expect(transactSpy).toHaveBeenCalledTimes(0)
      }
    })

    test('Should not call hostToInterim if token owner is missing', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const provider = new pTokensEosioProvider('eos-rpc-endpoint')
      const transactSpy = jest.spyOn(provider, 'transact')
      const asset = new pTokensEosioAsset({
        node,
        symbol: 'SYM',
        provider: provider,
        assetInfo: {
          chainId: ChainId.EosMainnet,
          isNative: true,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          decimals: 8,
          vaultAddress: 'vault-contract-address',
        },
      })
      try {
        await asset.hostToInterim(BigNumber(123.456789), 'destination-address', 'destination-chain-id')
        fail()
      } catch (err) {
        expect(err.message).toEqual('Missing actor')
        expect(transactSpy).toHaveBeenCalledTimes(0)
      }
    })

    test('Should call makeContractSend with redeem for non-native token', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const provider = new pTokensEosioProvider('eos-rpc-endpoint')
      provider.setActor('tokenOwner')
      const transactSpy = jest.spyOn(provider, 'transact').mockImplementation(() => {
        const promi = new PromiEvent<string>((resolve) =>
          setImmediate(() => {
            promi.emit('txBroadcasted', 'tx-hash')
            promi.emit('txConfirmed', 'tx-hash')
            return resolve('tx-hash')
          })
        )
        return promi
      })
      const asset = new pTokensEosioAsset({
        node,
        symbol: 'SYM',
        provider: provider,
        assetInfo: {
          chainId: ChainId.EosMainnet,
          isNative: false,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          decimals: 8,
        },
      })
      let txHashBroadcasted = ''
      let txHashConfirmed = ''
      const ret = await asset
        .hostToInterim(BigNumber(123.456789), 'destination-address', 'destination-chain-id')
        .on('txBroadcasted', (_txHash) => {
          txHashBroadcasted = _txHash
        })
        .on('txConfirmed', (_txHash) => {
          txHashConfirmed = _txHash
        })
      expect(txHashBroadcasted).toEqual('tx-hash')
      expect(txHashConfirmed).toEqual('tx-hash')
      expect(ret).toEqual('tx-hash')
      expect(transactSpy).toHaveBeenNthCalledWith(1, [
        {
          abi: tokenAbi,
          contractAddress: 'token-contract-address',
          method: 'redeem2',
          arguments: {
            chain_id: 'stination-chain-id',
            memo: 'destination-address',
            quantity: '123.45678900 SYM',
            sender: 'tokenOwner',
            user_data: '',
          },
        },
      ])
    })

    test('Should call makeContractSend with redeem for non-native token with user data', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const provider = new pTokensEosioProvider('eos-rpc-endpoint')
      provider.setActor('tokenOwner')
      const transactSpy = jest.spyOn(provider, 'transact').mockImplementation(() => {
        const promi = new PromiEvent<string>((resolve) =>
          setImmediate(() => {
            promi.emit('txBroadcasted', 'tx-hash')
            promi.emit('txConfirmed', 'tx-hash')
            return resolve('tx-hash')
          })
        )
        return promi
      })
      const asset = new pTokensEosioAsset({
        node,
        symbol: 'SYM',
        provider: provider,
        assetInfo: {
          chainId: ChainId.EosMainnet,
          isNative: false,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          decimals: 8,
        },
      })
      let txHashBroadcasted = ''
      let txHashConfirmed = ''
      const ret = await asset
        .hostToInterim(BigNumber(123.456789), 'destination-address', 'destination-chain-id', Buffer.from('user-data'))
        .on('txBroadcasted', (_txHash) => {
          txHashBroadcasted = _txHash
        })
        .on('txConfirmed', (_txHash) => {
          txHashConfirmed = _txHash
        })
      expect(txHashBroadcasted).toEqual('tx-hash')
      expect(txHashConfirmed).toEqual('tx-hash')
      expect(ret).toEqual('tx-hash')
      expect(transactSpy).toHaveBeenNthCalledWith(1, [
        {
          abi: tokenAbi,
          contractAddress: 'token-contract-address',
          method: 'redeem2',
          arguments: {
            chain_id: 'stination-chain-id',
            memo: 'destination-address',
            quantity: '123.45678900 SYM',
            sender: 'tokenOwner',
            user_data: Buffer.from('user-data'),
          },
        },
      ])
    })
  })
})
