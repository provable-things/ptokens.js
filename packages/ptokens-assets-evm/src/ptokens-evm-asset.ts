import BigNumber from 'bignumber.js'
import PromiEvent from 'promievent'
import { BlockchainType } from 'ptokens-constants'
import { pTokensAsset, pTokenAssetConfig } from 'ptokens-entities'
import { AbiItem } from 'web3-utils'

import pRouterAbi from './abi/PRouterAbi.json'
import { onChainFormat } from './lib'
import { pTokensEvmProvider } from './ptokens-evm-provider'

const USER_SEND_METHOD = 'userSend'

export type pTokenEvmAssetConfig = pTokenAssetConfig & {
  /** An pTokensEvmProvider for interacting with the underlaying blockchain */
  provider?: pTokensEvmProvider
}
export class pTokensEvmAsset extends pTokensAsset {
  private _provider: pTokensEvmProvider

  /**
   * Create and initialize a pTokensEvmAsset object. pTokensEvmAsset objects shall be created with a pTokensEvmAssetBuilder instance.
   */
  constructor(config: pTokenEvmAssetConfig) {
    if (config.assetInfo.decimals === undefined) throw new Error('Missing decimals')
    super(config, BlockchainType.EVM)
    this._provider = config.provider
  }

  get provider() {
    return this._provider
  }

  protected swap(
    _routerAddress: string,
    _amount: BigNumber,
    _destinationAddress: string,
    _destinationChainId: string,
    _userData = '0x',
    _optionsMask = '0x0000000000000000000000000000000000000000000000000000000000000000'
  ): PromiEvent<string> {
    const promi = new PromiEvent<string>(
      (resolve, reject) =>
        (async () => {
          try {
            console.info('evm asset swap')
            if (!this._provider) return reject(new Error('Missing provider'))
            const args = [
              _destinationAddress,
              _destinationChainId,
              this.assetInfo.underlyingAssetName,
              this.assetInfo.underlyingAssetSymbol,
              this.assetInfo.underlyingAssetDecimals,
              this.assetInfo.underlyingAssetTokenAddress,
              this.assetInfo.underlyingAssetNetworkId,
              this.assetInfo.assetTokenAddress,
              onChainFormat(_amount, this.assetInfo.decimals).toFixed(),
              _userData.toString(),
              _optionsMask,
            ]
            console.info('_routerAddress', _routerAddress)
            console.info('args', args)
            const txHash: string = await this._provider
              .makeContractSend(
                {
                  method: USER_SEND_METHOD,
                  abi: pRouterAbi as unknown as AbiItem,
                  contractAddress: _routerAddress,
                  value: BigNumber(0),
                },
                args
              )
              .once('txBroadcasted', (_hash) => promi.emit('txBroadcasted', _hash))
              .once('txConfirmed', (_hash: string) => promi.emit('txConfirmed', _hash))
              .once('txError', reject)
            return resolve(txHash)
          } catch (err) {
            return reject(err)
          }
        })() as unknown
    )
    return promi
  }
}
