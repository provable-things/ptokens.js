import {
  networkLabelType,
  blockchainShortTypes,
  blockchainTypes,
  networkLabels,
  pTokenNativeBlockchain,
  pTokensAvailables,
} from './maps'
import { Mainnet, Testnet } from './names'

const HEX_PREFIX = '0x'
export const zeroEther = HEX_PREFIX + '00'
export const zeroAddress = HEX_PREFIX + '0000000000000000000000000000000000000000'

export function isHexPrefixed(_string: string) {
  return _string.slice(0, 2) === HEX_PREFIX
}

export function addHexPrefix(_string: string) {
  return isHexPrefixed(_string) ? _string : HEX_PREFIX + _string
}

export function removeHexPrefix(_string: string) {
  return isHexPrefixed(_string) ? _string.substring(2) : _string
}

export function getNetworkType(_network: string): string {
  return networkLabelType[_network.toLowerCase()]
}

export function getBlockchainType(_blockchain: string): string {
  return blockchainTypes[_blockchain.toLowerCase()]
}

export function getBlockchainShortType(_blockchain: string) {
  return blockchainShortTypes[_blockchain.toLowerCase()]
}

export function getNativeBlockchainFromPtokenName(_name: string) {
  return pTokenNativeBlockchain[_name.toLowerCase()]
}

export function isValidPTokenName(_name: string) {
  return Boolean(pTokensAvailables.includes(_name.toLowerCase()))
}

export type Params = {
  network?: string
  hostNetwork?: string
  blockchain?: string
  hostBlockchain?: string
  nativeNetwork?: string
  nativeBlockchain?: string
}

export function parseParams(_params: Params, _nativeBlockchain: string) {
  const { blockchain, network, hostBlockchain, hostNetwork, nativeBlockchain, nativeNetwork } = _params

  if (Boolean(hostBlockchain) === Boolean(blockchain) || Boolean(hostNetwork) === Boolean(network))
    throw new Error('Bad initialization')

  let parsedHostBlockchain: string
  if (hostBlockchain) parsedHostBlockchain = blockchainTypes[hostBlockchain.toLowerCase()]
  else if (blockchain) parsedHostBlockchain = blockchainTypes[blockchain.toLowerCase()]
  if (!parsedHostBlockchain) throw new Error('Invalid hostBlockchain value')

  let parsedHostNetwork: string
  if (hostNetwork) parsedHostNetwork = networkLabels[parsedHostBlockchain][hostNetwork.toLowerCase()]
  else if (network) parsedHostNetwork = networkLabels[parsedHostBlockchain][network.toLowerCase()]
  if (!parsedHostNetwork) throw new Error('Invalid hostNetwork value')

  const a = nativeNetwork ? networkLabels[nativeNetwork.toLowerCase()] : null
  let parsedNativeNetwork: string
  if (!a && parsedHostNetwork.includes(Testnet)) parsedNativeNetwork = Testnet
  else parsedNativeNetwork = Mainnet

  const parsedNativeBlockchain = nativeBlockchain ? blockchainTypes[nativeBlockchain.toLowerCase()] : _nativeBlockchain

  return {
    hostBlockchain: parsedHostBlockchain,
    hostNetwork: parsedHostNetwork,
    nativeBlockchain: parsedNativeBlockchain,
    nativeNetwork: parsedNativeNetwork,
  }
}
