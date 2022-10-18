import { Blockchain, BlockchainType, ChainId, chainIdToTypeMap, Network } from 'ptokens-constants'
import { maps } from 'ptokens-helpers'
import { pTokensNode, AssetInfo } from 'ptokens-node'

import PromiEvent from 'promievent'
import BigNumber from 'bignumber.js'

export type pTokenAssetConfig = {
  node: pTokensNode
  symbol: string
  assetInfo: AssetInfo
  weight?: number
  destinationAddress?: string
}

export abstract class pTokensAsset {
  protected _node: pTokensNode
  private _symbol: string
  private _assetInfo: AssetInfo
  private _weight: number
  private _type: BlockchainType

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

  get symbol(): string {
    return this._symbol
  }

  get chainId(): ChainId {
    return this.assetInfo.chainId as ChainId
  }

  get blockchain(): Blockchain {
    return maps.chainIdToBlockchainMap.get(this._assetInfo.chainId).blockchain
  }

  get network(): Network {
    return maps.chainIdToBlockchainMap.get(this._assetInfo.chainId).network
  }

  get vaultAddress(): string {
    return this.assetInfo.vaultAddress ? this.assetInfo.vaultAddress : null
  }

  get tokenAddress(): string {
    return this.assetInfo.tokenAddress ? this.assetInfo.tokenAddress : null
  }

  get identity() {
    return this.assetInfo.identity ? this.assetInfo.identity : null
  }

  get weight(): number {
    return this._weight
  }

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
