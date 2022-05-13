import BigNumber from 'bignumber.js'
import polling from 'light-async-polling'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import { TransactionReceipt } from 'web3-core'
import { PromiEvent } from 'web3-core'

const HEX_PREFIX = '0x'
export const zeroEther = '0x00'
export const zeroAddress = '0x0000000000000000000000000000000000000000'

export function addHexPrefix(_string: string) {
  return isHexPrefixed(_string) ? _string : HEX_PREFIX + _string
}

export function removeHexPrefix(_string: string) {
  return isHexPrefixed(_string) ? _string.substr(2) : _string
}

export function onChainFormat(_amount: BigNumber, _decimals: number) {
  return _amount.multipliedBy(new BigNumber(Math.pow(10, _decimals)))
}

export function offChainFormat(_amount: BigNumber, _decimals: number) {
  return _amount.dividedBy(new BigNumber(Math.pow(10, _decimals)))
}

export async function getAccount(_web3: Web3): Promise<string> {
  if (_web3.eth.defaultAccount) return _web3.eth.defaultAccount
  const accounts = await _web3.eth.getAccounts()
  return accounts[0]
}

export function getContract(_web3: Web3, _abi: AbiItem, _contractAddress: string, _account: string = undefined) {
  const contract = new _web3.eth.Contract(_abi, _contractAddress)
  contract.defaultAccount = _account
  return contract
}

export async function getGasLimit(_web3: Web3) {
  const block = await _web3.eth.getBlock('latest')
  return block.gasLimit
}

export function isHexPrefixed(_string: string) {
  return _string.slice(0, 2) === HEX_PREFIX
}

export type MakeContractCallOptions = {
  abi: AbiItem
  contractAddress: string
}

export async function makeContractCall(
  _web3: Web3,
  _method: string,
  _options: MakeContractCallOptions,
  _params = []
): Promise<any> {
  const { abi, contractAddress } = _options
  const account = await getAccount(_web3)
  const contract = getContract(_web3, abi, contractAddress, account)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return contract.methods[_method](..._params).call() as Promise<any>
}

export type MakeContractSendOptions = {
  abi: AbiItem
  contractAddress: string
  value: number
  gas: number
  gasPrice: number
  transactionHashCallback?: (hash: string) => void
  receiptCallback?: (receipt: TransactionReceipt) => void
}

export async function makeContractSend(
  _web3: Web3,
  _method: string,
  _options: MakeContractSendOptions,
  _params = []
): Promise<TransactionReceipt> {
  const { abi, contractAddress, value, gasPrice, gas } = _options
  const account = await getAccount(_web3)
  const contract = getContract(_web3, abi, contractAddress, account)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const ret = contract.methods[_method](..._params).send({
    from: account,
    value,
    gasPrice,
    gas,
  }) as PromiEvent<TransactionReceipt>
  if (_options.receiptCallback) void ret.on('receipt', _options.receiptCallback)
  if (_options.transactionHashCallback) void ret.on('transactionHash', _options.transactionHashCallback)
  return ret
}

export type SendSignedMethodTxOptions = {
  abi: AbiItem
  contractAddress: string
  value?: number
  gas?: number
  gasPrice?: number
  privateKey: string
  transactionHashCallback?: (hash: string) => void
  receiptCallback?: (receipt: TransactionReceipt) => void
}

export async function sendSignedMethodTx(
  _web3: Web3,
  _method: string,
  _options: SendSignedMethodTxOptions,
  _params = []
) {
  const { abi, contractAddress, value, gas, gasPrice, privateKey } = _options
  const contract = getContract(_web3, abi, _web3.eth.defaultAccount)
  const nonce = await _web3.eth.getTransactionCount(_web3.eth.defaultAccount, 'pending')
  const { rawTransaction } = await _web3.eth.accounts.signTransaction(
    {
      nonce,
      gasPrice: gasPrice || (await _web3.eth.getGasPrice()),
      gas: gas || (await getGasLimit(_web3)),
      to: contractAddress,
      value,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      data: contract.methods[_method](..._params).encodeABI(),
    },
    privateKey
  )
  const ret = _web3.eth.sendSignedTransaction(rawTransaction)
  if (_options.receiptCallback) void ret.once('receipt', _options.receiptCallback)
  if (_options.transactionHashCallback) void ret.once('transactionHash', _options.transactionHashCallback)
  return ret
}

export async function waitForTransactionConfirmation(_web3: Web3, _tx: string, _pollingTime = 5000) {
  let receipt: TransactionReceipt = null
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await polling(async () => {
    try {
      receipt = await _web3.eth.getTransactionReceipt(_tx)
      if (!receipt) return false
      else if (receipt.status) return true
      else return false
    } catch (_err) {
      return false
    }
  }, _pollingTime)
  return receipt.transactionHash
}
