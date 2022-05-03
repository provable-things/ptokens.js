import * as btc from './utxo/btc'
import * as doge from './utxo/doge'
import * as ltc from './utxo/ltc'
// import * as converters from './converters'
import * as evm from './evm'
// import * as eos from './eos'
import * as rvn from './utxo/rvn'
// import * as helpers from './helpers/index'
// import * as constants from './constants'
// import { redeemFromEosio } from './redeem-from/redeem-from-eosio'
// import { redeemFromEvmCompatible } from './redeem-from/redeem-from-evm-compatible'
// import pERC20VaultContractAbi from './abi/pERC20VaultContractAbi.json'
// import pTokenOnEosAbi from './abi/pTokenOnEOSContractAbi.json'
// import pTokenOnEthAbi from './abi/pTokenOnETHContractAbi.json'
// import EosioTokenAbi from './abi/EosioTokenAbi.json'

export default {
  // abi: {
  //   pTokenOnEth: pTokenOnEthAbi,
  //   pTokenOnEos: pTokenOnEosAbi,
  //   pERC20Vault: pERC20VaultContractAbi,
  //   EosioToken: EosioTokenAbi,
  // },
  btc,
  doge,
  // converters,
  // constants,
  evm,
  // eos,
  // telos: eos,
  // helpers,
  ltc,
  rvn,
  // redeemFrom: {
  //   redeemFromEvmCompatible,
  //   redeemFromEosio,
  // },
}
