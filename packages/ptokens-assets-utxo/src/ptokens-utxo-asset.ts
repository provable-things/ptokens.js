import { pTokensAsset } from 'ptokens-entities'
import { pTokensNode } from 'ptokens-node'
import { DepositAddress } from 'ptokens-deposit-address'
import PromiEvent from 'promievent'
export class pTokensUtxoAsset extends pTokensAsset {
  nativeToInterim(node: pTokensNode, destinationAddress: string, destinationChainId: string): PromiEvent<string> {
    if (node === undefined) throw new Error('Undefined node')
    if (destinationChainId === undefined) throw new Error('Undefined chain ID')
    const config = { nativeBlockchain: this.blockchain, nativeNetwork: this.network, node: node }
    const promi = new PromiEvent<string>(
      (resolve) =>
        (async () => {
          const depositAddress = new DepositAddress(config)
          await depositAddress.generate(destinationAddress, this.chainId, destinationChainId)
          const txHash = depositAddress.waitForDeposit()
          await txHash
            .on('txBroadcasted', (txHash) => promi.emit('txBroadcasted', txHash))
            .on('txConfirmed', (txHash) => promi.emit('txConfirmed', txHash))
          resolve(txHash)
        })() as unknown
    )
    return promi
  }

  hostToInterim(): PromiEvent<string> {
    throw new Error('No ptokens in a UTXO blockchain')
  }

  interimToDestination(): PromiEvent<string> {
    const promi = new PromiEvent<string>((resolve) => {
      resolve('')
    })
    return promi
  }
}
