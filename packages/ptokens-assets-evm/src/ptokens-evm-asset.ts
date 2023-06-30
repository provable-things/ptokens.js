import BigNumber from 'bignumber.js'
import PromiEvent from 'promievent'
import { BlockchainType } from 'ptokens-constants'
import { pTokensAsset, pTokenAssetConfig, SwapResult } from 'ptokens-entities'
import { TransactionReceipt } from 'web3-core'
import { AbiItem } from 'web3-utils'

// import receipt from '../test/utils/receiptUserSend.json'

import pRouterAbi from './abi/PRouterAbi.json'
import { getOperationIdFromTransactionReceipt, onChainFormat } from './lib'
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
    _amount: BigNumber,
    _destinationAddress: string,
    _destinationChainId: string,
    _userData = '0x',
    _optionsMask = '0x0000000000000000000000000000000000000000000000000000000000000000'
  ): PromiEvent<SwapResult> {
    const promi = new PromiEvent<SwapResult>(
      (resolve, reject) =>
        (async () => {
          try {
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
            const txReceipt: TransactionReceipt = await this._provider
              .makeContractSend(
                {
                  method: USER_SEND_METHOD,
                  abi: pRouterAbi as unknown as AbiItem,
                  contractAddress: this.routerAddress,
                  value: BigNumber(0),
                },
                args
              )
              .once('txBroadcasted', (_hash) => promi.emit('txBroadcasted', { txHash: _hash }))
              .once('txError', reject)
              .then((_receipt) => this.provider.getTransactionReceipt(_receipt.transactionHash))
            const ret = {
              txHash: txReceipt.transactionHash,
              operationId: getOperationIdFromTransactionReceipt(this.networkId, txReceipt),
            }
            promi.emit('txConfirmed', ret)
            return resolve(ret)
          } catch (err) {
            return reject(err)
          }
        })() as unknown
    )
    return promi
  }

  protected monitorCrossChainOperations(_operationId: string): PromiEvent<string> {
    return this.provider.monitorCrossChainOperations(this.stateManagerAddress, _operationId)
  }
}
