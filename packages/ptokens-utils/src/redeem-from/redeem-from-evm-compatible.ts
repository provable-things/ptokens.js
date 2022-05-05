import Web3 from 'web3'
import * as evm from '../evm'
import pTokenOnEthAbi from '../abi/pTokenOnETHContractAbi.json'
import PromiEvent from 'promievent'
import { AbiItem } from 'web3-utils'

export function redeemFromEvmCompatible(_web3: Web3, _options: any, _params = [], _broadcastEventName: string) {
  const promievent = new PromiEvent((resolve, reject) => {
    let f: typeof evm.sendSignedMethodTx | typeof evm.makeContractSend
    if (_options.privateKey) f = evm.sendSignedMethodTx
    else f = evm.makeContractSend
    f(
      _web3,
      'redeem',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      {
        abi: pTokenOnEthAbi as unknown as AbiItem,
        ..._options,
        transactionHashCallback: (_hash) => {
          promievent.emit(_broadcastEventName, _hash)
        },
      },
      _params
    )
      .then((_res) => resolve(_res))
      .catch((_err) => reject(_err))
  })
  return promievent
}
