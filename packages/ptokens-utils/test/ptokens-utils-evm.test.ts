import utils from '../src'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import abi from './utils/exampleContractABI.json'
import BigNumber from 'bignumber.js'

const TEST_CONTRACT_ADDRESS = '0x15FA11dFB23eae46Fda69fB6A148f41677B4a090'
const TEST_ETH_PRIVATE_KEY = '422c874bed50b69add046296530dc580f8e2e253879d98d66023b7897ab15742'
const TEST_ETH_PROVIDER = 'https://kovan.infura.io/v3/4762c881ac0c4938be76386339358ed6'
const ETH_TESTING_TX = '0xcbda0526ef6f74583e0af541e3e8b25542130691bddea2fdf5956c8e1ea783e5'

jest.setTimeout(60000)

describe('ethereum utilities', () => {
  test('Should return the same 0x prefixed string', () => {
    const string0xPrefixed = '0xhello'
    const expectedString0xPrefixed = '0xhello'
    const result = utils.evm.addHexPrefix(string0xPrefixed)
    expect(result).toStrictEqual(expectedString0xPrefixed)
  })

  test('Should return the 0x prefixed string', () => {
    const stringNot0xPrefixed = 'hello'
    const expectedString0xPrefixed = '0xhello'
    const result = utils.evm.addHexPrefix(stringNot0xPrefixed)
    expect(result).toStrictEqual(expectedString0xPrefixed)
  })

  test('Should remove the 0x prefix', () => {
    const string0xPrefixed = '0xhello'
    const expectedStringnnNot0xPrefixed = 'hello'
    const result = utils.evm.removeHexPrefix(string0xPrefixed)
    expect(result).toStrictEqual(expectedStringnnNot0xPrefixed)
  })

  test('Should return the correct Ethereum offchain format', () => {
    const onChainAmount = new BigNumber(10000)
    const decimals = 4
    const expectedOffChainAmount = '1'
    const offChainAmount = utils.evm.offChainFormat(onChainAmount, decimals).toFixed()
    expect(offChainAmount).toStrictEqual(expectedOffChainAmount)
  })

  test('Should return the correct Ethereum onchain format', () => {
    const offChainAmount = new BigNumber(1)
    const decimals = 4
    const expectedOnChainAmount = '10000'
    const onChainAmount = utils.evm.onChainFormat(offChainAmount, decimals).toFixed()
    expect(onChainAmount).toStrictEqual(expectedOnChainAmount)
  })

  test('Should return the current Ethereum account with non injected Web3 instance', async () => {
    const web3 = new Web3(TEST_ETH_PROVIDER)
    const expectedEthereumAccount = '0xdf3B180694aB22C577f7114D822D28b92cadFd75'
    const account = web3.eth.accounts.privateKeyToAccount(utils.evm.addHexPrefix(TEST_ETH_PRIVATE_KEY))
    web3.eth.defaultAccount = account.address
    const ethereumAccount = await utils.evm.getAccount(web3)
    expect(ethereumAccount).toStrictEqual(expectedEthereumAccount)
  })

  test('Should return a valid Web3.eth.Contract instance', () => {
    const web3 = new Web3(TEST_ETH_PROVIDER)
    const account = web3.eth.accounts.privateKeyToAccount(utils.evm.addHexPrefix(TEST_ETH_PRIVATE_KEY))
    const contract = utils.evm.getContract(web3, abi as unknown as AbiItem, TEST_CONTRACT_ADDRESS, account.address)
    const expectedContract = new web3.eth.Contract(abi as unknown as AbiItem, TEST_CONTRACT_ADDRESS)
    expectedContract.defaultAccount = account.address
    expect(JSON.stringify(contract)).toStrictEqual(JSON.stringify(expectedContract))
  })

  test('Should return a valid gas limit', async () => {
    const web3 = new Web3(TEST_ETH_PROVIDER)
    const gasLimit = await utils.evm.getGasLimit(web3)
    expect(typeof gasLimit).toBe('number')
  })

  test('Should return true since 0xhello is 0x prefixed', () => {
    const string0xPrefixed = '0xhello'
    const result = utils.evm.isHexPrefixed(string0xPrefixed)
    expect(result).toBe(true)
  })

  test('Should return false since hello is not 0x prefixed', () => {
    const string0xNotPrefixed = 'hello0x'
    const result = utils.evm.isHexPrefixed(string0xNotPrefixed)
    expect(result).toBe(false)
  })

  test('Should make an ETH contract send correctly', async () => {
    const web3 = new Web3(TEST_ETH_PROVIDER)
    const account = web3.eth.accounts.privateKeyToAccount(utils.evm.addHexPrefix(TEST_ETH_PRIVATE_KEY))
    web3.eth.defaultAccount = account.address
    const expectedNumber = Math.floor(Math.random() * 100)

    await utils.evm.sendSignedMethodTx(
      web3,
      'setNumber',
      {
        abi: abi as unknown as AbiItem,
        contractAddress: TEST_CONTRACT_ADDRESS,
        gasPrice: 5e9,
        privateKey: utils.evm.addHexPrefix(TEST_ETH_PRIVATE_KEY),
      },
      [expectedNumber]
    )
    const number: string = await utils.evm.makeContractCall(web3, 'number', {
      abi: abi as unknown as AbiItem,
      contractAddress: TEST_CONTRACT_ADDRESS,
    })
    expect(parseInt(number)).toBe(expectedNumber)
  })

  test('Should make an ETH contract send correctly specifying the gas', async () => {
    const web3 = new Web3(TEST_ETH_PROVIDER)
    const account = web3.eth.accounts.privateKeyToAccount(utils.evm.addHexPrefix(TEST_ETH_PRIVATE_KEY))
    web3.eth.defaultAccount = account.address
    const expectedNumber = Math.floor(Math.random() * 100)

    await utils.evm.sendSignedMethodTx(
      web3,
      'setNumber',
      {
        abi: abi as unknown as AbiItem,
        contractAddress: TEST_CONTRACT_ADDRESS,
        gas: 30000,
        gasPrice: 5e9,
        privateKey: utils.evm.addHexPrefix(TEST_ETH_PRIVATE_KEY),
      },
      [expectedNumber]
    )
    const number: string = await utils.evm.makeContractCall(web3, 'number', {
      abi: abi as unknown as AbiItem,
      contractAddress: TEST_CONTRACT_ADDRESS,
    })
    expect(parseInt(number)).toBe(expectedNumber)
  })

  test('Should fail to send a tx because of gas limit', async () => {
    const GAS_TOO_LOW = 10

    const web3 = new Web3(TEST_ETH_PROVIDER)
    const account = web3.eth.accounts.privateKeyToAccount(utils.evm.addHexPrefix(TEST_ETH_PRIVATE_KEY))
    web3.eth.defaultAccount = account.address

    try {
      await utils.evm.sendSignedMethodTx(
        web3,
        'setNumber',
        {
          abi: abi as unknown as AbiItem,
          contractAddress: TEST_CONTRACT_ADDRESS,
          gas: GAS_TOO_LOW,
          privateKey: utils.evm.addHexPrefix(TEST_ETH_PRIVATE_KEY),
        },
        [0]
      )
    } catch (err) {
      if (err instanceof Error)
        expect(err.message.includes('Signer Error:  gasLimit is too low. given 10, need at least')).toBe(true)
      else fail()
    }
  })

  test('Should wait for an ETH transaction confirmation', async () => {
    const web3 = new Web3(TEST_ETH_PROVIDER)
    const receipt = await utils.evm.waitForTransactionConfirmation(web3, ETH_TESTING_TX, 3000)
    expect(receipt.blockNumber).toStrictEqual(16324912)
    expect(receipt.blockHash).toStrictEqual('0xa3bd30bb42d083521bfe0b201de55ffdf7f0652cc67b55135816b22393ad0c08')
  })
})
