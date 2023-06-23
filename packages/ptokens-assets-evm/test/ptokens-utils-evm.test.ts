import BigNumber from 'bignumber.js'
import { stringUtils } from 'ptokens-helpers'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'

import * as utils from '../src/lib'

const abi = require('./utils/exampleContractABI.json')

const TEST_CONTRACT_ADDRESS = '0x15FA11dFB23eae46Fda69fB6A148f41677B4a090'
const TEST_ETH_PRIVATE_KEY = '422c874bed50b69add046296530dc580f8e2e253879d98d66023b7897ab15742'
const TEST_ETH_PROVIDER = 'https://goerli.infura.io/v3/4762c881ac0c4938be76386339358ed6'

describe('ethereum utilities', () => {
  test('Should return the correct Ethereum off-chain format', () => {
    const onChainAmount = new BigNumber(10000)
    const decimals = 4
    const expectedOffChainAmount = '1'
    const offChainAmount = utils.offChainFormat(onChainAmount, decimals).toFixed()
    expect(offChainAmount).toStrictEqual(expectedOffChainAmount)
  })

  test('Should return the correct Ethereum on-chain format', () => {
    const offChainAmount = new BigNumber(1)
    const decimals = 4
    const expectedOnChainAmount = '10000'
    const onChainAmount = utils.onChainFormat(offChainAmount, decimals).toFixed()
    expect(onChainAmount).toStrictEqual(expectedOnChainAmount)
  })

  test('Should return the current Ethereum account with non injected Web3 instance', async () => {
    const web3 = new Web3(TEST_ETH_PROVIDER)
    const expectedEthereumAccount = '0xdf3B180694aB22C577f7114D822D28b92cadFd75'
    const account = web3.eth.accounts.privateKeyToAccount(stringUtils.addHexPrefix(TEST_ETH_PRIVATE_KEY))
    web3.eth.defaultAccount = account.address
    const ethereumAccount = await utils.getAccount(web3)
    expect(ethereumAccount).toStrictEqual(expectedEthereumAccount)
  })

  test('Should return the current Ethereum account with injected Web3 instance', async () => {
    const web3 = new Web3(TEST_ETH_PROVIDER)
    const expectedEthereumAccount = '0xdf3B180694aB22C577f7114D822D28b92cadFd75'
    const getAccountsSpy = jest
      .spyOn(web3.eth, 'getAccounts')
      .mockImplementation(() => Promise.resolve([expectedEthereumAccount]))
    const ethereumAccount = await utils.getAccount(web3)
    expect(ethereumAccount).toStrictEqual(expectedEthereumAccount)
    expect(getAccountsSpy).toHaveBeenNthCalledWith(1)
  })

  test('Should return a valid Web3.eth.Contract instance', () => {
    const web3 = new Web3(TEST_ETH_PROVIDER)
    const contract = utils.getContract(web3, abi as unknown as AbiItem, TEST_CONTRACT_ADDRESS)
    const expectedContract = new web3.eth.Contract(abi as unknown as AbiItem, TEST_CONTRACT_ADDRESS)
    expect(JSON.stringify(contract)).toStrictEqual(JSON.stringify(expectedContract))
  })

  test('Should return a valid Web3.eth.Contract instance with default account', () => {
    const web3 = new Web3(TEST_ETH_PROVIDER)
    const account = web3.eth.accounts.privateKeyToAccount(stringUtils.addHexPrefix(TEST_ETH_PRIVATE_KEY))
    const contract = utils.getContract(web3, abi as unknown as AbiItem, TEST_CONTRACT_ADDRESS, account.address)
    const expectedContract = new web3.eth.Contract(abi as unknown as AbiItem, TEST_CONTRACT_ADDRESS)
    expectedContract.defaultAccount = account.address
    expect(JSON.stringify(contract)).toStrictEqual(JSON.stringify(expectedContract))
  })

  test('Should return a valid gas limit', async () => {
    const web3 = new Web3(TEST_ETH_PROVIDER)
    const gasLimit = await utils.getGasLimit(web3)
    expect(typeof gasLimit).toBe('number')
  })

  test('Should return true since 0xhello is 0x prefixed', () => {
    const string0xPrefixed = '0xhello'
    const result = stringUtils.isHexPrefixed(string0xPrefixed)
    expect(result).toBe(true)
  })

  test('Should return false since hello is not 0x prefixed', () => {
    const string0xNotPrefixed = 'hello0x'
    const result = stringUtils.isHexPrefixed(string0xNotPrefixed)
    expect(result).toBe(false)
  })
})
