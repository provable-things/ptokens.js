import BigNumber from 'bignumber.js'
import PromiEvent from 'promievent'
import { Blockchain, BlockchainType, NetworkId, networkIdToTypeMap, Network } from 'ptokens-constants'
import { maps } from 'ptokens-helpers'

import { pTokensAssetProvider } from './ptokens-asset-provider'

export type pTokenAssetConfig = {
  /** An AssetInfo object containing asset technical details. */
  assetInfo: AssetInfo
  /** The asset weight during the swap. Defaults to 1. Actually it is not supported.  */
  weight?: number
}

export type NativeToXBasisPoints = {
  /** Basis point fees for native-to-host swap. */
  nativeToHost: number
  /** Basis point fees for native-to-native swap. */
  nativeToNative: number
}

export type HostToXBasisPoints = {
  /** Basis point fees for host-to-host swap. */
  hostToHost: number
  /** Basis point fees for host-to-native swap. */
  hostToNative: number
}

export type AssetFees = {
  /** Fees destinated to pay network fees (expressed in token quantity * 1e18). */
  networkFee: number
  /** Fees destinated to pay network fees (expressed in USD). */
  networkFeeUsd?: number
  /** Minimum fees destinated to node operators (expressed in token quantity * 1e18). */
  minNodeOperatorFee: number
  /** Minimum fees destinated to node operators (expressed in USD). */
  minNodeOperatorFeeUsd?: number
  /** Basis point to calculate node fees destinated to node operators. */
  basisPoints: NativeToXBasisPoints | HostToXBasisPoints
}

export type AssetInfo = {
  /** The chain ID of the asset's blockchain. */
  networkId: string
  /** Asset symbol */
  symbol: string
  /** Token smart contract address. */
  assetTokenAddress: string
  /** Token's decimals. */
  decimals?: number
  /** pNetwork enclave address. */
  identity?: string
  // /** Token-related fees. */
  // fees: AssetFees
  /** Underlying asset decmials*/
  underlyingAssetName: string
  /** Underlying asset symbol*/
  underlyingAssetSymbol: string
  /** Underlying asset decimals*/
  underlyingAssetDecimals: number
  /** Underlying asset token address*/
  underlyingAssetTokenAddress: string
  /** Underlying asset network ID */
  underlyingAssetNetworkId: string
}

export abstract class pTokensAsset {
  private _assetInfo: AssetInfo
  private _weight: number
  private _type: BlockchainType

  /**
   * Create and initialize a pTokensAsset object. pTokensAsset objects shall be created with a pTokensAssetBuilder instance.
   */
  constructor(_config: pTokenAssetConfig, _type: BlockchainType) {
    if (!_config.assetInfo) throw new Error('Missing asset info')
    console.info('_config.assetInfo', _config.assetInfo)
    console.info('constructor type', _type)
    console.info(
      'constructor networkIdToTypeMap.get(_config.assetInfo.networkId)',
      networkIdToTypeMap.get(_config.assetInfo.networkId)
    )
    if (networkIdToTypeMap.get(_config.assetInfo.networkId) !== _type) throw new Error('Not supported chain ID')
    this._type = _type
    this._assetInfo = _config.assetInfo
    this._weight = _config.weight || 1
  }

  /** Return the token's symbol. */
  get symbol(): string {
    return this.assetInfo.symbol
  }

  /** Return the chain ID of the token. */
  get networkId(): NetworkId {
    return this.assetInfo.networkId as NetworkId
  }

  /** Return the blockchain of the token. */
  get blockchain(): Blockchain {
    return maps.chainIdToBlockchainMap.get(this._assetInfo.networkId).blockchain
  }

  /** Return the blockchain's network of the token. */
  get network(): Network {
    return maps.chainIdToBlockchainMap.get(this._assetInfo.networkId).network
  }

  /** Return token smart contract address. */
  get assetTokenAddress(): string {
    return this.assetInfo.assetTokenAddress ? this.assetInfo.assetTokenAddress : null
  }

  /** Return the pNetwork enclave address for the token. */
  get identity() {
    return this.assetInfo.identity ? this.assetInfo.identity : null
  }

  /** Return the weight associated to the token during the swap. Its usage is currently not supported. */
  get weight(): number {
    return this._weight
  }

  /** Return technical details related to the token. */
  get assetInfo(): AssetInfo {
    return this._assetInfo
  }

  /** Return true if asset is native, false otherwise */
  get isNative(): boolean {
    return (
      this._assetInfo.underlyingAssetNetworkId === this._assetInfo.networkId &&
      this._assetInfo.assetTokenAddress === this._assetInfo.underlyingAssetTokenAddress
    )
  }

  /** Return the pTokensAssetProvider eventually assigned */
  abstract get provider(): pTokensAssetProvider

  protected abstract swap(
    _routerAddress: string,
    _amount: BigNumber,
    _destinationAddress: string,
    _destinationChainId: string,
    _userData?: string
  ): PromiEvent<string>
}
