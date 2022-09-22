import { pTokensNode, AssetInfo } from 'ptokens-node'
import PromiEvent from 'promievent'
import { ChainId, Blockchain, Network, chainIdToBlockchain } from './constants'

export type pTokenAssetConfig = {
  node: pTokensNode
  symbol: string
  chainId: ChainId
  assetInfo: AssetInfo
  weight?: number
  destinationAddress?: string
}

export abstract class pTokensAsset {
  protected _node: pTokensNode
  private _symbol: string
  private _chainId: ChainId
  private _blockchain: Blockchain
  private _network: Network
  private _assetInfo: AssetInfo
  private _weight: number
  private _destinationAddress: string

  constructor(config: pTokenAssetConfig) {
    if (!config.node) throw new Error('Missing node')
    if (!config.symbol) throw new Error('Missing symbol')
    if (!config.chainId) throw new Error('Missing chain ID')
    if (!config.assetInfo) throw new Error('Missing asset info')
    this._node = config.node
    this._symbol = config.symbol
    this._chainId = config.chainId
    const { blockchain, network } = chainIdToBlockchain.get(config.chainId)
    this._blockchain = blockchain
    this._network = network
    this._assetInfo = config.assetInfo
    this._weight = config.weight || 1
    this._destinationAddress = config.destinationAddress || undefined
  }

  public get symbol(): string {
    return this._symbol
  }

  public get chainId(): string {
    return this._chainId
  }

  public get destinationAddress(): string {
    return this._destinationAddress
  }

  public get blockchain(): Blockchain {
    return this._blockchain
  }

  public get network(): Network {
    return this._network
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
