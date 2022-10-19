import { ChainId } from 'ptokens-constants'
import { validate } from 'multicoin-address-validator'

const validatorFunction =
  (_blockchain: string, _network = 'prod') =>
  (_address: string) =>
    validate(_address, _blockchain, _network)

// https://developers.eos.io/welcome/v2.0/protocol-guides/accounts_and_permissions/#2-accounts
const eosioAddressValidator = (_address: string) => /(^[a-z1-5.]{0,11}[a-z1-5]$)/.test(_address)

// pNetwork also supports appIds as Algorand destination
const algorandAddressValidator = (_address: string) => validatorFunction('algo')(_address) || /^\d+$/.test(_address)

export const chainIdToAddressValidatorMap: Map<ChainId, (_address: string) => boolean> = new Map([
  [ChainId.AlgorandMainnet, algorandAddressValidator],
  [ChainId.ArbitrumMainnet, validatorFunction('eth')],
  [ChainId.BitcoinMainnet, validatorFunction('btc')],
  [ChainId.BitcoinTestnet, validatorFunction('btc', 'testnet')],
  [ChainId.BscMainnet, validatorFunction('bnb')],
  [ChainId.EosMainnet, eosioAddressValidator],
  [ChainId.EthereumMainnet, validatorFunction('eth')],
  [ChainId.FantomMainnet, validatorFunction('eth')],
  [ChainId.LibreMainnet, eosioAddressValidator],
  [ChainId.LuxochainMainnet, validatorFunction('eth')],
  [ChainId.PolygonMainnet, validatorFunction('matic')],
  [ChainId.TelosMainnet, eosioAddressValidator],
  [ChainId.UltraMainnet, eosioAddressValidator],
  [ChainId.XdaiMainnet, validatorFunction('eth')],
])

export function isValidAddressByChainId(_address: string, _chainId: ChainId) {
  const validator = chainIdToAddressValidatorMap.get(_chainId)
  if (validator) return validator(_address)
  throw new Error('Missing address validator')
}
