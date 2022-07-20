import { pTokensAsset, pTokenAssetConfig } from 'ptokens-entities'
import { pTokensNode } from 'ptokens-node'
import { pTokensDepositAddress } from './ptokens-deposit-address'
import { pTokensUtxoProvider } from './ptokens-utxo-provider'
import { Blockchain } from 'ptokens-entities'

import PromiEvent from 'promievent'

const confirmations: Map<Blockchain, number> = new Map([[Blockchain.Bitcoin, 1]])
const POLLING_TIME = 3000

export type pTokenUtxoAssetConfig = pTokenAssetConfig & { provider?: pTokensUtxoProvider }
export class pTokensUtxoAsset extends pTokensAsset {
  private provider: pTokensUtxoProvider

  constructor(config: pTokenUtxoAssetConfig) {
    super(config)
    this.provider = config.provider
  }

  waitForDeposit(address: string): PromiEvent<string> {
    const promi = new PromiEvent<string>(
      (resolve) =>
        (async () => {
          const nativeTxId = await this.provider
            .monitorUtxoByAddress(address, POLLING_TIME, confirmations.get(this.blockchain))
            .on('txBroadcasted', (_txId) => promi.emit('txBroadcasted', _txId))
            .on('txConfirmed', (_txId) => promi.emit('txConfirmed', _txId))
          resolve(nativeTxId)
        })() as unknown
    )
    return promi
  }

  nativeToInterim(
    node: pTokensNode,
    amount: number,
    destinationAddress: string,
    destinationChainId: string
  ): PromiEvent<string> {
    const promi = new PromiEvent<string>(
      (resolve, reject) =>
        (async () => {
          if (node === undefined) return reject(new Error('Undefined node'))
          if (destinationChainId === undefined) return reject(new Error('Undefined chain ID'))
          if (!this.provider) return reject(new Error('Missing provider'))
          const assetInfo = await node.getAssetInfo(this.symbol, this.chainId)
          if (!assetInfo.isNative) return reject(new Error('Invalid call to nativeToInterim() for non-native token'))
          const config = { nativeBlockchain: this.blockchain, nativeNetwork: this.network, node: node }
          const depositAddress = new pTokensDepositAddress(config)
          const address = await depositAddress.generate(destinationAddress, this.chainId, destinationChainId)
          const txHash: string = await this.waitForDeposit(address)
            .on('txBroadcasted', (_txHash) => promi.emit('txBroadcasted', _txHash))
            .on('txConfirmed', (_txHash) => promi.emit('txConfirmed', _txHash))
          return resolve(txHash)
        })() as unknown
    )
    return promi
  }

  hostToInterim(): PromiEvent<string> {
    throw new Error('No ptokens in a UTXO blockchain')
  }
}
