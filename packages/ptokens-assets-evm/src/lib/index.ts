import BigNumber from 'bignumber.js'
import { NetworkId } from 'ptokens-constants'
import Web3 from 'web3'
import { Log, TransactionReceipt } from 'web3-core'
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

import events from '../abi/events.json'

export enum EVENT_NAMES {
  OPERATION_QUEUED = 'OperationQueued',
  OPERATION_EXECUTED = 'OperationExecuted',
  OPERATION_CANCELLED = 'OperationCancelled',
  USER_OPERATION = 'UserOperation',
}

export const eventNameToSignatureMap = new Map(
  events.map((_event) => {
    const web3 = new Web3()
    const signature = web3.eth.abi.encodeEventSignature(_event as AbiItem)
    return [_event.name, signature]
  })
)

const topicToAbiMap = new Map(
  events.map((_event) => {
    const signature = eventNameToSignatureMap.get(_event.name)
    return [signature, _event]
  })
)

const getOperationIdFromObj = (_web3: Web3, _obj: any) => {
  const types = [
    'bytes32',
    'bytes32',
    'bytes4',
    'uint256',
    'string',
    'bytes4',
    'string',
    'string',
    'uint256',
    'address',
    'bytes4',
    'uint256',
    'bytes',
    'bytes32',
  ]
  return _web3.utils.keccak256(
    _web3.eth.abi.encodeParameters(types, [
      _obj.originatingBlockHash || _obj.originBlockHash || _obj.blockHash,
      _obj.originatingTransactionHash || _obj.originTransactionHash || _obj.transactionHash,
      _obj.originatingNetworkId || _obj.originNetworkId || _obj.networkId,
      _obj.nonce,
      _obj.destinationAccount,
      _obj.destinationNetworkId,
      _obj.underlyingAssetName,
      _obj.underlyingAssetSymbol,
      _obj.underlyingAssetDecimals,
      _obj.underlyingAssetTokenAddress,
      _obj.underlyingAssetNetworkId,
      _obj.assetAmount,
      _obj.userData || '0x',
      _obj.optionsMask,
    ])
  )
}

const getEventInputsFromSignature = (_signature: string) => {
  if (topicToAbiMap.has(_signature)) return topicToAbiMap.get(_signature).inputs
  throw new Error(`Missing abi for event signature ${_signature}`)
}

const decodeLog = (_web3: Web3, _log: Log) =>
  _web3.eth.abi.decodeLog(getEventInputsFromSignature(_log.topics[0]), _log.data, [])

export const getOperationIdFromLog = (_log: Log, _networkId: NetworkId = null) => {
  const web3 = new Web3()
  const decodedLog = decodeLog(web3, _log)
  return getOperationIdFromObj(
    web3,
    Object.assign(
      {},
      decodedLog.operation ? decodedLog.operation : decodedLog,
      {
        transactionHash: _log.transactionHash,
        blockHash: _log.blockHash,
      },
      _networkId ? { networkId: _networkId } : {}
    )
  )
}

export const getOperationIdFromTransactionReceipt = (_networkId: NetworkId, _receipt: TransactionReceipt) => {
  return getOperationIdFromLog(
    _receipt.logs.find(
      (_log) =>
        _log.topics[0] === eventNameToSignatureMap.get(EVENT_NAMES.USER_OPERATION) ||
        _log.topics[0] === eventNameToSignatureMap.get(EVENT_NAMES.OPERATION_QUEUED) ||
        _log.topics[0] === eventNameToSignatureMap.get(EVENT_NAMES.OPERATION_EXECUTED) ||
        _log.topics[0] === eventNameToSignatureMap.get(EVENT_NAMES.OPERATION_CANCELLED)
    ),
    _networkId
  )
}
