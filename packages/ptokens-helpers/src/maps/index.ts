import { Blockchain, NetworkId, Network } from 'ptokens-constants'

import { splitCamelCase } from '../string'

function parseChainIdKey(_networkId: NetworkId): { blockchain: Blockchain; network: Network } {
  const chainIdKey = Object.keys(NetworkId)[Object.values(NetworkId).indexOf(_networkId)]
  const tokens = splitCamelCase(chainIdKey)
  return { blockchain: Blockchain[tokens[0]], network: Network[tokens[1]] }
}

export const chainIdToBlockchainMap: Map<string, { blockchain: Blockchain; network: Network }> = new Map(
  Object.values(NetworkId).map((_value) => [_value, parseChainIdKey(_value)])
)
