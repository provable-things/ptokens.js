import { BlockchainType } from 'ptokens-constants'
import { pTokensAsset, pTokenAssetConfig } from 'ptokens-entities'
import { Action, pTokensEosioProvider } from './ptokens-eosio-provider'

import PromiEvent from 'promievent'
import BigNumber from 'bignumber.js'

import pTokenOnEOSIOContractAbi from './abi/pTokenOnEOSContractAbiV2.json'
import ptokenOnEOSIOVaultAbi from './abi/pTokenVaultOnEOSContractAbiV2.json'

const EOSIO_TOKEN_PEG_OUT_METHOD = 'redeem2'
const EOSIO_TOKEN_TRANSFER_METHOD = 'transfer'
const EOSIO_VAULT_ADD_USER_DATA_METHOD = 'adduserdata'

export type pTokenEosioAssetConfig = pTokenAssetConfig & {
  /** An pTokensEosioProvider for interacting with the underlaying blockchain */
  provider?: pTokensEosioProvider
}

const getAmountInEosFormat = (_amount: BigNumber, _decimals: number, symbol: string) => {
  return `${_amount.toFixed(_decimals)} ${symbol.toUpperCase()}`
}

export class pTokensEosioAsset extends pTokensAsset {
  private _provider: pTokensEosioProvider
  private _customActions: Action[]

  /**
   * Create and initialize a pTokensEosioAsset object. pTokensEosioAsset objects shall be created with a pTokensEosioAssetBuilder instance.
   */
  constructor(_config: pTokenEosioAssetConfig) {
    if (_config.assetInfo.decimals === undefined) throw new Error('Missing decimals')
    super(_config, BlockchainType.EOSIO)
    this._provider = _config.provider
  }

  get provider() {
    return this._provider
  }

  /**
   * Set custom actions to be pushed on-chain when swapping. These will override the standard actions used to interact with the pNetwork. __Use carefully__.
   * @param _actions - An array of algosdk.EncodedTransaction objects (https://algorand.github.io/js-algorand-sdk/interfaces/EncodedTransaction.html).
   * @returns The same asset. This allows methods chaining.
   */
  setCustomActions(_actions: Action[]) {
    if (_actions === undefined) throw new Error('Invalid undefined actions')
    if (_actions.length === 0) throw new Error('Invalid empty actions array')
    this._customActions = _actions
    return this
  }

  protected nativeToInterim(
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
            if (!this._provider.actor) return reject(new Error('Missing actor'))
            if (!this.assetInfo.isNative)
              return reject(new Error('Invalid call to nativeToInterim() for non-native token'))
            if (!this.assetInfo.vaultAddress) return reject(new Error('Missing vault address'))
            let actions: Action[]
            if (this._customActions) actions = this._customActions
            else {
              actions = [
                {
                  contractAddress: this.assetInfo.tokenAddress,
                  method: EOSIO_TOKEN_TRANSFER_METHOD,
                  abi: pTokenOnEOSIOContractAbi,
                  arguments: {
                    from: this._provider.actor,
                    to: this.assetInfo.vaultAddress,
                    quantity: getAmountInEosFormat(_amount, this.assetInfo.decimals, this.symbol),
                    memo: `${_destinationAddress},${_destinationChainId}${_userData ? ',1' : ''}`,
                  },
                },
              ]
              if (_userData)
                actions.push({
                  contractAddress: this.assetInfo.vaultAddress,
                  method: EOSIO_VAULT_ADD_USER_DATA_METHOD,
                  abi: ptokenOnEOSIOVaultAbi,
                  arguments: {
                    user_data: _userData,
                  },
                })
            }
            const txHash: string = await this._provider
              .transact(actions)
              .once('txBroadcasted', (_hash) => promi.emit('txBroadcasted', _hash))
              .once('txConfirmed', (_hash) => promi.emit('txConfirmed', _hash))
              .once('error', reject)
            return resolve(txHash)
          } catch (_err) {
            return reject(_err)
          }
        })() as unknown
    )
    return promi
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
            if (!this._provider.actor) return reject(new Error('Missing actor'))
            if (this.assetInfo.isNative) return reject(new Error('Invalid call to hostToInterim() for native token'))
            const callArguments = {
              sender: this._provider.actor,
              quantity: getAmountInEosFormat(_amount, this.assetInfo.decimals, this.symbol.toUpperCase()),
              memo: _destinationAddress,
              user_data: _userData || '',
              chain_id: _destinationChainId.substring(2),
            }
            let actions: Action[]
            if (this._customActions) actions = this._customActions
            else {
              actions = [
                {
                  method: EOSIO_TOKEN_PEG_OUT_METHOD,
                  abi: pTokenOnEOSIOContractAbi,
                  contractAddress: this.assetInfo.tokenAddress,
                  arguments: callArguments,
                },
              ]
            }
            const txHash: string = await this._provider
              .transact(actions)
              .once('txBroadcasted', (_hash) => promi.emit('txBroadcasted', _hash))
              .once('txConfirmed', (_hash) => promi.emit('txConfirmed', _hash))
              .once('error', reject)
            return resolve(txHash)
          } catch (_err) {
            return reject(_err)
          }
        })() as unknown
    )
    return promi
  }
}
