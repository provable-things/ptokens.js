import { pTokensNode, AssetInfo } from 'ptokens-node'
import PromiEvent from 'promievent'
import { Blockchain, BlockchainType, ChainId, chainIdToBlockchain, chainIdToTypeMap, Network } from './constants'

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
  private _destinationAddress: string
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
    this._destinationAddress = _config.destinationAddress || undefined
  }

  public get symbol(): string {
    return this._symbol
  }

  public get chainId(): ChainId {
    return this.assetInfo.chainId as ChainId
  }

  public get blockchain(): Blockchain {
    return chainIdToBlockchain.get(this._assetInfo.chainId).blockchain
  }

  public get network(): Network {
    return chainIdToBlockchain.get(this._assetInfo.chainId).network
  }

  public get destinationAddress(): string {
    return this._destinationAddress
  }

  public get weight(): number {
    return this._weight
  }

  public get assetInfo(): AssetInfo {
    return this._assetInfo
  }

  abstract nativeToInterim(
    amount: number,
    destinationAddress: string,
    destinationChainId: string,
    userData?: BinaryData
  ): PromiEvent<string>

  abstract hostToInterim(
    amount: number,
    destinationAddress: string,
    destinationChainId: string,
    userData?: BinaryData
  ): PromiEvent<string>
}
