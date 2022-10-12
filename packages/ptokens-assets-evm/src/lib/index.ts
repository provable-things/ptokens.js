import BigNumber from 'bignumber.js'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'

export function onChainFormat(_amount: BigNumber, _decimals: number): BigNumber {
  return _amount.multipliedBy(BigNumber(10).pow(_decimals))
}

export function offChainFormat(_amount: BigNumber, _decimals: number) {
  return _amount.dividedBy(BigNumber(10).pow(_decimals))
}

export async function getAccount(_web3: Web3): Promise<string> {
  if (_web3.eth.defaultAccount) return _web3.eth.defaultAccount
  const accounts = await _web3.eth.getAccounts()
  return accounts[0]
}

export function getContract(
  _web3: Web3,
  _abi: AbiItem | AbiItem[],
  _contractAddress: string,
  _account: string = undefined
) {
  const contract = new _web3.eth.Contract(_abi, _contractAddress)
  contract.defaultAccount = _account
  return contract
}

export async function getGasLimit(_web3: Web3) {
  const block = await _web3.eth.getBlock('latest')
  return block.gasLimit
}
