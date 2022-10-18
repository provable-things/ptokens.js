import { Blockchain, BlockchainType, ChainId, chainIdToTypeMap, Network } from 'ptokens-constants'
import { maps } from 'ptokens-helpers'
import { pTokensNode, AssetInfo } from 'ptokens-node'

import PromiEvent from 'promievent'
import BigNumber from 'bignumber.js'

export type pTokenAssetConfig = {
  /** A pTokensNode to interact with the pNetwork. */
  node: pTokensNode
  /** The token symbol. */
  symbol: string
  /** AssetInfo object containing asset technical details. */
  assetInfo: AssetInfo
  /** Weight of the asset during the swap. Defaults to 1. Actually it is not supported.  */
  weight?: number
}

export abstract class pTokensAsset {
  private _node: pTokensNode
  private _symbol: string
  private _assetInfo: AssetInfo
  private _weight: number
  private _type: BlockchainType

  /**
   * Create and initialize a pTokensAsset object. pTokensAsset objects shall be created with a pTokensAssetBuilder instance.
   */
  constructor(_config: pTokenAssetConfig, _type: BlockchainType) {
    if (!_config.node) throw new Error('Missing node')
    if (!_config.symbol) throw new Error('Missing symbol')
    if (!_config.assetInfo) throw new Error('Missing asset info')
    if (chainIdToTypeMap.get(_config.assetInfo.chainId) !== _type) throw new Error('Not supported chain ID')
    this._type = _type
    this._node = _config.node
    this._symbol = _config.symbol
    this._assetInfo = _config.assetInfo
    this._weight = _config.weight || 1
  }

  get node(): pTokensNode {
    return this._node
  }

  /** Return the token's symbol. */
  get symbol(): string {
    return this._symbol
  }

  /** Return the chain ID of the token. */
  get chainId(): ChainId {
    return this.assetInfo.chainId as ChainId
  }

  /** Return the blockchain of the token. */
  get blockchain(): Blockchain {
    return maps.chainIdToBlockchainMap.get(this._assetInfo.chainId).blockchain
  }

  /** Return the blockchain's network of the token. */
  get network(): Network {
    return maps.chainIdToBlockchainMap.get(this._assetInfo.chainId).network
  }

  /** Return the vault address for the token. */
  get vaultAddress(): string {
    return this.assetInfo.vaultAddress ? this.assetInfo.vaultAddress : null
  }

  /** Return token smart contract address. */
  get tokenAddress(): string {
    return this.assetInfo.tokenAddress ? this.assetInfo.tokenAddress : null
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

  protected abstract nativeToInterim(
    _amount: BigNumber,
    _destinationAddress: string,
    _destinationChainId: string,
    _userData?: Uint8Array
  ): PromiEvent<string>

  protected abstract hostToInterim(
    _amount: BigNumber,
    _destinationAddress: string,
    _destinationChainId: string,
    _userData?: Uint8Array
  ): PromiEvent<string>
}
