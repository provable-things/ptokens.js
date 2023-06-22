import { NetworkId, Blockchain, Network, BlockchainType, networkIdToTypeMap } from 'ptokens-constants'

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

  setAssetInfo(_assetInfo: AssetInfo) {
    this._assetInfo = _assetInfo
    return this
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  protected async _build(): Promise<pTokensAsset> {
    throw new Error('_build() is not implemented')
  }

  private validate() {
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
