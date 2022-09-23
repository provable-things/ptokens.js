import { pTokensAsset, pTokenAssetConfig, ChainId, BlockchainType } from 'ptokens-entities'
import { pTokensDepositAddress } from './ptokens-deposit-address'
import { pTokensUtxoProvider } from './ptokens-utxo-provider'

import PromiEvent from 'promievent'

const confirmations: Map<ChainId, number> = new Map([[ChainId.BitcoinMainnet, 1]])
const POLLING_TIME = 3000

export type pTokenUtxoAssetConfig = pTokenAssetConfig & { provider?: pTokensUtxoProvider }
export class pTokensUtxoAsset extends pTokensAsset {
  private provider: pTokensUtxoProvider

  constructor(config: pTokenUtxoAssetConfig) {
    super(config, BlockchainType.UTXO)
    this.provider = config.provider
  }

  waitForDeposit(address: string): PromiEvent<string> {
    const promi = new PromiEvent<string>(
      (resolve) =>
        (async () => {
          const nativeTxId = await this.provider
            .monitorUtxoByAddress(address, POLLING_TIME, confirmations.get(this.chainId) || 1)
            .on('txBroadcasted', (_txId) => promi.emit('txBroadcasted', _txId))
            .on('txConfirmed', (_txId) => promi.emit('txConfirmed', _txId))
          resolve(nativeTxId)
        })() as unknown
    )
    return promi
  }

  nativeToInterim(amount: number, destinationAddress: string, destinationChainId: string): PromiEvent<string> {
    const promi = new PromiEvent<string>(
      (resolve, reject) =>
        (async () => {
          try {
            if (!this._node) return reject(new Error('Undefined node'))
            if (!destinationChainId) return reject(new Error('Undefined chain ID'))
            if (!this.provider) return reject(new Error('Missing provider'))
            if (!this.assetInfo.isNative)
              return reject(new Error('Invalid call to nativeToInterim() for non-native token'))
            const config = { node: this._node }
            const depositAddress = new pTokensDepositAddress(config)
            const address = await depositAddress.generate(destinationAddress, this.chainId, destinationChainId)
            promi.emit('depositAddress', address)
            const txHash: string = await this.waitForDeposit(address)
              .on('txBroadcasted', (_txHash) => promi.emit('txBroadcasted', _txHash))
              .on('txConfirmed', (_txHash) => promi.emit('txConfirmed', _txHash))
            return resolve(txHash)
          } catch (err) {
            return reject(err)
          }
        })() as unknown
    )
    return promi
  }

  hostToInterim(): PromiEvent<string> {
    throw new Error('No ptokens in a UTXO blockchain')
  }
}
