import { pTokensEvmProvider } from '../src'
import Web3 from 'web3'
import * as utils from '../src/lib'
import PromiEvent from 'promievent'
import { AbiItem } from 'web3-utils'
import { TransactionReceipt } from 'web3-core'

const abi = require('./utils/exampleContractABI.json')
const receiptWithTrueStatus = require('./utils/receiptWithTrueStatus.json')
const receiptWithFalseStatus = require('./utils/receiptWithFalseStatus.json')

describe('EVM provider', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Should throw with negative gas price', () => {
    const web3 = new Web3()
    const provider = new pTokensEvmProvider(web3)
    try {
      provider.setGasPrice(-1)
      fail()
    } catch (err) {
      expect(err.message).toEqual('Invalid gas price')
    }
  })

  test('Should throw with negative gas price', () => {
    const web3 = new Web3()
    const provider = new pTokensEvmProvider(web3)
    try {
      provider.setGasPrice(1e12)
      fail()
    } catch (err) {
      expect(err.message).toEqual('Invalid gas price')
    }
  })

  test('Should throw with negative gas limit', () => {
    const web3 = new Web3()
    const provider = new pTokensEvmProvider(web3)
    try {
      provider.setGasLimit(-1)
      fail()
    } catch (err) {
      expect(err.message).toEqual('Invalid gas limit')
    }
  })

  test('Should throw with negative gas limit', () => {
    const web3 = new Web3()
    const provider = new pTokensEvmProvider(web3)
    try {
      provider.setGasLimit(10e6)
      fail()
    } catch (err) {
      expect(err.message).toEqual('Invalid gas limit')
    }
  })

  test('Should add account from private key', () => {
    const web3 = new Web3()
    const provider = new pTokensEvmProvider(web3)
    const addAccountSpy = jest.spyOn(web3.eth.accounts.wallet, 'add')
    provider.setPrivateKey('422c874bed50b69add046296530dc580f8e2e253879d98d66023b7897ab15742')
    expect(addAccountSpy).toHaveBeenCalledTimes(1)
    expect(web3.eth.defaultAccount).toEqual('0xdf3B180694aB22C577f7114D822D28b92cadFd75')
  })

  test('Should not add account from invalid private key', () => {
    const web3 = new Web3()
    const provider = new pTokensEvmProvider(web3)
    try {
      provider.setPrivateKey('invalid-key')
      fail()
    } catch (err) {
      expect(err.message).toEqual('Private key must be 32 bytes long')
    }
  })

  test('Should call a contract method', async () => {
    const web3 = new Web3()
    const provider = new pTokensEvmProvider(web3)
    const getAccountSpy = jest.spyOn(utils, 'getAccount').mockImplementation(() => {
      return Promise.resolve('evm-account')
    })
    const contract = new web3.eth.Contract(abi as unknown as AbiItem)
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
    expect(getAccountSpy).toHaveBeenNthCalledWith(1, web3)
    expect(getContractSpy).toHaveBeenNthCalledWith(1, web3, abi, 'contract-address', 'evm-account')
    expect(setNumberMock).toHaveBeenNthCalledWith(1, 1, 'arg2', 'arg3')
    expect(callMock).toHaveBeenNthCalledWith(1)
  })

  test('Should call a contract method with no arguments', async () => {
    const web3 = new Web3()
    const provider = new pTokensEvmProvider(web3)
    const getAccountSpy = jest.spyOn(utils, 'getAccount').mockImplementation(() => {
      return Promise.resolve('evm-account')
    })
    const contract = new web3.eth.Contract(abi as unknown as AbiItem)
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
    expect(getAccountSpy).toHaveBeenNthCalledWith(1, web3)
    expect(getContractSpy).toHaveBeenNthCalledWith(1, web3, abi, 'contract-address', 'evm-account')
    expect(numberMock).toHaveBeenNthCalledWith(1)
    expect(callMock).toHaveBeenNthCalledWith(1)
  })

  test('Should send a contract method', async () => {
    const web3 = new Web3()
    const provider = new pTokensEvmProvider(web3)
    const getAccountSpy = jest.spyOn(utils, 'getAccount').mockImplementation(() => {
      return Promise.resolve('evm-account')
    })
    const contract = new web3.eth.Contract(abi as unknown as AbiItem)
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
          value: 1,
        },
        [1, 'arg2', 'arg3']
      )
      .once('txBroadcasted', (_hash) => {
        txBroadcastedHash = _hash
      })
      .once('txConfirmed', (_hash) => {
        txConfirmedHash = _hash
      })
    expect(txHash).toEqual('tx-hash')
    expect(txBroadcastedHash).toEqual('tx-hash')
    expect(txConfirmedHash).toEqual('tx-hash')
    expect(getAccountSpy).toHaveBeenNthCalledWith(1, web3)
    expect(getContractSpy).toHaveBeenNthCalledWith(1, web3, abi, 'contract-address', 'evm-account')
    expect(setNumberMock).toHaveBeenNthCalledWith(1, 1, 'arg2', 'arg3')
    expect(sendMock).toHaveBeenNthCalledWith(1, { from: 'evm-account', value: 1 })
  })

  test('Should send a contract method with no arguments', async () => {
    const web3 = new Web3()
    const provider = new pTokensEvmProvider(web3)
    const getAccountSpy = jest.spyOn(utils, 'getAccount').mockImplementation(() => {
      return Promise.resolve('evm-account')
    })
    const contract = new web3.eth.Contract(abi as unknown as AbiItem)
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
        value: 1,
      })
      .once('txBroadcasted', (_hash) => {
        txBroadcastedHash = _hash
      })
      .once('txConfirmed', (_hash) => {
        txConfirmedHash = _hash
      })
    expect(txHash).toEqual('tx-hash')
    expect(txBroadcastedHash).toEqual('tx-hash')
    expect(txConfirmedHash).toEqual('tx-hash')
    expect(getAccountSpy).toHaveBeenNthCalledWith(1, web3)
    expect(getContractSpy).toHaveBeenNthCalledWith(1, web3, abi, 'contract-address', 'evm-account')
    expect(numberMock).toHaveBeenNthCalledWith(1)
    expect(sendMock).toHaveBeenNthCalledWith(1, { from: 'evm-account', value: 1 })
  })

  test('Should send a contract method with set gas price and gas limit', async () => {
    const web3 = new Web3()
    const provider = new pTokensEvmProvider(web3)
    provider.setGasLimit(200000)
    provider.setGasPrice(100e9)
    const getAccountSpy = jest.spyOn(utils, 'getAccount').mockImplementation(() => {
      return Promise.resolve('evm-account')
    })
    const contract = new web3.eth.Contract(abi as unknown as AbiItem)
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
          value: 1,
        },
        [1, 'arg2', 'arg3']
      )
      .once('txBroadcasted', (_hash) => {
        txBroadcastedHash = _hash
      })
      .once('txConfirmed', (_hash) => {
        txConfirmedHash = _hash
      })
    expect(txHash).toEqual('tx-hash')
    expect(txBroadcastedHash).toEqual('tx-hash')
    expect(txConfirmedHash).toEqual('tx-hash')
    expect(getAccountSpy).toHaveBeenNthCalledWith(1, web3)
    expect(getContractSpy).toHaveBeenNthCalledWith(1, web3, abi, 'contract-address', 'evm-account')
    expect(setNumberMock).toHaveBeenNthCalledWith(1, 1, 'arg2', 'arg3')
    expect(sendMock).toHaveBeenNthCalledWith(1, { from: 'evm-account', value: 1, gas: 200000, gasPrice: 100e9 })
  })

  test('Should send a contract method with set gas price', async () => {
    const web3 = new Web3()
    const provider = new pTokensEvmProvider(web3)
    provider.setGasPrice(100e9)
    const getAccountSpy = jest.spyOn(utils, 'getAccount').mockImplementation(() => {
      return Promise.resolve('evm-account')
    })
    const contract = new web3.eth.Contract(abi as unknown as AbiItem)
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
          value: 1,
        },
        [1, 'arg2', 'arg3']
      )
      .once('txBroadcasted', (_hash) => {
        txBroadcastedHash = _hash
      })
      .once('txConfirmed', (_hash) => {
        txConfirmedHash = _hash
      })
    expect(txHash).toEqual('tx-hash')
    expect(txBroadcastedHash).toEqual('tx-hash')
    expect(txConfirmedHash).toEqual('tx-hash')
    expect(getAccountSpy).toHaveBeenNthCalledWith(1, web3)
    expect(getContractSpy).toHaveBeenNthCalledWith(1, web3, abi, 'contract-address', 'evm-account')
    expect(setNumberMock).toHaveBeenNthCalledWith(1, 1, 'arg2', 'arg3')
    expect(sendMock).toHaveBeenNthCalledWith(1, { from: 'evm-account', value: 1, gasPrice: 100e9 })
  })

  test('Should send a contract method with set gas price and gas limit', async () => {
    const web3 = new Web3()
    const provider = new pTokensEvmProvider(web3)
    provider.setGasLimit(200000)
    const getAccountSpy = jest.spyOn(utils, 'getAccount').mockImplementation(() => {
      return Promise.resolve('evm-account')
    })
    const contract = new web3.eth.Contract(abi as unknown as AbiItem)
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
          value: 1,
        },
        [1, 'arg2', 'arg3']
      )
      .once('txBroadcasted', (_hash) => {
        txBroadcastedHash = _hash
      })
      .once('txConfirmed', (_hash) => {
        txConfirmedHash = _hash
      })
    expect(txHash).toEqual('tx-hash')
    expect(txBroadcastedHash).toEqual('tx-hash')
    expect(txConfirmedHash).toEqual('tx-hash')
    expect(getAccountSpy).toHaveBeenNthCalledWith(1, web3)
    expect(getContractSpy).toHaveBeenNthCalledWith(1, web3, abi, 'contract-address', 'evm-account')
    expect(setNumberMock).toHaveBeenNthCalledWith(1, 1, 'arg2', 'arg3')
    expect(sendMock).toHaveBeenNthCalledWith(1, { from: 'evm-account', value: 1, gas: 200000 })
  })

  test('Should send a contract method and emit txError', async () => {
    const web3 = new Web3()
    const provider = new pTokensEvmProvider(web3)
    const getAccountSpy = jest.spyOn(utils, 'getAccount').mockImplementation(() => {
      return Promise.resolve('evm-account')
    })
    const contract = new web3.eth.Contract(abi as unknown as AbiItem)
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
          value: 1,
        },
        [1, 'arg2', 'arg3']
      )
      .once('txError', (_error) => {
        txError = _error
      })
    expect(txHash).toEqual('tx-hash')
    expect(txError.message).toStrictEqual('tx-error')
    expect(getAccountSpy).toHaveBeenNthCalledWith(1, web3)
    expect(getContractSpy).toHaveBeenNthCalledWith(1, web3, abi, 'contract-address', 'evm-account')
    expect(setNumberMock).toHaveBeenNthCalledWith(1, 1, 'arg2', 'arg3')
    expect(sendMock).toHaveBeenNthCalledWith(1, { from: 'evm-account', value: 1 })
  })

  test('Should reject if getAccount throws', async () => {
    const web3 = new Web3()
    const provider = new pTokensEvmProvider(web3)
    jest.spyOn(utils, 'getAccount').mockImplementation(() => {
      return Promise.reject(new Error('getAccount exception'))
    })
    try {
      await provider.makeContractSend(
        {
          method: 'setNumber',
          abi,
          contractAddress: 'contract-address',
          value: 1,
        },
        [1, 'arg2', 'arg3']
      )
      fail()
    } catch (err) {
      expect(err.message).toEqual('getAccount exception')
    }
  })

  test('Should reject if getContract throws', async () => {
    const web3 = new Web3()
    const provider = new pTokensEvmProvider(web3)
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
          value: 1,
        },
        [1, 'arg2', 'arg3']
      )
      fail()
    } catch (err) {
      expect(err.message).toEqual('getContract exception')
    }
  })

  test('Should reject if contract method send throws', async () => {
    const web3 = new Web3()
    const provider = new pTokensEvmProvider(web3)
    jest.spyOn(utils, 'getAccount').mockImplementation(() => {
      return Promise.resolve('evm-account')
    })
    const contract = new web3.eth.Contract(abi as unknown as AbiItem)
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
          value: 1,
        },
        [1, 'arg2', 'arg3']
      )
      fail()
    } catch (err) {
      expect(err.message).toEqual('method send error')
    }
  })

  test('Should wait for transaction confirmation', async () => {
    const web3 = new Web3()

    const waitForConfirmationSpy = jest
      .spyOn(web3.eth, 'getTransactionReceipt')
      .mockResolvedValueOnce(null)
      .mockRejectedValueOnce(new Error('getTransactionReceipt error'))
      .mockResolvedValueOnce(receiptWithFalseStatus as unknown as TransactionReceipt)
      .mockResolvedValue(receiptWithTrueStatus as unknown as TransactionReceipt)
    const provider = new pTokensEvmProvider(web3)
    const ret = await provider.waitForTransactionConfirmation(
      '0x5d65fa769234d6eef32baaeeb267dd1b3b8e0ff2e04a0861e2d36af26d631046',
      500
    )
    expect(waitForConfirmationSpy).toHaveBeenCalledTimes(4)
    expect(ret).toBe('0x5d65fa769234d6eef32baaeeb267dd1b3b8e0ff2e04a0861e2d36af26d631046')
  })
})
