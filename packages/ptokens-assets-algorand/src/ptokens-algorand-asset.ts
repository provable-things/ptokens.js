import { pTokensAsset, pTokenAssetConfig, BlockchainType } from 'ptokens-entities'
import { pTokensAlgorandProvider } from './ptokens-algorand-provider'
import { pTokensNode } from 'ptokens-node'
import PromiEvent from 'promievent'
import algosdk from 'algosdk'
import { encode } from '@msgpack/msgpack'

export type pTokenAlgorandAssetConfig = pTokenAssetConfig & {
  provider?: pTokensAlgorandProvider
}

// function encodeStringForArgs(_str: string) {
//   return new Uint8Array(Buffer.from(_str))
// }

// function parseHexString(_str: string): number[] {
//   let inStr = _str
//   const result: number[] = []
//   while (inStr.length >= 2) {
//     result.push(parseInt(inStr.substring(0, 2), 16))
//     inStr = inStr.substring(2, inStr.length)
//   }
//   return result
// }
export class pTokensAlgorandAsset extends pTokensAsset {
  private _provider: pTokensAlgorandProvider
  private _customTransactions: algosdk.Transaction[]

  constructor(config: pTokenAlgorandAssetConfig) {
    super(config, BlockchainType.ALGORAND)
    this._provider = config.provider
  }

  public get identity() {
    if (this.assetInfo.identity) return this.assetInfo.identity
  }

  nativeToInterim(): PromiEvent<string> {
    throw new Error('Method not implemented.')
  }

  hostToInterim(
    amount: number,
    destinationAddress: string,
    destinationChainId: string,
    userData?: BinaryData
  ): PromiEvent<string> {
    const promi = new PromiEvent<string>(
      (resolve, reject) =>
        (async () => {
          try {
            if (!this._provider) return reject(new Error('Missing provider'))
            if (this.assetInfo.isNative) return reject(new Error('Invalid call to hostToInterim() for native token'))
            if (!this._provider.account) return reject(new Error('Missing account'))
            if (!this.assetInfo.identity) return reject(new Error('Missing identity'))
            const transactions = this._customTransactions
              ? this._customTransactions
              : [
                  algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
                    from: this._provider.account,
                    to: this.assetInfo.identity,
                    assetIndex: parseInt(this.assetInfo.tokenAddress),
                    amount,
                    suggestedParams: await this._provider.getTransactionParams(),
                    note: encode([0, destinationChainId, destinationAddress, []]),
                  }),
                ]
            const groupId: string = await this._provider
              .transactInGroup(transactions)
              .once('txBroadcasted', (_hash) => promi.emit('txBroadcasted', _hash))
              .once('txConfirmed', (_hash) => promi.emit('txConfirmed', _hash))
              .once('error', reject)
            return resolve(groupId)
          } catch (_err) {
            return reject(_err)
          }
        })() as unknown
    )
    return promi
  }
}
