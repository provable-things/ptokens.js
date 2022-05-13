import Btc from './utxo/btc'
import Doge from './utxo/doge'
import Ltc from './utxo/ltc'
import Rvn from './utxo/rvn'

export * as converters from './converters'
export * as evm from './evm'
// export * as eosio from './eosio'

export * as helpers from './helpers'
export * as constants from './constants'
// import { redeemFromEosio } from './redeem-from/redeem-from-eosio'
export * as redeemFrom from './redeem-from/redeem-from-evm-compatible'

import * as pERC20VaultContractAbi from './abi/pERC20VaultContractAbi.json'
// import pTokenOnEosAbi from './abi/pTokenOnEOSContractAbi.json'
import pTokenOnEthAbi from './abi/pTokenOnETHContractAbi.json'
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

export const abi = {
  pTokenOnEth: pTokenOnEthAbi,
  // pTokenOnEos: pTokenOnEosAbi,
  pERC20Vault: pERC20VaultContractAbi,
  // EosioToken: EosioTokenAbi,
}
