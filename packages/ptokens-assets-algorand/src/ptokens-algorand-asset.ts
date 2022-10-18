import { BlockchainType } from 'ptokens-constants'
import { pTokensAsset, pTokenAssetConfig } from 'ptokens-entities'
import { stringUtils } from 'ptokens-helpers'
import { pTokensAlgorandProvider } from './ptokens-algorand-provider'
import PromiEvent from 'promievent'
import algosdk from 'algosdk'
import { encode } from '@msgpack/msgpack'
import BigNumber from 'bignumber.js'

export type pTokenAlgorandAssetConfig = pTokenAssetConfig & {
  provider?: pTokensAlgorandProvider
}

const encodeNote = (_destinationChainId: string, _destinationAddress: string, userData: Uint8Array = undefined) =>
  userData
    ? encode([
        0,
        Array.from(stringUtils.hexStringToBuffer(_destinationChainId)),
        _destinationAddress,
        Array.from(userData),
      ])
    : encode([0, Array.from(stringUtils.hexStringToBuffer(_destinationChainId)), _destinationAddress, []])

export class pTokensAlgorandAsset extends pTokensAsset {
  private _provider: pTokensAlgorandProvider
  private _customTransactions: algosdk.Transaction[]

  constructor(_config: pTokenAlgorandAssetConfig) {
    if (_config.assetInfo.decimals === undefined) throw new Error('Missing decimals')
    super(_config, BlockchainType.ALGORAND)
    this._provider = _config.provider
  }

  setCustomTransactions(_transactions: algosdk.EncodedTransaction[]) {
    if (_transactions === undefined) throw new Error('Invalid undefined transactions')
    if (_transactions.length === 0) throw new Error('Invalid empty transactions array')
    this._customTransactions = _transactions.map((_tx) => algosdk.Transaction.from_obj_for_encoding(_tx))
    return this
  }

  protected nativeToInterim(): PromiEvent<string> {
    throw new Error('Method not implemented.')
  }

  protected hostToInterim(
    _amount: BigNumber,
    _destinationAddress: string,
    _destinationChainId: string,
    _userData?: Uint8Array
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
                    amount: +_amount.multipliedBy(BigNumber(10).pow(this.assetInfo.decimals)),
                    suggestedParams: await this._provider.getTransactionParams(),
                    note: encodeNote(_destinationChainId, _destinationAddress, _userData),
                  }),
                ]
            const enclaveTx: string = await this._provider
              .transactInGroup(transactions)
              .once('txBroadcasted', (_hash) => promi.emit('txBroadcasted', _hash))
              .once('txConfirmed', (_hash) => promi.emit('txConfirmed', _hash))
              .once('error', reject)
            return resolve(enclaveTx)
          } catch (_err) {
            return reject(_err)
          }
        })() as unknown
    )
    return promi
  }
}
