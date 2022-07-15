import Btc from './utxo/btc'
import Doge from './utxo/doge'
import Ltc from './utxo/ltc'
import Rvn from './utxo/rvn'

export * as converters from './converters'
// export * as eosio from './eosio'

export * as helpers from './helpers'
export * as constants from './constants'
// import { redeemFromEosio } from './redeem-from/redeem-from-eosio'
// import pTokenOnEosAbi from './abi/pTokenOnEOSContractAbi.json'
// import EosioTokenAbi from './abi/EosioTokenAbi.json'
import { UtxoApi } from './utxo/api'

interface A {
  [key: string]: new (_network?: string) => UtxoApi
}

export const utxo: A = {
  btc: Btc,
  doge: Doge,
  ltc: Ltc,
  rvn: Rvn,
}
