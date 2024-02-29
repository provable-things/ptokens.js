import { Blockchain, ChainId, Network } from 'ptokens-constants'
import { pTokensNode, pTokensNodeProvider } from 'ptokens-node'
import { pTokensEvmAsset, pTokensEvmProvider } from '../src'

import PromiEvent from 'promievent'
import BigNumber from 'bignumber.js'

const vaultAbi = require('../src/abi/pERC20VaultContractAbi.json')
const erc20TokenAbi = require('../src/abi/pTokenOnETHV2ContractAbi.json')
const erc777TokenAbi = require('../src/abi/pTokenOnEthERC777Abi.json')

const nativeToXFees = {
  networkFee: 1e18,
  minNodeOperatorFee: 2e18,
  basisPoints: {
    nativeToHost: 30,
    nativeToNative: 40,
  },
}

const hostToXFees = {
  networkFee: 5e18,
  minNodeOperatorFee: 6e18,
  basisPoints: {
    hostToHost: 70,
    hostToNative: 80,
  },
}

jest.mock('web3')
jest.mock('ptokens-node')

describe('EVM asset', () => {
  test('Should create an EVM asset from constructor', () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
    const asset = new pTokensEvmAsset({
      node,
      symbol: 'SYM',
      assetInfo: {
        chainId: ChainId.EthereumMainnet,
        isNative: false,
        tokenAddress: 'token-contract-address',
        tokenReference: 'token-internal-address',
        decimals: 18,
        vaultAddress: 'vault-contract-address',
        fees: hostToXFees,
      },
    })
    expect(asset.symbol).toStrictEqual('SYM')
    expect(asset.chainId).toStrictEqual(ChainId.EthereumMainnet)
    expect(asset.blockchain).toStrictEqual(Blockchain.Ethereum)
    expect(asset.network).toStrictEqual(Network.Mainnet)
    expect(asset.weight).toEqual(1)
  })
  describe('nativeToInterim', () => {
    test('Should not call nativeToInterim if provider is missing', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const asset = new pTokensEvmAsset({
        node,
        symbol: 'SYM',
        assetInfo: {
          chainId: ChainId.EthereumMainnet,
          isNative: false,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          decimals: 18,
          vaultAddress: 'vault-contract-address',
          fees: hostToXFees,
        },
      })
      try {
        await asset['nativeToInterim'](BigNumber(123.456789), 'destination-address', 'destination-chain-id')
        fail()
      } catch (err) {
        expect(err.message).toEqual('Missing provider')
      }
    })

    test('Should not call nativeToInterim for non-native tokens', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
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
      const asset = new pTokensEvmAsset({
        node,
        symbol: 'SYM',
        provider: provider,
        assetInfo: {
          chainId: ChainId.EthereumMainnet,
          isNative: false,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          decimals: 18,
          vaultAddress: 'vault-contract-address',
          fees: hostToXFees,
        },
      })
      try {
        await asset['nativeToInterim'](BigNumber(123.456789), 'destination-address', 'destination-chain-id')
        fail()
      } catch (err) {
        expect(err.message).toEqual('Invalid call to nativeToInterim() for non-native token')
        expect(makeContractSendSpy).toHaveBeenCalledTimes(0)
      }
    })

    test('Should call makeContractSend with pegIn for native token', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
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
      const asset = new pTokensEvmAsset({
        node,
        symbol: 'SYM',
        provider: provider,
        assetInfo: {
          chainId: ChainId.EthereumMainnet,
          isNative: true,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          decimals: 18,
          vaultAddress: 'vault-contract-address',
          fees: nativeToXFees,
        },
      })
      let txHashBroadcasted = ''
      let txHashConfirmed = ''
      const ret = await asset['nativeToInterim'](BigNumber(123.456789), 'destination-address', 'destination-chain-id')
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
          abi: vaultAbi,
          contractAddress: 'vault-contract-address',
          method: 'pegIn',
          value: BigNumber(0),
        },
        ['123456789000000000000', 'token-contract-address', 'destination-address', 'destination-chain-id']
      )
    })

    test('Should call makeContractSend with pegIn for native token and user data', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
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
      const asset = new pTokensEvmAsset({
        node,
        symbol: 'SYM',
        provider: provider,
        assetInfo: {
          chainId: ChainId.EthereumMainnet,
          isNative: true,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          decimals: 18,
          vaultAddress: 'vault-contract-address',
          fees: nativeToXFees,
        },
      })
      let txHashBroadcasted = ''
      let txHashConfirmed = ''
      const ret = await asset['nativeToInterim'](
        BigNumber(123.456789),
        'destination-address',
        'destination-chain-id',
        Buffer.from('user-data')
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
          abi: vaultAbi,
          contractAddress: 'vault-contract-address',
          method: 'pegIn',
          value: BigNumber(0),
        },
        [
          '123456789000000000000',
          'token-contract-address',
          'destination-address',
          Buffer.from('user-data'),
          'destination-chain-id',
        ]
      )
    })

    test('Should call makeContractSend with pegInEth for system token', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
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
      const asset = new pTokensEvmAsset({
        node,
        symbol: 'FTM',
        provider: provider,
        assetInfo: {
          chainId: ChainId.FantomMainnet,
          isNative: true,
          tokenAddress: '',
          tokenReference: 'token-internal-address',
          decimals: 18,
          vaultAddress: 'vault-contract-address',
          fees: nativeToXFees,
        },
      })
      let txHashBroadcasted = ''
      let txHashConfirmed = ''
      const ret = await asset['nativeToInterim'](BigNumber(123.456789), 'destination-address', 'destination-chain-id')
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
          abi: vaultAbi,
          contractAddress: 'vault-contract-address',
          method: 'pegInEth',
          value: BigNumber(123456789000000000000),
        },
        ['destination-address', 'destination-chain-id']
      )
    })

    test('Should call makeContractSend with pegInEth for system token with user data', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
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
      const asset = new pTokensEvmAsset({
        node,
        symbol: 'FTM',
        provider: provider,
        assetInfo: {
          chainId: ChainId.FantomMainnet,
          isNative: true,
          tokenAddress: '',
          tokenReference: 'token-internal-address',
          decimals: 18,
          vaultAddress: 'vault-contract-address',
          fees: nativeToXFees,
        },
      })
      let txHashBroadcasted = ''
      let txHashConfirmed = ''
      const ret = await asset['nativeToInterim'](
        BigNumber(123.456789),
        'destination-address',
        'destination-chain-id',
        Buffer.from('user-data')
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
          abi: vaultAbi,
          contractAddress: 'vault-contract-address',
          method: 'pegInEth',
          value: BigNumber(123456789000000000000),
        },
        ['destination-address', 'destination-chain-id', Buffer.from('user-data')]
      )
    })

    test('Should not call nativeToInterim for non-native tokens', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
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
      const asset = new pTokensEvmAsset({
        node,
        symbol: 'SYM',
        provider: provider,
        assetInfo: {
          chainId: ChainId.EthereumMainnet,
          isNative: false,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          decimals: 18,
          vaultAddress: 'vault-contract-address',
          fees: hostToXFees,
        },
      })
      try {
        await asset['nativeToInterim'](BigNumber(123.456789), 'destination-address', 'destination-chain-id')
        fail()
      } catch (err) {
        expect(err.message).toEqual('Invalid call to nativeToInterim() for non-native token')
        expect(makeContractSendSpy).toHaveBeenCalledTimes(0)
      }
    })
  })

  describe('hostToInterim', () => {
    test('Should not call hostToInterim if provider is missing', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
      const asset = new pTokensEvmAsset({
        node,
        symbol: 'SYM',
        assetInfo: {
          chainId: ChainId.EthereumMainnet,
          isNative: true,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          decimals: 18,
          vaultAddress: 'vault-contract-address',
          fees: nativeToXFees,
        },
      })
      try {
        await asset['hostToInterim'](BigNumber(123.456789), 'destination-address', 'destination-chain-id')
        fail()
      } catch (err) {
        expect(err.message).toEqual('Missing provider')
      }
    })

    test('Should not call hostToInterim for native tokens', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
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
      const asset = new pTokensEvmAsset({
        node,
        symbol: 'SYM',
        provider: provider,
        assetInfo: {
          chainId: ChainId.EthereumMainnet,
          isNative: true,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          decimals: 18,
          vaultAddress: 'vault-contract-address',
          fees: nativeToXFees,
        },
      })
      try {
        await asset['hostToInterim'](BigNumber(123.456789), 'destination-address', 'destination-chain-id')
        fail()
      } catch (err) {
        expect(err.message).toEqual('Invalid call to hostToInterim() for native token')
        expect(makeContractSendSpy).toHaveBeenCalledTimes(0)
      }
    })

    test('Should call makeContractSend with redeem for non-native token', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
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
      const asset = new pTokensEvmAsset({
        node,
        symbol: 'SYM',
        provider: provider,
        assetInfo: {
          chainId: ChainId.EthereumMainnet,
          isNative: false,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          decimals: 18,
          fees: hostToXFees,
        },
      })
      let txHashBroadcasted = ''
      let txHashConfirmed = ''
      const ret = await asset['hostToInterim'](BigNumber(123.456789), 'destination-address', 'destination-chain-id')
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
          abi: erc20TokenAbi,
          contractAddress: 'token-contract-address',
          method: 'redeem',
          value: BigNumber(0),
        },
        ['123456789000000000000', 'destination-address', 'destination-chain-id']
      )
    })

    test('Should call makeContractSend with redeem for non-native token with user data', async () => {
      const node = new pTokensNode(new pTokensNodeProvider('test-url'))
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
      const asset = new pTokensEvmAsset({
        node,
        symbol: 'SYM',
        provider: provider,
        assetInfo: {
          chainId: ChainId.EthereumMainnet,
          isNative: false,
          tokenAddress: 'token-contract-address',
          tokenReference: 'token-internal-address',
          decimals: 18,
          fees: hostToXFees,
        },
      })
      let txHashBroadcasted = ''
      let txHashConfirmed = ''
      const ret = await asset['hostToInterim'](
        BigNumber(123.456789),
        'destination-address',
        'destination-chain-id',
        Buffer.from('user-data')
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
          abi: erc20TokenAbi,
          contractAddress: 'token-contract-address',
          method: 'redeem',
          value: BigNumber(0),
        },
        ['123456789000000000000', Buffer.from('user-data'), 'destination-address', 'destination-chain-id']
      )
    })
  })

  test('Should call makeContractSend with redeem for pTLOS on Ethereum', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
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
    const asset = new pTokensEvmAsset({
      node,
      symbol: 'TLOS',
      provider: provider,
      assetInfo: {
        chainId: ChainId.EthereumMainnet,
        isNative: false,
        tokenAddress: '0x7825e833d495f3d1c28872415a4aee339d26ac88',
        tokenReference: 'token-internal-address',
        decimals: 18,
        fees: hostToXFees,
      },
    })
    let txHashBroadcasted = ''
    let txHashConfirmed = ''
    const ret = await asset['hostToInterim'](BigNumber(123.456789), 'destination-address', 'destination-chain-id')
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
        abi: erc777TokenAbi,
        contractAddress: '0x7825e833d495f3d1c28872415a4aee339d26ac88',
        method: 'redeem',
        value: BigNumber(0),
      },
      ['123456789000000000000', 'destination-address']
    )
  })

  test('Should call makeContractSend with redeem for pTLOS on Ethereum with user data', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
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
    const asset = new pTokensEvmAsset({
      node,
      symbol: 'TLOS',
      provider: provider,
      assetInfo: {
        chainId: ChainId.EthereumMainnet,
        isNative: false,
        tokenAddress: '0x7825e833d495f3d1c28872415a4aee339d26ac88',
        tokenReference: 'token-internal-address',
        decimals: 18,
        fees: hostToXFees,
      },
    })
    let txHashBroadcasted = ''
    let txHashConfirmed = ''
    const ret = await asset['hostToInterim'](
      BigNumber(123.456789),
      'destination-address',
      'destination-chain-id',
      Buffer.from('user-data')
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
        abi: erc777TokenAbi,
        contractAddress: '0x7825e833d495f3d1c28872415a4aee339d26ac88',
        method: 'redeem',
        value: BigNumber(0),
      },
      ['123456789000000000000', Buffer.from('user-data'), 'destination-address']
    )
  })

  test('Should call makeContractSend with redeem for pLTC on Ethereum', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
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
    const asset = new pTokensEvmAsset({
      node,
      symbol: 'LTC',
      provider: provider,
      assetInfo: {
        chainId: ChainId.EthereumMainnet,
        isNative: false,
        tokenAddress: '0x5979f50f1d4c08f9a53863c2f39a7b0492c38d0f',
        tokenReference: 'token-internal-address',
        decimals: 18,
        fees: hostToXFees,
      },
    })
    let txHashBroadcasted = ''
    let txHashConfirmed = ''
    const ret = await asset['hostToInterim'](BigNumber(123.456789), 'destination-address', 'destination-chain-id')
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
        abi: erc777TokenAbi,
        contractAddress: '0x5979f50f1d4c08f9a53863c2f39a7b0492c38d0f',
        method: 'redeem',
        value: BigNumber(0),
      },
      ['123456789000000000000', 'destination-address']
    )
  })

  test('Should call makeContractSend with redeem for pLTC on Ethereum with user data', async () => {
    const node = new pTokensNode(new pTokensNodeProvider('test-url'))
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
    const asset = new pTokensEvmAsset({
      node,
      symbol: 'LTC',
      provider: provider,
      assetInfo: {
        chainId: ChainId.EthereumMainnet,
        isNative: false,
        tokenAddress: '0x5979f50f1d4c08f9a53863c2f39a7b0492c38d0f',
        tokenReference: 'token-internal-address',
        decimals: 18,
        fees: hostToXFees,
      },
    })
    let txHashBroadcasted = ''
    let txHashConfirmed = ''
    const ret = await asset['hostToInterim'](
      BigNumber(123.456789),
      'destination-address',
      'destination-chain-id',
      Buffer.from('user-data')
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
        abi: erc777TokenAbi,
        contractAddress: '0x5979f50f1d4c08f9a53863c2f39a7b0492c38d0f',
        method: 'redeem',
        value: BigNumber(0),
      },
      ['123456789000000000000', Buffer.from('user-data'), 'destination-address']
    )
  })
})
