import BigNumber from 'bignumber.js'
import PromiEvent from 'promievent'
import { TransactionReceipt } from 'web3-core'
import { AbiItem } from 'web3-utils'

import { pTokensEvmProvider } from '../src'
import * as utils from '../src/lib'

import logs from './utils/logs.json'

const abi = require('./utils/exampleContractABI.json')
const receiptWithFalseStatus = require('./utils/receiptWithFalseStatus.json')
const receiptWithTrueStatus = require('./utils/receiptWithTrueStatus.json')

describe('EVM provider', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Should throw with negative gas price', () => {
    const provider = new pTokensEvmProvider()
    try {
      provider.setGasPrice(-1)
      fail()
    } catch (err) {
      expect(err.message).toEqual('Invalid gas price')
    }
  })

  test('Should throw with negative gas price', () => {
    const provider = new pTokensEvmProvider()
    try {
      provider.setGasPrice(1e12)
      fail()
    } catch (err) {
      expect(err.message).toEqual('Invalid gas price')
    }
  })

  test('Should throw with negative gas limit', () => {
    const provider = new pTokensEvmProvider()
    try {
      provider.setGasLimit(-1)
      fail()
    } catch (err) {
      expect(err.message).toEqual('Invalid gas limit')
    }
  })

  test('Should throw with negative gas limit', () => {
    const provider = new pTokensEvmProvider()
    try {
      provider.setGasLimit(10e6)
      fail()
    } catch (err) {
      expect(err.message).toEqual('Invalid gas limit')
    }
  })

  test('Should add account from private key', () => {
    const provider = new pTokensEvmProvider()
    const addAccountSpy = jest.spyOn(provider['_web3'].eth.accounts.wallet, 'add')
    provider.setPrivateKey('422c874bed50b69add046296530dc580f8e2e253879d98d66023b7897ab15742')
    expect(addAccountSpy).toHaveBeenCalledTimes(1)
    expect(provider['_web3'].eth.defaultAccount).toEqual('0xdf3B180694aB22C577f7114D822D28b92cadFd75')
  })

  test('Should not add account from invalid private key', () => {
    const provider = new pTokensEvmProvider()
    try {
      provider.setPrivateKey('invalid-key')
      fail()
    } catch (err) {
      expect(err.message).toEqual('Private key must be 32 bytes long')
    }
  })

  test('Should call a contract method', async () => {
    const provider = new pTokensEvmProvider()
    const getAccountSpy = jest.spyOn(utils, 'getAccount').mockImplementation(() => {
      return Promise.resolve('evm-account')
    })
    const contract = new provider['_web3'].eth.Contract(abi as unknown as AbiItem)
    const getContractSpy = jest.spyOn(utils, 'getContract').mockImplementation(() => contract)
    const callMock = jest.fn().mockImplementation(() => {
      const promi = new PromiEvent((resolve) =>
        setImmediate(() => {
          promi.emit('transactionHash', 'tx-hash')
          promi.emit('receipt', { transactionHash: 'tx-hash' })
          return resolve(123456)
        })
      )
      return promi
    })
    const setNumberMock = jest.fn().mockImplementation(() => ({
      call: callMock,
    }))
    contract.methods['number'] = setNumberMock
    const res = await provider.makeContractCall(
      {
        method: 'number',
        abi,
        contractAddress: 'contract-address',
      },
      [1, 'arg2', 'arg3']
    )
    expect(res).toEqual(123456)
    expect(getAccountSpy).toHaveBeenNthCalledWith(1, provider['_web3'])
    expect(getContractSpy).toHaveBeenNthCalledWith(1, provider['_web3'], abi, 'contract-address', 'evm-account')
    expect(setNumberMock).toHaveBeenNthCalledWith(1, 1, 'arg2', 'arg3')
    expect(callMock).toHaveBeenNthCalledWith(1)
  })

  test('Should call a contract method with no arguments', async () => {
    const provider = new pTokensEvmProvider()
    const getAccountSpy = jest.spyOn(utils, 'getAccount').mockImplementation(() => {
      return Promise.resolve('evm-account')
    })
    const contract = new provider['_web3'].eth.Contract(abi as unknown as AbiItem)
    const getContractSpy = jest.spyOn(utils, 'getContract').mockImplementation(() => contract)
    const callMock = jest.fn().mockImplementation(() => {
      const promi = new PromiEvent((resolve) =>
        setImmediate(() => {
          promi.emit('transactionHash', 'tx-hash')
          promi.emit('receipt', { transactionHash: 'tx-hash' })
          return resolve(123456)
        })
      )
      return promi
    })
    const numberMock = jest.fn().mockImplementation(() => ({
      call: callMock,
    }))
    contract.methods['number'] = numberMock
    const res = await provider.makeContractCall({
      method: 'number',
      abi,
      contractAddress: 'contract-address',
    })
    expect(res).toEqual(123456)
    expect(getAccountSpy).toHaveBeenNthCalledWith(1, provider['_web3'])
    expect(getContractSpy).toHaveBeenNthCalledWith(1, provider['_web3'], abi, 'contract-address', 'evm-account')
    expect(numberMock).toHaveBeenNthCalledWith(1)
    expect(callMock).toHaveBeenNthCalledWith(1)
  })

  test('Should send a contract method', async () => {
    const provider = new pTokensEvmProvider()
    const getAccountSpy = jest.spyOn(utils, 'getAccount').mockImplementation(() => {
      return Promise.resolve('evm-account')
    })
    const contract = new provider['_web3'].eth.Contract(abi as unknown as AbiItem)
    const getContractSpy = jest.spyOn(utils, 'getContract').mockImplementation(() => contract)
    const sendMock = jest.fn().mockImplementation(() => {
      const promi = new PromiEvent((resolve) =>
        setImmediate(() => {
          promi.emit('transactionHash', 'tx-hash')
          promi.emit('receipt', { transactionHash: 'tx-hash' })
          return resolve({ transactionHash: 'tx-hash' })
        })
      )
      return promi
    })
    const setNumberMock = jest.fn().mockImplementation(() => ({
      send: sendMock,
    }))
    contract.methods['setNumber'] = setNumberMock
    let txBroadcastedHash = ''
    let txConfirmedHash = ''
    const txHash = await provider
      .makeContractSend(
        {
          method: 'setNumber',
          abi,
          contractAddress: 'contract-address',
          value: BigNumber(1),
        },
        [1, 'arg2', 'arg3']
      )
      .once('txBroadcasted', (_hash) => {
        txBroadcastedHash = _hash
      })
      .once('txConfirmed', (_hash) => {
        txConfirmedHash = _hash
      })
    expect(txHash).toEqual({ transactionHash: 'tx-hash' })
    expect(txBroadcastedHash).toEqual('tx-hash')
    expect(txConfirmedHash).toEqual({ transactionHash: 'tx-hash' })
    expect(getAccountSpy).toHaveBeenNthCalledWith(1, provider['_web3'])
    expect(getContractSpy).toHaveBeenNthCalledWith(1, provider['_web3'], abi, 'contract-address', 'evm-account')
    expect(setNumberMock).toHaveBeenNthCalledWith(1, 1, 'arg2', 'arg3')
    expect(sendMock).toHaveBeenNthCalledWith(1, { from: 'evm-account', value: BigNumber(1) })
  })

  test('Should send a contract method with no arguments', async () => {
    const provider = new pTokensEvmProvider()
    const getAccountSpy = jest.spyOn(utils, 'getAccount').mockImplementation(() => {
      return Promise.resolve('evm-account')
    })
    const contract = new provider['_web3'].eth.Contract(abi as unknown as AbiItem)
    const getContractSpy = jest.spyOn(utils, 'getContract').mockImplementation(() => contract)
    const sendMock = jest.fn().mockImplementation(() => {
      const promi = new PromiEvent((resolve) =>
        setImmediate(() => {
          promi.emit('transactionHash', 'tx-hash')
          promi.emit('receipt', { transactionHash: 'tx-hash' })
          return resolve({ transactionHash: 'tx-hash' })
        })
      )
      return promi
    })
    const numberMock = jest.fn().mockImplementation(() => ({
      send: sendMock,
    }))
    contract.methods['number'] = numberMock
    let txBroadcastedHash = ''
    let txConfirmedHash = ''
    const txHash = await provider
      .makeContractSend({
        method: 'number',
        abi,
        contractAddress: 'contract-address',
        value: BigNumber(1),
      })
      .once('txBroadcasted', (_hash) => {
        txBroadcastedHash = _hash
      })
      .once('txConfirmed', (_hash) => {
        txConfirmedHash = _hash
      })
    expect(txHash).toEqual({ transactionHash: 'tx-hash' })
    expect(txBroadcastedHash).toEqual('tx-hash')
    expect(txConfirmedHash).toEqual({ transactionHash: 'tx-hash' })
    expect(getAccountSpy).toHaveBeenNthCalledWith(1, provider['_web3'])
    expect(getContractSpy).toHaveBeenNthCalledWith(1, provider['_web3'], abi, 'contract-address', 'evm-account')
    expect(numberMock).toHaveBeenNthCalledWith(1)
    expect(sendMock).toHaveBeenNthCalledWith(1, { from: 'evm-account', value: BigNumber(1) })
  })

  test('Should send a contract method with set gas price and gas limit', async () => {
    const provider = new pTokensEvmProvider()
    provider.setGasLimit(200000)
    provider.setGasPrice(100e9)
    const getAccountSpy = jest.spyOn(utils, 'getAccount').mockImplementation(() => {
      return Promise.resolve('evm-account')
    })
    const contract = new provider['_web3'].eth.Contract(abi as unknown as AbiItem)
    const getContractSpy = jest.spyOn(utils, 'getContract').mockImplementation(() => contract)
    const sendMock = jest.fn().mockImplementation(() => {
      const promi = new PromiEvent((resolve) =>
        setImmediate(() => {
          promi.emit('transactionHash', 'tx-hash')
          promi.emit('receipt', { transactionHash: 'tx-hash' })
          return resolve({ transactionHash: 'tx-hash' })
        })
      )
      return promi
    })
    const setNumberMock = jest.fn().mockImplementation(() => ({
      send: sendMock,
    }))
    contract.methods['setNumber'] = setNumberMock
    let txBroadcastedHash = ''
    let txConfirmedHash = ''
    const txHash = await provider
      .makeContractSend(
        {
          method: 'setNumber',
          abi,
          contractAddress: 'contract-address',
          value: BigNumber(1),
        },
        [1, 'arg2', 'arg3']
      )
      .once('txBroadcasted', (_hash) => {
        txBroadcastedHash = _hash
      })
      .once('txConfirmed', (_hash) => {
        txConfirmedHash = _hash
      })
    expect(txHash).toEqual({ transactionHash: 'tx-hash' })
    expect(txBroadcastedHash).toEqual('tx-hash')
    expect(txConfirmedHash).toEqual({ transactionHash: 'tx-hash' })
    expect(getAccountSpy).toHaveBeenNthCalledWith(1, provider['_web3'])
    expect(getContractSpy).toHaveBeenNthCalledWith(1, provider['_web3'], abi, 'contract-address', 'evm-account')
    expect(setNumberMock).toHaveBeenNthCalledWith(1, 1, 'arg2', 'arg3')
    expect(sendMock).toHaveBeenNthCalledWith(1, {
      from: 'evm-account',
      value: BigNumber(1),
      gas: 200000,
      gasPrice: 100e9,
    })
  })

  test('Should send a contract method with set gas price', async () => {
    const provider = new pTokensEvmProvider()
    provider.setGasPrice(100e9)
    const getAccountSpy = jest.spyOn(utils, 'getAccount').mockImplementation(() => {
      return Promise.resolve('evm-account')
    })
    const contract = new provider['_web3'].eth.Contract(abi as unknown as AbiItem)
    const getContractSpy = jest.spyOn(utils, 'getContract').mockImplementation(() => contract)
    const sendMock = jest.fn().mockImplementation(() => {
      const promi = new PromiEvent((resolve) =>
        setImmediate(() => {
          promi.emit('transactionHash', 'tx-hash')
          promi.emit('receipt', { transactionHash: 'tx-hash' })
          return resolve({ transactionHash: 'tx-hash' })
        })
      )
      return promi
    })
    const setNumberMock = jest.fn().mockImplementation(() => ({
      send: sendMock,
    }))
    contract.methods['setNumber'] = setNumberMock
    let txBroadcastedHash = ''
    let txConfirmedHash = ''
    const txHash = await provider
      .makeContractSend(
        {
          method: 'setNumber',
          abi,
          contractAddress: 'contract-address',
          value: BigNumber(1),
        },
        [1, 'arg2', 'arg3']
      )
      .once('txBroadcasted', (_hash) => {
        txBroadcastedHash = _hash
      })
      .once('txConfirmed', (_hash) => {
        txConfirmedHash = _hash
      })
    expect(txHash).toEqual({ transactionHash: 'tx-hash' })
    expect(txBroadcastedHash).toEqual('tx-hash')
    expect(txConfirmedHash).toEqual({ transactionHash: 'tx-hash' })
    expect(getAccountSpy).toHaveBeenNthCalledWith(1, provider['_web3'])
    expect(getContractSpy).toHaveBeenNthCalledWith(1, provider['_web3'], abi, 'contract-address', 'evm-account')
    expect(setNumberMock).toHaveBeenNthCalledWith(1, 1, 'arg2', 'arg3')
    expect(sendMock).toHaveBeenNthCalledWith(1, { from: 'evm-account', value: BigNumber(1), gasPrice: 100e9 })
  })

  test('Should send a contract method with set gas price and gas limit', async () => {
    const provider = new pTokensEvmProvider()
    provider.setGasLimit(200000)
    const getAccountSpy = jest.spyOn(utils, 'getAccount').mockImplementation(() => {
      return Promise.resolve('evm-account')
    })
    const contract = new provider['_web3'].eth.Contract(abi as unknown as AbiItem)
    const getContractSpy = jest.spyOn(utils, 'getContract').mockImplementation(() => contract)
    const sendMock = jest.fn().mockImplementation(() => {
      const promi = new PromiEvent((resolve) =>
        setImmediate(() => {
          promi.emit('transactionHash', 'tx-hash')
          promi.emit('receipt', { transactionHash: 'tx-hash' })
          return resolve({ transactionHash: 'tx-hash' })
        })
      )
      return promi
    })
    const setNumberMock = jest.fn().mockImplementation(() => ({
      send: sendMock,
    }))
    contract.methods['setNumber'] = setNumberMock
    let txBroadcastedHash = ''
    let txConfirmedHash = ''
    const txHash = await provider
      .makeContractSend(
        {
          method: 'setNumber',
          abi,
          contractAddress: 'contract-address',
          value: BigNumber(1),
        },
        [1, 'arg2', 'arg3']
      )
      .once('txBroadcasted', (_hash) => {
        txBroadcastedHash = _hash
      })
      .once('txConfirmed', (_hash) => {
        txConfirmedHash = _hash
      })
    expect(txHash).toEqual({ transactionHash: 'tx-hash' })
    expect(txBroadcastedHash).toEqual('tx-hash')
    expect(txConfirmedHash).toEqual({ transactionHash: 'tx-hash' })
    expect(getAccountSpy).toHaveBeenNthCalledWith(1, provider['_web3'])
    expect(getContractSpy).toHaveBeenNthCalledWith(1, provider['_web3'], abi, 'contract-address', 'evm-account')
    expect(setNumberMock).toHaveBeenNthCalledWith(1, 1, 'arg2', 'arg3')
    expect(sendMock).toHaveBeenNthCalledWith(1, { from: 'evm-account', value: BigNumber(1), gas: 200000 })
  })

  test('Should send a contract method and emit txError', async () => {
    const provider = new pTokensEvmProvider()
    const getAccountSpy = jest.spyOn(utils, 'getAccount').mockImplementation(() => {
      return Promise.resolve('evm-account')
    })
    const contract = new provider['_web3'].eth.Contract(abi as unknown as AbiItem)
    const getContractSpy = jest.spyOn(utils, 'getContract').mockImplementation(() => contract)
    const sendMock = jest.fn().mockImplementation(() => {
      const promi = new PromiEvent((resolve) =>
        setImmediate(() => {
          promi.emit('error', new Error('tx-error'))
          return resolve({ transactionHash: 'tx-hash' })
        })
      )
      return promi
    })
    const setNumberMock = jest.fn().mockImplementation(() => ({
      send: sendMock,
    }))
    contract.methods['setNumber'] = setNumberMock
    let txError = new Error()
    const txHash = await provider
      .makeContractSend(
        {
          method: 'setNumber',
          abi,
          contractAddress: 'contract-address',
          value: BigNumber(1),
        },
        [1, 'arg2', 'arg3']
      )
      .once('txError', (_error) => {
        txError = _error
      })
    expect(txHash).toEqual({ transactionHash: 'tx-hash' })
    expect(txError.message).toStrictEqual('tx-error')
    expect(getAccountSpy).toHaveBeenNthCalledWith(1, provider['_web3'])
    expect(getContractSpy).toHaveBeenNthCalledWith(1, provider['_web3'], abi, 'contract-address', 'evm-account')
    expect(setNumberMock).toHaveBeenNthCalledWith(1, 1, 'arg2', 'arg3')
    expect(sendMock).toHaveBeenNthCalledWith(1, { from: 'evm-account', value: BigNumber(1) })
  })

  test('Should reject if getAccount throws', async () => {
    const provider = new pTokensEvmProvider()
    jest.spyOn(utils, 'getAccount').mockImplementation(() => {
      return Promise.reject(new Error('getAccount exception'))
    })
    try {
      await provider.makeContractSend(
        {
          method: 'setNumber',
          abi,
          contractAddress: 'contract-address',
          value: BigNumber(1),
        },
        [1, 'arg2', 'arg3']
      )
      fail()
    } catch (err) {
      expect(err.message).toEqual('getAccount exception')
    }
  })

  test('Should reject if getContract throws', async () => {
    const provider = new pTokensEvmProvider()
    jest.spyOn(utils, 'getAccount').mockImplementation(() => {
      return Promise.resolve('evm-account')
    })
    jest.spyOn(utils, 'getContract').mockImplementation(() => {
      throw new Error('getContract exception')
    })

    try {
      await provider.makeContractSend(
        {
          method: 'setNumber',
          abi,
          contractAddress: 'contract-address',
          value: BigNumber(1),
        },
        [1, 'arg2', 'arg3']
      )
      fail()
    } catch (err) {
      expect(err.message).toEqual('getContract exception')
    }
  })

  test('Should reject if contract method send throws', async () => {
    const provider = new pTokensEvmProvider()
    jest.spyOn(utils, 'getAccount').mockImplementation(() => {
      return Promise.resolve('evm-account')
    })
    const contract = new provider['_web3'].eth.Contract(abi as unknown as AbiItem)
    jest.spyOn(utils, 'getContract').mockImplementation(() => contract)
    const sendMock = jest.fn().mockImplementation(() => {
      const promi = new PromiEvent((resolve, reject) => {
        return reject(new Error('method send error'))
      })
      return promi
    })
    const setNumberMock = jest.fn().mockImplementation(() => ({
      send: sendMock,
    }))
    contract.methods['setNumber'] = setNumberMock
    try {
      await provider.makeContractSend(
        {
          method: 'setNumber',
          abi,
          contractAddress: 'contract-address',
          value: BigNumber(1),
        },
        [1, 'arg2', 'arg3']
      )
      fail()
    } catch (err) {
      expect(err.message).toEqual('method send error')
    }
  })

  test('Should wait for transaction confirmation', async () => {
    const provider = new pTokensEvmProvider()
    const waitForConfirmationSpy = jest
      .spyOn(provider['_web3'].eth, 'getTransactionReceipt')
      .mockResolvedValueOnce(null)
      .mockRejectedValueOnce(new Error('getTransactionReceipt error'))
      .mockResolvedValueOnce(receiptWithFalseStatus as unknown as TransactionReceipt)
      .mockResolvedValue(receiptWithTrueStatus as unknown as TransactionReceipt)
    const ret = await provider.waitForTransactionConfirmation(
      '0x5d65fa769234d6eef32baaeeb267dd1b3b8e0ff2e04a0861e2d36af26d631046',
      500
    )
    expect(waitForConfirmationSpy).toHaveBeenCalledTimes(4)
    expect(ret).toBe('0x5d65fa769234d6eef32baaeeb267dd1b3b8e0ff2e04a0861e2d36af26d631046')
  })

  test('Should monitor a cross chain operation', async () => {
    let operationQueuedObject = null,
      operationExecutedObject = null,
      operationCancelledObject = null
    const provider = new pTokensEvmProvider()
    const spy = jest
      .fn()
      .mockResolvedValueOnce([logs[0], logs[1]])
      .mockResolvedValueOnce([logs[2]])
      .mockResolvedValue([])
    provider['_web3']['eth'].getBlock = jest.fn().mockImplementation(() => Promise.resolve({ number: 333 }))
    provider['_web3']['eth'].getPastLogs = spy
    const ret = await provider
      .monitorCrossChainOperations(
        '0xCE22B9ba226B5d851d86c983656a9008FeC25193',
        '0xc6cc8381b3a70dc38c587d6c5518d72edb05b4040acbd4251fe6b67acff7f986'
      )
      .on('operationQueued', (_obj) => {
        operationQueuedObject = _obj
      })
      .on('operationExecuted', (_obj) => {
        operationExecutedObject = _obj
      })
      .on('operationCancelled', (_obj) => {
        operationCancelledObject = _obj
      })
    expect(spy).toHaveBeenCalledTimes(3)
    expect(spy).toHaveBeenNthCalledWith(1, {
      address: '0xCE22B9ba226B5d851d86c983656a9008FeC25193',
      fromBlock: 333,
      topics: ['0xd1a85d51ecfea5edd75f97fcf615b22c6f56eaf8f0487db9fadfbe661689b9af'],
    })
    expect(spy).toHaveBeenNthCalledWith(2, {
      address: '0xCE22B9ba226B5d851d86c983656a9008FeC25193',
      fromBlock: 333,
      topics: ['0xfb83c807750a326c5845536dc89b4d2da9f1f5e0df344e9f69f27c84f4d7d726'],
    })
    expect(spy).toHaveBeenNthCalledWith(3, {
      address: '0xCE22B9ba226B5d851d86c983656a9008FeC25193',
      fromBlock: 333,
      topics: ['0xec5d8f38737ebccaa579d2caeaed8fbc5f2c7c598fee1eb335429c8c48ec2598'],
    })
    expect(ret).toStrictEqual('0x88174f8b1c6715fee676c48d95d9ad6b126d008244c2ab3b28094a1e8267f547')
    expect(operationQueuedObject).toStrictEqual({
      operationId: '0xc6cc8381b3a70dc38c587d6c5518d72edb05b4040acbd4251fe6b67acff7f986',
      txHash: '0xe03f1eb68ca2c13c4b2d08abf4d6154c2846cb88a52333fd3c8128587ad0cd34',
    })
    expect(operationExecutedObject).toStrictEqual({
      operationId: '0xc6cc8381b3a70dc38c587d6c5518d72edb05b4040acbd4251fe6b67acff7f986',
      txHash: '0x88174f8b1c6715fee676c48d95d9ad6b126d008244c2ab3b28094a1e8267f547',
    })
    expect(operationCancelledObject).toStrictEqual(null)
  })
})
