import {
  NetworkId,
  Blockchain,
  Network,
  BlockchainType,
  networkIdToTypeMap,
  RouterAddress,
  StateManagerAddress,
} from 'ptokens-constants'
import { validators } from 'ptokens-helpers'

import { AssetInfo, pTokensAsset } from './ptokens-asset'
import { pTokensAssetProvider } from './ptokens-asset-provider'

export abstract class pTokensAssetBuilder {
  protected _decimals: number
  protected _weight: number
  protected _network: Network
  protected _blockchain: Blockchain
  protected _networkId: NetworkId
  protected _assetInfo: AssetInfo
  private _type: BlockchainType
  protected _routerAddress: string
  protected _stateManagerAddress: string

  /**
   * Create and initialize a pTokensAssetBuilder object.
   * @param _type - A type indicating the builder nature and used for validation.
   */
  constructor(_type: BlockchainType) {
    this._type = _type
  }

  /**
   * Set a weight for the asset during the swap. Its usage is currently not supported.
   * @param _weight - A weight for the token.
   * @returns The same builder. This allows methods chaining.
   */
  setWeight(_weight: number) {
    this._weight = _weight
    return this
  }

  /**
   * Set the blockchain chain ID for the token.
   * @param _networkId - The chain ID.
   * @returns The same builder. This allows methods chaining.
   */
  setBlockchain(_networkId: NetworkId) {
    if (networkIdToTypeMap.get(_networkId) !== this._type) throw new Error('Unsupported chain ID')
    this._networkId = _networkId
    return this
  }

  /**
   * Set the number of decimals for the token.
   * @param _decimals - The number of decimals.
   * @returns The same builder. This allows methods chaining.
   */
  setDecimals(_decimals: number) {
    this._decimals = _decimals
    return this
  }

  abstract setProvider(_provider: pTokensAssetProvider): this

  /**
   * Return the router address for the swap.
   */
  get routerAddress(): string {
    return this._routerAddress || RouterAddress.get(this._assetInfo.networkId as NetworkId)
  }

  /**
   * Set a custom pTokens router address for the swap.
   * @param _routerAddress - Address of the pTokens router contract
   * @returns The same builder. This allows methods chaining.
   */
  setRouterAddress(_routerAddress: string) {
    this._routerAddress = _routerAddress
    return this
  }

  /**
   * Return the router address for the swap.
   */
  get stateManagerAddress(): string {
    return this._stateManagerAddress || StateManagerAddress.get(this._assetInfo.networkId as NetworkId)
  }

  /**
   * Set a custom pTokens router address for the swap.
   * @param _routerAddress - Address of the pTokens router contract
   * @returns The same builder. This allows methods chaining.
   */
  setStateManagerAddress(_stateManagerAddress: string) {
    this._stateManagerAddress = _stateManagerAddress
    return this
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  protected async _build(): Promise<pTokensAsset> {
    throw new Error('_build() is not implemented')
  }

  private validate() {
    if (!this.routerAddress) throw new Error('Missing router address')
    if (!validators.isValidAddressByChainId(this.routerAddress, this._networkId))
      throw new Error('Invalid router address')
    if (!this.routerAddress) throw new Error('Missing router address')
    if (!validators.isValidAddressByChainId(this.stateManagerAddress, this._networkId))
      throw new Error('Invalid router address')
    if (!this._networkId) throw new Error('Missing chain ID')
    if (!this._assetInfo) throw new Error('Missing asset info')
    if (this._decimals !== undefined) this._assetInfo.decimals = this._decimals
  }

  /**
   * Build a pTokensAsset object from the parameters specified to the builder.
   * @returns A Promise that resolves with the created pTokensAsset object.
   */
  async build(): Promise<pTokensAsset> {
    this.validate()
    return this._build()
  }
}
