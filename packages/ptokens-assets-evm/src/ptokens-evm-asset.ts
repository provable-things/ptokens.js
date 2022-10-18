import { BlockchainType } from 'ptokens-constants'
import { pTokensAsset, pTokenAssetConfig } from 'ptokens-entities'
import { pTokensEvmProvider } from './ptokens-evm-provider'
import { onChainFormat } from './lib'

import PromiEvent from 'promievent'
import BigNumber from 'bignumber.js'
import { AbiItem } from 'web3-utils'

import pERC20VaultContractAbi from './abi/pERC20VaultContractAbi.json'
import pTokenOnEVMContractAbi from './abi/pTokenOnETHV2ContractAbi.json'

const SYSTEM_TOKEN_PEG_IN_METHOD = 'pegInEth'
const ERC20_TOKEN_PEG_IN_METHOD = 'pegIn'
const ERC20_TOKEN_PEG_OUT_METHOD = 'redeem'

export type pTokenEvmAssetConfig = pTokenAssetConfig & { provider?: pTokensEvmProvider }
export class pTokensEvmAsset extends pTokensAsset {
  private provider: pTokensEvmProvider

  /**
   * Create and initialize a pTokensEvmAsset object. pTokensEvmAsset objects shall be created with a pTokensEvmAssetBuilder instance.
   */
  constructor(config: pTokenEvmAssetConfig) {
    if (config.assetInfo.decimals === undefined) throw new Error('Missing decimals')
    super(config, BlockchainType.EVM)
    this.provider = config.provider
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
            if (!this.provider) return reject(new Error('Missing provider'))
            if (!this.assetInfo.isNative)
              return reject(new Error('Invalid call to nativeToInterim() for non-native token'))
            if (!this.assetInfo.vaultAddress) return reject(new Error('Missing vault address'))
            const txHash: string = await this.provider
              .makeContractSend(
                {
                  method: !this.assetInfo.tokenAddress ? SYSTEM_TOKEN_PEG_IN_METHOD : ERC20_TOKEN_PEG_IN_METHOD,
                  abi: pERC20VaultContractAbi as unknown as AbiItem,
                  contractAddress: this.assetInfo.vaultAddress,
                  value: !this.assetInfo.tokenAddress ? +onChainFormat(_amount, this.assetInfo.decimals) : 0,
                },
                _userData
                  ? !this.assetInfo.tokenAddress
                    ? [_destinationAddress, _destinationChainId, _userData]
                    : [
                        onChainFormat(_amount, this.assetInfo.decimals).toFixed(),
                        this.assetInfo.tokenAddress,
                        _destinationAddress,
                        _userData,
                        _destinationChainId,
                      ]
                  : !this.assetInfo.tokenAddress
                  ? [_destinationAddress, _destinationChainId]
                  : [
                      onChainFormat(_amount, this.assetInfo.decimals).toFixed(),
                      this.assetInfo.tokenAddress,
                      _destinationAddress,
                      _destinationChainId,
                    ]
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
            if (!this.provider) return reject(new Error('Missing provider'))
            if (this.assetInfo.isNative) return reject(new Error('Invalid call to hostToInterim() for native token'))
            const txHash: string = await this.provider
              .makeContractSend(
                {
                  method: ERC20_TOKEN_PEG_OUT_METHOD,
                  abi: pTokenOnEVMContractAbi as unknown as AbiItem,
                  contractAddress: this.assetInfo.tokenAddress,
                  value: 0,
                },
                _userData
                  ? [
                      onChainFormat(_amount, this.assetInfo.decimals).toFixed(),
                      _userData,
                      _destinationAddress,
                      _destinationChainId,
                    ]
                  : [
                      onChainFormat(_amount, this.assetInfo.decimals).toFixed(),
                      _destinationAddress,
                      _destinationChainId,
                    ]
              )
              .once('txBroadcasted', (_hash) => promi.emit('txBroadcasted', _hash))
              .once('txConfirmed', (_hash: string) => promi.emit('txConfirmed', _hash))
              .once('error', reject)
            return resolve(txHash)
          } catch (err) {
            return reject(err)
          }
        })() as unknown
    )
    return promi
  }
}
