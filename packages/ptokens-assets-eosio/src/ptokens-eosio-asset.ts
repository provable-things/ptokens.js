import { pTokensAsset, pTokenAssetConfig, BlockchainType } from 'ptokens-entities'
import PromiEvent from 'promievent'
import { Action, pTokensEosioProvider } from './ptokens-eosio-provider'

import pTokenOnEOSIOContractAbi from './abi/pTokenOnEOSContractAbiV2.json'
import ptokenOnEOSIOVaultAbi from './abi/pTokenVaultOnEOSContractAbiV2.json'

const EOSIO_TOKEN_PEG_OUT_METHOD = 'redeem2'
const EOSIO_TOKEN_TRANSFER_METHOD = 'transfer'
const EOSIO_VAULT_ADD_USER_DATA_METHOD = 'adduserdata'

export type pTokenEosioAssetConfig = pTokenAssetConfig & {
  provider?: pTokensEosioProvider
}

const getAmountInEosFormat = (_amount: number, _decimals: number, symbol: string) => {
  return `${_amount.toFixed(_decimals)} ${symbol}`
}

export class pTokensEosioAsset extends pTokensAsset {
  private provider: pTokensEosioProvider

  constructor(config: pTokenEosioAssetConfig) {
    super(config, BlockchainType.EOSIO)
    this.provider = config.provider
  }

  nativeToInterim(
    amount: number,
    destinationAddress: string,
    destinationChainId: string,
    userData?: Uint8Array
  ): PromiEvent<string> {
    const promi = new PromiEvent<string>(
      (resolve, reject) =>
        (async () => {
          try {
            if (!this.provider) return reject(new Error('Missing provider'))
            if (!this.provider.actor) return reject(new Error('Missing actor'))
            if (!this.assetInfo.isNative)
              return reject(new Error('Invalid call to nativeToInterim() for non-native token'))
            if (!this.assetInfo.vaultAddress) return reject(new Error('Missing vault address'))
            const actions: Action[] = [
              {
                contractAddress: this.assetInfo.tokenAddress,
                method: EOSIO_TOKEN_TRANSFER_METHOD,
                abi: pTokenOnEOSIOContractAbi,
                arguments: {
                  from: this.provider.actor,
                  to: this.assetInfo.vaultAddress,
                  quantity: getAmountInEosFormat(amount, 8, this.symbol.toUpperCase()),
                  memo: `${destinationAddress},${destinationChainId}${userData ? ',1' : ''}`,
                },
              },
            ]
            if (userData)
              actions.push({
                contractAddress: this.assetInfo.vaultAddress,
                method: EOSIO_VAULT_ADD_USER_DATA_METHOD,
                abi: ptokenOnEOSIOVaultAbi,
                arguments: {
                  user_data: userData,
                },
              })
            const txHash: string = await this.provider
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

  hostToInterim(
    amount: number,
    destinationAddress: string,
    destinationChainId: string,
    userData?: Uint8Array
  ): PromiEvent<string> {
    const promi = new PromiEvent<string>(
      (resolve, reject) =>
        (async () => {
          try {
            if (!this.provider) return reject(new Error('Missing provider'))
            if (!this.provider.actor) return reject(new Error('Missing actor'))
            if (this.assetInfo.isNative) return reject(new Error('Invalid call to hostToInterim() for native token'))
            const callArguments = {
              sender: this.provider.actor,
              quantity: getAmountInEosFormat(amount, 8, this.symbol.toUpperCase()),
              memo: destinationAddress,
              user_data: userData || '',
              chain_id: destinationChainId.substring(2),
            }
            const txHash: string = await this.provider
              .transact([
                {
                  method: EOSIO_TOKEN_PEG_OUT_METHOD,
                  abi: pTokenOnEOSIOContractAbi,
                  contractAddress: this.assetInfo.tokenAddress,
                  arguments: callArguments,
                },
              ])
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
