import { pTokensNode, pTokensNodeProvider } from 'ptokens-node'
import { pTokensEosioAsset, pTokensEosioProvider } from '../src'
import PromiEvent from 'promievent'
import { Blockchain, ChainId, Network } from 'ptokens-entities'

const tokenAbi = require('../src/abi/pTokenOnEOSContractAbiV2.json')
const vaultAbi = require('../src/abi/pTokenVaultOnEOSContractAbiV2.json')

jest.mock('ptokens-node')

describe('EOSIO asset', () => {
  test('Should create an EOSIO asset from constructor', () => {
    const asset = new pTokensEosioAsset({
      symbol: 'SYM',
      chainId: ChainId.EthereumMainnet,
      blockchain: Blockchain.Ethereum,
      network: Network.Mainnet,
    })
    expect(asset.symbol).toStrictEqual('SYM')
    expect(asset.chainId).toStrictEqual(ChainId.EthereumMainnet)
    expect(asset.blockchain).toStrictEqual(Blockchain.Ethereum)
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
        symbol: 'SYM',
        chainId: ChainId.EthereumMainnet,
        blockchain: Blockchain.Ethereum,
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
      const provider = new pTokensEosioProvider('eos-rpc-endpoint')
      provider.setActor('tokenOwner')
      const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfoByChainId').mockImplementation(() => {
        return Promise.resolve({
          chainId: 'originating-chain-id',
          isNative: false,
          tokenAddress: 'token-contract-address',
          isSystemToken: false,
          vaultAddress: 'vault-contract-address',
        })
      })
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
        symbol: 'SYM',
        chainId: ChainId.EthereumMainnet,
        blockchain: Blockchain.Ethereum,
        network: Network.Mainnet,
        provider: provider,
      })
      try {
        await asset.nativeToInterim(node, 1, 'destination-address', 'destination-chain-id')
        fail()
      } catch (err) {
        expect(err.message).toEqual('Invalid call to nativeToInterim() for non-native token')
        expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', ChainId.EthereumMainnet)
        expect(transactSpy).toHaveBeenCalledTimes(0)
      }
    })

    test('Should not call nativeToInterim if token owner is missing', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const provider = new pTokensEosioProvider('eos-rpc-endpoint')
      const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfoByChainId')
      const transactSpy = jest.spyOn(provider, 'transact')
      const asset = new pTokensEosioAsset({
        symbol: 'SYM',
        chainId: ChainId.EthereumMainnet,
        blockchain: Blockchain.Ethereum,
        network: Network.Mainnet,
        provider: provider,
      })
      try {
        await asset.nativeToInterim(node, 1, 'destination-address', 'destination-chain-id')
        fail()
      } catch (err) {
        expect(err.message).toEqual('Missing actor')
        expect(getAssetInfoSpy).toHaveBeenCalledTimes(0)
        expect(transactSpy).toHaveBeenCalledTimes(0)
      }
    })

    test('Should reject if getAssetInfoReject', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const provider = new pTokensEosioProvider('eos-rpc-endpoint')
      provider.setActor('tokenOwner')
      const getAssetInfoSpy = jest
        .spyOn(pTokensNode.prototype, 'getAssetInfoByChainId')
        .mockRejectedValue(new Error('getAssetInfo error'))
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
        symbol: 'SYM',
        chainId: ChainId.EthereumMainnet,
        blockchain: Blockchain.Ethereum,
        network: Network.Mainnet,
        provider: provider,
      })
      try {
        await asset.nativeToInterim(node, 1, 'destination-address', 'destination-chain-id')
        fail()
      } catch (err) {
        expect(err.message).toEqual('getAssetInfo error')
        expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', ChainId.EthereumMainnet)
        expect(transactSpy).toHaveBeenCalledTimes(0)
      }
    })

    test('Should call makeContractSend with pegIn for native token', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const provider = new pTokensEosioProvider('eos-rpc-endpoint')
      provider.setActor('tokenOwner')
      const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfoByChainId').mockImplementation(() => {
        return Promise.resolve({
          chainId: 'originating-chain-id',
          isNative: true,
          tokenAddress: 'token-contract-address',
          isSystemToken: false,
          vaultAddress: 'vault-contract-address',
        })
      })
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
        symbol: 'SYM',
        chainId: ChainId.EthereumMainnet,
        blockchain: Blockchain.Ethereum,
        network: Network.Mainnet,
        provider: provider,
      })
      let txHash = ''
      const ret = await asset
        .nativeToInterim(node, 1, 'destination-address', 'destination-chain-id')
        .on('txBroadcasted', (_txHash) => {
          txHash = _txHash
        })
      expect(txHash).toEqual('tx-hash')
      expect(ret).toEqual('tx-hash')
      expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', ChainId.EthereumMainnet)
      expect(transactSpy).toHaveBeenNthCalledWith(1, [
        {
          abi: tokenAbi,
          contractAddress: 'token-contract-address',
          method: 'transfer',
          arguments: {
            from: 'tokenOwner',
            to: 'vault-contract-address',
            quantity: '1.00000000 SYM',
            memo: 'destination-address,destination-chain-id',
          },
        },
      ])
    })

    test('Should call makeContractSend with pegIn for native token and user data', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const provider = new pTokensEosioProvider('eos-rpc-endpoint')
      provider.setActor('tokenOwner')
      const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfoByChainId').mockImplementation(() => {
        return Promise.resolve({
          chainId: 'originating-chain-id',
          isNative: true,
          tokenAddress: 'token-contract-address',
          isSystemToken: false,
          vaultAddress: 'vault-contract-address',
        })
      })
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
        symbol: 'SYM',
        chainId: ChainId.EthereumMainnet,
        blockchain: Blockchain.Ethereum,
        network: Network.Mainnet,
        provider: provider,
      })
      let txHash = ''
      const ret = await asset
        .nativeToInterim(node, 1, 'destination-address', 'destination-chain-id', Buffer.from('user-data'))
        .on('txBroadcasted', (_txHash) => {
          txHash = _txHash
        })
      expect(txHash).toEqual('tx-hash')
      expect(ret).toEqual('tx-hash')
      expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', ChainId.EthereumMainnet)
      expect(transactSpy).toHaveBeenNthCalledWith(1, [
        {
          abi: tokenAbi,
          contractAddress: 'token-contract-address',
          method: 'transfer',
          arguments: {
            from: 'tokenOwner',
            to: 'vault-contract-address',
            quantity: '1.00000000 SYM',
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

    test('Should call makeContractSend with pegInEth for system token', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const provider = new pTokensEosioProvider('eos-rpc-endpoint')
      provider.setActor('tokenOwner')
      const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfoByChainId').mockImplementation(() => {
        return Promise.resolve({
          chainId: 'originating-chain-id',
          isNative: true,
          tokenAddress: 'token-contract-address',
          isSystemToken: true,
          vaultAddress: 'vault-contract-address',
        })
      })
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
        symbol: 'SYM',
        chainId: ChainId.EthereumMainnet,
        blockchain: Blockchain.Ethereum,
        network: Network.Mainnet,
        provider: provider,
      })
      let txHash = ''
      const ret = await asset
        .nativeToInterim(node, 1, 'destination-address', 'destination-chain-id')
        .on('txBroadcasted', (_txHash) => {
          txHash = _txHash
        })
      expect(txHash).toEqual('tx-hash')
      expect(ret).toEqual('tx-hash')
      expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', ChainId.EthereumMainnet)
      expect(transactSpy).toHaveBeenNthCalledWith(1, [
        {
          abi: tokenAbi,
          contractAddress: 'token-contract-address',
          method: 'transfer',
          arguments: {
            from: 'tokenOwner',
            to: 'vault-contract-address',
            quantity: '1.00000000 SYM',
            memo: 'destination-address,destination-chain-id',
          },
        },
      ])
    })

    test('Should call transact with transfer and adduserdata for system token with user data', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const provider = new pTokensEosioProvider('eos-rpc-endpoint')
      provider.setActor('tokenOwner')
      const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfoByChainId').mockImplementation(() => {
        return Promise.resolve({
          chainId: 'originating-chain-id',
          isNative: true,
          tokenAddress: 'token-contract-address',
          isSystemToken: true,
          vaultAddress: 'vault-contract-address',
        })
      })
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
        symbol: 'SYM',
        chainId: ChainId.EthereumMainnet,
        blockchain: Blockchain.Ethereum,
        network: Network.Mainnet,
        provider: provider,
      })
      let txHash = ''
      const ret = await asset
        .nativeToInterim(node, 1, 'destination-address', 'destination-chain-id', Buffer.from('user-data'))
        .on('txBroadcasted', (_txHash) => {
          txHash = _txHash
        })
      expect(txHash).toEqual('tx-hash')
      expect(ret).toEqual('tx-hash')
      expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', ChainId.EthereumMainnet)
      expect(transactSpy).toHaveBeenNthCalledWith(1, [
        {
          abi: tokenAbi,
          contractAddress: 'token-contract-address',
          method: 'transfer',
          arguments: {
            from: 'tokenOwner',
            to: 'vault-contract-address',
            quantity: '1.00000000 SYM',
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
      const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfoByChainId').mockImplementation(() => {
        return Promise.resolve({
          chainId: 'originating-chain-id',
          isNative: false,
          tokenAddress: 'token-contract-address',
          isSystemToken: false,
          vaultAddress: 'vault-contract-address',
        })
      })
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
        symbol: 'SYM',
        chainId: ChainId.EthereumMainnet,
        blockchain: Blockchain.Ethereum,
        network: Network.Mainnet,
        provider: provider,
      })
      try {
        await asset.nativeToInterim(node, 1, 'destination-address', 'destination-chain-id')
        fail()
      } catch (err) {
        expect(err.message).toEqual('Invalid call to nativeToInterim() for non-native token')
        expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', ChainId.EthereumMainnet)
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
        symbol: 'SYM',
        chainId: ChainId.EthereumMainnet,
        blockchain: Blockchain.Ethereum,
        network: Network.Mainnet,
      })
      try {
        await asset.hostToInterim(node, 1, 'destination-address', 'destination-chain-id')
        fail()
      } catch (err) {
        expect(err.message).toEqual('Missing provider')
      }
    })

    test('Should not call hostToInterim for native tokens', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const provider = new pTokensEosioProvider('eos-rpc-endpoint')
      provider.setActor('tokenOwner')
      const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfoByChainId').mockImplementation(() => {
        return Promise.resolve({
          chainId: 'originating-chain-id',
          isNative: true,
          tokenAddress: 'token-contract-address',
          isSystemToken: false,
          vaultAddress: 'vault-contract-address',
        })
      })
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
        symbol: 'SYM',
        chainId: ChainId.EthereumMainnet,
        blockchain: Blockchain.Ethereum,
        network: Network.Mainnet,
        provider: provider,
      })
      try {
        await asset.hostToInterim(node, 1, 'destination-address', 'destination-chain-id')
        fail()
      } catch (err) {
        expect(err.message).toEqual('Invalid call to hostToInterim() for native token')
        expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', ChainId.EthereumMainnet)
        expect(transactSpy).toHaveBeenCalledTimes(0)
      }
    })

    test('Should not call hostToInterim if token owner is missing', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const provider = new pTokensEosioProvider('eos-rpc-endpoint')
      const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfoByChainId')
      const transactSpy = jest.spyOn(provider, 'transact')
      const asset = new pTokensEosioAsset({
        symbol: 'SYM',
        chainId: ChainId.EthereumMainnet,
        blockchain: Blockchain.Ethereum,
        network: Network.Mainnet,
        provider: provider,
      })
      try {
        await asset.hostToInterim(node, 1, 'destination-address', 'destination-chain-id')
        fail()
      } catch (err) {
        expect(err.message).toEqual('Missing actor')
        expect(getAssetInfoSpy).toHaveBeenCalledTimes(0)
        expect(transactSpy).toHaveBeenCalledTimes(0)
      }
    })

    test('Should reject if getAssetInfo rejects', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const provider = new pTokensEosioProvider('eos-rpc-endpoint')
      provider.setActor('tokenOwner')
      const getAssetInfoSpy = jest
        .spyOn(pTokensNode.prototype, 'getAssetInfoByChainId')
        .mockRejectedValue(new Error('getAssetInfo error'))
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
        symbol: 'SYM',
        chainId: ChainId.EthereumMainnet,
        blockchain: Blockchain.Ethereum,
        network: Network.Mainnet,
        provider: provider,
      })
      try {
        await asset.hostToInterim(node, 1, 'destination-address', 'destination-chain-id')
        fail()
      } catch (err) {
        expect(err.message).toEqual('getAssetInfo error')
        expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', ChainId.EthereumMainnet)
        expect(transactSpy).toHaveBeenCalledTimes(0)
      }
    })

    test('Should call makeContractSend with redeem for non-native token', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const provider = new pTokensEosioProvider('eos-rpc-endpoint')
      provider.setActor('tokenOwner')
      const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfoByChainId').mockImplementation(() => {
        return Promise.resolve({
          chainId: 'originating-chain-id',
          isNative: false,
          tokenAddress: 'token-contract-address',
          isSystemToken: false,
        })
      })
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
        symbol: 'SYM',
        chainId: ChainId.EthereumMainnet,
        blockchain: Blockchain.Ethereum,
        network: Network.Mainnet,
        provider: provider,
      })
      let txHashBroadcasted = ''
      let txHashConfirmed = ''
      const ret = await asset
        .hostToInterim(node, 1, 'destination-address', 'destination-chain-id')
        .on('txBroadcasted', (_txHash) => {
          txHashBroadcasted = _txHash
        })
        .on('txConfirmed', (_txHash) => {
          txHashConfirmed = _txHash
        })
      expect(txHashBroadcasted).toEqual('tx-hash')
      expect(txHashConfirmed).toEqual('tx-hash')
      expect(ret).toEqual('tx-hash')
      expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', ChainId.EthereumMainnet)
      expect(transactSpy).toHaveBeenNthCalledWith(1, [
        {
          abi: tokenAbi,
          contractAddress: 'token-contract-address',
          method: 'redeem2',
          arguments: {
            chain_id: 'stination-chain-id',
            memo: 'destination-address',
            quantity: '1.00000000 SYM',
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
      const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfoByChainId').mockImplementation(() => {
        return Promise.resolve({
          chainId: 'originating-chain-id',
          isNative: false,
          tokenAddress: 'token-contract-address',
          isSystemToken: false,
        })
      })
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
        symbol: 'SYM',
        chainId: ChainId.EosMainnet,
        blockchain: Blockchain.Eos,
        network: Network.Mainnet,
        provider: provider,
      })
      let txHashBroadcasted = ''
      let txHashConfirmed = ''
      const ret = await asset
        .hostToInterim(node, 1, 'destination-address', 'destination-chain-id', Buffer.from('user-data'))
        .on('txBroadcasted', (_txHash) => {
          txHashBroadcasted = _txHash
        })
        .on('txConfirmed', (_txHash) => {
          txHashConfirmed = _txHash
        })
      expect(txHashBroadcasted).toEqual('tx-hash')
      expect(txHashConfirmed).toEqual('tx-hash')
      expect(ret).toEqual('tx-hash')
      expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', ChainId.EosMainnet)
      expect(transactSpy).toHaveBeenNthCalledWith(1, [
        {
          abi: tokenAbi,
          contractAddress: 'token-contract-address',
          method: 'redeem2',
          arguments: {
            chain_id: 'stination-chain-id',
            memo: 'destination-address',
            quantity: '1.00000000 SYM',
            sender: 'tokenOwner',
            user_data: Buffer.from('user-data'),
          },
        },
      ])
    })
  })
})
