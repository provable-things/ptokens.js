import { pTokensNode } from 'ptokens-node'
import PromiEvent from 'promievent'
import { Blockchain, Network } from './constants'

export type pTokenAssetConfig = {
  symbol: string
  chainId: string
  blockchain: Blockchain
  network: Network
  weight?: number
  destinationAddress?: string
}

export abstract class pTokensAsset {
  private _symbol: string
  private _chainId: string
  private _destinationAddress: string
  private _blockchain: Blockchain
  private _network: Network
  private _weight: number

  constructor(config: pTokenAssetConfig) {
    this._symbol = config.symbol
    this._chainId = config.chainId
    this._blockchain = config.blockchain
    this._network = config.network
    this._weight = config.weight || 1
    this._destinationAddress = config.destinationAddress
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

  abstract nativeToInterim(
    node: pTokensNode,
    amount: number,
    destinationAddress: string,
    destinationChainId: string,
    userData?: BinaryData
  ): PromiEvent<string>

  abstract hostToInterim(
    node: pTokensNode,
    amount: number,
    destinationAddress: string,
    destinationChainId: string,
    userData?: BinaryData
  ): PromiEvent<string>
}
