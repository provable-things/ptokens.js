import { validate } from 'multicoin-address-validator'
import { NetworkId } from 'ptokens-constants'

const validatorFunction =
  (_blockchain: string, _network = 'prod') =>
  (_address: string) =>
    validate(_address, _blockchain, _network)

export const chainIdToAddressValidatorMap: Map<NetworkId, (_address: string) => boolean> = new Map([
  [NetworkId.SepoliaTestnet, validatorFunction('eth')],
  [NetworkId.GoerliTestnet, validatorFunction('eth')],
  [NetworkId.ArbitrumMainnet, validatorFunction('eth')],
  [NetworkId.GnosisMainnet, validatorFunction('eth')],
])

export function isValidAddressByChainId(_address: string, _networkId: NetworkId) {
  const validator = chainIdToAddressValidatorMap.get(_networkId)
  if (validator) return validator(_address)
  throw new Error('Missing address validator')
}
