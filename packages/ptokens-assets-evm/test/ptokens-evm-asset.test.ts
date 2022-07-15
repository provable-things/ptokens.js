import Web3 from 'web3'
import { pTokensNode, pTokensNodeProvider } from 'ptokens-node'
import { pTokensEvmAsset, pTokensEvmProvider } from '../src'
import PromiEvent from 'promievent'

const vaultAbi = require('../src/abi/pERC20VaultContractAbi.json')
const tokenAbi = require('../src/abi/pTokenOnETHContractAbi.json')

jest.mock('web3')
jest.mock('ptokens-node')

describe('EVM asset', () => {
  test('Should create an EVM asset from constructor', () => {
    const asset = new pTokensEvmAsset({
      symbol: 'SYM',
      chainId: 'chain-id',
      blockchain: 'blockchain',
      network: 'network',
    })
    expect(asset.symbol).toStrictEqual('SYM')
    expect(asset.chainId).toStrictEqual('chain-id')
    expect(asset.blockchain).toStrictEqual('blockchain')
    expect(asset.network).toStrictEqual('network')
    expect(asset.weight).toEqual(1)
  })

  test('Should not call nativeToInterim if provider is missing', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const asset = new pTokensEvmAsset({
      symbol: 'SYM',
      chainId: 'chain-id',
      blockchain: 'blockchain',
      network: 'network',
    })
    try {
      await asset.nativeToInterim(node, 1, 'destination-address', 'destination-chain-id')
      fail()
    } catch (err) {
      expect(err.message).toEqual('Missing provider')
    }
  })

  test('Should not call nativeToInterim for non-native tokens', async () => {
    const web3 = new Web3()
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const provider = new pTokensEvmProvider(web3)
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfo').mockImplementation(() => {
      return Promise.resolve({
        chainId: 'originating-chain-id',
        isNative: false,
        tokenAddress: 'token-contract-address',
        isSystemToken: false,
        vaultAddress: 'vault-contract-address',
      })
    })
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
    const asset = new pTokensEvmAsset({
      symbol: 'SYM',
      chainId: 'chain-id',
      blockchain: 'blockchain',
      network: 'network',
      provider: provider,
    })
    try {
      await asset.nativeToInterim(node, 1, 'destination-address', 'destination-chain-id')
      fail()
    } catch (err) {
      expect(err.message).toEqual('Invalid call to nativeToInterim() for non-native token')
      expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', 'chain-id')
      expect(makeContractSendSpy).toHaveBeenCalledTimes(0)
    }
  })

  test('Should call makeContractSend with pegIn for native token', async () => {
    const web3 = new Web3()
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const provider = new pTokensEvmProvider(web3)
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfo').mockImplementation(() => {
      return Promise.resolve({
        chainId: 'originating-chain-id',
        isNative: true,
        tokenAddress: 'token-contract-address',
        isSystemToken: false,
        vaultAddress: 'vault-contract-address',
      })
    })
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
    const asset = new pTokensEvmAsset({
      symbol: 'SYM',
      chainId: 'chain-id',
      blockchain: 'blockchain',
      network: 'network',
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
    expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', 'chain-id')
    expect(makeContractSendSpy).toHaveBeenNthCalledWith(
      1,
      {
        abi: vaultAbi,
        contractAddress: 'vault-contract-address',
        method: 'pegIn',
        value: 0,
      },
      [1, 'token-contract-address', 'destination-address', 'destination-chain-id']
    )
  })

  test('Should call makeContractSend with pegIn for native token and user data', async () => {
    const web3 = new Web3()
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const provider = new pTokensEvmProvider(web3)
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfo').mockImplementation(() => {
      return Promise.resolve({
        chainId: 'originating-chain-id',
        isNative: true,
        tokenAddress: 'token-contract-address',
        isSystemToken: false,
        vaultAddress: 'vault-contract-address',
      })
    })
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
    const asset = new pTokensEvmAsset({
      symbol: 'SYM',
      chainId: 'chain-id',
      blockchain: 'blockchain',
      network: 'network',
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
    expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', 'chain-id')
    expect(makeContractSendSpy).toHaveBeenNthCalledWith(
      1,
      {
        abi: vaultAbi,
        contractAddress: 'vault-contract-address',
        method: 'pegIn',
        value: 0,
      },
      [1, 'token-contract-address', 'destination-address', Buffer.from('user-data'), 'destination-chain-id']
    )
  })

  test('Should call makeContractSend with pegInEth for system token', async () => {
    const web3 = new Web3()
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const provider = new pTokensEvmProvider(web3)
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfo').mockImplementation(() => {
      return Promise.resolve({
        chainId: 'originating-chain-id',
        isNative: true,
        tokenAddress: 'token-contract-address',
        isSystemToken: true,
        vaultAddress: 'vault-contract-address',
      })
    })
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
    const asset = new pTokensEvmAsset({
      symbol: 'SYM',
      chainId: 'chain-id',
      blockchain: 'blockchain',
      network: 'network',
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
    expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', 'chain-id')
    expect(makeContractSendSpy).toHaveBeenNthCalledWith(
      1,
      {
        abi: vaultAbi,
        contractAddress: 'vault-contract-address',
        method: 'pegInEth',
        value: 1,
      },
      ['destination-address', 'destination-chain-id']
    )
  })

  test('Should call makeContractSend with pegInEth for system token with user data', async () => {
    const web3 = new Web3()
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const provider = new pTokensEvmProvider(web3)
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfo').mockImplementation(() => {
      return Promise.resolve({
        chainId: 'originating-chain-id',
        isNative: true,
        tokenAddress: 'token-contract-address',
        isSystemToken: true,
        vaultAddress: 'vault-contract-address',
      })
    })
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
    const asset = new pTokensEvmAsset({
      symbol: 'SYM',
      chainId: 'chain-id',
      blockchain: 'blockchain',
      network: 'network',
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
    expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', 'chain-id')
    expect(makeContractSendSpy).toHaveBeenNthCalledWith(
      1,
      {
        abi: vaultAbi,
        contractAddress: 'vault-contract-address',
        method: 'pegInEth',
        value: 1,
      },
      ['destination-address', 'destination-chain-id', Buffer.from('user-data')]
    )
  })

  test('Should not call nativeToInterim for non-native tokens', async () => {
    const web3 = new Web3()
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const provider = new pTokensEvmProvider(web3)
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfo').mockImplementation(() => {
      return Promise.resolve({
        chainId: 'originating-chain-id',
        isNative: false,
        tokenAddress: 'token-contract-address',
        isSystemToken: false,
        vaultAddress: 'vault-contract-address',
      })
    })
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
    const asset = new pTokensEvmAsset({
      symbol: 'SYM',
      chainId: 'chain-id',
      blockchain: 'blockchain',
      network: 'network',
      provider: provider,
    })
    try {
      await asset.nativeToInterim(node, 1, 'destination-address', 'destination-chain-id')
      fail()
    } catch (err) {
      expect(err.message).toEqual('Invalid call to nativeToInterim() for non-native token')
      expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', 'chain-id')
      expect(makeContractSendSpy).toHaveBeenCalledTimes(0)
    }
  })

  test('Should not call hostToInterim if provider is missing', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const asset = new pTokensEvmAsset({
      symbol: 'SYM',
      chainId: 'chain-id',
      blockchain: 'blockchain',
      network: 'network',
    })
    try {
      await asset.hostToInterim(node, 1, 'destination-address', 'destination-chain-id')
      fail()
    } catch (err) {
      expect(err.message).toEqual('Missing provider')
    }
  })

  test('Should not call hostToInterim for native tokens', async () => {
    const web3 = new Web3()
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const provider = new pTokensEvmProvider(web3)
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfo').mockImplementation(() => {
      return Promise.resolve({
        chainId: 'originating-chain-id',
        isNative: true,
        tokenAddress: 'token-contract-address',
        isSystemToken: false,
        vaultAddress: 'vault-contract-address',
      })
    })
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
    const asset = new pTokensEvmAsset({
      symbol: 'SYM',
      chainId: 'chain-id',
      blockchain: 'blockchain',
      network: 'network',
      provider: provider,
    })
    try {
      await asset.hostToInterim(node, 1, 'destination-address', 'destination-chain-id')
      fail()
    } catch (err) {
      expect(err.message).toEqual('Invalid call to hostToInterim() for native token')
      expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', 'chain-id')
      expect(makeContractSendSpy).toHaveBeenCalledTimes(0)
    }
  })

  test('Should call makeContractSend with redeem for non-native token', async () => {
    const web3 = new Web3()
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const provider = new pTokensEvmProvider(web3)
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfo').mockImplementation(() => {
      return Promise.resolve({
        chainId: 'originating-chain-id',
        isNative: false,
        tokenAddress: 'token-contract-address',
        isSystemToken: false,
      })
    })
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
    const asset = new pTokensEvmAsset({
      symbol: 'SYM',
      chainId: 'chain-id',
      blockchain: 'blockchain',
      network: 'network',
      provider: provider,
    })
    let txHash = ''
    const ret = await asset
      .hostToInterim(node, 1, 'destination-address', 'destination-chain-id')
      .on('txBroadcasted', (_txHash) => {
        txHash = _txHash
      })
    expect(txHash).toEqual('tx-hash')
    expect(ret).toEqual('tx-hash')
    expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', 'chain-id')
    expect(makeContractSendSpy).toHaveBeenNthCalledWith(
      1,
      {
        abi: tokenAbi,
        contractAddress: 'token-contract-address',
        method: 'redeem',
        value: 0,
      },
      [1, 'destination-address', 'destination-chain-id']
    )
  })

  test('Should call makeContractSend with redeem for non-native token with user data', async () => {
    const web3 = new Web3()
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const provider = new pTokensEvmProvider(web3)
    const getAssetInfoSpy = jest.spyOn(pTokensNode.prototype, 'getAssetInfo').mockImplementation(() => {
      return Promise.resolve({
        chainId: 'originating-chain-id',
        isNative: false,
        tokenAddress: 'token-contract-address',
        isSystemToken: false,
      })
    })
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
    const asset = new pTokensEvmAsset({
      symbol: 'SYM',
      chainId: 'chain-id',
      blockchain: 'blockchain',
      network: 'network',
      provider: provider,
    })
    let txHash = ''
    const ret = await asset
      .hostToInterim(node, 1, 'destination-address', 'destination-chain-id', Buffer.from('user-data'))
      .on('txBroadcasted', (_txHash) => {
        txHash = _txHash
      })
    expect(txHash).toEqual('tx-hash')
    expect(ret).toEqual('tx-hash')
    expect(getAssetInfoSpy).toHaveBeenNthCalledWith(1, 'SYM', 'chain-id')
    expect(makeContractSendSpy).toHaveBeenNthCalledWith(
      1,
      {
        abi: tokenAbi,
        contractAddress: 'token-contract-address',
        method: 'redeem',
        value: 0,
      },
      [1, Buffer.from('user-data'), 'destination-address', 'destination-chain-id']
    )
  })
})
