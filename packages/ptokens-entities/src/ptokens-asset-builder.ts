import { pTokensAsset } from './ptokens-asset'
import { ChainId, Blockchain, Network, BlockchainType, chainIdToTypeMap } from 'ptokens-constants'
import { pTokensNode, AssetInfo } from 'ptokens-node'
import { pTokensAssetProvider } from './ptokens-asset-provider'

export abstract class pTokensAssetBuilder {
  protected _symbol: string
  protected _decimals: number
  protected _weight: number
  protected _network: Network
  protected _blockchain: Blockchain
  protected _chainId: ChainId
  protected _node: pTokensNode
  protected _assetInfo: AssetInfo
  private _type: BlockchainType

  /**
   * Create and initialize a pTokensAssetBuilder object.
   * @param _node A pNetworkNode necessary for pNetworkSwap.
   * @param _type A type indicating the builder nature and used for validation.
   */
  constructor(_node: pTokensNode, _type: BlockchainType) {
    this._node = _node
    this._type = _type
  }

  /**
   * Set the pTokensAsset symbol.
   * @param _symbol The token symbol.
   * @returns The same builder. This allows methods chaining.
   */
  setSymbol(_symbol: string) {
    this._symbol = _symbol
    return this
  }

  /**
   * Set a weight for the asset during the swap. Its usage is currently not supported.
   * @param _weight A weight for the token.
   * @returns The same builder. This allows methods chaining.
   */
  setWeight(_weight: number) {
    this._weight = _weight
    return this
  }

  /**
   * Set the blockchain chain ID for the token.
   * @param _chainId The chain ID.
   * @returns The same builder. This allows methods chaining.
   */
  setBlockchain(_chainId: ChainId) {
    if (chainIdToTypeMap.get(_chainId) !== this._type) throw new Error('Unsupported chain ID')
    this._chainId = _chainId
    return this
  }

  /**
   * Set the number of decimals for the token.
   * @param _decimals The number of decimals.
   * @returns The same builder. This allows methods chaining.
   */
  setDecimals(_decimals: number) {
    this._decimals = _decimals
    return this
  }

  abstract setProvider(_provider: pTokensAssetProvider): this

  // eslint-disable-next-line @typescript-eslint/require-await
  protected async _build(): Promise<pTokensAsset> {
    throw new Error('_build() is not implemented')
  }

  private async validate() {
    if (!this._chainId) throw new Error('Missing chain ID')
    if (!this._symbol) throw new Error('Missing symbol')
    const assetInfo = await this._node.getAssetInfoByChainId(this._symbol, this._chainId)
    if (!assetInfo) throw new Error(`Unsupported token for chain ID ${this._chainId}`)
    if (this._decimals !== undefined) assetInfo.decimals = this._decimals
    this._assetInfo = assetInfo
  }

  /**
   * Build a pTokensAsset object from the parameters specified to the builder.
   * @returns A Promise that resolves with the created pTokensAsset object.
   */
  async build(): Promise<pTokensAsset> {
    await this.validate()
    return this._build()
  }
}
