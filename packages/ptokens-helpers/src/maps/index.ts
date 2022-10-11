import { Blockchain, ChainId, Network } from 'ptokens-constants'
import { splitCamelCase } from '../string'

function parseChainIdKey(chainId: ChainId): { blockchain: Blockchain; network: Network } {
  const chainIdKey = Object.keys(ChainId)[Object.values(ChainId).indexOf(chainId)]
  const tokens = splitCamelCase(chainIdKey)
  return { blockchain: Blockchain[tokens[0]], network: Network[tokens[1]] }
}

export const chainIdToBlockchainMap: Map<string, { blockchain: Blockchain; network: Network }> = new Map(
  Object.values(ChainId).map((_value) => [_value, parseChainIdKey(_value)])
)
