import { pTokensEosioProvider } from '../src'
import { JsonRpc, Api } from 'eosjs'
import { executedGetTransactionResult, notExecutedGetTransactionResult } from './utils/eosjsResults'

const abi = require('./utils/exampleContractABI.json')

describe('EOSIO provider', () => {
  let waitForConfirmationSpy
  beforeEach(() => {
    jest.resetAllMocks()
    waitForConfirmationSpy = jest
      .spyOn(JsonRpc.prototype, 'history_get_transaction')
      .mockRejectedValueOnce(new Error('getTransactionReceipt error'))
      .mockResolvedValueOnce(notExecutedGetTransactionResult)
      .mockResolvedValueOnce(executedGetTransactionResult)
  })

  test('Should throw with negative expireSeconds', () => {
    const provider = new pTokensEosioProvider('eos-rpc-endpoint')
    try {
      provider.expireSeconds = -1
      fail()
    } catch (err) {
      expect(err.message).toEqual('Invalid expire seconds')
    }
  })

  test('Should throw with too large expireSeconds', () => {
    const provider = new pTokensEosioProvider('eos-rpc-endpoint')
    try {
      provider.expireSeconds = 1e12
      fail()
    } catch (err) {
      expect(err.message).toEqual('Invalid expire seconds')
    }
  })

  test('Should throw with negative blocksBehind', () => {
    const provider = new pTokensEosioProvider('eos-rpc-endpoint')
    try {
      provider.blocksBehind = -1
      fail()
    } catch (err) {
      expect(err.message).toEqual('Invalid blocks behind')
    }
  })

  test('Should throw with too large blocksBehind', () => {
    const provider = new pTokensEosioProvider('eos-rpc-endpoint')
    try {
      provider.blocksBehind = 10e6
      fail()
    } catch (err) {
      expect(err.message).toEqual('Invalid blocks behind')
    }
  })

  test('Should add account from private key', () => {
    const provider = new pTokensEosioProvider('eos-rpc-endpoint')
    provider.setPrivateKey('5K7ZPXDP5ptRZHF3DptSy7C7Quq7D78X82jQwBG8JVgnY3N4irG')
    expect(provider['_api'].signatureProvider['availableKeys']).toEqual([
      'PUB_K1_7baqPNZG5P2Lq1HTADRBgLF5rmbUyiFCdh1PmYeAtb1BRNR5oe',
    ])
  })

  test('Should not add account from invalid private key', () => {
    const provider = new pTokensEosioProvider('eos-rpc-endpoint')
    try {
      provider.setPrivateKey('invalid-key')
      fail()
    } catch (err) {
      expect(err.message).toEqual('invalid base-58 value')
    }
  })

  test('Should throw when calling a contract method without actor', async () => {
    const provider = new pTokensEosioProvider('eos-rpc-endpoint')
    const setAbiSpy = jest.spyOn(provider['_api'].cachedAbis, 'set')
    const transactSpy = jest.spyOn(Api.prototype, 'transact')
    try {
      await provider.makeContractSend(
        {
          method: 'setNumber',
          abi,
          contractAddress: 'contract-address',
        },
        [1, 'arg2', 'arg3']
      )
      fail()
    } catch (err) {
      expect(err.message).toStrictEqual('Missing actor')
      expect(transactSpy).toHaveBeenCalledTimes(0)
      expect(setAbiSpy).toHaveBeenCalledTimes(0)
    }
  })

  test('Should throw when calling a contract method with an invalid ABI', async () => {
    const provider = new pTokensEosioProvider('eos-rpc-endpoint')
    provider.actor = 'eosioaccount'
    const setAbiSpy = jest.spyOn(provider['_api'].cachedAbis, 'set').mockImplementation(() => {
      throw new Error('Set ABI error')
    })
    const transactSpy = jest.spyOn(Api.prototype, 'transact')
    try {
      await provider.makeContractSend(
        {
          method: 'setNumber',
          abi,
          contractAddress: 'contract-address',
        },
        [1, 'arg2', 'arg3']
      )
      fail()
    } catch (err) {
      expect(err.message).toStrictEqual('Set ABI error')
      expect(setAbiSpy).toHaveBeenCalledWith('contract-address', { abi, rawAbi: null })
      expect(transactSpy).toHaveBeenCalledTimes(0)
    }
  })

  test('Should throw when calling a contract method and there is no result in the transact return value', async () => {
    const provider = new pTokensEosioProvider('eos-rpc-endpoint')
    provider.actor = 'eosioaccount'
    expect(provider.blocksBehind).toBe(3)
    expect(provider.expireSeconds).toBe(60)
    expect(provider.actor).toBe('eosioaccount')
    const setAbiSpy = jest.spyOn(provider['_api'].cachedAbis, 'set')
    const transactSpy = jest.spyOn(Api.prototype, 'transact').mockResolvedValue({
      head_block_num: 1,
      head_block_id: 'head_block_id',
      last_irreversible_block_num: 1,
      last_irreversible_block_id: 'last_irreversible_block_id',
      code_hash: 'code_hash',
      pending_transactions: [],
      result: {
        id: 'tx-hash',
        block_num: 1,
        block_time: 'block-time',
        producer_block_id: 'producer_block_id',
        receipt: null,
        elapsed: 0,
        net_usage: 0,
        scheduled: false,
        action_traces: [],
        account_ram_delta: null,
        except: null,
        error_code: null,
        bill_to_accounts: [],
      },
    })
    try {
      await provider.makeContractSend(
        {
          method: 'setNumber',
          abi,
          contractAddress: 'contract-address',
        },
        [1, 'arg2', 'arg3']
      )
    } catch (err) {
      expect(err.message).toBe('Unexpected return value from transact()')
      expect(setAbiSpy).toHaveBeenCalledWith('contract-address', { abi, rawAbi: null })
      expect(transactSpy).toHaveBeenCalledWith(
        {
          actions: [
            {
              account: 'contract-address',
              authorization: [{ actor: 'eosioaccount', permission: 'active' }],
              data: [1, 'arg2', 'arg3'],
              name: 'setNumber',
            },
          ],
        },
        { blocksBehind: 3, expireSeconds: 60 }
      )
      expect(waitForConfirmationSpy).toHaveBeenCalledTimes(0)
    }
  })

  test('Should call a contract method with default parameters', async () => {
    const provider = new pTokensEosioProvider('eos-rpc-endpoint')
    provider.actor = 'eosioaccount'
    expect(provider.blocksBehind).toBe(3)
    expect(provider.expireSeconds).toBe(60)
    expect(provider.actor).toBe('eosioaccount')
    const setAbiSpy = jest.spyOn(provider['_api'].cachedAbis, 'set')
    let txBroadcastedHash = ''
    let txConfirmedHash = ''
    const transactSpy = jest.spyOn(Api.prototype, 'transact').mockResolvedValue({
      transaction_id: 'tx-hash',
      processed: {
        id: 'tx-hash',
        block_num: 1,
        block_time: 'block-time',
        producer_block_id: 'producer_block_id',
        receipt: null,
        elapsed: 0,
        net_usage: 0,
        scheduled: false,
        action_traces: [],
        account_ram_delta: null,
        except: null,
        error_code: null,
        bill_to_accounts: [],
      },
    })
    const txHash = await provider
      .makeContractSend(
        {
          method: 'setNumber',
          abi,
          contractAddress: 'contract-address',
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
    expect(setAbiSpy).toHaveBeenCalledWith('contract-address', { abi, rawAbi: null })
    expect(transactSpy).toHaveBeenCalledWith(
      {
        actions: [
          {
            account: 'contract-address',
            authorization: [{ actor: 'eosioaccount', permission: 'active' }],
            data: [1, 'arg2', 'arg3'],
            name: 'setNumber',
          },
        ],
      },
      { blocksBehind: 3, expireSeconds: 60 }
    )
    expect(waitForConfirmationSpy).toHaveBeenCalledTimes(3)
    expect(waitForConfirmationSpy).toHaveBeenCalledWith('tx-hash')
  })

  test('Should call a contract method with default parameters and no data', async () => {
    const provider = new pTokensEosioProvider('eos-rpc-endpoint')
    provider.actor = 'eosioaccount'
    expect(provider.blocksBehind).toBe(3)
    expect(provider.expireSeconds).toBe(60)
    expect(provider.actor).toBe('eosioaccount')
    const setAbiSpy = jest.spyOn(provider['_api'].cachedAbis, 'set')
    let txBroadcastedHash = ''
    let txConfirmedHash = ''
    const transactSpy = jest.spyOn(Api.prototype, 'transact').mockResolvedValue({
      transaction_id: 'tx-hash',
      processed: {
        id: 'tx-hash',
        block_num: 1,
        block_time: 'block-time',
        producer_block_id: 'producer_block_id',
        receipt: null,
        elapsed: 0,
        net_usage: 0,
        scheduled: false,
        action_traces: [],
        account_ram_delta: null,
        except: null,
        error_code: null,
        bill_to_accounts: [],
      },
    })
    const txHash = await provider
      .makeContractSend({
        method: 'setNumber',
        abi,
        contractAddress: 'contract-address',
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
    expect(setAbiSpy).toHaveBeenCalledWith('contract-address', { abi, rawAbi: null })
    expect(transactSpy).toHaveBeenCalledWith(
      {
        actions: [
          {
            account: 'contract-address',
            authorization: [{ actor: 'eosioaccount', permission: 'active' }],
            data: {},
            name: 'setNumber',
          },
        ],
      },
      { blocksBehind: 3, expireSeconds: 60 }
    )
    expect(waitForConfirmationSpy).toHaveBeenCalledTimes(3)
    expect(waitForConfirmationSpy).toHaveBeenCalledWith('tx-hash')
  })

  test('Should call a contract method with custom parameters', async () => {
    const provider = new pTokensEosioProvider('eos-rpc-endpoint')
    provider.blocksBehind = 5
    provider.expireSeconds = 10
    provider.actor = 'eosioaccount'
    const setAbiSpy = jest.spyOn(provider['_api'].cachedAbis, 'set')
    let txBroadcastedHash = ''
    let txConfirmedHash = ''
    const transactSpy = jest.spyOn(Api.prototype, 'transact').mockResolvedValue({
      transaction_id: 'tx-hash',
      processed: {
        id: 'tx-hash',
        block_num: 1,
        block_time: 'block-time',
        producer_block_id: 'producer_block_id',
        receipt: null,
        elapsed: 0,
        net_usage: 0,
        scheduled: false,
        action_traces: [],
        account_ram_delta: null,
        except: null,
        error_code: null,
        bill_to_accounts: [],
      },
    })
    const txHash = await provider
      .makeContractSend(
        {
          method: 'setNumber',
          abi,
          contractAddress: 'contract-address',
          permission: 'owner',
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
    expect(setAbiSpy).toHaveBeenCalledWith('contract-address', { abi, rawAbi: null })
    expect(transactSpy).toHaveBeenCalledWith(
      {
        actions: [
          {
            account: 'contract-address',
            authorization: [{ actor: 'eosioaccount', permission: 'owner' }],
            data: [1, 'arg2', 'arg3'],
            name: 'setNumber',
          },
        ],
      },
      { blocksBehind: 5, expireSeconds: 10 }
    )
    expect(provider.blocksBehind).toBe(5)
    expect(provider.expireSeconds).toBe(10)
    expect(waitForConfirmationSpy).toHaveBeenCalledTimes(3)
    expect(waitForConfirmationSpy).toHaveBeenCalledWith('tx-hash')
  })

  // test('Should send a contract method with no arguments', async () => {
  //   const provider = new pTokensEosioProvider('eos-rpc-endpoint')
  //   const sendMock = jest.fn().mockImplementation(() => {
  //     const promi = new PromiEvent((resolve) =>
  //       setImmediate(() => {
  //         promi.emit('transactionHash', 'tx-hash')
  //         promi.emit('receipt', { transactionHash: 'tx-hash' })
  //         return resolve({ transactionHash: 'tx-hash' })
  //       })
  //     )
  //     return promi
  //   })
  //   const numberMock = jest.fn().mockImplementation(() => ({
  //     send: sendMock,
  //   }))
  //   let txBroadcastedHash = ''
  //   let txConfirmedHash = ''
  //   const txHash = await provider
  //     .makeContractSend({
  //       method: 'number',
  //       abi,
  //       contractAddress: 'contract-address',
  //     })
  //     .once('txBroadcasted', (_hash) => {
  //       txBroadcastedHash = _hash
  //     })
  //     .once('txConfirmed', (_hash) => {
  //       txConfirmedHash = _hash
  //     })
  //   expect(txHash).toEqual('tx-hash')
  //   expect(txBroadcastedHash).toEqual('tx-hash')
  //   expect(txConfirmedHash).toEqual('tx-hash')
  //   expect(numberMock).toHaveBeenNthCalledWith(1)
  //   expect(sendMock).toHaveBeenNthCalledWith(1, { from: 'evm-account', value: 1, gas: 80000 })
  // })

  // test('Should send a contract method with set gas price and gas limit', async () => {
  //   const provider = new pTokensEosioProvider('eos-rpc-endpoint')
  //   const sendMock = jest.fn().mockImplementation(() => {
  //     const promi = new PromiEvent((resolve) =>
  //       setImmediate(() => {
  //         promi.emit('transactionHash', 'tx-hash')
  //         promi.emit('receipt', { transactionHash: 'tx-hash' })
  //         return resolve({ transactionHash: 'tx-hash' })
  //       })
  //     )
  //     return promi
  //   })
  //   const setNumberMock = jest.fn().mockImplementation(() => ({
  //     send: sendMock,
  //   }))
  //   let txBroadcastedHash = ''
  //   let txConfirmedHash = ''
  //   const txHash = await provider
  //     .makeContractSend(
  //       {
  //         method: 'setNumber',
  //         abi,
  //         contractAddress: 'contract-address',
  //       },
  //       [1, 'arg2', 'arg3']
  //     )
  //     .once('txBroadcasted', (_hash) => {
  //       txBroadcastedHash = _hash
  //     })
  //     .once('txConfirmed', (_hash) => {
  //       txConfirmedHash = _hash
  //     })
  //   expect(txHash).toEqual('tx-hash')
  //   expect(txBroadcastedHash).toEqual('tx-hash')
  //   expect(txConfirmedHash).toEqual('tx-hash')
  //   expect(setNumberMock).toHaveBeenNthCalledWith(1, 1, 'arg2', 'arg3')
  //   expect(sendMock).toHaveBeenNthCalledWith(1, { from: 'evm-account', value: 1, gas: 200000, gasPrice: 100e9 })
  // })

  // test('Should send a contract method with set gas price', async () => {
  //   const provider = new pTokensEosioProvider('eos-rpc-endpoint')
  //   const sendMock = jest.fn().mockImplementation(() => {
  //     const promi = new PromiEvent((resolve) =>
  //       setImmediate(() => {
  //         promi.emit('transactionHash', 'tx-hash')
  //         promi.emit('receipt', { transactionHash: 'tx-hash' })
  //         return resolve({ transactionHash: 'tx-hash' })
  //       })
  //     )
  //     return promi
  //   })
  //   const setNumberMock = jest.fn().mockImplementation(() => ({
  //     send: sendMock,
  //   }))
  //   let txBroadcastedHash = ''
  //   let txConfirmedHash = ''
  //   const txHash = await provider
  //     .makeContractSend(
  //       {
  //         method: 'setNumber',
  //         abi,
  //         contractAddress: 'contract-address',
  //       },
  //       [1, 'arg2', 'arg3']
  //     )
  //     .once('txBroadcasted', (_hash) => {
  //       txBroadcastedHash = _hash
  //     })
  //     .once('txConfirmed', (_hash) => {
  //       txConfirmedHash = _hash
  //     })
  //   expect(txHash).toEqual('tx-hash')
  //   expect(txBroadcastedHash).toEqual('tx-hash')
  //   expect(txConfirmedHash).toEqual('tx-hash')
  //   expect(setNumberMock).toHaveBeenNthCalledWith(1, 1, 'arg2', 'arg3')
  //   expect(sendMock).toHaveBeenNthCalledWith(1, { from: 'evm-account', value: 1, gasPrice: 100e9, gas: 80000 })
  // })

  // test('Should send a contract method with set gas price and gas limit', async () => {
  //   const provider = new pTokensEosioProvider('eos-rpc-endpoint')
  //   const sendMock = jest.fn().mockImplementation(() => {
  //     const promi = new PromiEvent((resolve) =>
  //       setImmediate(() => {
  //         promi.emit('transactionHash', 'tx-hash')
  //         promi.emit('receipt', { transactionHash: 'tx-hash' })
  //         return resolve({ transactionHash: 'tx-hash' })
  //       })
  //     )
  //     return promi
  //   })
  //   const setNumberMock = jest.fn().mockImplementation(() => ({
  //     send: sendMock,
  //   }))
  //   let txBroadcastedHash = ''
  //   let txConfirmedHash = ''
  //   const txHash = await provider
  //     .makeContractSend(
  //       {
  //         method: 'setNumber',
  //         abi,
  //         contractAddress: 'contract-address',
  //       },
  //       [1, 'arg2', 'arg3']
  //     )
  //     .once('txBroadcasted', (_hash) => {
  //       txBroadcastedHash = _hash
  //     })
  //     .once('txConfirmed', (_hash) => {
  //       txConfirmedHash = _hash
  //     })
  //   expect(txHash).toEqual('tx-hash')
  //   expect(txBroadcastedHash).toEqual('tx-hash')
  //   expect(txConfirmedHash).toEqual('tx-hash')
  //   expect(setNumberMock).toHaveBeenNthCalledWith(1, 1, 'arg2', 'arg3')
  //   expect(sendMock).toHaveBeenNthCalledWith(1, { from: 'evm-account', value: 1, gas: 200000 })
  // })

  // test('Should send a contract method and emit txError', async () => {
  //   const provider = new pTokensEosioProvider('eos-rpc-endpoint')
  //   const sendMock = jest.fn().mockImplementation(() => {
  //     const promi = new PromiEvent((resolve) =>
  //       setImmediate(() => {
  //         promi.emit('error', new Error('tx-error'))
  //         return resolve({ transactionHash: 'tx-hash' })
  //       })
  //     )
  //     return promi
  //   })
  //   const setNumberMock = jest.fn().mockImplementation(() => ({
  //     send: sendMock,
  //   }))
  //   let txError = new Error()
  //   const txHash = await provider
  //     .makeContractSend(
  //       {
  //         method: 'setNumber',
  //         abi,
  //         contractAddress: 'contract-address',
  //       },
  //       [1, 'arg2', 'arg3']
  //     )
  //     .once('txError', (_error) => {
  //       txError = _error
  //     })
  //   expect(txHash).toEqual('tx-hash')
  //   expect(txError.message).toStrictEqual('tx-error')
  //   expect(setNumberMock).toHaveBeenNthCalledWith(1, 1, 'arg2', 'arg3')
  //   expect(sendMock).toHaveBeenNthCalledWith(1, { from: 'evm-account', value: 1, gas: 80000 })
  // })

  // test('Should reject if getAccount throws', async () => {
  //   const provider = new pTokensEosioProvider('eos-rpc-endpoint')
  //   try {
  //     await provider.makeContractSend(
  //       {
  //         method: 'setNumber',
  //         abi,
  //         contractAddress: 'contract-address',
  //       },
  //       [1, 'arg2', 'arg3']
  //     )
  //     fail()
  //   } catch (err) {
  //     expect(err.message).toEqual('getAccount exception')
  //   }
  // })

  // test('Should reject if getContract throws', async () => {
  //   const provider = new pTokensEosioProvider('eos-rpc-endpoint')
  //   try {
  //     await provider.makeContractSend(
  //       {
  //         method: 'setNumber',
  //         abi,
  //         contractAddress: 'contract-address',
  //       },
  //       [1, 'arg2', 'arg3']
  //     )
  //     fail()
  //   } catch (err) {
  //     expect(err.message).toEqual('getContract exception')
  //   }
  // })

  // test('Should reject if contract method send throws', async () => {
  //   const provider = new pTokensEosioProvider('eos-rpc-endpoint')
  //   const sendMock = jest.fn().mockImplementation(() => {
  //     const promi = new PromiEvent((resolve, reject) => {
  //       return reject(new Error('method send error'))
  //     })
  //     return promi
  //   })
  //   try {
  //     await provider.makeContractSend(
  //       {
  //         method: 'setNumber',
  //         abi,
  //         contractAddress: 'contract-address',
  //       },
  //       [1, 'arg2', 'arg3']
  //     )
  //     fail()
  //   } catch (err) {
  //     expect(err.message).toEqual('method send error')
  //   }
  // })

  test('Should wait for transaction confirmation', async () => {
    const expected = executedGetTransactionResult
    const provider = new pTokensEosioProvider('http://api-mainnet.starteos.io')
    const ret = await provider.waitForTransactionConfirmation(
      'ea2ca390a256283ac55981a75c0832ccffabcd764153fd090ecc2ed28d88c6c7',
      500
    )
    expect(waitForConfirmationSpy).toHaveBeenCalledTimes(3)
    expect(ret).toStrictEqual(expected)
  })

  test('Should use the passed RPC provider', async () => {
    const expected = executedGetTransactionResult
    const rpcProvider = new JsonRpc('http://api-mainnet.starteos.io')
    const waitForConfirmationSpy = jest
      .spyOn(rpcProvider, 'history_get_transaction')
      .mockRejectedValueOnce(new Error('getTransactionReceipt error'))
      .mockResolvedValueOnce(expected)
    const provider = new pTokensEosioProvider(rpcProvider)
    const ret = await provider.waitForTransactionConfirmation(
      'ea2ca390a256283ac55981a75c0832ccffabcd764153fd090ecc2ed28d88c6c7',
      500
    )
    expect(waitForConfirmationSpy).toHaveBeenCalledTimes(3)
    expect(ret).toStrictEqual(expected)
  })
})
